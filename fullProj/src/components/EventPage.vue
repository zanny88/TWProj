<template>
  <div class="container mt-5">
    <h2>Event form</h2>
    <form>
      <div class="mb-3">
        <label for="title" class="form-label">Title</label>
        <input type="text" id="title" class="form-control" v-model="event.title" placeholder="Enter event title" :class="{'is-invalid': titleError}" />
		<div v-if="titleError" class="invalid-feedback">
			Title is mandatory!
		</div>
      </div>

      <div class="mb-3">
        <label for="location" class="form-label">Location</label>
        <input type="text" id="location" class="form-control" v-model="event.location" placeholder="Enter event location" />
      </div>

      <div class="mb-3 form-switch">
        <input type="checkbox" id="allDay" class="form-check-input" v-model="event.allDay" />
        <label for="allDay" class="form-check-label switch-label-margin">All Day Event</label>
      </div>

      <div class="row mb-3">
        <div class="col-md-7">
          <div class="form-group">
			<div class="mb-3">
				<label for="startDate" class="form-label">Start Date</label>
				<VueDatePicker v-model="event.startDate" :format="format" :enable-time-picker="false" :auto-apply="true" />
			</div>
          </div>
        </div>
        <div class="col-md-5" v-if="!event.allDay">
          <div class="form-group">
            <label for="startTime" class="form-label">Start Time</label>
			<VueDatePicker v-model="event.startTime" time-picker placeholder="Select start time" model-type="timestamp" />
          </div>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-md-7">
          <div class="form-group">
			<div class="mb-3">
				<label for="endDate" class="form-label">End Date</label>
				<div :class="{'is-invalid': endDateError}">
					<VueDatePicker
					  v-model="event.endDate"
					  :format="format"
					  :enable-time-picker="false"
					  :auto-apply="true"
					/>
				</div>
				<div v-if="endDateError" class="invalid-feedback">
					End Date must be after Start Date!
				</div>
			</div>
		  </div>
        </div>
        <div class="col-md-5" v-if="!event.allDay">
          <div class="form-group">
            <label for="endTime" class="form-label">End Time</label>
			<VueDatePicker v-model="event.endTime" time-picker placeholder="Select end time" model-type="timestamp" />
          </div>
        </div>
      </div>

      <div class="mb-3 form-switch">
        <input type="checkbox" id="recurringEvent" class="form-check-input" v-model="event.isRecurring" />
        <label for="recurringEvent" class="form-check-label switch-label-margin">Recurring event</label>
      </div>

      <!-- Selezione della frequenza -->
      <div v-if="event.isRecurring" class="mb-3">
        <label for="frequency" class="form-label">Frequency</label>
        <select id="frequency" class="form-select" v-model="event.frequency">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
          <option value="specific_day_month">Specific Day of the Month</option>
          <option value="specific_weekday_month">Specific Weekday of the Month</option>
        </select>
      </div>

      <div v-if="event.frequency === 'specific_day_month'" class="mb-3">
        <label for="specificDay" class="form-label">Choose the Day of the Month</label>
        <input type="number" id="specificDay" class="form-control" min="1" max="31" v-model="event.specificDay" placeholder="Enter day of the month (e.g. 4)" />
      </div>

      <div v-if="event.frequency === 'specific_weekday_month'" class="mb-3">
        <label for="weekNumber" class="form-label">Choose Week Number</label>
        <select id="weekNumber" class="form-select" v-model="event.weekNumber">
          <option value="first">First</option>
          <option value="second">Second</option>
          <option value="third">Third</option>
          <option value="fourth">Fourth</option>
          <option value="last">Last</option>
        </select>

        <label for="weekday" class="form-label mt-3">Choose the Day of the Week</label>
        <select id="weekday" class="form-select" v-model="event.weekday">
          <option value="monday">Monday</option>
          <option value="tuesday">Tuesday</option>
          <option value="wednesday">Wednesday</option>
          <option value="thursday">Thursday</option>
          <option value="friday">Friday</option>
          <option value="saturday">Saturday</option>
          <option value="sunday">Sunday</option>
        </select>
      </div>

      <div v-if="event.isRecurring" class="mb-3">
        <label class="form-label">Recurrence End Option</label>
        <div>
          <div class="form-check">
            <input type="radio" id="repeatForever" value="forever" class="form-check-input" v-model="event.recurringEndOption" />
            <label for="repeatForever" class="form-check-label">Repeat Forever</label>
          </div>
          <div class="form-check">
            <input type="radio" id="repeatNTimes" value="untilCount" class="form-check-input" v-model="event.recurringEndOption" />
            <label for="repeatNTimes" class="form-check-label">
              Repeat N times
              <input type="number" min="1" v-model="event.repeatCount" class="form-control mt-2" v-if="event.recurringEndOption === 'untilCount'" />
            </label>
          </div>
          <div class="form-check">
            <input type="radio" id="repeatUntilDate" value="untilDate" class="form-check-input" v-model="event.recurringEndOption" />
            <label for="repeatUntilDate" class="form-check-label">
              Repeat until specific date
			  <VueDatePicker v-model="event.untilDate" :format="format" :enable-time-picker="false" :auto-apply="true" v-if="event.recurringEndOption === 'untilDate'" />
            </label>
          </div>
        </div>
      </div>

      <div class="mb-4 form-switch">
        <input type="checkbox" id="eventTypeNotAvailable" class="form-check-input" v-model="event.eventTypeNotAvailable" />
        <label for="eventTypeNotAvailable" class="form-check-label switch-label-margin">Event type: not available</label>
      </div>


		<!-- PRIORITY SECTION START -->
		<div class="mb-3">
		  <label for="priority" class="form-label">Priority</label>
		  <select id="priority" class="form-select w-auto" v-model="event.priority">
			<option value="1">Low (1)</option>
			<option value="2">Normal (2)</option>
			<option value="3">High (3)</option>
			<option value="4">Highest (4)</option>
		  </select>
		</div>
		<!-- PRIORITY SECTION END -->

		<!-- NOTIFICATION SECTION START -->
      <div class="mb-3 form-switch mt-4">
        <input type="checkbox" id="reminderEnabled" class="form-check-input" v-model="reminder.enabled" />
        <label for="reminderEnabled" class="form-check-label switch-label-margin">Enable notification</label>
      </div>

      <!-- Se il reminder è abilitato, mostra i parametri di configurazione -->
      <div v-if="reminder.enabled">

        <!-- Canali di notifica -->
        <!--<div class="mb-3">
          <label class="form-label">Notification channels</label>
          <div class="form-check">
            <input type="checkbox" id="alertChannel" class="form-check-input" v-model="reminder.channels.alert" />
            <label for="alertChannel" class="form-check-label">Alert</label>
          </div>
          <div class="form-check">
            <input type="checkbox" id="emailChannel" class="form-check-input" v-model="reminder.channels.email" />
            <label for="emailChannel" class="form-check-label">Email</label>
          </div>
          <div v-if="channelsError" class="text-danger">
            Please choose at least one channel!
          </div>
        </div>-->

        <!-- Offset: in minuti (scelta veloce) oppure orario esatto con DatePicker -->
        <div class="mb-3">
          <label class="form-label">Notification offset</label>

          <div class="form-check">
            <input type="radio" id="offsetTypeMinutes" class="form-check-input" value="minutes" v-model="reminder.offsetType" />
            <label for="offsetTypeMinutes" class="form-check-label">Offset in minutes</label>
          </div>

          <div class="ms-4" v-if="reminder.offsetType === 'minutes'">
            <select v-model="reminder.offsetMinutes" class="form-select w-auto mt-1">
              <option v-for="opt in offsetOptions" :key="opt" :value="opt">
                {{ formatOffsetOption(opt) }}
              </option>
            </select>
          </div>

          <div class="form-check mt-2">
            <input type="radio" id="offsetTypeExact" class="form-check-input" value="exact" v-model="reminder.offsetType" />
            <label for="offsetTypeExact" class="form-check-label">Exact time</label>
          </div>

          <div class="ms-4" v-if="reminder.offsetType === 'exact'">
            <VueDatePicker v-model="reminder.offsetTime" :format="timeFormat" :enable-time-picker="true" time-picker :auto-apply="true" placeholder="Select offset time" />
          </div>
        </div>

        <!-- Ripetizioni -->
        <div class="mb-3">
          <label class="form-label">Repetitions</label>
          <input type="number" class="form-control w-auto" min="0" v-model="reminder.repeatCount" placeholder="0 = indefinite" />
          <div class="form-text">Use 0 for repetitions until stopped</div>
        </div>

        <!-- Intervallo tra ripetizioni -->
        <div class="mb-3">
          <label class="form-label">Interval between notifications (minutes)</label>
          <select v-model="reminder.repeatInterval" class="form-select w-auto" @change="checkCustomInterval">
            <option value="1">1 minute</option>
            <option value="5">5 minutes</option>
            <option value="10">10 minutes</option>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">60 minutes</option>
            <option value="-1">Custom...</option>
          </select>
          <div class="mt-2" v-if="reminder.isCustomRepeatInterval">
            <input type="number" class="form-control w-auto" min="1" v-model="reminder.customRepeatInterval" placeholder="Enter custom minutes" />
          </div>
        </div>
      </div>
      <!-- NOTIFICATION SECTION END -->

      
	  
	  <div class="mt-4 d-flex justify-content-between align-items-center gap-2">
		  <div class="d-flex gap-2">
			<button type="button" class="btn btn-outline-primary" @click="saveEvent">{{ formType }}</button>
			<button type="button" class="btn btn-outline-secondary" @click="cancel">Cancel</button>
		  </div>
		  <button type="button" class="btn btn-outline-danger" @click="remove" v-if="props.id!=-1">Remove</button>
	  </div>
    </form>
  </div>
  </template>


