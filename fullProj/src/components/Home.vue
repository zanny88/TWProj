<template>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
        rel="stylesheet">

    <ul class="background">
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
    </ul>

    <div class="container-fluid">
        <div class="row mb-3 justify-content-center justify-content-md-start">
            <div class="col col-md-8">
                <div class="preview container-fluid floating floating1" id="calendar-preview">
                    <div class="row h-25">
                        <router-link class="preview-title col" to="/calendar">CALENDAR</router-link>
                    </div>

                    <div class="form-check form-switch position-absolute top-0 end-0 me-3 me-md-5 mt-0"
                        style="z-index: 1000;">
                        <label class="form-check-label" for="flexSwitchCheckCalendar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                class="bi bi-clock" viewBox="0 0 16 16">
                                <path
                                    d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z" />
                                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0" />
                            </svg>
                        </label>

                        <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckCalendar"
                            v-model="calendarToggle">

                        <label class="form-check-label" for="flexSwitchCheckCalendar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                class="bi bi-calendar-week" viewBox="0 0 16 16">
                                <path
                                    d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-5 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z" />
                                <path
                                    d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
                            </svg>
                        </label>

                    </div>


                    <div class="hstack h-50">
                        <div class="col container preview-img-container d-none d-sm-block"><img
                                src="../assets/slothCalendar1.png" class="img-fluid preview-img" /></div>


                        <div v-if="!calendarToggle" class="col d-flex flex-column preview-info">
                            <div>Events today:</div>
                            <div class="calendar-preview-info">
                                <div v-if="today_events.length > 0">
                                    <div v-for="event in today_events.slice(0, 2)" :key="event"
                                        style="margin-bottom: 0.5rem;">
                                        {{ event.substring(0, 20) + (event.length > 20 ? '...' : '') }}
                                    </div>
                                    <div v-if="today_events.length > 2" style="font-style: italic;">...and more</div>
                                </div>
                                <div v-else style="font-style: italic;">No events today.</div>
                            </div>
                        </div>

                        <div v-if="!calendarToggle" class="col-1 vr ms-3 me-3" style="color: #B8BDB5;"></div>

                        <div v-if="!calendarToggle" class="col d-flex flex-column preview-info">
                            <div>Activities today:</div>
                            <div class="calendar-preview-info">
                                <div v-if="today_activities.length > 0">
                                    <div v-for="activity in today_activities.slice(0, 2)" :key="activity"
                                        style="margin-bottom: 0.5rem;">
                                        {{ activity.substring(0, 20) + (activity.length > 20 ? '...' : '') }}
                                    </div>
                                    <div v-if="today_activities.length > 2" style="font-style: italic;">...and more
                                    </div>
                                </div>
                                <div v-else style="font-style: italic;">No activities today.</div>
                            </div>
                        </div>

                        <div v-else class="col d-flex flex-column preview-info">
                            <div>Pretend something is here</div>
                            <!-- TODO: Preview for current week -->
                        </div>

                    </div>
                </div>
            </div>
        </div>

        <div class="row mb-3 justify-content-center justify-content-md-end">
            <div class="col col-md-8">
                <div class="preview container-fluid floating floating2" id="pomodoro-preview">
                    <div class="row h-25">
                        <router-link class="preview-title col" to="/pomodoro">POMODORO</router-link>
                    </div>

                    <div class="form-check form-switch position-absolute top-0 end-0 me-3 me-md-5 mt-0"
                        style="z-index: 1000;">
                        <label class="form-check-label" for="flexSwitchCheckPomodoro">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                class="bi bi-clock" viewBox="0 0 16 16">
                                <path
                                    d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z" />
                                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0" />
                            </svg>
                        </label>

                        <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckPomodoro"
                            v-model="pomodoroToggle">

                        <label class="form-check-label" for="flexSwitchCheckPomodoro">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                class="bi bi-graph-up" viewBox="0 0 16 16">
                                <path fill-rule="evenodd"
                                    d="M0 0h1v15h15v1H0zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07" />
                            </svg>
                        </label>

                    </div>

                    <div class="hstack h-50">
                        <div v-if="!pomodoroToggle" class="col d-flex flex-column preview-info">
                            <div>Latest:</div>
                            <div id="pomodoro-preview-info">

                                <div v-if="latestPomodoroSession?._id">
                                    <div>Study: {{ latestPomodoroSession?.studyTime }} min.</div>
                                    <div>Rest: {{ latestPomodoroSession?.restTime }} min.</div>
                                    <div>Cycles:
                                        {{ latestPomodoroSession?.completedCycles }}/{{ latestPomodoroSession.totCycles
                                        }}
                                    </div>

                                    <router-link
                                        v-if="latestPomodoroSession.completedCycles < latestPomodoroSession.totCycles"
                                        id="resume-pomodoro-link" :to="`/pomodoro/${latestPomodoroSession?._id}`">
                                        RESUME
                                    </router-link>
                                </div>
                                <div v-else>No previous session to resume.</div>
                            </div>
                        </div>

                        <div v-else class="col d-flex flex-column preview-info">
                            <div>Stats for last week:</div>
                            <div id="pomodoro-preview-info">
                                <div>Sessions completed: {{ Math.floor(pomodoroWeekStats.percentOfCompletedSessions) }}%
                                    ({{ pomodoroWeekStats.completedSessionsCount }}/{{ pomodoroWeekStats.sessionsCount
                                    }})
                                </div>
                                <div>Cycles completed: {{ Math.floor(pomodoroWeekStats.percentOfCompletedCycles) }}%
                                    ({{ pomodoroWeekStats.completedCyclesCount }}/{{ pomodoroWeekStats.cyclesCount }})
                                </div>

                            </div>
                        </div>

                        <div class="col-1 vr ms-3 me-3" style="color: #B8BDB5;"></div>
                        <div class="col"><router-link :to="'/pomodoro'"><button
                                    class="btn badge-pill btn-light fw-bold p-2" id="new-session-btn">NEW
                                    SESSION</button></router-link></div>
                        <div class="col container preview-img-container d-none d-sm-block"><img
                                src="../assets/slothTomato.png" class="img-fluid preview-img" /></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row mb-3 justify-content-center justify-content-md-start">
            <div class="col col-md-8">
                <div class="preview container-fluid floating floating3" id="notes-preview">
                    <div class="row h-25">
                        <router-link class="preview-title col" to="/showNote">NOTES</router-link>
                    </div>

                    <div class="form-check form-switch position-absolute top-0 end-0 me-3 me-md-5 mt-0"
                        style="z-index: 1000;">
                        <label class="form-check-label" for="flexSwitchCheckNote">
                            Old
                        </label>

                        <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckNote"
                            v-model="latestNoteToggle">

                        <label class="form-check-label" for="flexSwitchCheckNote">
                            New
                        </label>

                    </div>

                    <div class="row h-75">
                        <div class="col container preview-img-container d-none d-sm-block"><img
                                src="../assets/slothStudying.png" class="img-fluid preview-img" /></div>
                        <div class="col d-flex flex-column preview-info align-items-center">
                            <div style="margin-bottom: 0.5rem">{{ latestNoteToggle ? 'Latest' : 'Oldest' }} note:</div>

                            <div class="card" style="width: 14rem;" v-if="displayedNoteId != ''" id="latest-note-card">
                                <div class="card-body">
                                    <h5 class="card-title">
                                        <router-link id="latest-note-link" :to="`/note/${displayedNoteId}`">{{
                                            displayedNoteHeading }}
                                        </router-link>
                                    </h5>
                                    <hr>
                                    <p class="card-text" v-if="displayedNoteContent != ''">{{ displayedNoteContent }}
                                    </p>
                                    <p class="card-text" v-else style="font-style: italic;">(no content provided)</p>
                                </div>
                            </div>


                            <div v-else>No note exists.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<!--
