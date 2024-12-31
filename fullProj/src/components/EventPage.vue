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
import { onMounted, ref, nextTick, inject, reactive, watch, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';  
dayjs.extend(customParseFormat);
import { useTimeMachineStore } from '../stores/timeMachine';
const timeMachineStore = useTimeMachineStore();

const api_url = inject('api_url');
const user = atob(localStorage.getItem('token').split('.')[1]);
const router = useRouter();
const props = defineProps(['id','callback','eventDate']);
const titleError = ref(false);
const endDateError = ref(false);


//********************************************************************************************************************
//TIME MACHINE
const currentTime = computed(() => timeMachineStore.getCurrentTime.format('YYYY-MM-DD HH:mm:ss'));
const currentTimeAsMs = computed(() => timeMachineStore.getCurrentTime.valueOf()); //TODO: remove if not used. currentTime in milliseconds
watch(currentTime, async() => {
	await nextTick();
	console.log("currentTime changed: ", currentTime.value);
});
//********************************************************************************************************************


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
  recurring_rule: ''
});



var formType = ref('');

//alert('props='+JSON.stringify(props));
if (props.id == '-1'){
	event.startDate = dayjs(props.eventDate, 'DDMMYYYY', true).toDate();
	event.endDate = event.startDate;
	event.startTime = new Date(currentTime.value).getTime();
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
		//alert("event= " + JSON.stringify(event));
		parseRRule(event.recurring_rule);
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
	if (props.id == "-1"){  //Aggiunta di un evento
		try{
			const newevent = {
				userName: user,
				title: event.title,
				place: event.location,
				//participants: participants.value,
				all_day: event.allDay,
				is_recurring: event.isRecurring,
				recurring_rule: rrule,
				ev_type: (event.eventTypeNotAvailable ? 'notAvailable' : 'Event')
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
			const event_ = {
				userName: user,
				eventId : props.id,
				title: event.title,
				place: event.location,
				//participants: participants.value,
				all_day: event.allDay,
				is_recurring: event.isRecurring,
				recurring_rule: rrule,
				ev_type: (event.eventTypeNotAvailable ? 'notAvailable' : 'Event')
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