<script setup>
import { onMounted, ref, nextTick, inject, reactive, watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';  
dayjs.extend(customParseFormat);

const api_url = inject('api_url');
const user = atob(localStorage.getItem('token').split('.')[1]);
const router = useRouter();
const props = defineProps(['id','callback','eventDate']);
const titleError = ref(false);
const endDateError = ref(false);



// Dati dell'Evento
const event = reactive({
	title: '',
	location: '',
	startDate: null,
	startTime: null,
	endDate: null,
	endTime: null,
	allDay: false,
	//variabili per l'evento ricorrente
	isRecurring: false,
	frequency: '',
	specificDay: null,
	weekNumber: '',
	weekday: '',
	recurringEndOption: 'forever',
	repeatCount: 1,
	untilDate: null,
	//
	eventTypeNotAvailable: false,
	recurring_rule: '',
	priority: 2   // default = Normal
});



// Dati per le notifiche
const reminder = reactive({
	enabled: false,                  // Switch principale
	channels: {
		alert: false,
		email: true
	},
	offsetType: 'minutes',          // "minutes" oppure "exact"
	offsetMinutes: 30,              // Valore selezionato dall’elenco
	offsetTime: null,               // Data/ora, se si sceglie "exact"
	repeatCount: 3,                 // 0 = illimitato
	repeatInterval: 15,              // Intervallo (in minuti)
	isCustomRepeatInterval: false,  // Flag per mostrare l'input custom
	customRepeatInterval: null      // Valore personalizzato
});

// Valori possibili per l’offset in minuti
const offsetOptions = [1, 5, 10, 15, 30, 60, 120, 1440, 2880];

// Errore se non vengono scelti canali (solo se reminder.enabled = true)
const channelsError = ref(false);

const formatOffsetOption = (val) => {
  // Serve a stampare in modo più leggibile i minuti
  switch(val) {
    case 1: return '1 minute before';
    case 5: return '5 minutes before';
    case 10: return '10 minutes before';
    case 15: return '15 minutes before';
    case 30: return '30 minutes before';
    case 60: return '1 hour before';
    case 120: return '2 hours before';
    case 1440: return '1 day before';
    case 2880: return '2 days before';
    default: return `${val} min before`;
  }
};

// Formato orario per VueDatePicker
const timeFormat = (date) => {
  return dayjs(date).format('HH:mm');
};

// Funzione per gestire cambio nel <select> delle ripetizioni
const checkCustomInterval = () => {
  if (reminder.repeatInterval === '-1') {
    reminder.isCustomRepeatInterval = true;
    reminder.customRepeatInterval = null; // reset
  } else {
    reminder.isCustomRepeatInterval = false;
  }
};










var formType = ref('');

//alert('props='+JSON.stringify(props));
if (props.id == '-1'){
	event.startDate = dayjs(props.eventDate, 'DDMMYYYY', true).toDate();
	event.endDate = event.startDate;
	event.startTime = new Date().getTime();
	event.endTime = dayjs(event.startTime).add(1, 'hour').toDate().getTime();
	//date_start.value = dayjs(props.eventDate, 'DDMMYYYY', true).format('YYYY-MM-DD');
	//alert("event.startDate="+event.startDate+", event.endDate="+event.endDate +", date_start.value=" +date_start.value);
	//alert("Event="+JSON.stringify(event));
}



async function getEvent(eventId){
	try{
		const res = await axios.get(api_url + "getEvents/" + user + "/" + eventId);
		var Events = res.data;
		await nextTick();
		var event_ = Events[0];
		//alert("event_= " + JSON.stringify(event_));
		event.title = event_.title;
		//day.value = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());   //toglie le ore dalla data    event_.day; // dayjs(event_.day).format('DD/MM/YYYY');
		event.startDate = dayjs(event_.date_start).toDate();
		event.startTime = dayjs(event.startDate).toDate().getTime();
		event.endDate = dayjs(event_.date_end).toDate();
		event.endTime = dayjs(event.endDate).toDate().getTime();
		event.location = event_.place;
		//participants.value = event_.participants;
		event.allDay = event_.all_day;
		event.isRecurring = event_.is_recurring;
		event.recurring_rule = event_.recurring_rule;
		event.eventTypeNotAvailable = (event_.ev_type === 'notAvailable');
		event.priority = event_.priority || 2;
		//alert("event= " + JSON.stringify(event));
		parseRRule(event.recurring_rule);
		
		
		if (typeof event_.has_notification !== 'undefined') {
		  reminder.enabled = event_.has_notification;
		}

		// Imposto i canali
		if (Array.isArray(event_.notification_modes)) {
		  reminder.channels.alert = event_.notification_modes.includes('ALERT');
		  reminder.channels.email = event_.notification_modes.includes('EMAIL');
		}

		// Se esiste un orario specifico per l’offset (notification_advance_date)
		// uso quello, altrimenti uso i minuti (notification_advance)
		if (event_.notification_advance_date) {
		  reminder.offsetType = 'exact';
		  // Esempio: converti in data se lato server è stringa
		  reminder.offsetTime = dayjs(event_.notification_advance_date).toDate();
		} else {
		  reminder.offsetType = 'minutes';
		  // Se il server restituisce un numero di minuti da anticipare
		  reminder.offsetMinutes = event_.notification_advance || 0;
		}

		// Numero ripetizioni
		if (typeof event_.notification_repetitions !== 'undefined') {
		  reminder.repeatCount = event_.notification_repetitions;
		}

		// Intervallo tra le ripetizioni
		if (typeof event_.notification_interval !== 'undefined') {
		  // Se il valore non è fra quelli standard e non è -1, lo consideriamo "custom"
		  const validIntervals = ["1","5","10","15","30","60"];
		  reminder.repeatInterval = event_.notification_interval.toString();

		  if (!validIntervals.includes(reminder.repeatInterval) && reminder.repeatInterval !== "-1") {
			reminder.isCustomRepeatInterval = true;
			reminder.customRepeatInterval = parseInt(reminder.repeatInterval, 10);
			// Imposto il <select> a “Custom…”
			reminder.repeatInterval = "-1";
		  } else {
			// È un valore standard o -1
			reminder.isCustomRepeatInterval = (reminder.repeatInterval === "-1");
			if (reminder.isCustomRepeatInterval) {
			  // Se il server restituisce -1, devi capire se hai un valore custom salvato da qualche parte.
			  // Altrimenti puoi lasciare null oppure assegnare un default.
			  reminder.customRepeatInterval = null;
			}
		  }
		}
	}catch(error){
		console.log("Error adding event: ",error);
		alert("error="+error);
	}
}




async function submit(rrule){
	if (event.title.trim() === ''){
		titleError.value = true;
		return;
	} else{
		titleError.value = false;
	}
	
  // Controllo fine-data
  if (event.endDate < event.startDate) {
    endDateError.value = true;
    return;
  } else {
    endDateError.value = false;
  }

  // -- VALIDAZIONE SEZIONE NOTIFICA --
  // Se la notifica è abilitata, almeno un canale deve essere scelto
  if (reminder.enabled) {
    if (!reminder.channels.alert && !reminder.channels.email) {
      channelsError.value = true;
      return;
    } else {
      channelsError.value = false;
    }
    // Se l'intervallo è custom, usiamo il valore custom come repeatInterval
    if (reminder.isCustomRepeatInterval && reminder.customRepeatInterval) {
      reminder.repeatInterval = reminder.customRepeatInterval;
    }
  }
  
  
	if (props.id == "-1"){  //Aggiunta di un evento
		try{
			const notif_modes = [];
			if (reminder.channels.alert) {
				notif_modes.push('ALERT');
			}
			if (reminder.channels.email) {
				notif_modes.push('EMAIL');
			}
			const newevent = {
				userName: user,
				title: event.title,
				place: event.location,
				//participants: participants.value,
				all_day: event.allDay,
				is_recurring: event.isRecurring,
				recurring_rule: rrule,
				ev_type: (event.eventTypeNotAvailable ? 'notAvailable' : 'Event'),
				priority: event.priority,
				has_notification: reminder.enabled,
				notification_modes: notif_modes,
				notification_advance: reminder.offsetMinutes,
				notification_advance_date: (reminder.offsetTime ? dayjs(reminder.offsetTime).toDate() : null),
				notification_repetitions: reminder.repeatCount,
				notification_interval: reminder.repeatInterval,
				notification_num_sent: 0
			};
			if (event.allDay){
				newevent.date_start = new Date(event.startDate.getFullYear(), event.startDate.getMonth(), event.startDate.getDate());
				newevent.date_end = new Date(event.endDate.getFullYear(), event.endDate.getMonth(), event.endDate.getDate());
			} else{
				newevent.date_start = copyTimeToDate(event.startDate, event.startTime);
				newevent.date_end = copyTimeToDate(event.endDate, event.endTime);
			}
			
			//console.log("bb, newevent=" + JSON.stringify(newevent));
			//alert("bb, newevent=" + JSON.stringify(newevent));
			const r = await axios.post(`${api_url}addEvent`, newevent,{timeout: 5000});
			if(r.data && r.data.message == "OK"){
				callback();
			}else{
				console.error('Error: ' + r.data.message);
				//alert("Message= " + r.data.message);
			}
		}catch(error){
			alert("Errore: "+error);
			console.log("Errore: ", error);
		}
	}else{  //Modifica di un evento
		try{
			const notif_modes = [];
			if (reminder.channels.alert) {
				notif_modes.push('ALERT');
			}
			if (reminder.channels.email) {
				notif_modes.push('EMAIL');
			}
			const event_ = {
				userName: user,
				eventId : props.id,
				title: event.title,
				place: event.location,
				//participants: participants.value,
				all_day: event.allDay,
				is_recurring: event.isRecurring,
				recurring_rule: rrule,
				ev_type: (event.eventTypeNotAvailable ? 'notAvailable' : 'Event'),
				priority: event.priority,
				has_notification: reminder.enabled,
				notification_modes: notif_modes,
				notification_advance: reminder.offsetMinutes,
				notification_advance_date: (reminder.offsetTime ? dayjs(reminder.offsetTime).toDate() : null),
				notification_repetitions: reminder.repeatCount,
				notification_interval: reminder.repeatInterval,
				notification_num_sent: 0
			}
			if (event.allDay){
				event_.date_start = new Date(event.startDate.getFullYear(), event.startDate.getMonth(), event.startDate.getDate());
				event_.date_end = new Date(event.endDate.getFullYear(), event.endDate.getMonth(), event.endDate.getDate());
			} else{
				event_.date_start = copyTimeToDate(event.startDate, event.startTime);
				event_.date_end = copyTimeToDate(event.endDate, event.endTime);
			}
			//alert('pre-axios event_=' + JSON.stringify(event_) + ", " + api_url + 'editEvent');
			const r = await axios.post(api_url + 'editEvent', event_);
			//alert('post-axios');
			if(r.data.message == "OK"){
				callback();
			}else{
				console.log(r.data.message);
				//alert("Message= " + r.data.message);
			}
		}catch(error){
			alert("Errore: "+error);
			console.log("Errore: ", error);
		}
	}
}

function copyTimeToDate(date1, dateWithTime){
	let date = dayjs(date1).toDate();
	let dateTime = dayjs(dateWithTime).toDate();
	//alert("copyTimeToDate("+date+","+dateTime);
	date.setHours(dateTime.getHours());
	date.setMinutes(dateTime.getMinutes());
	//alert("date="+date);
	return date;
}

function cancel(){
	//alert("Event.="+JSON.stringify(event));
	callback();
}

async function remove(){
	if(confirm("Do you really want to delete the event?")){
		try{
			const event_ = {
				userName: user,
				eventId : props.id
			}
			const r = await axios.post(api_url + 'deleteEvent', event_);
			if(r.data.message == "OK"){
				callback();
			}else{
				console.log(r.data.message);
				//alert("Message= " + r.data.message);
			}
		}catch(error){
			console.log("Errore: ", error);
			alert("Error: "+error);
		}
	}
}


function callback(){
	if (props.callback === "Hp"){   //Home Page
		router.push({path: "/"});
	}else{
		var date = props.callback.substring(2);
		if (props.callback.startsWith("CM")){
			router.push({path: "/calendar/CM/" + date});
		}else if (props.callback.startsWith("CW")){
			router.push({path: "/calendar/CW/" + date});
		}else if (props.callback.startsWith("CD")){
			router.push({path: "/calendar/CD/" + date});
		}
	}
}

onMounted(async () => {
	if (props.id == "-1"){
		formType.value = 'Create';
	}else{
		formType.value = 'Save';
		await getEvent(props.id);
	}
	//isLoaded.value = true;
});




const saveEvent = () => {
	titleError.value = event.title.trim() === '';
	if (titleError.value) {
		return;
	}

	// Controllo delle date
	if (event.endDate < event.startDate) {
		endDateError.value = true;
		return;
	} else {
		endDateError.value = false;
	}
	let rrule = '';

	if (event.isRecurring) {
		let rruleParts = [`FREQ=${event.frequency.toUpperCase()}`];

		//Gestione Giorno del mese
		if (event.frequency === 'specific_day_month' && event.specificDay) {
		  rruleParts.push(`BYMONTHDAY=${event.specificDay}`);
		}

		//Gestione giorno della settimana del mese
		if (event.frequency === 'specific_weekday_month' && event.weekNumber && event.weekday) {
		  const weekdayMap = {
			monday: 'MO',
			tuesday: 'TU',
			wednesday: 'WE',
			thursday: 'TH',
			friday: 'FR',
			saturday: 'SA',
			sunday: 'SU',
		  };
		  const weekNumberMap = {
			first: 1,
			second: 2,
			third: 3,
			fourth: 4,
			last: -1,
		  };
		  rruleParts.push(`BYDAY=${weekNumberMap[event.weekNumber]}${weekdayMap[event.weekday]}`);
		}

		//Gestione data di fine ricorrenza
		if (event.recurringEndOption === 'untilCount') {
			rruleParts.push(`COUNT=${event.repeatCount}`);
		} else if (event.recurringEndOption === 'untilDate' && event.untilDate) {
			//alert("event.untilDate="+event.untilDate+", "+typeof event.untilDate+", "+event.untilDate.toISOString());
			//rruleParts.push(`UNTIL=${event.untilDate.toISOString().replace(/-/g, '')}T235959Z`);
			rruleParts.push(`UNTIL=${event.untilDate.toISOString().slice(0,10).replace(/-/g,"")}`);
		}
		rrule = `RRULE:${rruleParts.join(';')}`;
	}

	console.log("Event Data:", event);
	console.log("RRULE:", rrule);
	//alert('RRULE: '+rrule);
	submit(rrule);
	//alert(`Event saved successfully!\nRRULE: ${rrule}`);
};





const parseRRule = (rrule) => {
  //Pulisce la stringa RRULE per prendere solo la parte dopo "RRULE:"
  if (!rrule.startsWith("RRULE:")) {
	//console.error("Invalid RRULE format.");
	return;
  }
  
  const rruleString = rrule.replace("RRULE:", "");
  const parts = rruleString.split(';');
  const rruleObject = {};
  
  // Parse ogni parte dell'RRULE
  parts.forEach(part => {
	const [key, value] = part.split('=');
	rruleObject[key] = value;
  });

  //Imposta i valori di 'event' in base alle informazioni estratte dall'RRULE
  event.isRecurring = true;

  if (rruleObject.FREQ) {
	// Traduci la frequenza in un valore leggibile per il campo 'event.frequency'
	switch (rruleObject.FREQ) {
	  case 'DAILY':
		event.frequency = 'daily';
		break;
	  case 'WEEKLY':
		event.frequency = 'weekly';
		break;
	  case 'MONTHLY':
		event.frequency = 'monthly';
		break;
	  case 'YEARLY':
		event.frequency = 'yearly';
		break;
	  default:
		event.frequency = '';
	}
  }

  if (rruleObject.BYMONTHDAY) {
	event.specificDay = parseInt(rruleObject.BYMONTHDAY, 10);
	event.frequency = 'specific_day_month';
  }

  if (rruleObject.BYDAY) {
	const weekNumberMap = {
	  '1': 'first',
	  '2': 'second',
	  '3': 'third',
	  '4': 'fourth',
	  '-1': 'last',
	};
	const weekdayMap = {
	  'MO': 'monday',
	  'TU': 'tuesday',
	  'WE': 'wednesday',
	  'TH': 'thursday',
	  'FR': 'friday',
	  'SA': 'saturday',
	  'SU': 'sunday',
	};

	const weekNumber = rruleObject.BYDAY.slice(0, -2);
	const weekday = rruleObject.BYDAY.slice(-2);

	if (weekNumberMap[weekNumber] && weekdayMap[weekday]) {
	  event.weekNumber = weekNumberMap[weekNumber];
	  event.weekday = weekdayMap[weekday];
	  event.frequency = 'specific_weekday_month';
	}
  }

  if (rruleObject.COUNT) {
	event.recurringEndOption = 'untilCount';
	event.repeatCount = parseInt(rruleObject.COUNT, 10);
  } else if (rruleObject.UNTIL) {
	event.recurringEndOption = 'untilDate';
	event.untilDate = dayjs(rruleObject.UNTIL.slice(0, 8).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')).toDate();
  } else {
	event.recurringEndOption = 'forever';
  }
  console.log("Parsed Event Data:", event);
};




const format = (date) => {
	const day = date.getDate();
	const month = date.getMonth() + 1;
	const year = date.getFullYear();
	return `${day} / ${month} / ${year}`;
};

//Watch per quando cambia Start Date
watch(() => event.startDate, (newStartDate) => {
	if (event.endDate < newStartDate) {
		event.endDate = newStartDate;
	}

	// Reset dell'errore se necessario
	if (event.endDate < event.startDate) {
		endDateError.value = true;
	} else {
		endDateError.value = false;
	}
});

//Watch per validare End Date
watch(() => event.endDate, (newEndDate) => {
  if (newEndDate && event.startDate && newEndDate < event.startDate) {
	endDateError.value = true;
  } else {
	endDateError.value = false;
  }
});
//alert("Event.="+JSON.stringify(event));

//alert("event.startDate="+event.startDate+", event.endDate="+event.endDate );
</script>



<style scoped>
	.container {
	  max-width: 800px;
	}

	.switch-label-margin {
	  margin-left: 0.5cm;
	}
</style>