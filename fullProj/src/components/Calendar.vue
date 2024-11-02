<template>
    <div class="main">
		<div class="header">
			<div class="wrapper">
				<div class="arrow">
					<button type="button" class="btn task-icon" id="Prev" @click="prev_next('prev')" title="Previous" >
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left" viewBox="0 0 16 16">
						  <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
						</svg>
					</button>
				</div>
				<div class="month">
					<h2>{{ CurrentCalString }}</h2>
				</div>
				<div class="arrow">
					<button type="button" class="btn task-icon" id="Next" @click="prev_next('next')" title="Next" >
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16">
						  <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
						</svg>
					</button>
				</div>
				<div>
					<button type="button" class="btn task-icon arrow" @click="toToday()" title="Today" >
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar-date" viewBox="0 0 16 16">
						  <path d="M6.445 11.688V6.354h-.633A13 13 0 0 0 4.5 7.16v.695c.375-.257.969-.62 1.258-.777h.012v4.61zm1.188-1.305c.047.64.594 1.406 1.703 1.406 1.258 0 2-1.066 2-2.871 0-1.934-.781-2.668-1.953-2.668-.926 0-1.797.672-1.797 1.809 0 1.16.824 1.77 1.676 1.77.746 0 1.23-.376 1.383-.79h.027c-.004 1.316-.461 2.164-1.305 2.164-.664 0-1.008-.45-1.05-.82zm2.953-2.317c0 .696-.559 1.18-1.184 1.18-.601 0-1.144-.383-1.144-1.2 0-.823.582-1.21 1.168-1.21.633 0 1.16.398 1.16 1.23"/>
						  <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
						</svg>
					</button>
					<button type="button" class="btn task-icon arrow" @click="toDayView()" title="Day view" >
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar-day" viewBox="0 0 16 16">
						  <path d="M4.684 11.523v-2.3h2.261v-.61H4.684V6.801h2.464v-.61H4v5.332zm3.296 0h.676V8.98c0-.554.227-1.007.953-1.007.125 0 .258.004.329.015v-.613a2 2 0 0 0-.254-.02c-.582 0-.891.32-1.012.567h-.02v-.504H7.98zm2.805-5.093c0 .238.192.425.43.425a.428.428 0 1 0 0-.855.426.426 0 0 0-.43.43m.094 5.093h.672V7.418h-.672z"/>
						  <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
						</svg>
					</button>
					<button type="button" class="btn task-icon arrow" @click="toWeekView()" title="Week view" >
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar-week" viewBox="0 0 16 16">
						  <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-5 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z"/>
						  <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
						</svg>
					</button>
					<button type="button" class="btn task-icon arrow" @click="toMonthView()" title="Month view" >
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar-month" viewBox="0 0 16 16">
						  <path d="M2.56 11.332 3.1 9.73h1.984l.54 1.602h.718L4.444 6h-.696L1.85 11.332zm1.544-4.527L4.9 9.18H3.284l.8-2.375zm5.746.422h-.676V9.77c0 .652-.414 1.023-1.004 1.023-.539 0-.98-.246-.98-1.012V7.227h-.676v2.746c0 .941.606 1.425 1.453 1.425.656 0 1.043-.28 1.188-.605h.027v.539h.668zm2.258 5.046c-.563 0-.91-.304-.985-.636h-.687c.094.683.625 1.199 1.668 1.199.93 0 1.746-.527 1.746-1.578V7.227h-.649v.578h-.019c-.191-.348-.637-.64-1.195-.64-.965 0-1.64.679-1.64 1.886v.34c0 1.23.683 1.902 1.64 1.902.558 0 1.008-.293 1.172-.648h.02v.605c0 .645-.423 1.023-1.071 1.023m.008-4.53c.648 0 1.062.527 1.062 1.359v.253c0 .848-.39 1.364-1.062 1.364-.692 0-1.098-.512-1.098-1.364v-.253c0-.868.406-1.36 1.098-1.36z"/>
						  <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
						</svg>
					</button>
				</div>
			</div>
		</div>
		<div v-if="CalViewMode === VIEW_MODE_MONTH">    <!-- MODALITA' MENSILE -->
			<div class="calendar-grid">
				<div class="days-grid">
					<div
						v-for="day, index in DAYS"
						:key="index"
						:class="['day', {today: dayjs(ActiveCalDate).weekday() === index}]" 
						:title="day"
					>{{ day }}</div>
				</div>
				<div class="date-grid">
					<div class="date"
						v-for="dateDay in DateGrid"     
						:key="dateDay.id"
					>                                <!-- Loop sugli item di DateGrid-->
						<table>
							<div
								:class="['val', {'btn-primary': dateDay.num === dayjs(ActiveCalDate).date()}]"
								v-if="dateDay.num">
								<tr><button type="button" :class="['btn', {'btn-primary': dateDay.num === dayjs(ActiveCalDate).date()}]" @click="dayClick(dateDay.date)">{{ dateDay.num }}</button></tr>
							</div>
							<div 
								 v-for="event_ in getDateEvents(dateDay.date)"
								 v-if="dateDay.num"
								 :key="event_.id">
								<tr><button type="button" class="btn" @click="editEvent(event_.id)">{{ event_.title }}</button></tr>
							</div>
							<div v-else>&#8203;</div>
						</table>
					</div>
				</div>
			</div>
		</div>
		
		<div v-else-if="CalViewMode === VIEW_MODE_WEEK">    <!-- MODALITA' SETTIMANALE -->
			<table style="border-collapse: collapse; width: 100%;" border="1" class="date-grid-week">
				<thead>     <!--Intestazioni dei giorni: giorno della settimana e numero giorno-->
					<tr>
						<td style="width: 2%;" scope="col">&nbsp;</td>
						<td style="width: 10%;" scope="col"
							class="date"
							v-for="dateDay in DateGrid"     
							:key="dateDay.id"
						>
							<table style="border-collapse: collapse; width: 100%;" border="1">
								<tbody>
									<tr>   <!-- giorno della settimana -->
										<td style="width: 67.3333%; text-align: center;" class="['day', {today: dayjs(ActiveCalDate).weekday() === dayjs(dateDay.date).weekday()}]">{{ dateDay.day }}</td>
									</tr>
									<tr>   <!-- numero del giorno della settimana -->
										<td style="width: 67.3333%; text-align: center;">
											<button type="button" :class="['btn', {'btn-primary': dateDay.num === dayjs(ActiveCalDate).date()}]" @click="dayClick(dateDay.date)">{{ dateDay.num }}</button>
										</td>
									</tr>
								</tbody>
							</table>
						</td>
					</tr>
				</thead>
				<tbody class="dayEvents_Week">
					<tr>    <!--Eventi ed attività prive di orario: giornata completa-->
						<td style="width: 2%;">&nbsp;</td>
						<td style="width: 10%;" scope="col"
							class="date"
							v-for="dateDay in DateGrid"     
							:key="dateDay.id"
						>
							<p v-for="event in getAllDayEvents(dateDay.date)"
							   :key="event.id"
							>
								<button type="button" class="btn" @click="editEvent(event.id)" title="Edit event">{{ event.title }}</button>
							</p>
							<p v-for="activity in getExpiringActivities(dateDay.date)"
							   :key="activity.id"
							>
								<button type="button" class="btn" @click="editActivity(activity.id)" title="Edit activity">{{ activity.title }}</button>
							</p>
						</td>
					</tr>
					
					
					<tr v-for="row in 96" border="1">    <!--Eventi all'interno delle giornate-->
						<td style="width: 2%; border-right: 1px solid;">{{ (row-1)/4==Math.trunc((row-1) / 4)? (row-1)/4 : '&nbsp;' }}</td>
						<td scope="col"
							v-for="dateDay in DateGrid"     
							:key="dateDay.id"
						>
							<div border="1">
								<td style="width: 9.46035%" colspan="1" rowspan="1" border="1">&nbsp;</td>
								<td v-for="event in getDateEventsRowDate(row, dateDay.date)"
									:key="event.id"
								>
									<button type="button" class="btn" @click="editEvent(event.id)" title="Edit event">{{ event.title }}</button>
								</td>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<div v-else-if="CalViewMode === VIEW_MODE_DAY">   <!-- MODALITA' GIORNALIERA -->
			
			    <!--TODO-->
			
			
			
		</div>
		
		<div v-else>
			Error: calendar view mode not supported!
		</div>
    </div>
	
	<table>
		<tr>
			<td>      <!-- Eventi del giorno selezionato -->
				<div class="main-evact">
					<table>
						<tr>
							<th class="header-evact">
								<h3>
									<button type="button" class="btn btn-primary task-icon arrow" @click="addEvent()" title="Add event" >
										<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-plus-circle-fill" viewBox="0 0 16 16">
										  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z"/>
										</svg>
									</button>
									Events {{ dayjs(ActiveCalDate).format('DD/MM/YYYY') }}
								</h3>
							</th>
						</tr>
						<tr v-for="event in getDateEvents(ActiveCalDate)" :key="event.id" v-if="isEventLoaded" >
							<td>
								<button type="button" class="events" @click="editEvent(event.id)" title="Edit event">{{ event.title }}</button>
							</td>
						</tr>
					</table>
				</div>
			</td>

			<td>      <!-- Attività -->
				<div class="main-evact">
					<table>
						<tr>
							<th class="header-evact">
								<h3>
									<button type="button" class="btn btn-primary task-icon arrow" @click="addActivity()" title="Add activity" >
										<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-plus-circle-fill" viewBox="0 0 16 16">
										  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z"/>
										</svg>
									</button>
									Activities
								</h3>
							</th>
						</tr>
						<tr v-for="activity in DateActivities" :key="activity.id" v-if="isActivityLoaded" >
							<td>
								<button type="button" class="events" @click="editActivity(activity.id)" title="Edit activity">{{ activity.title }}</button>
							</td>
						</tr>
					</table>
				</div>
			</td>
		</tr>
	</table>
