const { rrulestr, RRule } = require('rrule');
const dayjs = require('dayjs');
const minMax = require('dayjs/plugin/minMax');
dayjs.extend(minMax);
const axios = require('axios');

//Controlla se due intervalli [startA, endA] e [startB, endB] si sovrappongono
function intervalsOverlap(startA, endA, startB, endB) {
  return (startA <= endB && startB <= endA);
}

//Funzione che genera tutte le occorrenze (come coppie [start, end]) per un evento, limitandole a un range di date [rangeStart, rangeEnd].
function getEventOccurrences(event, rangeStart, rangeEnd, maxOccurrences = 1000) {
  if (!event.is_recurring) {
    const eventStart = dayjs(event.date_start);
    const eventEnd = dayjs(event.date_end);

    // Controlliamo se [eventStart, eventEnd] è almeno parzialmente dentro [rangeStart, rangeEnd]
    if (intervalsOverlap(eventStart.valueOf(), eventEnd.valueOf(), dayjs(rangeStart).valueOf(), dayjs(rangeEnd).valueOf())) {
      return [{ start: eventStart.toDate(), end: eventEnd.toDate() }];
    } else {
      return [];
    }
  }

  //Evento ricorrente
  let rule;
  try {
    rule = rrulestr(event.recurring_rule, { dtstart: new Date(event.date_start) });
  } catch (err) {
    console.error('Errore nella creazione rrule', err);
    return [];
  }

  //generiamo le occorrenze nel range [rangeStart, rangeEnd]
  const occurrences = rule.between(rangeStart, rangeEnd, true);
  const duration = dayjs(event.date_end).diff(dayjs(event.date_start), 'millisecond');    //durata dell'evento

  //costruiamo le coppie start/end di ogni occorrenza, rispettando la durata
  const results = [];
  for (let i = 0; i < occurrences.length && i < maxOccurrences; i++) {
    const occStart = dayjs(occurrences[i]);
    const occEnd = occStart.add(duration, 'millisecond');

    // Verifichiamo anche se l'intervallo di questa occorrenza è almeno parzialmente dentro [rangeStart, rangeEnd]
    if (intervalsOverlap(occStart.valueOf(), occEnd.valueOf(), dayjs(rangeStart).valueOf(), dayjs(rangeEnd).valueOf())) {
      results.push({ start: occStart.toDate(), end: occEnd.toDate() });
    }
  }
  return results;
}

//Funzione che, dati due eventi (eventA, eventB), restituisce true se esiste almeno una sovrapposizione nel range considerato.
function eventsOverlap(eventA, eventB) {
  const rangeStart = dayjs.min(dayjs(eventA.date_start), dayjs(eventB.date_start)).toDate();
  const rangeEnd = dayjs.max(dayjs(eventA.date_end), dayjs(eventB.date_end)).toDate();

  // Generiamo le occorrenze dei due eventi
  const occurrencesA = getEventOccurrences(eventA, rangeStart, rangeEnd);
  const occurrencesB = getEventOccurrences(eventB, rangeStart, rangeEnd);

  // Controlliamo ogni coppia di occorrenze
  for (const occA of occurrencesA) {
    for (const occB of occurrencesB) {
      if (intervalsOverlap(dayjs(occA.start).valueOf(), dayjs(occA.end).valueOf(), dayjs(occB.start).valueOf(), dayjs(occB.end).valueOf())) {
        return true; // Basta una sola sovrapposizione
      }
    }
  }
  //Nessuna sovrapposizione trovata
  return false;
}





