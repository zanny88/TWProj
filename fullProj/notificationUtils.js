const { rrulestr, RRule } = require('rrule');
const dayjs = require('dayjs');
const axios = require('axios');

//Funzione che, ogni N secondi, controlla tutti gli eventi con has_notification=true e verifica se è il momento di inviare la notifica, considerando anche le ricorrenze.
async function checkAndSendNotifications(MongoDBEvent, MongoDBUser) {
  try {
    const events = await MongoDBEvent.find({
      has_notification: true,
      $or: [{ is_recurring: true }, { $expr: { $not: { $in: ["$owner", "$notification_stop"] } } }]       //Ricorrenti oppure owner NON presente in notification_stop
    });

    //Costruisce un dizionario delle coppie (username, mail) per gli utenti che hanno mail configurata
    const emailDictionary = {};
    const emailUsers = await MongoDBUser.find({ mail: { $exists: true, $ne: null } });
    if (!emailUsers) {
      return;
    }
    emailUsers.forEach(emailUser => {
      const { username, mail } = emailUser;
      if (!emailDictionary[username]) {
        emailDictionary[username] = mail;
      }
    });

    for (const ev of events) {
      const userDB = await MongoDBUser.findOne({ username: ev.owner });
      if (!userDB) {
        continue;
      }
      const now = (userDB.deltaTime != undefined ? new Date(Date.now() + userDB.deltaTime) : new Date());
      const users = [ev.owner, ...(ev.participants_accepted || [])];        //utente che ha creato l'evento e tutti gli eventuali utenti che hanno accettato l'invito
      for (const user of users) {
        if (!emailDictionary[user]) {
          console.error("utente " + user + " privo di mail");
          continue;
        }
        const email = emailDictionary[user];
        if (ev.is_recurring && ev.recurring_rule) {  //Se l'evento è ricorrente, devo calcolare la prossima occorrenza basandomi sulla rrule
          await notification_handleRecurringEvent(ev, now, user, email);
        } else {
          await notification_handleSingleEvent(ev, now, user, email);
        }
      }
    }
  } catch (error) {
    console.error("[checkAndSendNotifications] Errore:", error);
  }
}


//Gestisce un evento NON ricorrente: verifica se è giunto il momento di inviare la prossima notifica.
async function notification_handleSingleEvent(event, now, user, email) {
  try {
    if (event.notification_stop.includes(user)) {
      return;
    }

    if (event.date_end && now >= event.date_end) {
      return;
    }
    const N = getEventNotification_Number(event, now);
    if (event.notification_num_sent != N) {
      if (N > 0 && N <= event.notification_repetitions) {         //Bisogna mandare la notifica numero N
        await sendNotification(event, event.date_start, now, user, email);
      }
      //Aggiorna contatore delle notifiche inviate
      event.notification_num_sent = N;
      await event.save();
    }
  } catch (error) {
    console.error("[notification_handleSingleEvent] Errore:", error);
  }
}

function getEventNotification_Number(event, now) {
  const interval = event.notification_interval || 0;
  if (interval <= 0) {
    return 0;
  }
  let baseDate = event.notification_advance_date;
  if (!baseDate) {
    baseDate = new Date(event.date_start.getTime() - (event.notification_advance * 60000)); // se non è impostata, prendo date_start - notification_advance minuti
  }
  const calc = (now - baseDate) / (interval * 60000);
  if (calc < 0) {
    return 0;
  }
  return Math.trunc(calc) + 1;
}

//Gestisce un evento ricorrente utilizzando la RRULE.
async function notification_handleRecurringEvent(event, now, user, email) {
  try {
    const rule = rrulestr(event.recurring_rule, { dtstart: event.date_start });
    //Calcolo la prossima occorrenza >= now
    const nextOccurrence = rule.after(now);
    if (!nextOccurrence) {
      return;
    }
    if (!event.notification_last_handled || nextOccurrence.getTime() != event.notification_last_handled.getTime()) {  	//E' cambiata l'occorrenza rispetto all'ultima considerata
      event.notification_num_sent = 0;
      event.notification_last_handled = nextOccurrence;
      if (event.notification_stop.includes(user)) {
        event.notification_stop = event.notification_stop.filter(item => item !== user);
      }
    } else if (event.notification_stop.includes(user)) {
      return;
    }

    const N = getRecurringEventNotification_Number(event, now, nextOccurrence);

    if (event.notification_num_sent != N) {
      if (N > 0 && N <= event.notification_repetitions) {         //Bisogna mandare la notifica numero N
        await sendNotification(event, event.date_start, now, user, email);
      }
      //Aggiorna contatore delle notifiche inviate
      event.notification_num_sent = N;
      // Aggiorna la data dell'ultima occorrenza gestita
      event.notification_last_handled = nextOccurrence;
      await event.save();
    }
  } catch (error) {
    console.error("[notification_handleRecurringEvent] Errore:", error);
  }
}