Palette 1:
#dda15e, #60d394, #aaf683, #330f0a, #394f49

-->

<style scoped>
@import '../assets/styles/pomodoroVariables.css';

.container-fluid {
    height: 80vh;
}

*:not(.background) {
    transition: all 1s;
}

.preview {
    width: 80%;
    height: 24vh;
    border-radius: 2em;
    text-align: center;
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.648);
}

#calendar-preview {
    background-color: #885A5A;
    color: white;
}

#pomodoro-preview {
    background-color: #353A47;
    color: white;
}

#notes-preview {
    background-color: #DC136C;
    color: white;
}

.preview-title {
    font-family: Poppins, sans-serif;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-decoration: none;
    color: white;

    &:hover {
        letter-spacing: 0.5em;
        text-shadow: 1px 1px 1px black;
    }
}

#resume-pomodoro-link,
#new-session-btn {
    background-color: white;
    font-size: 0.8em;
    padding: 0.2rem;
    border-radius: 5px;
    color: black;
    mix-blend-mode: screen;
    text-decoration: none;

    &:hover {
        background-color: var(--my-tomato);
        color: white;
        transition: 200ms all;
    }
}

#pomodoro-preview-info {
    font-size: 0.8em;
}

.calendar-preview-info {
    font-size: 0.8em;
}

