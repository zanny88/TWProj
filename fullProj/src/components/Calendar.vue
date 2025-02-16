<template>
  <div v-if="errorMessage" class="error">
    {{ errorMessage }}
  </div>
  <div class="main">
		<div>
			<div>
				<button 
				  type="button" 
				  :class="[
					'btn btn-sm task-icon arrow me-2 mb-2',
					CalViewMode === VIEW_MODE_DAY ? 'btn-primary' : 'btn-outline-primary'
				  ]" 
				  @click="toDayView()" 
				  title="Day view">
				  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-calendar-day" viewBox="0 0 16 16">
					<path d="M4.684 11.523v-2.3h2.261v-.61H4.684V6.801h2.464v-.61H4v5.332zm3.296 0h.676V8.98c0-.554.227-1.007.953-1.007.125 0 .258.004.329.015v-.613a2 2 0 0 0-.254-.02c-.582 0-.891.32-1.012.567h-.02v-.504H7.98zm2.805-5.093c0 .238.192.425.43.425a.428.428 0 1 0 0-.855.426.426 0 0 0-.43.43m.094 5.093h.672V7.418h-.672z"/>
					<path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
				  </svg>
				  <span class="fs-7">Day view</span>
				</button>

				<button 
				  type="button" 
				  :class="[
					'btn btn-sm task-icon arrow me-2 mb-2',
					CalViewMode === VIEW_MODE_WEEK ? 'btn-primary' : 'btn-outline-primary'
				  ]" 
				  @click="toWeekView()" 
				  title="Week view">
				  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-calendar-week" viewBox="0 0 16 16">
					<path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-5 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z"/>
					<path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
				  </svg>
				  Week view
				</button>
				
				<button 
				  type="button" 
				  :class="[
					'btn btn-sm task-icon arrow me-2 mb-2',
					CalViewMode === VIEW_MODE_MONTH ? 'btn-primary' : 'btn-outline-primary'
				  ]" 
				  @click="toMonthView()" 
				  title="Month view">
				  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-calendar-month" viewBox="0 0 16 16">
					<path d="M2.56 11.332 3.1 9.73h1.984l.54 1.602h.718L4.444 6h-.696L1.85 11.332zm1.544-4.527L4.9 9.18H3.284l.8-2.375zm5.746.422h-.676V9.77c0 .652-.414 1.023-1.004 1.023-.539 0-.98-.246-.98-1.012V7.227h-.676v2.746c0 .941.606 1.425 1.453 1.425.656 0 1.043-.28 1.188-.605h.027v.539h.668zm2.258 5.046c-.563 0-.91-.304-.985-.636h-.687c.094.683.625 1.199 1.668 1.199.93 0 1.746-.527 1.746-1.578V7.227h-.649v.578h-.019c-.191-.348-.637-.64-1.195-.64-.965 0-1.64.679-1.64 1.886v.34c0 1.23.683 1.902 1.64 1.902.558 0 1.008-.293 1.172-.648h.02v.605c0 .645-.423 1.023-1.071 1.023m.008-4.53c.648 0 1.062.527 1.062 1.359v.253c0 .848-.39 1.364-1.062 1.364-.692 0-1.098-.512-1.098-1.364v-.253c0-.868.406-1.36 1.098-1.36z"/>
					<path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
				  </svg>
				  Month view
				</button>
			</div>
			<FullCalendar ref="calendarRef" :options="calendarOptions" />
		</div>
		<button type="button" class="btn btn-outline-primary d-flex align-items-center" @click="generateICal" title="Download iCal">
		  <div class="bi bi-calendar-plus me-2">Download iCal</div>
		</button>
	</div>
	<div class="sections-container">
		<!-- Eventi del giorno selezionato -->
		<div class="section events-section mt-5">
		<h3 class="d-flex align-items-center">
		  <!-- Pulsante per aggiungere un evento -->
		  <button type="button" class="btn btn-primary task-icon arrow me-2" @click="addEvent" title="Add event">
			<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-plus-circle-fill" viewBox="0 0 16 16">
			  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z" />
			</svg>
		  </button>
		  Events {{ dayjs(ActiveCalDate).format('DD/MM/YYYY') }}
		</h3>

		<!-- Lista degli eventi -->
		<div class="event-list mt-3">
		  
		  <div v-for="event in CalDateEvents" :key="event.id" v-if="isEventLoaded" class="event-item mb-2">
			<button type="button" class="btn btn-outline-primary events w-100 text-start" @click="editEvent(event.id)" title="Edit event">
			  {{ event.title }}
			</button>
		  </div>
		  <div v-if="incompletePomodoroSessions.length > 0">
			<h5>Incomplete Pomodoro Sessions:</h5>
			<div v-for="session in incompletePomodoroSessions" :key="session._id" class="event-item mb-2">
			  <button type="button" class="btn btn-outline-secondary w-100 text-start" @click="router.push({ path: '/pomodoro/' + session._id })" title="Open Pomodoro Session">
				{{ session.studyTime }}min study, {{ session.restTime }}min rest, {{ session.completedCycles }} / {{ session.totCycles }} - {{ dayjs(session.dateTime).format('DD/MM/YYYY') }}
			  </button>
			</div>
		  </div>
		</div>
		</div>

		<!-- Attivit� -->
		<div class="section activities-section mt-5">
		<div class="d-flex justify-content-between align-items-center">
		<!-- Titolo e pulsante per aggiungere attivit� -->
		<h3 class="d-flex align-items-center mb-0">
			<!-- Pulsante per aggiungere un'attivit� -->
			<button type="button" class="btn btn-primary task-icon arrow me-2" @click="addActivity" title="Add activity">
			<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-plus-circle-fill" viewBox="0 0 16 16">
				<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z" />
			</svg>
			</button>
			Activities
		</h3>
		<!-- Switch per mostrare le attivit� completate -->
		<div class="form-check form-switch">
			<input class="form-check-input" type="checkbox" id="completedSwitch" v-model="Activities_completed" />
			<label class="form-check-label" for="completedSwitch">
			Completed
			</label>
		</div>
		</div>

		<!-- Lista delle attivit� -->
		<div class="activity-list mt-3" v-if="isActivityLoaded">
			<div v-for="activity in CalDateActivities" :key="activity.id" class="activity-item mb-2 d-flex align-items-center">
				<div v-if="activity.is_completed" class="me-1">
					<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-check checkmark-icon" viewBox="0 0 16 16">
						<path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
					</svg>
				</div>
				<button type="button"
					:class="['btn btn-outline-secondary w-100 text-start',
						     isActivityExpired(activity) ? 'expired-activities' : 'activities']"
					  @click="editActivity(activity.id)" title="Edit activity">
					{{ activity.title }}
				</button>
			</div>
		</div>
	  </div>
	</div>

