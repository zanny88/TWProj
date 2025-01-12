const { rrulestr } = require('rrule');
const dayjs = require('dayjs');
const axios = require('axios');

//Funzione che, ogni N secondi, controlla tutti gli eventi con has_notification=true e verifica se è il momento di inviare la notifica, considerando anche le ricorrenze.
async function checkAndSendNotifications(MongoDBEvent, MongoDBUser) {
    //console.log("checkAndSendNotifications-START");
    try {
        const events = await MongoDBEvent.find({
            has_notification: true,
            $or: [{ is_recurring: true }, { $expr: { $not: { $in: [ "$owner", "$notification_stop" ] } } }]       //Ricorrenti oppure owner NON presente in notification_stop
        });

        const now = new Date();
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
        //console.log("emailDictionary="+JSON.stringify(emailDictionary));
        
        for (const ev of events) {
            //console.log("gestione evento: "+JSON.stringify(ev));
            const users = [ev.owner, ...(ev.participants_accepted || [])];        //utente che ha creato l'evento e tutti gli eventuali utenti che hanno accettato l'invito
            for (const user of users) {
                console.log("gestione evento '" + ev.title + "' per utente " + user);
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
    //console.log("checkAndSendNotifications-END");
}


//Gestisce un evento NON ricorrente: verifica se è giunto il momento di inviare la prossima notifica.
async function notification_handleSingleEvent(event, now, user, email) {
	//console.log("notification_handleSingleEvent(" + JSON.stringify(event) + ")");
    try {
        if (event.notification_stop.includes(user)) {
            return;
        }

        // Se l'evento ha già raggiunto il numero massimo di notifiche, esco
        if (event.notification_repetitions !== 0 && event.notification_num_sent >= event.notification_repetitions) {
            console.log("notification_handleSingleEvent --> notification_stop=true 1");
            if (!event.notification_stop.includes(user)) {
                event.notification_stop.push(user);
            }
            await event.save();
            return;
        }

        if (event.date_end && now >= event.date_end) {
            console.log("notification_handleSingleEvent --> notification_stop=true 2");
            if (!event.notification_stop.includes(user)) {
                event.notification_stop.push(user);
            }
            await event.save();
            return;
        }

        //Calcolo l'orario di invio della prossima notifica.
        let baseDate = event.notification_advance_date; 
        if (!baseDate) {
            baseDate = new Date(event.date_start.getTime() - (event.notification_advance * 60000)); // se non è impostata, prendo date_start - notification_advance minuti
        }

        const interval = event.notification_interval || 0; 
        const numSent = event.notification_num_sent || 0;
        const nextNotificationTime = new Date(baseDate.getTime() + numSent * interval * 60000);
        console.log("nextNotificationTime="+nextNotificationTime);
        //console.log("now="+now);

        if (now >= nextNotificationTime) {
          await sendNotification(event, event.date_start, now, user, email);

          //Aggiorna contatore delle notifiche inviate
          console.log("numSent="+numSent);
          event.notification_num_sent = numSent + 1;
          console.log("numSent="+event.notification_num_sent );

          // Se abbiamo inviato abbastanza notifiche da raggiungere notification_repetitions (se non è 0) --> imposto notification_stop
          if (event.notification_repetitions !== 0 && event.notification_num_sent >= event.notification_repetitions) {
            console.log("notification_handleSingleEvent --> notification_stop=true 3");
            if (!event.notification_stop.includes(user)) {
                event.notification_stop.push(user);
              }
          }
          await event.save();
        }
    } catch (error) {
        console.error("[notification_handleSingleEvent] Errore:", error);
    }
}


//Gestisce un evento ricorrente utilizzando la RRULE.
async function notification_handleRecurringEvent(event, now, user, email) {
	//console.log("notification_handleRecurringEvent(" + JSON.stringify(event) + ")");
    try {
        // Se l'evento ha già raggiunto il numero massimo di notifiche complessive (se ne hai uno),
        // oppure se notification_stop è true, esco
        //if (event.notification_stop) {
        //  return;
        //}

        const rule = rrulestr(event.recurring_rule, { dtstart: event.date_start });
        //Calcolo la prossima occorrenza >= now
        const nextOccurrence = rule.after(now);
        if (!nextOccurrence) {
          // Non ci sono più occorrenze, fermiamo le notifiche
            console.log("notification_handleRecurringEvent --> notification_stop=true 1");
          if (!event.notification_stop.includes(user)) {
            event.notification_stop.push(user);
          }
          await event.save();
          return;
        }
        if (!event.notification_last_handled || nextOccurrence.getTime() != event.notification_last_handled.getTime()){  	//E' cambiata l'occorrenza rispetto all'ultima considerata
            //console.log("nextOccurrence="+nextOccurrence);
            //console.log("event.notification_last_handled="+event.notification_last_handled);
            event.notification_num_sent = 0;
            event.notification_last_handled = nextOccurrence;
        } else if (event.notification_stop.includes(user)) {
            return;
        }


        const interval = event.notification_interval || 0; 
        const numSent = event.notification_num_sent || 0;
        const advance = event.notification_advance || 0;

        // prossimo invio = data base + (numero di notifiche già inviate * interval)
        const nextNotificationTime = new Date(nextOccurrence.getTime() + (-advance + (numSent * interval)) * 60000);
        console.log("nextNotificationTime="+nextNotificationTime);


        //const nextNotificationTime = new Date(nextOccurrence.getTime() - (event.notification_advance || 0) * 60000);
        //console.log("nextNotificationTime="+nextNotificationTime);
        //console.log("now="+now);
        
        if (now >= nextNotificationTime) {
          // Invia la notifica
          await sendNotification(event, nextOccurrence, now, user, email);

          // Aggiorna il contatore di notifiche
          event.notification_num_sent = numSent + 1;
          console.log("event.notification_num_sent="+event.notification_num_sent);

          // Aggiorna la data dell'ultima occorrenza gestita
          event.notification_last_handled = nextOccurrence;

          // Se c'è un limite di ripetizioni di notifica (notification_repetitions), controllalo
          if (event.notification_repetitions !== 0 && event.notification_num_sent >= event.notification_repetitions) {
            console.log("notification_handleRecurringEvent --> notification_stop=true 2");
            if (!event.notification_stop.includes(user)) {
                event.notification_stop.push(user);
              }
          }
          await event.save();
        }
    } catch (error) {
        console.error("[notification_handleRecurringEvent] Errore:", error);
    }
}


async function sendNotification(event, occurrenceDate, now, user, email) {
  if (event.notification_modes && event.notification_modes.length > 0) {
	  if (event.notification_modes.includes('EMAIL')) {
		  console.log("Email a " + email);
          let html = getEventNotificationHtml(event, now, user);
          console.log(html);

          console.log("event.owner="+event.owner);
          console.log("event.title="+event.title);
          try {
              const payload = {
                to: user, //event.owner,
                subject: `Reminder fo event: ${event.title}`,
                html: html //`Ciao ${event.owner}, ti ricordiamo che l'evento "${event.title}" è in programma per il giorno ${occurrenceDate || event.date_end}.`
              }
              await axios.post(`${process.env.SERVER_URL}sendNotification`, payload);
          } catch (error) {
              console.error("Errore: "+error);
          }
	  }

      //console.log(
      //  `Invio notifica per l'evento "${event.title}" all'owner "${event.owner}"`,
      //  occurrenceDate ? ` (occorrenza: ${occurrenceDate})` : ''
      //);
    //}
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
    if (!event.isRecurring || !event.recurring_rule) {
        return null;
    }
    const rruleString = event.recurring_rule.replace('RRULE:', '');
    const options = RRule.parseString(rruleString);

    const dtstart = event.allDay ? event.startDate : copyTimeToDate(event.startDate, event.startTime);
    if (!dtstart) return null;
    options.dtstart = dtstart;
    const rule = new RRule(options);

    // Trova la prossima occorrenza (inclusa la referenceDate se coincide)
    const next = rule.after(referenceDate, true);
    return next || null;
}

//Genera una stringa HTML con i dati principali di un evento, per l'invio della notifica via mail
function getEventNotificationHtml(event, now, user) {
  const referenceDate = now; //new Date();
  let start;
  let end;
  if (event.isRecurring && event.recurring_rule) {
    //Evento ricorrente: calcola la prossima occorrenza
    const nextStart = getNextOccurrence(event, referenceDate);
    if (nextStart) {
      const baseStart = event.allDay ? event.startDate : copyTimeToDate(event.startDate, event.startTime);
      const baseEnd = event.allDay ? event.endDate : copyTimeToDate(event.endDate, event.endTime);

      const durationMs = baseEnd - baseStart;    //durata dell'evento
      const nextEnd = new Date(nextStart.getTime() + durationMs);

      start = nextStart;
      end = nextEnd;
    } else {
      // Nessuna occorrenza futura: usiamo start/end originali
      start = event.allDay ? event.startDate : copyTimeToDate(event.startDate, event.startTime);
      end = event.allDay ? event.endDate : copyTimeToDate(event.endDate, event.endTime);
    }
  } else {
    //Evento non ricorrente
    start = event.allDay ? event.startDate : copyTimeToDate(event.startDate, event.startTime);
    end = event.allDay ? event.endDate : copyTimeToDate(event.endDate, event.endTime);
  }

  // Formattiamo date e orari
  const startDateStr = dayjs(start).format('DD/MM/YYYY');
  const startTimeStr = event.allDay ? 'All day' : dayjs(start).format('HH:mm');
  const endDateStr = dayjs(end).format('DD/MM/YYYY');
  const endTimeStr = event.allDay ? 'All day' : dayjs(end).format('HH:mm');

  // Costruiamo l'HTML
  let html = '<h2>Event reminder:</h2>';
  html += `<p><strong>Title:</strong> ${event.title || ''}</p>`;
  if (event.location) {
    html += `<p><strong>Location:</strong> ${event.location}</p>`;
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
            Disable this event notifications
          </a>
        </p>
      `;

  return html;
}

module.exports = checkAndSendNotifications;
