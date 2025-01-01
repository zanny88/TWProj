const { /*RRule, RRuleSet,*/ rrulestr } = require('rrule');

/**
 * Funzione che, ogni N secondi, controlla tutti gli eventi con has_notification=true
 * e verifica se è il momento di inviare la notifica, considerando anche le ricorrenze.
 * MongoDBEvent è l'archivio di eventi MongoDB mappati con Mongoose.
 */
async function checkAndSendNotifications(MongoDBEvent) {
    //console.log("checkAndSendNotifications-START");
    try {
        const events = await MongoDBEvent.find({
            has_notification: true,
            $or: [{ is_recurring: true }, { $expr: { $not: { $in: [ "$owner", "$notification_stop" ] } } }]       //Ricorrenti oppure owner NON presente in notification_stop
        });

        const now = new Date();

        for (const ev of events) {
            //console.log("gestione evento: "+JSON.stringify(ev));
            console.log("gestione evento '"+ev.title+"'");
            if (ev.is_recurring && ev.recurring_rule) {  //Se l'evento è ricorrente, devo calcolare la prossima occorrenza basandomi sulla rrule
                await notification_handleRecurringEvent(ev, now);
            } else {
                await notification_handleSingleEvent(ev, now);
            }
        }
    } catch (error) {
        console.error("[checkAndSendNotifications] Errore:", error);
    }
    //console.log("checkAndSendNotifications-END");
}


/**
 * Gestisce un evento NON ricorrente: verifica se è giunto il momento di inviare la prossima notifica.
 */
async function notification_handleSingleEvent(event, now) {
	//console.log("notification_handleSingleEvent(" + JSON.stringify(event) + ")");
    try {
        // Se l'evento ha già raggiunto il numero massimo di notifiche, esco
        if (event.notification_repetitions !== 0 && event.notification_num_sent >= event.notification_repetitions) {
            console.log("notification_handleSingleEvent --> notification_stop=true 1");
            if (!event.notification_stop.includes(event.owner)) {
                event.notification_stop.push(event.owner);
            }
            await event.save();
            return;
        }

        if (event.date_end && now >= event.date_end) {
            console.log("notification_handleSingleEvent --> notification_stop=true 2");
            if (!event.notification_stop.includes(event.owner)) {
                event.notification_stop.push(event.owner);
            }
            await event.save();
            return;
        }

        //Calcolo l'orario di invio della prossima notifica.
        let baseDate = event.notification_advance_date; 
        if (!baseDate) baseDate = new Date(event.date_start.getTime() - (event.notification_advance * 60000)); // se non è impostata, prendo date_start - notification_advance minuti

        const interval = event.notification_interval || 0; 
        const numSent = event.notification_num_sent || 0;
        const nextNotificationTime = new Date(baseDate.getTime() + numSent * interval * 60000);
        console.log("nextNotificationTime="+nextNotificationTime);
        //console.log("now="+now);

        if (now >= nextNotificationTime) {
          await sendNotification(event);

          //Aggiorna contatore delle notifiche inviate
          event.notification_num_sent = numSent + 1;

          // Se abbiamo inviato abbastanza notifiche da raggiungere notification_repetitions (se non è 0) --> imposto notification_stop
          if (event.notification_repetitions !== 0 && event.notification_num_sent >= event.notification_repetitions) {
            console.log("notification_handleSingleEvent --> notification_stop=true 3");
            if (!event.notification_stop.includes(event.owner)) {
                event.notification_stop.push(event.owner);
              }
          }

          await event.save();
        }
    } catch (error) {
        console.error("[notification_handleSingleEvent] Errore:", error);
    }
}


/**
 * Gestisce un evento ricorrente utilizzando la RRULE.
 */
async function notification_handleRecurringEvent(event, now) {
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
          if (!event.notification_stop.includes(event.owner)) {
            event.notification_stop.push(event.owner);
          }
          await event.save();
          return;
        }
        if (!event.notification_last_handled || nextOccurrence.getTime() != event.notification_last_handled.getTime()){  	//E' cambiata l'occorrenza rispetto all'ultima considerata
            //console.log("nextOccurrence="+nextOccurrence);
            //console.log("event.notification_last_handled="+event.notification_last_handled);
            event.notification_num_sent = 0;
            event.notification_last_handled = nextOccurrence;
        } else if (event.notification_stop.includes(event.owner)) {
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
          await sendNotification(event, nextOccurrence);

          // Aggiorna il contatore di notifiche
          event.notification_num_sent = numSent + 1;
          console.log("event.notification_num_sent="+event.notification_num_sent);

          // Aggiorna la data dell'ultima occorrenza gestita
          event.notification_last_handled = nextOccurrence;

          // Se c'è un limite di ripetizioni di notifica (notification_repetitions), controllalo
          if (event.notification_repetitions !== 0 && event.notification_num_sent >= event.notification_repetitions) {
            console.log("notification_handleRecurringEvent --> notification_stop=true 2");
            if (!event.notification_stop.includes(event.owner)) {
                event.notification_stop.push(event.owner);
              }
          }
          await event.save();
        }

        // Se vuoi, potresti continuare a calcolare la "successiva" occorrenza in un while
        // finché la prossima data è comunque <= now (per gestire i ritardi di esecuzione),
        // ma qui dipende da come preferisci gestire eventuali "arretrati".

    } catch (error) {
        console.error("[notification_handleRecurringEvent] Errore:", error);
    }
}


/**
 * Esempio di funzione "fittizia" che simula l'invio di una notifica
 * (Email, SMS, push, console.log, etc.)
 */
async function sendNotification(event, occurrenceDate) {
  // Esempio: potresti avere un array di "notification_modes" con i canali di invio
  if (event.notification_modes && event.notification_modes.length > 0) {
	  if (event.notification_modes.includes('EMAIL')) {
		  console.log("Email");
	  }
    //for (const mode of event.notification_modes) {
    //  switch (mode) {
    //   ...
    //  }
      console.log(
        `Invio notifica per l'evento "${event.title}" all'owner "${event.owner}"`,
        occurrenceDate ? ` (occorrenza: ${occurrenceDate})` : ''
      );
    //}
  } else {
    console.log(`Invio notifica standard per l'evento "${event.title}"`);
  }
}

module.exports = checkAndSendNotifications;