</template>


<script setup>
import { computed, ref, nextTick, onMounted, inject, watch, reactive } from 'vue';
import {useRouter} from 'vue-router';
import axios from 'axios';
import { createEvents } from 'ics';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import { prepareCalendarEvents, formatToICalendarDate } from './calendarUtils';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs().format();
dayjs.extend(customParseFormat);

import { useTimeMachineStore } from '../stores/timeMachine';
const timeMachineStore = useTimeMachineStore();

const incompletePomodoroSessions = ref([]);

const VIEW_MODE_MONTH = "dayGridMonth";
const VIEW_MODE_WEEK = "timeGridWeek";
const VIEW_MODE_DAY = "timeGridDay";
const api_url = inject('api_url');
const pomodoro_sessions_api_url = inject('pomodoro_sessions_api_url');
const router = useRouter();
const props = defineProps(['mode','calDate']);
const CalViewMode = ref(                                    //Modalit� di visualizzazione del calendario
	props.mode === "CW" ? VIEW_MODE_WEEK :
	props.mode === "CD" ? VIEW_MODE_DAY :
	VIEW_MODE_MONTH
);

const Activities_completed = ref(false);
const errorMessage = ref('');

//Utente loggato
const user = atob(localStorage.getItem('token').split('.')[1]);



//********************************************************************************************************************
//TIME MACHINE
const currentTime = computed(() => timeMachineStore.getCurrentTime.format('YYYY-MM-DD HH:mm:ss'));
const currentTimeAsMs = computed(() => timeMachineStore.getCurrentTime.valueOf()); //TODO: remove if not used. currentTime in milliseconds
watch(currentTime, async() => {
	FullCalDate.value = dayjs(currentTime.value).toISOString().substring(0, 10);
	await nextTick();
	await loadIncompletePomodoroSessions();
});
//********************************************************************************************************************