//Restituisce una descrizione in inglese della ricorrenza
// Modifica della funzione getRecurrenceDescription
function getRecurrenceDescription(recurringRule) {
  try {
    const rule = rrulestr(recurringRule);
    const options = rule.options;
    const descriptions = [];

    // Frequenza
    const freqMap = {
      [RRule.YEARLY]: 'yearly',
      [RRule.MONTHLY]: 'monthly',
      [RRule.WEEKLY]: 'weekly',
      [RRule.DAILY]: 'daily',
      [RRule.HOURLY]: 'hourly',
      [RRule.MINUTELY]: 'every minute',
      [RRule.SECONDLY]: 'every second',
    };
    const freqMap2 = {
      [RRule.YEARLY]: 'years',
      [RRule.MONTHLY]: 'months',
      [RRule.WEEKLY]: 'weeks',
      [RRule.DAILY]: 'days',
      [RRule.HOURLY]: 'hours',
      [RRule.MINUTELY]: 'minutes',
      [RRule.SECONDLY]: 'seconds',
    };
    const freqStr = freqMap[options.freq] || 'custom frequency';
    descriptions.push(`Recurs ${freqStr}`);

    // Interval
    if (options.interval && options.interval > 1) {
      const freqStr2 = freqMap2[options.freq] || 'custom frequency';
      descriptions.push(`every ${options.interval} ${freqStr2}`);
    }

    // ByDay
    if (options.byweekday && options.byweekday.length > 0 && !options.until && !options.count && !(!options.until && !options.count)) {
      const weekdaysMap = {
        MO: 'Monday',
        TU: 'Tuesday',
        WE: 'Wednesday',
        TH: 'Thursday',
        FR: 'Friday',
        SA: 'Saturday',
        SU: 'Sunday'
      };
      const weekdays = options.byweekday.map(wd => weekdaysMap[wd.toString().slice(0, 2)]).join(', ');
      descriptions.push(`on ${weekdays}`);
    }

    // Until
    if (options.until) {
      descriptions.push(`until ${dayjs(options.until).format('YYYY-MM-DD')}`);
    }

    // Count
    if (options.count) {
      descriptions.push(`for ${options.count} time(s)`);
    }
    if (!options.until && !options.count) {
      descriptions.push('forever');
    }

    return descriptions.join(' ');
  } catch (error) {
    console.error('Error generating recurrence description:', error);
    return 'Recurring rule not valid or not provided.';
  }
}



//Ritorna una breve descrizione della configurazione di notifica
function getNotificationSummary(event) {
  if (!event.has_notification) {
    return 'No notifications enabled.';
  }
  let summaryNotif = `Notifications are enabled via: ${event.notification_modes.join(', ')}.`;
  if (event.notification_advance) {
    summaryNotif += `<br/>Advance notice: ${event.notification_advance} minute(s).`;
  }
  if (event.notification_repetitions === 0) {
    summaryNotif += '<br/>Repetitions: infinite.';
  } else if (event.notification_repetitions) {
    summaryNotif += `<br/>Repetitions: ${event.notification_repetitions}.`;
  }
  if (event.notification_interval) {
    summaryNotif += `<br/>Interval between notifications: ${event.notification_interval} minute(s).`;
  }
  return summaryNotif;
}

//Genera una stringa HTML da utilizzare in un'email di invito
function generateEventInvitationHTML(event, user, ownerDB) {
  // Formatto le date d'inizio e fine
  const formatString = 'YYYY-MM-DD HH:mm';
  const startStr = event.date_start ? dayjs(event.date_start).format(formatString) : 'N/A';
  const endStr = event.date_end ? dayjs(event.date_end).format(formatString) : 'N/A';

  // Descrizione della ricorrenza
  let recurringDescription = 'Not recurring';
  if (event.is_recurring && event.recurring_rule) {
    recurringDescription = getRecurrenceDescription(event.recurring_rule);
  }

  const map = {
    1: 'Low',
    2: 'Normal',
    3: 'High',
    4: 'Highest',
  };
  const priorityStr = map[event.priority] || 'Unknown';  //Priorità
  const notificationInfo = getNotificationSummary(event);  //Info sulle notifiche
  const inviteStr = (ownerDB != null && ownerDB.name ? ownerDB.name + " invited you to the Event: " : "You're invited to the Event: ") + (event.title || 'Untitled Event');

  const acceptUrl = `${process.env.SERVER_URL}acceptEventInvitation/${event._id}/${user}`;
  const refuseUrl = `${process.env.SERVER_URL}refuseEventInvitation/${event._id}/${user}`;
  let html = `
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Event Invitation</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.4;
      }
      .container {
        max-width: 600px;
        margin: auto;
      }
      h2 {
        color: #333;
      }
      .section-title {
        font-weight: bold;
        margin-top: 20px;
      }
      .info {
        margin-left: 10px;
      }
      .buttons {
        margin-top: 30px;
      }
      .button {
        display: inline-block;
        padding: 10px 20px;
        text-decoration: none;
        margin-right: 10px;
        color: #fff;
        border-radius: 4px;
      }
      .accept {
        background-color: green;
      }
      .refuse {
        background-color: red;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>${inviteStr}</h2>

      <p><span class="section-title">Description:</span> <span class="info">${event.description || 'N/A'}</span></p>
      <p><span class="section-title">Place:</span> <span class="info">${event.place || 'N/A'}</span></p>
      <p><span class="section-title">Starts:</span> <span class="info">${startStr}</span></p>
      <p><span class="section-title">Ends:</span> <span class="info">${endStr}</span></p>
      <p><span class="section-title">All Day:</span> <span class="info">${event.all_day ? 'Yes' : 'No'}</span></p>

      <p><span class="section-title">Recurrence:</span> <span class="info">${recurringDescription}</span></p>

      <p><span class="section-title">Notifications:</span> 
        <div class="info">${notificationInfo}</div>
      </p>

      <p><span class="section-title">Priority:</span> <span class="info">${priorityStr}</span></p>
      <div class="buttons">
        <a class="button accept" href="${acceptUrl}">Accept</a>
        <a class="button refuse" href="${refuseUrl}">Refuse</a>
      </div>
    </div>
  </body>
</html>
`;
  return html;
}


