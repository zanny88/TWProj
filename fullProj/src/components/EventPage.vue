<template>
    <div class="background"></div>
    <div class="form-container">
        <div class="form-card">
            <h2 class="form-title">Event Form</h2>
            <form>
                <div class="mb-3">
                    <label for="title" class="form-label">Title</label>
                    <input
                        type="text"
                        id="title"
                        class="form-control"
                        v-model="event.title"
                        placeholder="Enter event title"
                        :class="{'is-invalid': titleError}"
                        :disabled="isReadOnly"
                    />
                    <div v-if="titleError" class="invalid-feedback">
                        Title is mandatory!
                    </div>
                </div>

                <div class="mb-3">
                    <label for="description" class="form-label">Description</label>
                    <textarea
                        id="description"
                        class="form-control"
                        v-model="event.description"
                        placeholder="Enter a description (optional)"
                        :disabled="isReadOnly"
                    ></textarea>
                </div>

                <div class="mb-3">
                    <label for="location" class="form-label">Location</label>
                    <input
                        type="text"
                        id="location"
                        class="form-control"
                        v-model="event.location"
                        placeholder="Enter event location"
                        :disabled="isReadOnly"
                    />
                </div>

                <div class="mb-3 form-switch">
                    <input
                        type="checkbox"
                        id="allDay"
                        class="form-check-input"
                        v-model="event.allDay"
                        :disabled="isReadOnly"
                    />
                    <label for="allDay" class="form-check-label">All Day Event</label>
                </div>

                <div class="row mb-3">
                    <div class="col-md-6">
                        <label for="startDate" class="form-label">Start Date</label>
                        <VueDatePicker
                            v-model="event.startDate"
                            :format="format"
                            :enable-time-picker="false"
                            :auto-apply="true"
                            :disabled="isReadOnly"
                        />
                    </div>
                    <div class="col-md-6" v-if="!event.allDay">
                        <label for="startTime" class="form-label">Start Time</label>
                        <VueDatePicker
                            v-model="event.startTime"
                            time-picker
                            placeholder="Select start time"
                            model-type="timestamp"
                            :disabled="isReadOnly"
                        />
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-6">
                        <label for="endDate" class="form-label">End Date</label>
                        <VueDatePicker
                            v-model="event.endDate"
                            :format="format"
                            :enable-time-picker="false"
                            :auto-apply="true"
                            :disabled="isReadOnly"
                        />
                        <div v-if="endDateError" class="invalid-feedback">
                            End Date must be after Start Date!
                        </div>
                    </div>
                    <div class="col-md-6" v-if="!event.allDay">
                        <label for="endTime" class="form-label">End Time</label>
                        <VueDatePicker
                            v-model="event.endTime"
                            time-picker
                            placeholder="Select end time"
                            model-type="timestamp"
                            :disabled="isReadOnly"
                        />
                    </div>
                </div>

                <div class="mb-3">
                    <label for="priority" class="form-label">Priority</label>
                    <select
                        id="priority"
                        class="form-select"
                        v-model="event.priority"
                        :disabled="isReadOnly"
                    >
                        <option value="1">Low (1)</option>
                        <option value="2">Normal (2)</option>
                        <option value="3">High (3)</option>
                        <option value="4">Highest (4)</option>
                    </select>
                </div>

                <div class="mt-4 d-flex justify-content-between">
                    <button
                        type="button"
                        class="btn btn-primary"
                        @click="saveEvent"
                        v-if="formType === 'Create' || User === event.owner"
                    >
                        {{ formType }}
                    </button>
                    
                <button v-if="formType === 'Save' && User === event.owner" type="button" :class="isModifying ? 'btn btn-primary' : 'btn btn-outline-primary'" @click="toggleModify">Modify</button>
                    <button
                        type="button"
                        class="btn btn-secondary"
                        @click="cancel"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
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
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { timeZonesNames } from '@vvo/tzdb';
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

import { useTimeMachineStore } from '../stores/timeMachine';
const timeMachineStore = useTimeMachineStore();

const api_url = inject('api_url');
const user = atob(localStorage.getItem('token').split('.')[1]);
const router = useRouter();
const props = defineProps(['id','callback','eventDate']);
const titleError = ref(false);
const endDateError = ref(false);
const frequencyError = ref(false);
const specificDayError = ref(false);
const specificWeekdayError = ref(false);
const Friends = ref([]);