const today = computed(() => new Date(currentTime.value));
const Today = computed(() => new Date(today.value.getFullYear(), today.value.getMonth(), today.value.getDate()));       //Oggi
const ActiveCalDate = ref(Today.value);                                                     //Data evidenziata dell'attuale calendario
if (props.calDate != undefined && props.calDate != "0"){
	const parsedDate = dayjs(props.calDate, 'DDMMYYYY');
	if (parsedDate.isValid()) {
		ActiveCalDate.value = parsedDate.toDate();
	} else {
		console.error("La stringa di data fornita non � valida.");
	}
}


//Eventi del giorno selezionato del calendario
const CalDateEvents = computed(() => {
	//alert("CalDateEvents");
	const date = ActiveCalDate.value;
	const ev = [];
	for (let i = 0; i < Events.value.length; i++){
		const event_ = Events.value[i];
		//alert(JSON.stringify(event_));
		if (event_.ev_type === 'notAvailable') {
			//alert("notAvailable");
			continue;
		}
		const eventStartDate = dayjs(event_.date_start).toDate();
		const eventEndDate = dayjs(event_.date_end).toDate();
		if ((eventStartDate <= date && eventEndDate >= date) || (eventStartDate.getFullYear() == date.getFullYear() && eventStartDate.getMonth() == date.getMonth() && eventStartDate.getDate() == date.getDate())){
			const item = {};
			item.id = event_._id;
			item.title = '';
			//alert("event_="+JSON.stringify(event_)+", eventStartDate="+eventStartDate+", event_.all_day="+event_.all_day);
			if (!event_.all_day){
				item.title = dayjs(eventStartDate).format('HH:mm') + ' ';
				if (eventStartDate < eventEndDate){
					item.title += '- ' + dayjs(eventEndDate).format('HH:mm') + ' ';
				}
			}
			item.title += event_.title;
			//alert("item.title="+item.title);
			item.date_start = eventStartDate;
			if (event_.is_recurring){
				//alert(JSON.stringify(event_));
				item.rrule = `DTSTART=${formatToICalendarDate(event_.date_start)};` + event_.recurring_rule;
				//alert(item.rrule);
				console.log(item.rrule);
			}
			//console.log("item="+JSON.stringify(item));
			ev.push(item);
			//alert("push "+dayjs(eventDate).format('DD/MM/YYYY'));
		}
	}
	
	
	//Aggiungo gli eventuali eventi ricorrenti
	const events = calendarRef.value.getApi().getEvents();
	//Filtra gli eventi validi in data
	const eventsOnDate = events.filter(event => {
		//alert("event="+JSON.stringify(event));
		const start = new Date(event.start);
		const end = event.end ? new Date(event.end) : start;
		return (
			date >= new Date(start.setHours(0, 0, 0, 0)) &&
			date <= new Date(end.setHours(23, 59, 59, 999))
		);
	});
	//alert("eventsOnDate="+JSON.stringify(eventsOnDate));
	for (let i = 0; i < eventsOnDate.length; i++){
		const event_ = eventsOnDate[i];
		if (event_.extendedProps.class === 'notAvailable') {
			//alert("notAvailable");
			continue;
		}
		//alert("event_="+JSON.stringify(event_));
		if (!ev.some(item => item.id === event_.id) && event_.extendedProps.class == 'event'){   //Se non esiste ancora, lo aggiungo
			const item = {};
			item.id = event_.id;
			//alert("event_.all_day="+event_.extendedProps.all_day);
			if (event_.allDay){
				item.title = event_.title;
			} else {
				item.title = dayjs(event_.start).format('HH:mm') + " - " + dayjs(event_.end).format('HH:mm') + ' ' + event_.title;
			}
			item.date_start = dayjs(event_.start).toDate();
			ev.push(item);
		}
	}
	//Lista ordinata per data iniziale crescente
	ev.sort((a, b) => {
		const dataA = new Date(a.date_start);
		const dataB = new Date(b.date_start);
		return dataA - dataB;
	});
	//alert("ev="+ev);
	return ev;
});




