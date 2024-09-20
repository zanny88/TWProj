<template>
    <div class="container" style="text-align: center; margin-top: 10px;">
        <h5 id="title">Event form</h5>
		<div class="col-lg-2 col-md-2 col-sm-4">
			<button type="button" class="btn btn-outline-info" id="deleteButton" @click="remove()">Delete</button>
		</div>
        <form id="mainForm">
            <div class="row" style="position: relative; justify-content: center; align-items: center;">
                <div class="col-lg-4 col-md-4 col-sm-12">
                    <div class="form-floating">
                        <input type="text" v-model="title" id="title" name="title" class="form-control"/>
                        <label for="title">Title:</label>
                    </div>
                </div>
            </div>
            <div class="row" style="position: relative; justify-content: center; align-items: center;">
                <div class="col-lg-4 col-md-4 col-sm-12">
                    <div class="form-floating">
                        <input type="checkbox" v-model="all_day" id="all_day" name="all_day" @click="allDayClick()"/>
                        <label for="all_day">All day:</label>
                    </div>
                </div>
            </div>
            <div class="row" style="position: relative; justify-content: center; align-items: center;">
                <div class="col-lg-4 col-md-4 col-sm-12">
                    <div class="form-floating">
						<VueDatePicker v-model="date_start" id="eventDay" locale="it" :preview-format="format_start_date" :format="format_start_date" :enable-time-picker="!all_day" v-if="isLoaded" placeholder="Select start date" name="Start date" />
					</div>
                </div>
            </div>
            <div class="row" style="position: relative; justify-content: center; align-items: center;">
                <div class="col-lg-4 col-md-4 col-sm-12">
                    <div class="form-floating">
						<VueDatePicker v-model="date_end" id="eventDay" locale="it" :preview-format="format_end_date" :format="format_end_date" :enable-time-picker="!all_day" v-if="isLoaded" placeholder="Select end date" name="End date" />
					</div>
                </div>
            </div>
            <div class="row" style="position: relative; justify-content: center; align-items: center;">
                <div class="col-lg-4 col-md-4 col-sm-12">
                    <div class="form-floating">
                        <input type="text" v-model="place" id="place" name="place" class="form-control"/>
                        <label for="place">Place:</label>
                    </div>
                </div>
            </div>
            <div class="row" style="position: relative; justify-content: center; align-items: center;">
                <div class="col-lg-4 col-md-4 col-sm-12">
                    <div class="form-floating">
                        <input type="text" v-model="participants" id="participants" name="participants" class="form-control"/>
                        <label for="participants">Participants:</label>
                    </div>
                </div>
            </div>
            <div class="row" style="position: relative; justify-content: center; align-items: center; margin-top: 10px;">
                <div class="col-lg-2 col-md-2 col-sm-4">
                    <button type="button" class="btn btn-outline-info" id="submitButton" @click="submit()">{{ formType }}</button>
                </div>
                <div class="col-lg-2 col-md-2 col-sm-4">
                    <button type="button" class="btn btn-outline-info" id="cancelButton" @click="cancel()">Cancel</button>
                </div>
            </div>
        </form>
    </div>
</template>


<script setup>
    import { onMounted, computed, ref, nextTick, inject } from "vue";
    import axios from 'axios';
    import {useRouter} from "vue-router";
    import VueDatePicker from '@vuepic/vue-datepicker';
    import '@vuepic/vue-datepicker/dist/main.css';
  
    const api_url = inject('api_url');
    const loggedUser = inject('loggedUser');
	const router = useRouter();
	const props = defineProps(['id','callback','eventDate']);

	const dayjs = require('dayjs')
	dayjs().format()
	var customParseFormat = require("dayjs/plugin/customParseFormat");
	dayjs.extend(customParseFormat)


	var formType = ref('');
	var title = ref('');
	var date_start = ref();
	var date_end = ref();
	var place = ref('');
	var participants = ref([]);
	var all_day = ref(false);
	var enableHourSelect = ref(true);
	var isLoaded = ref(false);

	if (props.eventDate!="-1"){
		date_start.value = dayjs(props.eventDate, 'DDMMYYYY', true).toDate();
		date_end.value = date_start.value;
	}

	const format_start_date = (date) => {
		const day = date.getDate();
		const month = date.getMonth() + 1;
		const year = date.getFullYear();
		return `Start date: ${day}/${month}/${year}` + (all_day.value ? '' : dayjs(date).format(" HH:mm"));
	}
	const format_end_date = (date) => {
		const day = date.getDate();
		const month = date.getMonth() + 1;
		const year = date.getFullYear();
		return `End date: ${day}/${month}/${year}` + (all_day.value ? '' : dayjs(date).format(" HH:mm"));
	}
	
	