function getRecurringEventNotification_Number(event, now, nextOccurrence) {
  const interval = event.notification_interval || 0;
  if (interval <= 0) {
    return 0;
  }
  let baseDate = event.notification_advance_date;
  if (!baseDate) {
    baseDate = new Date(nextOccurrence.getTime() - (event.notification_advance * 60000)); // se non è impostata, prendo date_start - notification_advance minuti
  } else {
    baseDate = copyTimeToDate(nextOccurrence, event.notification_advance_date);
  }
  const calc = (now - baseDate) / (interval * 60000);
  if (calc < 0) {
    return 0;
  }
  return Math.trunc(calc) + 1;
}


async function sendNotification(event, occurrenceDate, now, user, email) {
  if (event.notification_modes && event.notification_modes.length > 0) {
    if (event.notification_modes.includes('EMAIL')) {
      let html = getEventNotificationHtml(event, now, user);
      try {
        const payload = {
          to: user, //event.owner,
          subject: `Reminder for event: ${event.title}`,
          html: html
        }
        await axios.post(`${process.env.SERVER_URL}sendNotification`, payload);
      } catch (error) {
        console.error("Errore: " + error);
      }
    }
  } else {
    console.log(`Invio notifica standard per l'evento "${event.title}"`);
  }
}


//Copia ore/minuti/secondi da dateWithTime a date.
function copyTimeToDate(date, dateWithTime) {
  if (!date || !dateWithTime) return date;
  const d = new Date(date);
  const t = new Date(dateWithTime);
  d.setHours(t.getHours());
  d.setMinutes(t.getMinutes());
  d.setSeconds(t.getSeconds());
  return d;
}

//Calcola la prossima occorrenza di un evento ricorrente
function getNextOccurrence(event, referenceDate = new Date()) {
  if (!event.is_recurring || !event.recurring_rule) {
    return null;
  }
  const rruleString = event.recurring_rule.replace('RRULE:', '');
  const options = RRule.parseString(rruleString);

  const dtstart = event.date_start;  //event.allDay ? event.date_start : copyTimeToDate(event.date_start, event.startTime);
  if (!dtstart) return null;
  options.dtstart = dtstart;
  const rule = new RRule(options);

  // Trova la prossima occorrenza (inclusa la referenceDate se coincide)
  const next = rule.after(referenceDate, true);
  return next || null;
}

//Genera una stringa HTML con i dati principali di un evento, per l'invio della notifica via mail
function getEventNotificationHtml(event, now, user) {
  const referenceDate = now;
  let start;
  let end;
  if (event.is_recurring && event.recurring_rule) {
    //Evento ricorrente: calcola la prossima occorrenza
    const nextStart = getNextOccurrence(event, referenceDate);
    if (nextStart) {
      const baseStart = event.date_start;
      const baseEnd = event.date_end;

      const durationMs = baseEnd - baseStart;    //durata dell'evento
      const nextEnd = new Date(nextStart.getTime() + durationMs);

      start = nextStart;
      end = nextEnd;
    } else {
      // Nessuna occorrenza futura: usiamo start/end originali
      start = event.date_start;
      end = event.date_end;
    }
  } else {
    //Evento non ricorrente
    start = event.date_start;
    end = event.date_end;
  }

  // Formattiamo date e orari
  const startDateStr = dayjs(start).format('DD/MM/YYYY');
  const startTimeStr = event.all_day ? 'All day' : dayjs(start).format('HH:mm');
  const endDateStr = dayjs(end).format('DD/MM/YYYY');
  const endTimeStr = event.all_day ? 'All day' : dayjs(end).format('HH:mm');

  // Costruiamo l'HTML
  let html = '<h2>Event reminder:</h2>';
  html += `<p><strong>Title:</strong> ${event.title || ''}</p>`;
  if (event.place) {
    html += `<p><strong>Location:</strong> ${event.place}</p>`;
  }
  html += `<p><strong>Start Date:</strong> ${startDateStr}</p>`;
  html += `<p><strong>Start Time:</strong> ${startTimeStr}</p>`;
  html += `<p><strong>End Date:</strong> ${endDateStr}</p>`;
  html += `<p><strong>End Time:</strong> ${endTimeStr}</p>`;
  html += `<p><strong>Priority:</strong> ${event.priority || ''}</p>`;

  const disableUrl = `${process.env.SERVER_URL}disableEventNotification/${event._id}/${user}`;
  html += `
        <p>
          <a 
            href="${disableUrl}" 
            style="display:inline-block;padding:10px 20px;background-color:red;color:#fff;text-decoration:none;border-radius:4px;"
          >
            Disable this event's notifications
          </a>
        </p>
      `;

  return html;
}