//Elenco attivit�
const CalDateActivities = computed(() => {
	//alert("CalDateActivities");
	const act = [];
	for (let i = 0; i < Activities.value.length; i++){
		const activity = Activities.value[i];
		//alert(JSON.stringify(activity));
		if (Activities_completed.value || (!Activities_completed.value && !activity.is_completed)) {
			const item = {};
			item.id = activity._id;
			item.is_completed = activity.is_completed;
			item.title = '';
			if (activity.has_deadline){
				item.end = dayjs(activity.end).toDate();
				item.title = 'End date: ' + dayjs(activity.end).format('DD/MM/YYYY') + ' - ';
			} else {
				item.end = dayjs('9999-12-31').toDate();          //Metto data massima cos� nell'ordinamento vanno dopo
			}
			item.title += activity.title;
			//alert("item="+JSON.stringify(item));
			act.push(item);
		}
	}
	//Lista ordinata per data di scadenza crescente
	act.sort((a, b) => {
		const dataA = new Date(a.end);
		const dataB = new Date(b.end);
		return dataA - dataB;
	});
	return act;
});



const Events = ref([]);
const isEventLoaded = computed(() => Events.value.length > 0);

//Eventi del calendario
const CalendarEvents = ref([]);

const Activities = ref([]);
const isActivityLoaded = computed(() => Activities.value.length > 0);


async function loadEventsAndActivities(){
	//alert('loadEventsAndActivities');
	try{
		errorMessage.value = '';
		let res = await axios.get(api_url + "getEvents/" + user + "/-1");    //Carica gli eventi
		Events.value = res.data;
		await nextTick();
		//alert("ris event=" + Events.value);
		res = await axios.get(api_url + "getSharedEvents/" + user);    //Carica gli eventi condivisi
        Events.value = Events.value.concat(res.data);
		await nextTick();
		//alert("ris event=" + Events.value);
		res = await axios.get(api_url + "getActivities/" + user + "/-1");    //Carica le attivit�
		Activities.value = res.data;
		await nextTick();
		res = await axios.get(api_url + "getSharedActivities/" + user);    //Carica le attivit� condivise
        Activities.value = Activities.value.concat(res.data);
		await nextTick();
		//alert("ris activity=" + Activities.value +" - #"+Activities.value.length);
		CalendarEvents.value = prepareCalendarEvents(Events.value, Activities.value, user);
		//alert("CalendarEvents.value="+JSON.stringify(CalendarEvents.value));
	}catch(error){
		//alert('Error: '+error);
		errorMessage.value = 'Errore nel caricamento di eventi e attivita: '+error;
		console.error("Error fetching events and activities: ",error);
	}
}


function getCallbackStr(){
	return (CalViewMode.value == VIEW_MODE_MONTH ? "CM" : (CalViewMode.value == VIEW_MODE_WEEK ? "CW" : "CD")) + dayjs(ActiveCalDate.value).format('DDMMYYYY');
}

function addEvent(){
	router.push({path: "/editEvent/-1/" + getCallbackStr() + "/" + dayjs(ActiveCalDate.value).format('DDMMYYYY')});   //passaggio al componente EventPage.vue
}

function editEvent(eventId){
	router.push({path: "/editEvent/" + eventId + "/" + getCallbackStr() + "/-1"});   //passaggio al componente EventPage.vue
}

function addActivity(){
	router.push({path: "/editActivity/-1/" + getCallbackStr()});   //passaggio al componente ActivityPage.vue
}

function editActivity(activityId){
	router.push({path: "/editActivity/" + activityId + "/" + getCallbackStr()});   //passaggio al componente ActivityPage.vue
}

async function loadIncompletePomodoroSessions() {
  try {
    const res = await axios.post(pomodoro_sessions_api_url + "read/incomplete", { user: user, now: currentTime.value });
    incompletePomodoroSessions.value = res.data;
	// console.log("incompletePomodoroSessions: ", incompletePomodoroSessions.value);
  } catch (error) {
    console.error("Error fetching pomodoro sessions: ", error);
  }
}

function toDayView(){
	CalViewMode.value = VIEW_MODE_DAY;
	if (calendarRef.value) {
		const calendarApi = calendarRef.value.getApi();
		calendarApi.gotoDate(ActiveCalDate.value);
	}
}

