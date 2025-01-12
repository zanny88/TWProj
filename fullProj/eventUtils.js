const { rrulestr } = require('rrule');
const dayjs = require('dayjs');

//Controlla se due intervalli [startA, endA] e [startB, endB] si sovrappongono
function intervalsOverlap(startA, endA, startB, endB) {
  return (startA <= endB && startB <= endA);
}

/**
 * Genera tutte le occorrenze (come coppie [start, end]) per un evento,
 * limitandole a un range di date [rangeStart, rangeEnd].
 * 
 * @param {Object} event - l'evento (contenente date e recurring_rule).
 * @param {Date} rangeStart - limite inferiore del range da considerare.
 * @param {Date} rangeEnd   - limite superiore del range da considerare.
 * @param {Number} maxOccurrences - numero massimo di occorrenze da generare (per evitare loop enormi).
 * @returns {Array<{start: Date, end: Date}>}
 */
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
function getRecurrenceDescription(recurringRule) {
  try {
    const rule = rrulestr(recurringRule);
    
    // Frequenza
    let freqStr = '';
    switch (rule.options.freq) {
      case RRule.YEARLY:
        freqStr = 'yearly';
        break;
      case RRule.MONTHLY:
        freqStr = 'monthly';
        break;
      case RRule.WEEKLY:
        freqStr = 'weekly';
        break;
      case RRule.DAILY:
        freqStr = 'daily';
        break;
      case RRule.HOURLY:
        freqStr = 'hourly';
        break;
      case RRule.MINUTELY:
        freqStr = 'every minute';
        break;
      case RRule.SECONDLY:
        freqStr = 'every second';
        break;
      default:
        freqStr = 'custom frequency';
        break;
    }

    // Interval
    const interval = rule.options.interval || 1;
    let description = `Recurs ${freqStr}`;
    if (interval > 1) {
      description += ` (every ${interval} ${freqStr === 'custom frequency' ? 'units' : freqStr.slice(0, -2) + 's'})`;
    }

    // ByDay, se presente
    if (rule.options.byweekday && rule.options.byweekday.length > 0) {
      const weekdays = rule.options.byweekday.map((wd) => RRule.weekdayToString(wd.weekday)).join(', ');
      description += ` on ${weekdays}`;
    }

    // Fino a data di fine (UNTIL) se presente
    if (rule.options.until) {
      description += ` until ${dayjs(rule.options.until).format('YYYY-MM-DD')}`;
    }

    // Numero di ricorrenze (COUNT) se presente
    if (rule.options.count) {
      description += ` for ${rule.options.count} time(s)`;
    }

    return description;
  } catch (error) {
    //Se non riesce il parsing o manca la rrule, restituisco una stringa di default
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
function generateEventInviteHTML(event, user) {
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
  const eventId = event._id || 'unknown-id';

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
      h1 {
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
      <h2>You're invited: ${event.title || 'Untitled Event'}</h2>

      <p><span class="section-title">Place:</span> <span class="info">${event.place || 'N/A'}</span></p>
      <p><span class="section-title">Starts:</span> <span class="info">${startStr}</span></p>
      <p><span class="section-title">Ends:</span> <span class="info">${endStr}</span></p>
      <p><span class="section-title">All Day:</span> <span class="info">${event.all_day ? 'Yes' : 'No'}</span></p>

      <p><span class="section-title">Recurrence:</span> <span class="info">${recurringDescription}</span></p>

      <p><span class="section-title">Notifications:</span> 
        <div class="info">${notificationInfo}</div>
      </p>

      <p><span class="section-title">Priority:</span> <span class="info">${priorityStr}</span></p>`;

      <!-- Pulsanti Accept e Refuse -->
      const acceptUrl = `${process.env.SERVER_URL}acceptEventInvite/${event._id}/${user}`;
      const refuseUrl = `${process.env.SERVER_URL}refuseEventInvite/${event._id}/${user}`;
      html += `
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

module.exports = {
  generateEventInviteHTML, eventsOverlap
};
