<template>
    <div class="container mt-5">
        <h2>Event form</h2>
        <form>
            <div class="mb-3">
                <label for="title" class="form-label">Title</label>
                <input type="text" id="title" class="form-control" v-model="event.title" placeholder="Enter event title" :class="{'is-invalid': titleError}" :disabled="isReadOnly" />
                <div v-if="titleError" class="invalid-feedback">
                    Title is mandatory!
                </div>
            </div>

            <div class="mb-3">
                <label for="description" class="form-label">Description</label>
                <textarea type="text" id="description" class="form-control" v-model="event.description" placeholder="Enter a description (optional)" :disabled="isReadOnly" />
            </div>

            <div class="mb-3">
                <label for="location" class="form-label">Location</label>
                <input type="text" id="location" class="form-control" v-model="event.location" placeholder="Enter event location" :disabled="isReadOnly" />
            </div>

            <div class="mb-3 form-switch">
                <input type="checkbox" id="allDay" class="form-check-input" v-model="event.allDay" :disabled="isReadOnly" />
                <label for="allDay" class="form-check-label switch-label-margin">All Day Event</label>
            </div>

            <div class="row mb-3">
                <div class="col-md-7">
                    <div class="form-group">
                        <div class="mb-3">
                            <label for="startDate" class="form-label">Start Date</label>
                            <VueDatePicker v-model="event.startDate" :format="format" :enable-time-picker="false" :auto-apply="true" :disabled="isReadOnly" />
                        </div>
                    </div>
                </div>
                <div class="col-md-5" v-if="!event.allDay">
                    <div class="form-group">
                        <label for="startTime" class="form-label">Start Time</label>
                        <VueDatePicker v-model="event.startTime" time-picker placeholder="Select start time" model-type="timestamp" :disabled="isReadOnly" />
                    </div>
                </div>
            </div>

            <div class="row mb-3">
                <div class="col-md-7">
                    <div class="form-group">
                        <div class="mb-3">
                            <label for="endDate" class="form-label">End Date</label>
                            <div :class="{'is-invalid': endDateError}">
                                <VueDatePicker v-model="event.endDate" :format="format" :enable-time-picker="false" :auto-apply="true" :disabled="isReadOnly" />
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
                        <VueDatePicker v-model="event.endTime" time-picker placeholder="Select end time" model-type="timestamp" :disabled="isReadOnly" />
                    </div>
                </div>
            </div>

            <div class="mb-3 form-switch">
                <input type="checkbox" id="recurringEvent" class="form-check-input" v-model="event.isRecurring" :disabled="isReadOnly || event.pomodoro" />
                <label for="recurringEvent" class="form-check-label switch-label-margin">Recurring event</label>
            </div>

            <!-- Selezione della frequenza -->
            <div v-if="event.isRecurring" class="mb-3">
                <label for="frequency" class="form-label">Frequency</label>
                <select id="frequency" class="form-select" v-model="event.frequency" :disabled="isReadOnly">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="specific_day_month">Specific Day of the Month</option>
                    <option value="specific_weekday_month">Specific Weekday of the Month</option>
                </select>
            </div>
            <div v-if="frequencyError" class="invalid-feedback">
                Frequency is required for recurring events!
            </div>
            <div v-if="event.frequency === 'specific_day_month'" class="mb-3">
                <label for="specificDay" class="form-label">Choose the Day of the Month</label>
                <input type="number" id="specificDay" class="form-control" min="1" max="31" v-model="event.specificDay" placeholder="Enter day of the month (e.g. 4)" :class="{'is-invalid': specificDayError}" :disabled="isReadOnly" />
                <div v-if="specificDayError" class="invalid-feedback">
                    The day of the month is required if frequency is "Specific Day of the Month"!
                </div>
            </div>

            <div v-if="event.frequency === 'specific_weekday_month'" class="mb-3">
                <label for="weekNumber" class="form-label">Choose Week Number</label>
                <select id="weekNumber" class="form-select" v-model="event.weekNumber" :class="{ 'is-invalid': specificWeekdayError && !event.weekNumber }" :disabled="isReadOnly">
                    <option value="first">First</option>
                    <option value="second">Second</option>
                    <option value="third">Third</option>
                    <option value="fourth">Fourth</option>
                    <option value="last">Last</option>
                </select>
                <div v-if="specificWeekdayError && !event.weekNumber" class="invalid-feedback">
                    Week Number is required if frequency is "Specific Weekday of the Month"!
                </div>

                <label for="weekday" class="form-label mt-3">Choose the Day of the Week</label>
                <select id="weekday" class="form-select" v-model="event.weekday" :class="{ 'is-invalid': specificWeekdayError && !event.weekday }" :disabled="isReadOnly">
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                    <option value="sunday">Sunday</option>
                </select>
                <div v-if="specificWeekdayError && !event.weekday" class="invalid-feedback">
                    Weekday is required if frequency is "Specific Weekday of the Month"!
                </div>
            </div>

            <div v-if="event.isRecurring" class="mb-3">
                <label class="form-label">Recurrence End Option</label>
                <div>
                    <div class="form-check">
                        <input type="radio" id="repeatForever" value="forever" class="form-check-input" v-model="event.recurringEndOption" :disabled="isReadOnly" />
                        <label for="repeatForever" class="form-check-label">Repeat Forever</label>
                    </div>
                    <div class="form-check">
                        <input type="radio" id="repeatNTimes" value="untilCount" class="form-check-input" v-model="event.recurringEndOption" :disabled="isReadOnly" />
                        <label for="repeatNTimes" class="form-check-label">
                            Repeat N times
                            <input type="number" min="1" v-model="event.repeatCount" class="form-control mt-2" v-if="event.recurringEndOption === 'untilCount'" :disabled="isReadOnly" />
                        </label>
                    </div>
                    <div class="form-check">
                        <input type="radio" id="repeatUntilDate" value="untilDate" class="form-check-input" v-model="event.recurringEndOption" :disabled="isReadOnly"/>
                        <label for="repeatUntilDate" class="form-check-label">
                            Repeat until specific date
                            <VueDatePicker v-model="event.untilDate" :format="format" :enable-time-picker="false" :auto-apply="true" v-if="event.recurringEndOption === 'untilDate'" />
                        </label>
                    </div>
                </div>
            </div>

            <div class="mb-4 form-switch">
                <input type="checkbox" id="eventTypeNotAvailable" class="form-check-input" v-model="event.eventTypeNotAvailable" :disabled="isReadOnly" />
                <label for="eventTypeNotAvailable" class="form-check-label switch-label-margin">Event type: not available</label>
            </div>

            <div class="mb-4 form-switch d-flex align-items-center">
                <input type="checkbox" id="pomodoro" class="form-check-input" v-model="event.pomodoro" :disabled="isReadOnly || event.isRecurring" />
                <label for="pomodoro" class="form-check-label switch-label-margin">Pomodoro event</label>
                <button v-if="formType === 'Save' && event.pomodoro" type="button" class="btn btn-danger" style="margin-left: 3cm;" @click="openPomodoro">
                Pomodoro
                </button>
            </div>
            
            <div v-if="event.pomodoro" class="mb-3">
                <label for="cycles" class="form-label">Cycles</label>
                <input type="number" id="cycles" class="form-control" v-model="event.cycles" :disabled="isReadOnly" />
            </div>
            
            <div v-if="event.pomodoro" class="mb-3">
                <label for="studyTime" class="form-label">Study time (minutes)</label>
                <input type="number" id="studyTime" class="form-control" v-model="event.studyTime" :disabled="isReadOnly" />
            </div>
            
            <div v-if="event.pomodoro" class="mb-3">
                <label for="restTime" class="form-label">Rest time (minutes)</label>
                <input type="number" id="restTime" class="form-control" v-model="event.restTime" :disabled="isReadOnly" />
            </div>


            <div class="mb-3">
                <label for="priority" class="form-label">Priority</label>
                <select id="priority" class="form-select w-auto" v-model="event.priority" :disabled="isReadOnly">
                    <option value="1">Low (1)</option>
                    <option value="2">Normal (2)</option>
                    <option value="3">High (3)</option>
                    <option value="4">Highest (4)</option>
                </select>
            </div>

            <!-- NOTIFICATION SECTION START -->
            <div class="mb-3 form-switch mt-4">
                <input type="checkbox" id="reminderEnabled" class="form-check-input" v-model="notification.enabled" :disabled="isReadOnly" />
                <label for="reminderEnabled" class="form-check-label switch-label-margin">Enable notification</label>
            </div>

            <!-- Se il reminder è abilitato, mostra i parametri di configurazione -->
            <div v-if="notification.enabled">

                <!-- Canali di notifica -->
                <!--<div class="mb-3">
                    <label class="form-label">Notification channels</label>
                    <div class="form-check">
                        <input type="checkbox" id="alertChannel" class="form-check-input" v-model="notification.channels.alert" :disabled="isReadOnly" />
                        <label for="alertChannel" class="form-check-label">Alert</label>
                    </div>
                    <div class="form-check">
                        <input type="checkbox" id="emailChannel" class="form-check-input" v-model="notification.channels.email" :disabled="isReadOnly" />
                        <label for="emailChannel" class="form-check-label">Email</label>
                    </div>
                    <div v-if="channelsError" class="text-danger">
                        Please choose at least one channel!
                    </div>
                </div>-->

                <div class="mb-3">
                    <label class="form-label">Notification offset</label>

                    <div class="form-check">
                        <input type="radio" id="offsetTypeMinutes" class="form-check-input" value="minutes" v-model="notification.offsetType" :disabled="isReadOnly" />
                        <label for="offsetTypeMinutes" class="form-check-label">Offset in minutes</label>
                    </div>

                    <div class="ms-4" v-if="notification.offsetType === 'minutes'">
                        <select v-model="notification.offsetMinutes" class="form-select w-auto mt-1" :disabled="isReadOnly">
                            <option v-for="opt in offsetOptions" :key="opt" :value="opt">
                                {{ formatOffsetOption(opt) }}
                            </option>
                        </select>
                    </div>

                    <div class="form-check mt-2">
                        <input type="radio" id="offsetTypeExact" class="form-check-input" value="exact" v-model="notification.offsetType" :disabled="isReadOnly" />
                        <label for="offsetTypeExact" class="form-check-label">Exact time</label>
                    </div>

                    <div class="ms-4" v-if="notification.offsetType === 'exact'">
                        <VueDatePicker v-model="notification.offsetTime" time-picker placeholder="Select offset time" model-type="timestamp" :disabled="isReadOnly" />
                    </div>
                </div>

                <!-- Ripetizioni -->
                <div class="mb-3">
                    <label class="form-label">Repetitions</label>
                    <input type="number" class="form-control w-auto" min="0" v-model="notification.repeatCount" placeholder="0 = indefinite" :disabled="isReadOnly" />
                    <div class="form-text">Use 0 for repetitions until stopped</div>
                </div>

                <!-- Intervallo tra ripetizioni -->
                <div class="mb-3">
                    <label class="form-label">Interval between notifications (minutes)</label>
                    <select v-model="notification.repeatInterval" class="form-select w-auto" @change="checkCustomInterval" :disabled="isReadOnly">
                        <option value="1">1 minute</option>
                        <option value="5">5 minutes</option>
                        <option value="10">10 minutes</option>
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">60 minutes</option>
                        <option value="-1">Custom...</option>
                    </select>
                    <div class="mt-2" v-if="notification.isCustomRepeatInterval">
                        <input type="number" class="form-control w-auto" min="1" v-model="notification.customRepeatInterval" placeholder="Enter custom minutes" :disabled="isReadOnly" />
                    </div>
                </div>
            </div>
            <!-- NOTIFICATION SECTION END -->


            <div v-if="Friends.length > 0" class="mb-3 form-switch">
                <input type="checkbox" id="addParticipants" class="form-check-input" v-model="event.addParticipants" :disabled="isReadOnly" />
                <label for="addParticipants" class="form-check-label switch-label-margin">Add participants</label>
            </div>

            <div v-if="event.addParticipants">
                <table class="table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="friend in Friends" :key="friend.username">
                        <td>
                            <input type="checkbox" class="form-check-input" v-model="event.selectedParticipants" :value="friend.username" :disabled="isReadOnly" />
                        </td>
                        <td>{{ friend.username }}</td>
                        <td>{{ friend.name }}</td>
                        <td>
                            <BIconHourglassSplit v-if="event.participants_waiting.includes(friend.username)" class="text-secondary" title="Waiting" />
                            <BIconCheckCircle v-else-if="event.participants_accepted.includes(friend.username)" class="text-success" title="Accepted" />
                            <BIconXCircle v-else-if="event.participants_refused.includes(friend.username)" class="text-danger" title="Refused" />
                        </td>
                    </tr>
                </tbody>
                </table>
            </div>
            
            
            <div class="mb-3">
              <label for="timezone" class="form-label">Time zone</label>
              <select
                id="timezone"
                class="form-select"
                v-model="event.timezone"
                :disabled="isReadOnly"
              >
                <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
              </select>
            </div>



            <div v-if="formType === 'Save' && User !== event.owner">
                --- This event is editable only by the owner ---
            </div>

            <div class="mt-4 d-flex justify-content-between align-items-center gap-2">
                <div class="d-flex gap-2">
                    <button type="button" class="btn btn-outline-primary" @click="saveEvent" v-if="formType === 'Create' || User === event.owner">{{ formType }}</button>
                    <button type="button" class="btn btn-outline-secondary" @click="cancel">Cancel</button>
                </div>
                <button v-if="formType === 'Save' && User === event.owner" type="button" :class="isModifying ? 'btn btn-primary' : 'btn btn-outline-primary'" @click="toggleModify">Modify</button>
                <button type="button" class="btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#confirmDeleteModal" v-if="formType === 'Save' && User === event.owner">Remove</button>
            </div>
        </form>
    </div>


    <!-- FINESTRA MODALE PER LA CONFERMA RIMOZIONE -->
    <div class="modal fade" id="confirmDeleteModal" tabindex="-1" aria-labelledby="confirmDeleteModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="confirmDeleteModalLabel">Confirm Deletion</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div class="modal-body">
                    Are you sure you want to delete this event?
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-danger" data-bs-dismiss="modal" @click="remove">Yes, delete</button>
                </div>
            </div>
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
const currentTimeAsMs = computed(() => timeMachineStore.getCurrentTime.valueOf()); //TODO: remove if not used. currentTime in milliseconds
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
    .container {
        max-width: 800px;
    }

    .switch-label-margin {
        margin-left: 0.5cm;
    }
</style>