/*
	owner: String,
    participants: [String],
	participants_state: {type:[String], default:"waiting"},          /* "waiting" per non ha ancora accettato, "refused" per ha rifiutato e "accepted" per ha accettato */
//    title: String,
    // day: Date,
    // repetitions: Number,                   /* 0 per infinite */
//    interval_period: Number,
//    interval_days_in_week: [Number],       /* giorni nella settimana */
//    interval_n_day_in_month: [Number],     /* n esimo giorno del mese */
//    interval_n_of_day_in_month: [Number],  /* n esimo giorno della settimana nel mese, codifica "n, giorno" */
    // duration: Number,                      /* numero di minuti di durata */
    // place: String,
	// notification_advance: Number,           /* anticipo in minuti nella notifica */
	// notification_repetitions: Number,       /* 0 per infinite*/
	// notification_interval: Number,          /* numero di minuti tra una notifica e la successiva */
	// notification_modes: [String],
	// notification_stop: Boolean,             /* Falso per notifiche non ancora fermate, vero per notifiche fermate */
	// ev_type:{type: String, default: "Event"}                     




	var Events = ref([]);
    const isEventLoaded = computed(() => Events.value.length > 0);
    async function getEvent(eventId){
		try{
			const res = await axios.get(api_url + "getEvents/" + loggedUser.value + "/" + eventId);
			Events.value = res.data;
			await nextTick();
			if (isEventLoaded){
				var event_ = Events.value[0];
				title.value = event_.title;
				//day.value = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());   //toglie le ore dalla data    event_.day; // dayjs(event_.day).format('DD/MM/YYYY');
				date_start.value = dayjs(event_.date_start).toDate();
				date_end.value = dayjs(event_.date_end).toDate();
				place.value = event_.place;
				//alert("day="+day.value);
				participants.value = event_.participants;
				all_day.value = event_.all_day;
			}
		}catch(error){
			console.log("Error adding event: ",error);
			alert("error="+error);
		}
    }



	async function submit(){
		if (title.value == ''){
			alert("Error: Event Title is mandatory!");
			return;
		}
		if (props.id == "-1"){  //Aggiunta di un evento
			try{
				const newevent = {
					userName: loggedUser.value,
					title: title.value,
					//day: new Date(day.value.getFullYear(), day.value.getMonth(), day.value.getDate()),   //toglie le ore dalla data
					date_start: (all_day.value ? new Date(date_start.value.getFullYear(), date_start.value.getMonth(), date_start.value.getDate()) : date_start.value),
					date_end: (all_day.value ? new Date(date_end.value.getFullYear(), date_end.value.getMonth(), date_end.value.getDate()) : date_end.value),
					place: place.value,
					participants: participants.value,
					all_day: all_day.value
				}
				const r = await axios.post(api_url + "addEvent", newevent);
				if(r.data.message == "OK"){
					callback();
				}else{
					console.log(r.data.message);
					//alert("Message= " + r.data.message);
				}
			}catch(error){
				console.log("Errore: ", error);
				alert("Errore: "+error);
			}
		}else{  //Modifica di un evento
			try{
				const event_ = {
					userName: loggedUser.value,
					eventId : props.id,
					title: title.value,
					//day: new Date(day.value.getFullYear(), day.value.getMonth(), day.value.getDate()),   //toglie le ore dalla data
					date_start: (all_day.value ? new Date(date_start.value.getFullYear(), date_start.value.getMonth(), date_start.value.getDate()) : date_start.value),
					date_end: (all_day.value ? new Date(date_end.value.getFullYear(), date_end.value.getMonth(), date_end.value.getDate()) : date_end.value),
					place: place.value,
					participants: participants.value,
					all_day: all_day.value
				}
				const r = await axios.post(api_url + "editEvent", event_);
				if(r.data.message == "OK"){
					callback();
				}else{
					console.log(r.data.message);
					//alert("Message= " + r.data.message);
				}
			}catch(error){
				console.log("Errore: ", error);
				alert("Errore: "+error);
			}
		}
    }
	
	function cancel(){
		callback();
	}
	
	function remove(){   //TODO
	}
	
	function allDayClick(){
		if (all_day.value){
			date_start.value = new Date(date_start.value.getFullYear(), date_start.value.getMonth(), date_start.value.getDate());
			date_end.value = new Date(date_end.value.getFullYear(), date_end.value.getMonth(), date_end.value.getDate());
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
		isLoaded.value = true;
    });
</script>