//Funzione che, ogni N secondi, controlla tutte le attività scadute e verifica se è il momento di inviare la notifica.
async function checkAndSendActivityNotifications(MongoDBActivity, MongoDBUser) {
  try {
    const activities = await MongoDBActivity.find({
      has_deadline: true,
      is_completed: false
    });

    //Costruisce un dizionario delle coppie (username, mail) per gli utenti che hanno mail configurata
    const emailDictionary = {};
    const emailUsers = await MongoDBUser.find({ mail: { $exists: true, $ne: null } });
    if (!emailUsers) {
      return;
    }
    emailUsers.forEach(emailUser => {
      const { username, mail } = emailUser;
      if (!emailDictionary[username]) {
        emailDictionary[username] = mail;
      }
    });

    for (const act of activities) {
      const userDB = await MongoDBUser.findOne({ username: act.owner });
      if (!userDB) {
        continue;
      }
      const now = (userDB.deltaTime != undefined ? new Date(Date.now() + userDB.deltaTime) : new Date());
      const yesterday = dayjs(now).add(-1, 'day').toDate();
      const diff_GG = (yesterday - act.end) / (1000 * 60 * 60 * 24);
      if (diff_GG <= 0) {   //attività non ancora scaduta
        continue;
      }
      let priority;
      if (diff_GG < 3) {          //Sono passati meno di 3 giorni dalla fine dell'attività
        priority = 'MEDIUM';
      } else if (diff_GG < 7) {   //Sono passati da 3 a 7 giorni dalla fine dell'attività
        priority = 'HIGH';
      } else {                    //Sono passati oltre 7 giorni dalla fine dell'attività
        priority = 'CRITICAL';
      }
      const N = getActivityNotification_Number(act, now);
      const numSent = act.notification_num_sent || 0;
      const users = [act.owner, ...(act.participants_accepted || [])];        //utente che ha creato l'evento e tutti gli eventuali utenti che hanno accettato l'invito
      for (const user of users) {
        if (!emailDictionary[user]) {
          console.error("utente " + user + " privo di mail");
          continue;
        }
        if (numSent != N) {
          if (N > 0) {
            const html = getActivityNotificationHtml(act, priority);
            try {
              const payload = {
                to: user,
                subject: `Reminder for activity: ${act.title}`,
                html: html
              }
              const email = emailDictionary[user];
              await axios.post(`${process.env.SERVER_URL}sendNotification`, payload);
            } catch (error) {
              console.error("Errore: " + error);
            }
          }
          try {
            act.notification_num_sent = N;
            act.save();
          } catch (error) {
            console.error("Errore: " + error);
          }
        }
      }
    }
  } catch (error) {
    console.error("[checkAndSendActivityNotifications] Errore:", error);
  }
}

function getActivityNotification_Number(activity, now) {
  let date = dayjs(activity.end);
  const nowJS = dayjs(now);
  if (nowJS.diff(date) <= 0) {
    return 0;
  }
  let N = 0;
  let i;
  for (i = 0; i < 3; i++) {
    date = date.add(24, 'hour');
    if (nowJS.diff(date) < 0) {
      return N;
    }
    N++;
  }
  for (i = 3; i < 7; i++) {
    date = date.add(12, 'hour');
    if (nowJS.diff(date) < 0) {
      return N;
    }
    N++;
  }
  for (i = 7; i < 9999; i++) {
    date = date.add(8, 'hour');
    if (nowJS.diff(date) < 0) {
      return N;
    }
    N++;
  }
  return N;
}


function getActivityNotificationHtml(activity, priority) {
  if (!activity || !activity._id || !activity.title) {
    throw new Error('Invalid activity object');
  }

  let endDate;
  if (activity.end) {
    endDate = new Date(activity.end).toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long',
      day: 'numeric'
    });
  } else {
    endDate = 'N/A';
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Activity expired!</title>
    <style>
        .container {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
        }
        .header {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
        }
        .content {
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>An activity has expired!</h2>
        </div>
        <div class="content">
            <h3>${activity.title}</h3>
            <p>${activity.description}</p>
            <p><strong>End Date:</strong> ${endDate}</p>
            <p>Priority: ${priority}</p>
        </div>
    </div>
</body>
</html>
    `;
}

module.exports = { checkAndSendNotifications, checkAndSendActivityNotifications };