function toWeekView(){
	CalViewMode.value = VIEW_MODE_WEEK;
	if (calendarRef.value) {
		const calendarApi = calendarRef.value.getApi();
		calendarApi.gotoDate(ActiveCalDate.value);
	}
}

function toMonthView(){
	CalViewMode.value = VIEW_MODE_MONTH;
	if (calendarRef.value) {
		const calendarApi = calendarRef.value.getApi();
		calendarApi.gotoDate(ActiveCalDate.value);
	}
}






// Definizione delle opzioni del calendario
const calendarRef = ref(null);
const FullCalDate = ref(new Date(currentTime.value).toISOString().substring(0, 10));     //Data attiva del calendario

const calendarOptions = reactive/*ref*/({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin],
  initialView: CalViewMode.value,
  initialDate: FullCalDate.value, // Imposta la data iniziale
  events: CalendarEvents,
  editable: true,
  selectable: true, // Abilita la selezione dei giorni
  select: (info) => {
	// Quando si seleziona una data o un intervallo, aggiorna la data attiva
	FullCalDate.value = info.startStr;
	ActiveCalDate.value = dayjs(FullCalDate.value).toDate();
  },
  dateClick: (info) => { // Aggiungi questo blocco
    ActiveCalDate.value = dayjs(info.date).toDate();
    FullCalDate.value = dayjs(info.date).format('YYYY-MM-DD');
    // Aggiorna la classe 'selected-day'
    const allSelectedCells = document.querySelectorAll('.fc-daygrid-day.selected-day');
    allSelectedCells.forEach((cell) => cell.classList.remove('selected-day'));
    const dateStr = dayjs(ActiveCalDate.value).format('YYYY-MM-DD');
    const cell = document.querySelector(`[data-date="${dateStr}"]`);
    if (cell) {
      cell.classList.add('selected-day');
    }
  },
  firstDay: 1,     //La settimana inizia dal luned�
  datesSet: (info) => {
	// Verifica se la vista corrente � la vista giornaliera
	if (CalViewMode.value === VIEW_MODE_DAY) {
	  // Ottieni la data corrente visualizzata
	  const currentDate = info.start; // In day view, start dovrebbe essere la data del giorno
	  FullCalDate.value = dayjs(currentDate).format('YYYY-MM-DD');
	  ActiveCalDate.value = dayjs(currentDate).toDate();
	}

	// Aggiorna la classe 'selected-day' per evidenziare il giorno corrente
	const allSelectedCells = document.querySelectorAll('.fc-daygrid-day.selected-day');
	allSelectedCells.forEach(cell => cell.classList.remove('selected-day'));  	// Rimuove tutte le classi 'selected-day'
	const dateStr = dayjs(ActiveCalDate.value).format('YYYY-MM-DD');
	const cell = document.querySelector(`[data-date="${dateStr}"]`);
	if (cell) {
	  cell.classList.add('selected-day');    // Aggiungi la classe 'selected-day' alla nuova data
	}
  },
  eventTimeFormat: {
	hour: 'numeric',
	minute: '2-digit',
	meridiem: false,
	hour12: false
  },
  eventClick: (info) => {
	//alert("event into.event="+JSON.stringify(info.event));
	//alert("class="+info.event.extendedProps.class);
	if (info.event.extendedProps.class === 'activity'){
		editActivity(info.event.id);
	} else if (info.event.extendedProps.class === 'event' || info.event.extendedProps.class === 'notAvailable'){
        if (info.event.extendedProps.pomodoro){
			router.push({path: "/pomodoro/" + info.event.extendedProps.pomodoroId});
		} else {
			editEvent(info.event.id);
		}
	}
  },
  dayCellClassNames: (arg) => {
	// Verifica se la data della cella corrisponde a ActiveCalDate
	if (dayjs(arg.date).isSame(ActiveCalDate.value, 'day')) {
		return ['selected-day'];
	}
	return [];
  }
});

// Watch per aggiornare la visualizzazione del calendario quando l'utente seleziona una nuova vista
watch(CalViewMode, (newView) => {
	if (calendarRef.value) {
		calendarRef.value.getApi().changeView(newView);
	}
});