#latest-note-link {
    color: black;
    text-decoration: none;
    text-transform: uppercase;

    &:hover {
        transform: scale(1.2, 1.2);
        transition: 500ms all;
        text-decoration: underline;
    }
}

#latest-note-card {
    hr {
        margin: 1px;
    }

    .card-body {
        padding: 8px;
    }

    .card-title {
        margin-bottom: 0;
        font-size: 1rem;
    }

    .card-text {
        font-size: 0.75rem;
        opacity: 0.4;
    }
}

.vr {
    width: 1px;
    height: 95%;
}

.preview-img {
    max-height: 93px;
    object-fit: cover;
}

.preview-info * {
    font-family: Ginto, sans-serif;
}

.floating {
    animation-duration: 5s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
}

.floating1 {
    animation-name: floating1;
}

.floating2 {
    animation-name: floating2;
}

.floating3 {
    animation-name: floating3;
}

@keyframes floating1 {
    0% {
        transform: translate(0, 0px);
    }

    25% {
        transform: translate(0, 3px);
    }

    75% {
        transform: translate(0, -3px);
    }

    100% {
        transform: translate(0, 0px);
    }
}

@keyframes floating2 {
    0% {
        transform: translate(0, 3px);
    }

    50% {
        transform: translate(0, -3px);
    }

    75% {
        transform: translate(0, 0px);
    }

    100% {
        transform: translate(0, 3px);
    }
}

@keyframes floating3 {
    0% {
        transform: translate(0, -3px);
    }

    50% {
        transform: translate(0, 3px);
    }

    75% {
        transform: translate(0, 0px);
    }

    100% {
        transform: translate(0, -3px);
    }
}


.form-check {
    display: flex;
    align-items: center;
}

.form-check-label:first-of-type {
    margin-right: 44px;
    /* Adjust as needed */
}

.form-check-label:last-of-type {
    margin-left: 4px;
    /* Adjust as needed */
}

/*****************Animated background credit: https://codepen.io/mohaiman/pen/MQqMyo*************************/

@keyframes animate {
    0% {
        transform: translateY(0) rotate(0deg);
        opacity: 1;
        border-radius: 0;
    }

    100% {
        transform: translateY(-1000px) rotate(720deg);
        opacity: 0;
        border-radius: 50%;
    }
}

.background {
    position: fixed;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    margin: 0;
    padding: 0;
    /*background: #d0cbdb;*/
    background: #84b082;
    overflow: hidden;
    z-index: -1;
}

.background li {
    position: absolute;
    display: block;
    list-style: none;
    width: 20px;
    height: 20px;
    background: rgba(255, 255, 255, 0.2);
    animation: animate 19s linear infinite;
}

.background li:nth-child(0) {
    left: 67%;
    width: 121px;
    height: 121px;
    bottom: -121px;
    animation-delay: 1s;
}

.background li:nth-child(1) {
    left: 27%;
    width: 105px;
    height: 105px;
    bottom: -105px;
    animation-delay: 1s;
}

.background li:nth-child(2) {
    left: 36%;
    width: 153px;
    height: 153px;
    bottom: -153px;
    animation-delay: 3s;
}

.background li:nth-child(3) {
    left: 6%;
    width: 108px;
    height: 108px;
    bottom: -108px;
    animation-delay: 5s;
}