</template>


<script setup>
	import {computed, ref, nextTick, onMounted, inject} from "vue";
    import axios from 'axios';
	const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
	const VIEW_MODE_MONTH = "month";
	const VIEW_MODE_WEEK = "week";
	const VIEW_MODE_DAY = "day";
	const api_url = inject('api_url');
	import {useRouter} from "vue-router";
	const router = useRouter();
	const props = defineProps(['mode','calDate']);
	var CalViewMode = ref()
	if (props.mode == undefined || props.mode == "CM"){
		CalViewMode.value = VIEW_MODE_MONTH;
	}else if (props.mode == "CW"){
		CalViewMode.value = VIEW_MODE_WEEK;
	}else{
		CalViewMode.value = VIEW_MODE_DAY;
	}
	
	const user = atob(localStorage.getItem('token').split('.')[1]);

	const dayjs = require('dayjs')
	dayjs().format()
	require('dayjs/locale/it')
	dayjs.locale('it')
	var weekday = require("dayjs/plugin/weekday");
	dayjs.extend(weekday);
	var customParseFormat = require("dayjs/plugin/customParseFormat");
	dayjs.extend(customParseFormat)
	
	var updateLocale = require("dayjs/plugin/updateLocale");
	dayjs.extend(updateLocale)
	dayjs.updateLocale('it', {
	  months: [
		"January", "February", "March", "April", "May", "June", "July",
		"August", "September", "October", "November", "December"
	  ]
	})

	var today = new Date();
	var Today = ref(new Date(today.getFullYear(), today.getMonth(), today.getDate()));       //Oggi
	var CalDate = ref(dayjs(Today.value).startOf('month').toDate());   //Inizialmente consideriamo oggi come data del calendario; è il primo giorno del mese per vis. mensile, primo giorno della settimana per vis. settimanale, giorno per vis. giornaliera
	var ActiveCalDate = ref(Today.value)           //Data evidenziata dell'attuale calendario
	if (props.calDate != undefined && props.calDate != "0"){
		ActiveCalDate.value = dayjs(props.calDate, 'DDMMYYYY', true).toDate();
		if (props.mode == "CM"){
			CalDate.value = dayjs(ActiveCalDate.value).startOf('month').toDate(); 
		} else if (props.mode == "CW"){
			CalDate.value = dayjs(ActiveCalDate.value).startOf('week').toDate(); 
		} else{
			CalDate.value = ActiveCalDate.value; 
		}
	}


	const CurrentCalString = computed(()=> {
		const CalDataDayJs = dayjs(CalDate.value);
		if (CalViewMode.value == VIEW_MODE_MONTH){
			return CalDataDayJs.format('MMMM') + ' ' + CalDataDayJs.format('YYYY');
		} else if (CalViewMode.value == VIEW_MODE_WEEK){
			return 'Week ' + CalDataDayJs.format('DD/MM/YYYY') + ' - ' + CalDataDayJs.add(6, 'day').format('DD/MM/YYYY');
		} else{
			return CalDataDayJs.format('DD/MM/YYYY');
		}
	})
	
	
	const DateGrid = computed(() => {
		const calDates = []
		const CalDataDayJs = dayjs(CalDate.value);
		if (CalViewMode.value == VIEW_MODE_MONTH){    //Visualizzazione mensile
			for (let i = 0; i < CalDataDayJs.weekday(); i++){                    //Giorni della settimana precedenti il primo del mese, da lunedì
				const item = {}
				item.id = -i
				item.num = null
				item.date = null
				item.day = DAYS[i]
				calDates.push(item)
			}
			for (let i = 0; i < CalDataDayJs.endOf('month').date(); i++){
				const item = {}
				item.id = i + 1
				item.num = i + 1
				item.date = CalDataDayJs.add(i, 'day').toDate()
				item.day = DAYS[CalDataDayJs.add(i, 'day').weekday()]             //Giorno della settimana del giorno i-esimo del mese
				calDates.push(item)
			}
		} else if (CalViewMode.value == VIEW_MODE_WEEK){    //Visualizzazione settimanale
			for (let i = 0; i < 7; i++){
				const item = {}
				item.id = i + 1
				item.date = CalDataDayJs.add(i, 'day').toDate()
				item.num = dayjs(item.date).date()
				item.day = DAYS[CalDataDayJs.add(i, 'day').weekday()]             //Giorno della settimana del giorno i-esimo del mese
				calDates.push(item)
			}
		} else{    //Visualizzazione giornaliera
			//TODO
		}
		return calDates;
	})
	
	const DateEvents = computed(() => {
		const dateEvents = []
		for (let i = 0; i < Events.value.length; i++){             //TODO: qui ci va l'elaborazione delle ripetizioni: generare un evento per ogni ripetizione nel mese visualizzato
			const item = {}
			var event_ = Events.value[i];
			item.id = event_._id;
			item.title = event_.title;
			item.date_start = event_.date_start;
			item.date_end = event_.date_end;
			item.ev_type = event_.ev_type;
			item.all_day = event_.all_day;
			dateEvents.push(item);
		}
		return dateEvents;
	})
	
	function getDateEvents(date){                   //Eventi di una data
		//alert("DateEvents="+DateEvents.value+" #"+DateEvents.value.length);
		//alert("getDateEvents(date), date="+date);
		const ev = []
		for (let i = 0; i < DateEvents.value.length; i++){
			var event_ = DateEvents.value[i];
			//alert("day1="+event_.day+", day2="+date);
			//if (event_.day == date){
			var eventStartDate = dayjs(event_.date_start).toDate();
			var eventEndDate = dayjs(event_.date_end).toDate();
			//if (eventDate.getFullYear() == date.getFullYear() && eventDate.getMonth() == date.getMonth() && eventDate.getDate() == date.getDate()){
			//if (date.getDate() >= 16)
			//	alert("eventStartDate="+eventStartDate+", eventEndDate="+eventEndDate+", date="+date);
			if ((eventStartDate <= date && eventEndDate >= date) || (eventStartDate.getFullYear() == date.getFullYear() && eventStartDate.getMonth() == date.getMonth() && eventStartDate.getDate() == date.getDate())){
			//if (event_.day.getFullYear() == date.getFullYear() && event_.day.getMonth() == date.getMonth() && event_.day.getDate() == date.getDate()){
			//if (new Date(event_.day.getFullYear(), event_.day.getMonth(), event_.day.getDate()) == new Date(date.getFullYear(), date.getMonth(), date.getDate())){
				ev.push(event_);
				//alert("push "+dayjs(eventDate).format('DD/MM/YYYY'));
			}
		}
		return ev;
	}
	
	function getDateEventsRowDate(row, date){         //Eventi relativi ad una riga di un giorno nella visualizzazione settimanale
		const ev = []
		for (let i = 0; i < DateEvents.value.length; i++){
			var event_ = DateEvents.value[i];
			if (event_.all_day){
				continue;
			}
			var eventStartDate = dayjs(event_.date_start).toDate();
			var eventEndDate = dayjs(event_.date_end).toDate();
			var hour = (row - 1) / 4;
			var dateRow = dayjs(date).add(hour, 'hour').toDate();
			if ((eventStartDate <= dateRow && eventEndDate >= dateRow)){
				ev.push(event_);
			}
		}
		return ev;
	}
	
	function getAllDayEvents(date){
		const list = []
		for (let i = 0; i < DateEvents.value.length; i++){
			var event_ = DateEvents.value[i];
			if (!event_.all_day){
				continue;
			}
			var eventStartDate = dayjs(event_.date_start).toDate();
			var eventEndDate = dayjs(event_.date_end).toDate();
			if (((eventStartDate <= date && eventEndDate >= date) || (eventStartDate.getFullYear() == date.getFullYear() && eventStartDate.getMonth() == date.getMonth() && eventStartDate.getDate() == date.getDate()))){
				list.push(event_);
			}
		}
		return list;
	}

	function getExpiringActivities(date){    //attività con scadenza "date"
		const list = []
		for (let i = 0; i < DateActivities.value.length; i++){
			var activity = DateActivities.value[i];
			if (activity.end == null){
				continue;
			}
			var activityEnd = dayjs(activity.end).toDate();
			if (activityEnd.getFullYear() == date.getFullYear() && activityEnd.getMonth() == date.getMonth() && activityEnd.getDate() == date.getDate()){
				list.push(activity);
			}
		}
		return list;
	}

	
	const DateActivities = computed(() => {
		const dateActivities = []
		for (let i = 0; i < Activities.value.length; i++){
			const item = {}
			var activity = Activities.value[i];
			item.id = activity._id
			item.title = activity.title
			item.participants = activity.participants
			item.participants_state = activity.participants_state
			item.end = activity.end
			item.has_deadline = activity.has_deadline
			item.is_completed = activity.is_completed
			dateActivities.push(item);
		}
		//alert("DateActivities #"+dateActivities.length);
		return dateActivities;
	})

	
    var Events = ref([]);
    const isEventLoaded = computed(() => Events.value.length > 0);
    async function getEvents(){
        try{
            const res = await axios.get(api_url + "getEvents/" + user + "/-1");
            Events.value = res.data;
            await nextTick();
			//alert("ris event=" + Events.value);
        }catch(error){
            console.log("Error fetching events: ",error);
        }
    }

    var Activities = ref([]);
	const isActivityLoaded = computed(() => Activities.value.length > 0);
    async function getActivities(){
        try{
            const res = await axios.get(api_url + "getActivities/" + user + "/-1");
            Activities.value = res.data;
            await nextTick();
			//alert("ris activity=" + Activities.value +" - #"+Activities.value.length);
        }catch(error){
            console.log("Error fetching activities: ",error);
        }
    }



	function prev_next(direction){
		var interval = (CalViewMode.value == VIEW_MODE_MONTH ? 'month' : (CalViewMode.value == VIEW_MODE_WEEK ? 'week' : 'day'));
		if (direction == 'prev'){
			CalDate.value = dayjs(CalDate.value).subtract(1, interval).toDate();
		} else{  //'next'
			CalDate.value = dayjs(CalDate.value).add(1, interval).toDate();
		}
		ActiveCalDate.value = CalDate.value;
	}
	
	function toToday(){
		ActiveCalDate.value = Today.value;
		if (CalViewMode.value == VIEW_MODE_MONTH){
			CalDate.value = dayjs(ActiveCalDate.value).startOf('month').toDate();
		} else if (CalViewMode.value == VIEW_MODE_WEEK){
			CalDate.value = dayjs(ActiveCalDate.value).startOf('week').toDate();
		} else{
			CalDate.value = ActiveCalDate.value;
		}
	}
	
	function toDayView(){
		CalViewMode.value = VIEW_MODE_DAY;
		CalDate.value = ActiveCalDate.value;
	}

	function toWeekView(){
		CalViewMode.value = VIEW_MODE_WEEK;
		CalDate.value = dayjs(ActiveCalDate.value).startOf('week').toDate();   //primo giorno della settimana
	}

	function toMonthView(){
		CalViewMode.value = VIEW_MODE_MONTH;
		CalDate.value = dayjs(ActiveCalDate.value).startOf('month').toDate();  //primo giorno del mese
	}
	
	async function dayClick(date){
		ActiveCalDate.value = date;
		await getEvents(date);
		await getActivities(date);
	}

	
	function getCallbackStr(){
		return (CalViewMode.value == VIEW_MODE_MONTH ? "CM" : (CalViewMode.value == VIEW_MODE_WEEK ? "CW" : "CD"))+dayjs(ActiveCalDate.value).format('DDMMYYYY');
	}
	
	function addEvent(){
		router.push({path: "/editEvent/-1/"+getCallbackStr()+"/"+dayjs(ActiveCalDate.value).format('DDMMYYYY')});   //passaggio al componente EventPage.vue
	}

	function editEvent(eventId){
		router.push({path: "/editEvent/" + eventId + "/" + getCallbackStr()+"/-1"});   //passaggio al componente EventPage.vue
	}

	function addActivity(){
		router.push({path: "/editActivity/-1/"+getCallbackStr()});   //passaggio al componente ActivityPage.vue
	}
	
	function editActivity(activityId){
		router.push({path: "/editActivity/" + activityId + "/" + getCallbackStr()});   //passaggio al componente ActivityPage.vue
	}

    onMounted(async () => {
        await getEvents(Today.value);
		await getActivities(Today.value);
    });