//gestione degli eventuali partecipanti all'evento condiviso
async function manageEventParticipants(event, Event, User) {
  try {
    if (!event || !event.selectedParticipants || event.selectedParticipants.length == 0) {
      return;  //nulla da fare --> esco
    }
    const part_waiting = event.participants_waiting || [];
    const part_accepted = event.participants_accepted || [];
    const part_refused = event.participants_refused || [];
    for (let i = 0; i < event.selectedParticipants.length; i++) {
      const user = event.selectedParticipants[i];
      if (part_waiting.includes(user) || part_accepted.includes(user) || part_refused.includes(user)) {
        continue;
      }
      //Controllo se ci sono eventi di tipo "notAvailable" sovrapposti
      const eventsNotAvailable = await Event.find({ owner: user, ev_type: 'notAvailable' });
      if (!eventsNotAvailable) {
        continue;
      }
      let overlapped = false;
      for (let k = 0; k < eventsNotAvailable.length; k++) {
        const ev = eventsNotAvailable[k];
        if (eventsOverlap(event, ev)) {  //Evento "notAvailable" sovrapposto --> rifiuto in automatico l'invito
          overlapped = true;
          event.participants_refused.push(user);
          await event.save();
          break;
        }
      }
      if (!overlapped) {
        const userDB = await User.findOne({ username: user });
        const ownerDB = await User.findOne({ username: event.owner });
        const formatString = 'YYYY-MM-DD HH:mm';
        const startStr = event.date_start ? dayjs(event.date_start).format(formatString) : 'N/A';
        const endStr = event.date_end ? dayjs(event.date_end).format(formatString) : 'N/A';
        const map = {
          1: 'Low',
          2: 'Normal',
          3: 'High',
          4: 'Highest',
        };
        const priorityStr = map[event.priority] || 'Unknown';  //Priorità
        const eventDescription = '\nDescription: ' + event.title +
          '\nPlace: ' + event.place +
          '\nStarts: ' + startStr +
          '\nEnds: ' + endStr +
          '\nAll Day: ' + (event.all_day ? 'Yes' : 'No') +
          '\nPriority: ' + priorityStr;
        if (userDB && userDB.mail) {
          //mando l'invito
          let html = generateEventInvitationHTML(event, user, ownerDB);
          try {
            let payload = {
              to: user,
              subject: `Invitation for event: ${event.title}`,
              html: html
            }
            await axios.post(`${process.env.SERVER_URL}sendNotification`, payload);
            event.participants_waiting.push(user);
            await event.save();

            //mando anche il messaggio all'utente
            payload = {
              toUser: user,
              fromUser: event.owner,
              message: 'An invitation for an event has been sent to you by ' + event.owner + ':' +
                eventDescription +
                '\n\nYou can accept or refuse it using the buttons here or in the email.',
              data: {
                eventId: event._id
              }
            }
            await axios.post(`${process.env.SERVER_URL}user/sendMessage`, payload);
          } catch (error) {
            console.error("Errore: " + error);
          }
        } else {
          console.error("Invito all'evento non inviato a " + user + " per mancanza di mail configurata!");
          //mando il messaggio all'utente
          const payload = {
            toUser: user,
            fromUser: event.owner,
            message: 'An invitation for an event has been sent to you by ' + event.owner + ':' +
              eventDescription +
              '\n\nYou can accept or refuse it using the buttons here.\nTo receive an email as well for further invitations set the email in User Data.',
            data: {
              eventId: event._id
            }
          }
          await axios.post(`${process.env.SERVER_URL}user/sendMessage`, payload);
        }
      }
    }
  } catch (error) {
    console.error("Errore nella gestione dei partecipanti all'evento: ", error);
  }
}