.background li:nth-child(4) {
    left: 28%;
    width: 163px;
    height: 163px;
    bottom: -163px;
    animation-delay: 3s;
}

.background li:nth-child(5) {
    left: 29%;
    width: 171px;
    height: 171px;
    bottom: -171px;
    animation-delay: 20s;
}

.background li:nth-child(6) {
    left: 13%;
    width: 114px;
    height: 114px;
    bottom: -114px;
    animation-delay: 3s;
}

.background li:nth-child(7) {
    left: 54%;
    width: 112px;
    height: 112px;
    bottom: -112px;
    animation-delay: 7s;
}

.background li:nth-child(8) {
    left: 63%;
    width: 145px;
    height: 145px;
    bottom: -145px;
    animation-delay: 4s;
}

.background li:nth-child(9) {
    left: 11%;
    width: 108px;
    height: 108px;
    bottom: -108px;
    animation-delay: 16s;
}

/*********************************************************************/
</style>

<script setup>
import { inject, ref, onMounted, watch, computed } from "vue";
import axios from 'axios';
import { nextTick } from 'vue';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import rrulePlugin from '@fullcalendar/rrule';
import { prepareCalendarEvents } from './calendarUtils';
import dayjs from 'dayjs';
import { useTimeMachineStore } from '../stores/timeMachine';


const api_url = inject('api_url');
const timeMachineStore = useTimeMachineStore();
const pomodoro_sessions_api_url = inject('pomodoro_sessions_api_url');
const notes_api_url = inject('notes_api_url');
const token = localStorage.getItem('token');

const currentTime = computed(() => timeMachineStore.getCurrentTime.format('YYYY-MM-DD HH:mm:ss'));

const latestPomodoroSession = ref({});
const pomodoroWeekStats = ref({});

const latestNoteId = ref('');
const latestNoteHeading = ref('');
const latestNoteContent = ref('');

const oldestNoteId = ref('');
const oldestNoteHeading = ref('');
const oldestNoteContent = ref('');

const displayedNoteId = ref('');
const displayedNoteHeading = ref('');
const displayedNoteContent = ref('');

const today_events = ref([]);
const today_activities = ref([]);
const calendarToggle = ref(false);
const pomodoroToggle = ref(false);
const latestNoteToggle = ref(true);

watch(currentTime, () => {
    update_previews();
});

async function update_previews() {
    get_latest_pomodoro_stats(); //Must manage time server-side in index.js
    get_pomodoro_week_stats(); //Must manage time server-side in index.js
    get_note_preview(); //Must manage time server-side in index.js
    get_today_events(); //Updates correctly
}

async function get_today_events() {
    const Events = ref([]);
    const Activities = ref([]);
    today_events.value = [];
    today_activities.value = [];

    // Crea un elemento DOM temporaneo e non aggiungerlo al DOM visibile
    const tempEl = document.createElement('div');

    // Inizializza FullCalendar sull'elemento temporaneo
    const calendar = new Calendar(tempEl, {
        plugins: [dayGridPlugin, rrulePlugin]
    });

    // Renderizza il calendario (anche se non è visibile)
    calendar.render();

    try {
        var user;
        if (token != null) {
            user = atob(token.split('.')[1]);
        }
        let res = await axios.get(api_url + "getEvents/" + user + "/-1");    //Carica gli eventi
        Events.value = res.data;
        await nextTick();
        res = await axios.get(api_url + "getActivities/" + user + "/-1");    //Carica le attività
        Activities.value = res.data;
        await nextTick();
        //alert("Events.value="+JSON.stringify(Events.value));
        //alert("Activities.value="+JSON.stringify(Activities.value));
        const calendarEvents = prepareCalendarEvents(Events.value, Activities.value);
        //alert("CalendarEvents.value="+JSON.stringify(calendarEvents));
        calendar.addEventSource(calendarEvents);


        const today = new Date(currentTime.value);
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        // Filtra gli eventi per oggi utilizzando FullCalendar
        const eventsToday = calendar.getEvents().filter(event => {
            const eventDate = new Date(event.start);
            return eventDate >= startOfDay && eventDate < endOfDay;
        }).slice(0, 6);            //Prendo fino a 6 elementi
        //alert("eventsToday="+JSON.stringify(eventsToday));
        //Lista ordinata per data iniziale crescente
        eventsToday.sort((a, b) => {
            const dataA = new Date(a.start);
            const dataB = new Date(b.start);
            return dataA - dataB;
        });
        for (let i = 0; i < eventsToday.length; i++) {
            const ev = eventsToday[i];
            let title = '';
            if (!ev.allDay) {
                title = dayjs(ev.start).format('HH:mm') + " - " + dayjs(ev.end).format('HH:mm') + ' ';
            }
            title += ev.title;
            //console.log("ev="+title);
            if (ev.extendedProps.class == "activity")
                today_activities.value.push(title);
            else today_events.value.push(title);
        }
    } catch (error) {
        //alert('Error: '+error);
        console.error("Error fetching events and activities: ", error);
    } finally {
        // Distruggi l'istanza di FullCalendar per liberare risorse
        calendar.destroy();
    }
}