</script>


<style scoped>
    .main{
        width: 1000px;
        padding-bottom: 30px;
        border-radius: 5px;
        background-color: azure;
        box-shadow: 5px 5px 20px 0 rgba(0, 0, 0, 0.5);
        @media(max-width: 500px){
            width: 90vw;
        }
    }
    .header{
        display: flex;
        flex-direction: column;
        padding: 10px;
        /*background-color: antiquewhite;*/
        border-radius: 5px 5px 0 0;
        .wrapper{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 0;
            .month{
                h2{
                    font-size: 32px;
                    font-weight: bolder;
                    letter-spacing: 5.5px;
                }
            }
            .arrow{
                user-select: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                transition: background-color .5s;
                &:hover{
                    background-color: rgb(243, 206, 158);
                }
                img{
                    width: 100%;
                    height: auto;
                    transform: translateX(2px);
                }
            }
        }
    }
	.calendar-grid{
        margin-top: 15px;
        display: grid;
        gap: 10px;
        user-select: none;
        .days-grid{
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            justify-content: space-between;
            align-items: center;
            .day{
                text-align: center;
                font-weight: bold;
                &.today{
                    color: blueviolet;
                }
            }
        }
        .date-grid{
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            justify-content: space-between;
            align-items: center;
            row-gap: 10px;
            .date{
                display: flex;
                justify-content: center;
                cursor: pointer;
				height: 130px;
				border-style: solid;
				border-width: 1px;
                .val{
                    width: 120px;
                    height: 20px;
                    text-align: center;
                    /*border-radius: 50%;*/
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 15px;
                    position: relative;
                    /*background-color: antiquewhite;*/
					/*&.today{
                        color: blueviolet;
                        font-weight: bold;
                    }*/
                }
				.today{
					color: blueviolet;
                    font-weight: bold;
				}
				.events{
					font-size: 10px;
					text-align: left;
					background-color: lightblue;
					border-radius: 5px 5px 5px 5px;
					border-width: 1px;
                    font-weight: bold;
				}
            }
        }
		.date-grid-week{
            display: grid;
            //grid-template-columns: repeat(7, 1fr);
            justify-content: space-between;
            align-items: center;
            row-gap: 10px;
            .date{
                display: flex;
                justify-content: center;
                cursor: pointer;
				height: 130px;
				border-style: solid;
				border-width: 1px;
                .val{
                    width: 120px;
                    height: 20px;
                    text-align: center;
                    /*border-radius: 50%;*/
                    /*display: flex;*/
                    //align-items: center;
                    /*justify-content: center;*/
                    padding: 15px;
                    position: relative;
                    /*background-color: antiquewhite;*/
					&.today{
                        color: blueviolet;
                        font-weight: bold;
                    }
                }
				.events{
					font-size: 10px;
					text-align: left;
					background-color: lightblue;
					border-radius: 5px 5px 5px 5px;
					border-width: 1px;
                    font-weight: bold;
				}
            }
        }
    }
	.calendar-grid{
        margin-top: 15px;
        display: grid;
        gap: 10px;
        user-select: none;
		.today{
			color: blueviolet;
			font-weight: bold;
		}
	}
	.main-evact{
        width: 500px;
		height: 300px;
        padding-bottom: 30px;
        border-radius: 5px;
        background-color: azure;
        box-shadow: 5px 5px 20px 0 rgba(0, 0, 0, 0.5);
        @media(max-width: 500px){
            width: 90vw;
        }
		.header-evact{
			text-align: center;
		}
		.events{
			font-size: 14px;
			text-align: left;
			background-color: lightblue;
			border-radius: 5px 5px 5px 5px;
			border-width: 1px;
			font-weight: bold;
		}
	}
</style>