// Watch per cambiare la data visualizzata nel calendario quando 'FullCalDate' cambia
watch(FullCalDate, (newDate) => {
	if (calendarRef.value) {
	//alert("watch, "+ActiveCalDate.value);
		ActiveCalDate.value = dayjs(FullCalDate.value).toDate();
	//alert("ActiveCalDate.value="+ActiveCalDate.value);
		calendarRef.value.getApi().gotoDate(newDate); // Cambia la data del calendario
	}
});

//Funzione che indica se un'attivit� � scaduta ma non ancora completata
function isActivityExpired(activity) {
	if (!activity.end || activity.is_completed) return false;
	const now = new Date(currentTime.value);
	const endDate = dayjs(activity.end).add(1,'day').toDate();
	return endDate < now;
}


function generateICal() {
  const events = Events.value.map(event => ({
	start: [dayjs(event.date_start).year(), dayjs(event.date_start).month() + 1, dayjs(event.date_start).date(), dayjs(event.date_start).hour(), dayjs(event.date_start).minute()],
	end: [dayjs(event.date_end).year(), dayjs(event.date_end).month() + 1, dayjs(event.date_end).date(), dayjs(event.date_end).hour(), dayjs(event.date_end).minute()],
	title: event.title,
	description: event.description,
	location: event.location,
	url: event.url,
  }));

  const activities = Activities.value.map(activity => ({
	start: [dayjs(activity.date_start).year(), dayjs(activity.date_start).month() + 1, dayjs(activity.date_start).date(), dayjs(activity.date_start).hour(), dayjs(activity.date_start).minute()],
	end: [dayjs(activity.date_end).year(), dayjs(activity.date_end).month() + 1, dayjs(activity.date_end).date(), dayjs(activity.date_end).hour(), dayjs(activity.date_end).minute()],
	title: activity.title,
	description: activity.description,
	location: activity.location,
	url: activity.url,
  }));

  const allEvents = [...events, ...activities];

  createEvents(allEvents, (error, value) => {
	if (error) {
	  console.error(error);
	  return;
	}
	const blob = new Blob([value], { type: 'text/calendar' });
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = 'calendar.ics';
	link.click();
  });
 }
  
onMounted(async () => {
	//alert('onMounted');
	await loadEventsAndActivities();
	//alert("CalendarEvents.value="+JSON.stringify(CalendarEvents.value));
	const calendarApi = calendarRef.value.getApi();
	calendarApi.changeView(CalViewMode.value);
	calendarApi.select({
		start: Today.value,
		end: new Date(Today.value.getTime() + 24 * 60 * 60 * 1000), // Fine del giorno
		allDay: true,
	});
	await nextTick();
	await loadIncompletePomodoroSessions();
});
</script>


<style>
	.main {
		width: 98vw;
		padding-bottom: 30px;
		border-radius: 5px;
		background-color: azure;
		box-shadow: 5px 5px 20px 0 rgba(0, 0, 0, 0.5);
	}

	.sections-container {
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
		width: 98vw;
	}
	.section {
		/*flex: 1;*/
		flex: 1 1 300px;
		display: flex;
		flex-direction: column;
		padding: 20px;
		box-sizing: border-box;
		border-radius: 5px;
		background-color: azure;
		box-shadow: 5px 5px 20px 0 rgba(0, 0, 0, 0.5);
	}

	.events,
	.expired-activities,
	.activities {
		font-size: 14px;
		text-align: left;
		color: white;
		border-radius: 5px;
		border-width: 1px;
		font-weight: bold;
		align-self: flex-start;
	}

	.events {
		background-color: blue;
	}
	.activities {
		background-color: green;
	}
	.expired-activities {
		background-color: red;
	}
	
	.event-list,
	.activity-list {
		display: flex;
		flex-direction: column;
		gap: 5px;
		align-items: flex-start;
		justify-content: flex-start;
	}

	.event-item,
	.activity-item {
		align-self: flex-start;
	}

	.view-selector {
		margin-bottom: 15px;
	}

	.active-date {
		margin-top: 15px;
		font-weight: bold;
	}

	.selected-day {
		background-color: yellow;
	}

	.fc-highlight {
		background-color: lightblue !important;
	}
	.error {
	  color: red;
	  margin: 10px 0;
	}

</style>