const generateHTMLResponse = (title, message, color) => `
    <html>
        <head>
            <title>${title}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    text-align: center;
                    margin-top: 50px;
                }
                .message {
                    display: inline-block;
                    padding: 20px;
                    border: 2px solid ${color};
                    border-radius: 10px;
                    background-color: ${color === '#4CAF50' ? '#f9fff9' : '#fff9f9'};
                }
                .message h1 {
                    color: ${color};
                }
            </style>
        </head>
        <body>
            <div class="message">
                <h1>${title}</h1>
                <h2>${message}</h2>
            </div>
        </body>
    </html>
`;


async function disableEventNotification(eventId, user, Event) {
  try {
    const event_ = await Event.findOne({ _id: eventId });
    if (!event_) {
      console.error("Event not found: " + eventId);
      return `
                <html>
                    <head><title>Event Not Found</title></head>
                    <body>
                        <h1>Event Not Found</h1>
                        <p>The event you are trying to modify does not exist.</p>
                    </body>
                </html>
            `;
    }
    if (!event_.notification_stop.includes(user)) {
      event_.notification_stop.push(user);
      await event_.save();
    }
    return generateHTMLResponse("Notifications Disabled", "You have successfully disabled this event's notifications.", "#4CAF50");
  } catch (error) {
    console.error("ERROR: ", error);
    return `
            <html>
                <head><title>Error</title></head>
                <body>
                    <h1>An Error Occurred</h1>
                    <p>We were unable to disable event notifications. Please try again later.</p>
                </body>
            </html>
        `;
  }
}


//gestione accettazione di invito ad un evento per un utente
async function acceptEventInvitation(eventId, user, Event) {
  try {
    const event_ = await Event.findOne({ _id: eventId });
    if (!event_) {
      console.error("Event not found: " + eventId);
      return `
                <html>
                    <head><title>Event Not Found</title></head>
                    <body>
                        <h1>Event Not Found</h1>
                        <p>The event you are trying to accept does not exist.</p>
                    </body>
                </html>
            `;
    }
    const part_waiting = event_.participants_waiting || [];
    const part_refused = event_.participants_refused || [];
    if (part_waiting.includes(user)) {
      event_.participants_waiting = part_waiting.filter(item => item !== user);
    }
    if (part_refused.includes(user)) {
      event_.participants_refused = part_refused.filter(item => item !== user);
    }
    if (!event_.participants_accepted.includes(user)) {
      event_.participants_accepted.push(user);
    }
    await event_.save();
    return generateHTMLResponse("Event Accepted", "You have successfully accepted the event invitation.", "#4CAF50");
  } catch (error) {
    console.error("ERROR: ", error);
    return `
            <html>
                <head><title>Error</title></head>
                <body>
                    <h1>An Error Occurred</h1>
                    <p>We were unable to accept the event. Please try again later.</p>
                </body>
            </html>
        `;
  }
}

//gestione rifiuto di invito ad un evento per un utente
async function refuseEventInvitation(eventId, user, Event) {
  try {
    const event_ = await Event.findOne({ _id: eventId });
    if (!event_) {
      console.error("Event not found: " + eventId);
      return `
                <html>
                    <head><title>Event Not Found</title></head>
                    <body>
                        <h1>Event Not Found</h1>
                        <p>The event you are trying to refuse does not exist.</p>
                    </body>
                </html>
            `;
    }
    const part_waiting = event_.participants_waiting || [];
    const part_accepted = event_.participants_accepted || [];
    if (part_waiting.includes(user)) {
      event_.participants_waiting = part_waiting.filter(item => item !== user);
    }
    if (part_accepted.includes(user)) {
      event_.participants_accepted = part_accepted.filter(item => item !== user);
    }
    if (!event_.participants_refused.includes(user)) {
      event_.participants_refused.push(user);
    }
    await event_.save();
    return generateHTMLResponse("Event Refused", "You have successfully refused the event invitation.", "#f44336");
  } catch (error) {
    console.error("ERROR: ", error);
    return `
            <html>
                <head><title>Error</title></head>
                <body>
                    <h1>An Error Occurred</h1>
                    <p>We were unable to refuse the event. Please try again later.</p>
                </body>
            </html>
        `;
  }
}


module.exports = { manageEventParticipants, disableEventNotification, acceptEventInvitation, refuseEventInvitation };