async function get_latest_pomodoro_stats() {
    var user;

    if (token != null) {
        user = atob(token.split('.')[1]);
    }

    try {
        var session = await axios.post(`${pomodoro_sessions_api_url}read/latest`, { user: user });
        if (session.data) {
            latestPomodoroSession.value = session.data;
        }
        else
            latestPomodoroSession.value = {};
    } catch (error) {
        console.error("Error fetching latest pomodoro session: ", error);
    }
}

async function get_pomodoro_week_stats() {
    var user;

    if (token != null) {
        user = atob(token.split('.')[1]);
    }

    try {
        var weekStats = await axios.post(`${pomodoro_sessions_api_url}read/week_stats`, { user: user });
        if (weekStats.data) {
            pomodoroWeekStats.value = weekStats.data;
        }
        else {
            pomodoroWeekStats.value = {};
        }
    } catch (error) {
        console.error("Error fetching pomodoro weekly stats: ", error);
    }
}

async function get_note_preview() {

    // const user = (await axios.post(`${api_url}getUser`)).data.name;
    var user;

    if (token != null) {
        user = atob(token.split('.')[1]);
    }

    try {
        var latestNote = await axios.post(`${notes_api_url}latest`, { user: user });
        var oldestNote = await axios.post(`${notes_api_url}oldest`, { user: user });

        if (latestNote.data) {
            const data = latestNote.data;
            latestNoteId.value = data._id;
            latestNoteHeading.value = data.heading.substring(0, 20) + (data.heading.length > 20 ? '...' : '');
            if (data.content) {
                let tmpContent = data.content.substring(0, 20) + (data.content.length > 20 ? '...' : '');
                latestNoteContent.value = tmpContent;
            }
        }

        if (oldestNote.data) {
            const data = oldestNote.data;
            oldestNoteId.value = data._id;
            oldestNoteHeading.value = data.heading.substring(0, 20) + (data.heading.length > 20 ? '...' : '');
            if (data.content) {
                let tmpContent = data.content.substring(0, 20) + (data.content.length > 20 ? '...' : '');
                oldestNoteContent.value = tmpContent;
            }
        }

        if (latestNoteToggle.value) {
            displayedNoteId.value = latestNoteId.value;
            displayedNoteHeading.value = latestNoteHeading.value;
            displayedNoteContent.value = latestNoteContent.value;
        }
        else {
            displayedNoteId.value = oldestNoteId.value;
            displayedNoteHeading.value = oldestNoteHeading.value;
            displayedNoteContent.value = oldestNoteContent.value;
        }
    } catch (error) {
        console.error("Error fetching notes: ", error);
    }
}

onMounted(() => {
    get_latest_pomodoro_stats();
    get_pomodoro_week_stats();
    get_note_preview();
    get_today_events();
});

watch(latestNoteToggle, (newVal) => {
    if (newVal) {
        displayedNoteId.value = latestNoteId.value;
        displayedNoteHeading.value = latestNoteHeading.value;
        displayedNoteContent.value = latestNoteContent.value;
    }
    else {
        displayedNoteId.value = oldestNoteId.value;
        displayedNoteHeading.value = oldestNoteHeading.value;
        displayedNoteContent.value = oldestNoteContent.value;
    }
});

</script>