const isModifying = ref(false);
const isReadOnly = computed(() => {
    if (formType.value === 'Create') return false;
    return !isModifying.value;
});
function toggleModify() {
    isModifying.value = !isModifying.value;
}
const User = ref(user);

//********************************************************************************************************************
//TIME MACHINE
const currentTime = computed(() => timeMachineStore.getCurrentTime.format('YYYY-MM-DD HH:mm:ss'));
//const currentTimeAsMs = computed(() => timeMachineStore.getCurrentTime.valueOf()); //TODO: remove if not used. currentTime in milliseconds
watch(currentTime, async() => {
    await nextTick();
    console.log("currentTime changed: ", currentTime.value);
});
//********************************************************************************************************************


// Dati dell'Evento
const event = reactive({
    owner : '',
    title: '',
    description: '',
    location: '',
    startDate: null,
    startTime: null,
    endDate: null,
    endTime: null,
    allDay: false,
    //variabili per l'evento ricorrente
    isRecurring: false,
    frequency: 'weekly',
    specificDay: null,
    weekNumber: '',
    weekday: '',
    recurringEndOption: 'forever',
    repeatCount: 1,
    untilDate: null,
    eventTypeNotAvailable: false,
    pomodoro: false,
    cycles: 5, // Default value for cycles (only used if pomodoro is true)
    studyTime: 30, // Default value for study time in minutes (only used if pomodoro is true)
    restTime: 5, // Default value for rest time in minutes (only used if pomodoro is true)
    pomodoroId: -1, // Default value for pomodoro id (only used if pomodoro is true)
    recurring_rule: '',
    priority: 2,                    // default: 2=Normal
    //variabili per la gestione dei partecipanti
    addParticipants: false,         // Switch per mostrare/nascondere la lista partecipanti
    selectedParticipants: [],       // Elenco di partecipanti selezionati
    participants_waiting: [],       // Partecipanti in attesa di risposta
    participants_accepted: [],      // Partecipanti che hanno accettato
    participants_refused: [],       // Partecipanti che hanno rifiutato
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone   //Fuso orario
});



// Dati per le notifiche
const notification = reactive({
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

const channelsError = ref(false);

const formatOffsetOption = (val) => {
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

const checkCustomInterval = () => {
    if (notification.repeatInterval === '-1') {
        notification.isCustomRepeatInterval = true;
        notification.customRepeatInterval = null; // reset
    } else {
        notification.isCustomRepeatInterval = false;
    }
};


const timezones = ref(timeZonesNames);


var formType = ref('');

//alert('props='+JSON.stringify(props));
if (props.id == '-1'){
    event.startDate = dayjs(props.eventDate, 'DDMMYYYY', true).toDate();
    event.endDate = event.startDate;
    //event.startTime = new Date(currentTime.value).getTime();
    const now = dayjs(currentTime.value);
    const remainder = 10 - (now.minute() % 10);
    const next10 = remainder === 10 ? now : now.add(remainder, 'minute');
    event.startTime = next10.second(0).millisecond(0).toDate().getTime();
    event.endTime = dayjs(event.startTime).add(1, 'hour').toDate().getTime();
    //date_start.value = dayjs(props.eventDate, 'DDMMYYYY', true).format('YYYY-MM-DD');
    //alert("event.startDate="+event.startDate+", event.endDate="+event.endDate +", date_start.value=" +date_start.value);
    //alert("Event="+JSON.stringify(event));
}



async function getEvent(eventId){
    try{
        //const res = await axios.get(api_url + "getEvents/" + user + "/" + eventId);
        const res = await axios.get(api_url + "getEvents/-1/" + eventId);
        const Events = res.data;
        await nextTick();
        const event_ = Events[0];
        //alert("event_= " + JSON.stringify(event_));
        event.owner = event_.owner;
        event.title = event_.title;
        event.description = event_.description;
        //event.startDate = dayjs(event_.date_start).toDate();
        const startUtc = dayjs(event_.date_start).utc();
        event.startDate = startUtc.tz(event.timezone).toDate();

        event.startTime = dayjs(event.startDate).toDate().getTime();
        //event.endDate = dayjs(event_.date_end).toDate();
        const endUtc = dayjs(event_.date_end).utc();
        event.endDate = endUtc.tz(event.timezone).toDate();
        
        event.endTime = dayjs(event.endDate).toDate().getTime();
        event.location = event_.place;
        event.allDay = event_.all_day;
        event.isRecurring = event_.is_recurring;
        event.recurring_rule = event_.recurring_rule;
        event.eventTypeNotAvailable = (event_.ev_type === 'notAvailable');
        event.pomodoro = event_.pomodoro;
        event.cycles = event_.cycles;
        event.studyTime = event_.studyTime;
        event.restTime = event_.restTime;
        event.pomodoroId = event_.pomodoroId;
        event.priority = event_.priority || 2;
        event.addParticipants = event_.addParticipants || false;
        event.selectedParticipants = event_.selectedParticipants || [];
        event.participants_waiting = event_.participants_waiting || [];
        event.participants_accepted = event_.participants_accepted || [];
        event.participants_refused = event_.participants_refused || [];
        event.timezone = event_.timezone || 'Europe/Rome'; // Intl.DateTimeFormat().resolvedOptions().timeZone;
        //alert(event.timezone);
        //alert("event= " + JSON.stringify(event));
        parseRRule(event.recurring_rule);


        if (typeof event_.has_notification !== 'undefined') {
            notification.enabled = event_.has_notification;
        }

        // Imposto i canali
        if (Array.isArray(event_.notification_modes)) {
            notification.channels.alert = event_.notification_modes.includes('ALERT');
            notification.channels.email = event_.notification_modes.includes('EMAIL');
        }

        // Se esiste un orario specifico per l’offset (notification_advance_date)
        // uso quello, altrimenti uso i minuti (notification_advance)
        if (event_.notification_advance_date) {
            notification.offsetType = 'exact';
            notification.offsetTime = dayjs(event_.notification_advance_date).toDate();
        } else {
            notification.offsetType = 'minutes';
            notification.offsetMinutes = event_.notification_advance || 0;
        }

        // Numero ripetizioni
        if (typeof event_.notification_repetitions !== 'undefined') {
            notification.repeatCount = event_.notification_repetitions;
        }

        // Intervallo tra le ripetizioni
        if (typeof event_.notification_interval !== 'undefined') {
            // Se il valore non è fra quelli standard e non è -1, lo consideriamo "custom"
            const validIntervals = ["1","5","10","15","30","60"];
            notification.repeatInterval = event_.notification_interval.toString();

            if (!validIntervals.includes(notification.repeatInterval) && notification.repeatInterval !== "-1") {
                notification.isCustomRepeatInterval = true;
                notification.customRepeatInterval = parseInt(notification.repeatInterval, 10);
                notification.repeatInterval = "-1";
            } else {
                notification.isCustomRepeatInterval = (notification.repeatInterval === "-1");
                if (notification.isCustomRepeatInterval) {
                    // Se il server restituisce -1, devi capire se hai un valore custom salvato da qualche parte.
                    // Altrimenti puoi lasciare null oppure assegnare un default.
                    notification.customRepeatInterval = null;
                }
            }
        }
    }catch(error){
        console.error("Error adding event: ",error);
        alert("error="+error);
    }
}

watch(() => event.pomodoro, (newVal) => {
    if (newVal) {
        event.isRecurring = false;
    }
})

watch(() => event.isRecurring, (newVal) => {
    if (newVal) {
        event.pomodoro = false;
    }
})

async function submit(rrule){
    // Se la notifica è abilitata, almeno un canale deve essere scelto
    if (notification.enabled) {
        if (!notification.channels.alert && !notification.channels.email) {
            channelsError.value = true;
            return;
        } else {
            channelsError.value = false;
        }
        // Se l'intervallo è custom, usiamo il valore custom come repeatInterval
        if (notification.isCustomRepeatInterval && notification.customRepeatInterval) {
            notification.repeatInterval = notification.customRepeatInterval;
        }
    }
  

    if (props.id == "-1"){  //Aggiunta di un evento
        try{
            const notif_modes = [];
            if (notification.channels.alert) {
                notif_modes.push('ALERT');
            }
            if (notification.channels.email) {
                notif_modes.push('EMAIL');
            }
            const newevent = {
                userName: user,
                title: event.title,
                description: event.description,
                place: event.location,
                all_day: event.allDay,
                is_recurring: event.isRecurring,
                recurring_rule: rrule,
                ev_type: (event.eventTypeNotAvailable ? 'notAvailable' : 'Event'),
                pomodoro: event.pomodoro,
                cycles: event.cycles,
                studyTime: event.studyTime,
                restTime: event.restTime,
                priority: event.priority,
                has_notification: notification.enabled,
                notification_modes: notif_modes,
                notification_advance: notification.offsetMinutes,
                notification_advance_date: (notification.offsetTime ? notification.offsetTime /*dayjs(notification.offsetTime).toDate()*/ : null),
                notification_repetitions: notification.repeatCount,
                notification_interval: notification.repeatInterval,
                notification_num_sent: 0,
                notification_stop: [],
                addParticipants: event.addParticipants,
                selectedParticipants: event.selectedParticipants,
                participants_waiting: event.participants_waiting,
                participants_accepted: event.participants_accepted,
                participants_refused: event.participants_refused,
                timezone: event.timezone
            };
            if (event.allDay){
                newevent.date_start = new Date(event.startDate.getFullYear(), event.startDate.getMonth(), event.startDate.getDate());
                newevent.date_end = new Date(event.endDate.getFullYear(), event.endDate.getMonth(), event.endDate.getDate());
            } else{
                //newevent.date_start = copyTimeToDate(event.startDate, event.startTime);
                const userStartDate = copyTimeToDate(event.startDate, event.startTime); 
                const startUTC = dayjs(userStartDate).tz(event.timezone, true).utc();
                newevent.date_start = startUTC.toDate();
                
                //newevent.date_end = copyTimeToDate(event.endDate, event.endTime);
                const userEndDate = copyTimeToDate(event.endDate, event.endTime); 
                const endUTC = dayjs(userEndDate).tz(event.timezone, true).utc();
                newevent.date_end = endUTC.toDate();
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
            console.error("Errore: ", error);
        }
    }else{  //Modifica di un evento
        try{
            const notif_modes = [];
            if (notification.channels.alert) {
                notif_modes.push('ALERT');
            }
            if (notification.channels.email) {
                notif_modes.push('EMAIL');
            }
            const event_ = {
                userName: user,
                eventId : props.id,
                title: event.title,
                description: event.description,
                place: event.location,
                //participants: participants.value,
                all_day: event.allDay,
                is_recurring: event.isRecurring,
                recurring_rule: rrule,
                ev_type: (event.eventTypeNotAvailable ? 'notAvailable' : 'Event'),
                pomodoro: event.pomodoro,
                cycles: event.cycles,
                studyTime: event.studyTime,
                restTime: event.restTime,
                pomodoroId: event.pomodoroId,
                priority: event.priority,
                has_notification: notification.enabled,
                notification_modes: notif_modes,
                notification_advance: notification.offsetMinutes,
                notification_advance_date: (notification.offsetTime ? notification.offsetTime /*dayjs(notification.offsetTime).toDate()*/ : null),
                notification_repetitions: notification.repeatCount,
                notification_interval: notification.repeatInterval,
                notification_num_sent: 0,
                notification_stop: [],
                addParticipants: event.addParticipants,
                selectedParticipants: event.selectedParticipants,
                participants_waiting: event.participants_waiting,
                participants_accepted: event.participants_accepted,
                participants_refused: event.participants_refused,
                timezone: event.timezone
            };
            if (event.allDay){
                event_.date_start = new Date(event.startDate.getFullYear(), event.startDate.getMonth(), event.startDate.getDate());
                event_.date_end = new Date(event.endDate.getFullYear(), event.endDate.getMonth(), event.endDate.getDate());
            } else{
                //event_.date_start = copyTimeToDate(event.startDate, event.startTime);
                const userStartDate = copyTimeToDate(event.startDate, event.startTime); 
                const startUTC = dayjs(userStartDate).tz(event.timezone, true).utc();
                event_.date_start = startUTC.toDate();
                
                //event_.date_end = copyTimeToDate(event.endDate, event.endTime);
                const userEndDate = copyTimeToDate(event.endDate, event.endTime); 
                const endUTC = dayjs(userEndDate).tz(event.timezone, true).utc();
                event_.date_end = endUTC.toDate();
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
            console.error("Errore: ", error);
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
        console.error("Errore: ", error);
        alert("Error: "+error);
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

//Funzione che legge gli amici dell'utente connesso
async function readFriends(){
    //alert("Friends");
    try{
        const res = await axios.get(api_url + "getUserFriends/" + user);
        Friends.value = res.data;
        await nextTick();
    } catch(error) {
        console.error("Error reading friends: ",error);
        alert("error="+error);
    }
    //alert("Friends="+JSON.stringify(Friends.value));
}

onMounted(async () => {
    if (props.id == '-1') {
        formType.value = 'Create';
        isModifying.value = true;
    } else {
        formType.value = 'Save';
        isModifying.value = false;
        await getEvent(props.id);
    }
    await readFriends();
});



const saveEvent = () => {
    titleError.value = event.title.trim() === '';
    if (titleError.value) {
        return;
    }

    // Controllo delle date
    if (event.endDate && event.startDate && dayjs(event.endDate).isBefore(dayjs(event.startDate), 'day')) {
        //if (event.endDate < event.startDate) {
        endDateError.value = true;
        return;
    } else {
        endDateError.value = false;
    }
    // Se l’evento è ricorrente, la frequenza è obbligatoria
    if (event.isRecurring && !event.frequency) {
        frequencyError.value = true;
        return;
    } else {
        frequencyError.value = false;
    }
    if (event.isRecurring && event.frequency === 'specific_day_month') {
        if (!event.specificDay) {
            specificDayError.value = true;
            return; // Blocco il salvataggio
        } else {
            specificDayError.value = false;
        }
    } else if (event.isRecurring && event.frequency === 'specific_weekday_month') {
        if (!event.weekNumber || !event.weekday) {
            specificWeekdayError.value = true;
            return; // Blocco il salvataggio
        } else {
            specificWeekdayError.value = false;
        }
    }
  
    let rrule = '';

    if (event.isRecurring) {
        let freqValue;
        switch (event.frequency) {
            case 'daily':
                freqValue = 'DAILY';
                break;
            case 'weekly':
                freqValue = 'WEEKLY';
                break;
            case 'monthly':
                freqValue = 'MONTHLY';
                break;
            case 'yearly':
                freqValue = 'YEARLY';
                break;
            case 'specific_day_month':
            case 'specific_weekday_month':
                freqValue = 'MONTHLY';
                break;
            default:
                freqValue = 'WEEKLY';
        }

        let rruleParts = [`FREQ=${freqValue}`];

        if (event.frequency === 'specific_day_month' && event.specificDay) {
            rruleParts.push(`BYMONTHDAY=${event.specificDay}`);
        }

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

        // Opzioni di fine ricorrenza
        if (event.recurringEndOption === 'untilCount') {
            rruleParts.push(`COUNT=${event.repeatCount}`);
        } else if (event.recurringEndOption === 'untilDate' && event.untilDate) {
            rruleParts.push(`UNTIL=${event.untilDate.toISOString().slice(0,10).replace(/-/g,"")}`);
        }
        rrule = `RRULE:${rruleParts.join(';')}`;
        console.log("RRULE:", rrule);
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
    //if (event.endDate < event.startDate) {
    if (event.endDate && event.startDate && dayjs(event.endDate).isBefore(dayjs(event.startDate), 'day')) {
        endDateError.value = true;
    } else {
        endDateError.value = false;
    }
});

//Watch per validare End Date
watch(() => event.endDate, (newEndDate) => {
    //if (newEndDate && event.startDate && newEndDate < event.startDate) {
    if (newEndDate && event.startDate && dayjs(newEndDate).isBefore(dayjs(event.startDate), 'day')) {
        endDateError.value = true;
    } else {
        endDateError.value = false;
    }
});
//alert("Event.="+JSON.stringify(event));

//alert("event.startDate="+event.startDate+", event.endDate="+event.endDate );

const openPomodoro = () => {
  router.push({path: "/pomodoro"});
};
</script>

<style scoped>
.background {
    position: fixed;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    margin: 0;
    padding: 0;
    overflow: hidden;
    z-index: -1;
    background: linear-gradient(to right, #f8f9fa, #e9ecef);
}

/* General container styling */
.form-container {
    display: flex;
    justify-content: center;
    padding: 20px;
}

/* Card styling */
.form-card {
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 600px;
}

/* Title styling */
.form-title {
    font-family: 'Poppins', sans-serif;
    font-size: 1.8rem;
    font-weight: bold;
    margin-bottom: 20px;
    text-align: center;
}

/* Input fields */
.form-control,
.form-select {
    border-radius: 5px;
    margin-bottom: 15px;
}

/* Button styling */
.btn-primary {
    background-color: #007bff;
    border: none;
    transition: background-color 0.3s ease;
}

.btn-primary:hover {
    background-color: #0056b3;
}

.btn-secondary {
    background-color: #6c757d;
    border: none;
    transition: background-color 0.3s ease;
}

.btn-secondary:hover {
    background-color: #5a6268;
}

/* Error messages */
.invalid-feedback {
    font-size: 0.9rem;
    color: #dc3545;
}

/* Responsive design */
@media (max-width: 768px) {
    .form-card {
        padding: 20px;
    }

    .form-title {
        font-size: 1.5rem;
    }
}
</style>
