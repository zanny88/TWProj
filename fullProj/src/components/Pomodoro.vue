<template>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Major+Mono+Display&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap"
        rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Monoton&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap"
        rel="stylesheet">

    <ul class="background">
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
    </ul>

    <main>
        <div class="modal fade" id="notificationModal" tabindex="-1" role="dialog"
            aria-labelledby="notificationModalTitle" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="notificationModalTitle">{{ modalTitle }}</h5>
                    </div>
                    <div class="modal-body">
                        {{ modalBody }}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
                    </div>
                </div>
            </div>
        </div>

        <form id="avail-time-form" class="d-flex flex-column align-items-center justify-content-evenly container-fluid">
            <div class="form-group row" id="avail-time-row">
                <label for="avail-h" class="col-md-6 col-form-label text-center text-md-end">(OPTIONAL) AVAILABLE
                    TIME</label>
                <div class="col">
                    <div class="row">
                        <div class="col-6">
                            <input type="number" class="form-control" id="avail-h" v-model="availH" min="0">
                            <span class="input-subtext">hours</span>
                        </div>
                        <div class="col-6">
                            <input type="number" class="form-control" id="avail-min" v-model="availM">
                            <span class="input-subtext">minutes</span>
                        </div>
                    </div>
                </div>
            </div>
        </form>
        <div id="expand-container">
            <div id="expand-collapse" class="collapsed">
                <div id="suggestions-box" class="mt-1 mb-1 flex-column justify-content-evenly align-items-center"
                    style="display:flex;">
                    <label for="suggestions">SUGGESTIONS</label>
                    <div id="suggestions">
                        <button type="button" class="col btn btn-light text-black ms-2 mb-2 suggestion-btn"
                            v-for="(cycle, index) in defaultCycles" :key="index"
                            @click.prevent="setDisplayed(suggestionsStructsArray[index].studyDuration, suggestionsStructsArray[index].restDuration, suggestionsStructsArray[index].cyclesNum)"
                            v-show="buttonShouldBeDisplayed(index)"></button>
                    </div>
                </div>
            </div>
        </div>
        <form id="times-form" class="d-flex flex-column align-items-center justify-content-evenly">
            <div class="container-fluid">
                <div class="form-group row">
                    <label for="study-time" class="col-md-6 col-form-label text-center text-md-end">STUDY
                        (minutes)</label>
                    <div class="col-12 col-md-3">
                        <input type="number" class="form-control text-center text-md-start" id="study-time" required
                            min="0" v-model="studyT">
                    </div>
                </div>
                <div class="form-group row">
                    <label for="rest-time" class="col-md-6 col-form-label text-center text-md-end">REST
                        (minutes)</label>
                    <div class="col-12 col-md-3">
                        <input type="number" class="form-control text-center text-md-start" id="rest-time" required
                            min="0" v-model="restT">
                    </div>
                </div>
                <div class="form-group row">
                    <label for="cycles-num" class="col-md-6 col-form-label text-center text-md-end">CYCLES</label>
                    <div class="col-12 col-md-3">
                        <input type="number" class="form-control text-center text-md-start" id="cycles-num" required
                            min="1" v-model="cyclesTot">
                    </div>
                </div>
            </div>

            <div class="flex-row justify-content-evenly align-items-center">
                <button type="submit" @click.prevent="handleSubmit" class="badge badge-pill mt-2" id="start-btn">START
                    STUDYING</button>

                <!-- Invite friend button -->
                <button type="button" class="btn btn-dark" id="inviteModalToggleBtn" @click="toggleInviteFriendModal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-plus-fill" viewBox="0 0 16 16">
                        <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                        <path fill-rule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5"/>
                    </svg>
                </button>
            </div>


            <!-- Invite friend modal -->
            <div class="modal fade" id="inviteFriendModal" tabindex="-1" role="dialog" aria-labelledby="inviteFriendModalTitle" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="inviteFriendModalTitle">Invite Friend</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="invite-friend-container mt-3">
                                <input type="text" v-model="friendSearch" @input="searchFriends" placeholder="Search friend by username" class="form-control" id="searchFriendInput"/>
                                <ul v-if="friendSuggestions.length > 0" class="list-group mt-2">
                                    <li v-for="friend in friendSuggestions.slice(0,3)" :key="friend" @click="inviteFriend(friend)" class="list-group-item list-group-item-action">
                                        {{ friend }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row col-10 col-sm-8 mt-1 mb-1" id="control-btns-container">
                <button class="btn badge badge-pill col-4 control-btn" id="skip-next-btn" disabled
                    @click.prevent="handleSkip">Skip</button>
                <button class="btn badge badge-pill col-4 control-btn" id="skip-cycle-btn" disabled
                    @click.prevent="handleSkipCycle">Skip cycle</button>
                <button class="btn badge badge-pill col-4 control-btn" id="restart-btn" disabled
                    @click.prevent="handleRestart">Restart cycle</button>
            </div>

            <div id="clock" class="blob">
                <div class="timer" id="timer-display">00:00</div>
            </div>
        </form>
        <div>
            <div id="tomato" class="container-fluid d-flex justify-content-center align-items-start" aria-hidden="true">
                <div>
                    <img src="../assets/vecteezy_bed.png" id="tomato-bed" aria-hidden="true" width="300px">
                    <!--Attribution: <a href="https://it.vecteezy.com/png-gratuito/letto">Letto PNGs di Vecteezy</a>-->
                    <div id="tomato-leg-l"></div>
                    <div id="tomato-leg-r"></div>
                    <div id="tomato-body"></div>
                    <div class="stem" id="tomato-stem"></div>
                    <div id="tomato-eye-l" class="tomato-eye">
                        <div class="tomato-pupil"></div>
                    </div>
                    <div id="tomato-eye-r" class="tomato-eye">
                        <div class="tomato-pupil"></div>
                    </div>
                    <div id="closed-tomato-eye-l" class="closed-tomato-eye">
                    </div>
                    <div id="closed-tomato-eye-r" class="closed-tomato-eye">
                    </div>
                    <div id="tomato-mouth"></div>
                    <div id="tomato-table"></div>
                    <div id="tomato-book"></div>
                    <div id="tomato-book-cover"></div>
                </div>
            </div>
        </div>
    </main>

</template>

<script setup>
import { inject, computed, watch, ref, onUnmounted, onMounted, nextTick } from "vue";
import axios from 'axios';
import { useTimeMachineStore } from '../stores/timeMachine';
const timeMachineStore = useTimeMachineStore();

const api_url = inject('api_url');
const pomodoro_sessions_api_url = inject('pomodoro_sessions_api_url');
const props = defineProps(['sessionId']);

const token = localStorage.getItem('token');

let studyT = ref(30);
let restT = ref(5);
let cyclesTot = ref(5);
let cyclesLeft = ref(5); // Number of cycles left to go through
let state = ref("idle");
let id = ref('');
let dateTime = ref(0);
let availH = ref(0);
let availM = ref(0);
let modalTitle = ref('');
let modalBody = ref('');

const inviteFriendModal = ref(null);

function toggleInviteFriendModal() {
    if (inviteFriendModal.value) {
        inviteFriendModal.value.toggle();
    }
}

let notifModal; // Notification modal shown when starting a cycle, switching between study and rest and at the end of each cycle
let suggestionsStructsArray = []; // Array of objects; each objects represents a suggestion given based on the provided available time
let interval; // Used for the interval-based function to update the timer while studying/resting
let end_time; // End time for the currently active study/rest phase
let loaded_session = false;

let friendSearch = ref('');
let friendSuggestions = ref([]);

let start_pause_time;
let end_pause_time;


//********************************************************************************************************************
//TIME MACHINE
const currentTime = computed(() => timeMachineStore.getCurrentTime.format('YYYY-MM-DD HH:mm:ss'));
watch(currentTime, async() => {
	await nextTick();
});
//********************************************************************************************************************

let currentSession = computed(() => {
    return {
        //user is added by back-end function in index.js
        studyTime: studyT.value,
        restTime: restT.value,
        totCycles: cyclesTot.value,
        completedCycles: cyclesTot.value - cyclesLeft.value,
        state: state.value,
        dateTime: dateTime.value,
        _id: id.value
    };
});


// Used to provide suggestions based on the available time
const defaultCycles = [
    {
        fullDuration: 20,
        studyDuration: 15,
        restDuration: 5
    },
    {
        fullDuration: 30,
        studyDuration: 25,
        restDuration: 5
    },
    {
        fullDuration: 35,
        studyDuration: 30,
        restDuration: 5
    },
    {
        fullDuration: 45,
        studyDuration: 35,
        restDuration: 10
    },
    {
        fullDuration: 50,
        studyDuration: 40,
        restDuration: 10
    },
    {
        fullDuration: 60,
        studyDuration: 45,
        restDuration: 15
    }
];

// Automatically called when the component is mounted; sets up suggestionStructsArray with data from defaultCycles, initializes the form with
// provided values or default ones (30 study + 5 rest, 5 cycles), enables the form
onMounted(async () => {
    window.bootstrap = require('/node_modules/bootstrap/dist/js/bootstrap');

    inviteFriendModal.value = new bootstrap.Modal(document.getElementById('inviteFriendModal'), {});
    const buttons = [...document.querySelectorAll("#suggestions>button")];
    let i = -1;
    for (const btn of buttons) {
        suggestionsStructsArray.push({});
        i++;
        suggestionsStructsArray[i].button = btn;
        suggestionsStructsArray[i].studyDuration = defaultCycles[i].studyDuration;
        suggestionsStructsArray[i].restDuration = defaultCycles[i].restDuration;
        suggestionsStructsArray[i].cyclesNum = 0;
    }

    enable_form_inputs();

    if (props.sessionId) {
        var session = await axios.post(`${pomodoro_sessions_api_url}read`, { _id: props.sessionId });
        if (session && session.data) {
            var sessionData = session.data;
            if (sessionData.totCycles == sessionData.completedCycles) {
                //Attempted to load an already completed session. Falling back on a new default session.
                defaultInit();
            }
            else {
                loaded_session = true;
                disable_form_inputs();

                setDisplayed(sessionData.studyTime, sessionData.restTime, sessionData.totCycles);
                id.value = props.sessionId;
                cyclesLeft.value = sessionData.totCycles - sessionData.completedCycles;
                state.value = sessionData.state;
                dateTime.value = sessionData.dateTime;

                if (state.value == "resting") {
                    setup_tomato_rest();
                    document.getElementById("start-btn").textContent = "START RESTING";
                }
                else {
                    setup_tomato_study();
                }
            }
        }
        else {
            //Invalid session id prop. Falling back on a new default session.
            defaultInit();
        }
    }
    else {
        //Didn't load a pre-existing session.
        defaultInit();
    }
    document.getElementById('timer-display').textContent = "00:00";
    notifModal = new bootstrap.Modal(document.getElementById('notificationModal'), {});
    document.getElementById('notificationModal').addEventListener('shown.bs.modal', pause);
    document.getElementById('notificationModal').addEventListener('hidden.bs.modal', resume);
})

// If the component is unmounted, clears the eventually active interval function
onUnmounted(() => {
    clearInterval(interval);
    if (loaded_session && state.value != "idle") updateSession();
    //else saveSession(); //uncomment to make it save every session on quit (should only be used for debugging purposes)
});

function defaultInit() {
    setDisplayed(30, 5, 5);
    dateTime.value = new Date(currentTime.value).getTime();
}

async function get_latest() {
    var user;
    if (token != null) {
        user = atob(token.split('.')[1]);
    }
    var session = await axios.post(`${pomodoro_sessions_api_url}read/latest`, { user: user });
    if (session.data)
        console.log("latest session by user", user, ": ", session.data);
    else
        console.log("No sessions exist for user", user);
}

function reset_tomato_animation() {
    const el = document.getElementById("tomato-body");
    el.style.animation = 'none';
    el.offsetHeight; /* trigger reflow */
    el.style.animation = null;
}

// Graphically prepares the tomato for studying phases
function setup_tomato_study() {
    document.getElementById("tomato-body").style.backgroundColor = "var(--my-unripe-tomato)";
    document.getElementById("closed-tomato-eye-l").style.display = "none";
    document.getElementById("closed-tomato-eye-r").style.display = "none";
    document.getElementById("tomato-eye-l").style.display = "block";
    document.getElementById("tomato-eye-r").style.display = "block";
    document.getElementById("tomato-table").style.display = "block";
    document.getElementById("tomato-book").style.display = "block";
    document.getElementById("tomato-book-cover").style.display = "block";
    document.getElementById("tomato-bed").style.display = "none";
    document.getElementById("tomato").style.filter = "brightness(100%)";
}

// Graphically prepares the tomato for resting phases
function setup_tomato_rest() {
    document.getElementById("tomato-body").style.backgroundColor = "var(--my-ripe-tomato)"
    document.getElementById("tomato-eye-l").style.display = "none";
    document.getElementById("tomato-eye-r").style.display = "none";
    document.getElementById("closed-tomato-eye-l").style.display = "block";
    document.getElementById("closed-tomato-eye-r").style.display = "block";
    document.getElementById("tomato-table").style.display = "none";
    document.getElementById("tomato-book").style.display = "none";
    document.getElementById("tomato-book-cover").style.display = "none";
    document.getElementById("tomato-bed").style.display = "block";
    document.getElementById("tomato").style.filter = "brightness(60%)";
}

// Sets up to start a study phase
function startStudying() {
    state.value = "studying";
    end_time = Date.now() + studyT.value * 60000;
    reset_tomato_animation();
    setup_tomato_study();

    document.getElementById("tomato-body").style.animation = `become-ripe ${studyT.value * 60}s linear forwards`;
    document.getElementById("start-btn").textContent = "STUDYING...";

    modalTitle.value = "Switch to studying";
    modalBody.value = `Current cycle: ${cyclesTot.value - cyclesLeft.value + 1}/${cyclesTot.value}`;
    notifModal.toggle();
}

// Sets up to start a rest phase
function startResting() {
    state.value = "resting";
    end_time = Date.now() + restT.value * 60000;
    reset_tomato_animation();
    setup_tomato_rest();

    document.getElementById("tomato-body").style.animation = `become-unripe ${restT.value * 60}s linear forwards`;
    document.getElementById("start-btn").textContent = "RESTING...";

    modalTitle.value = "Switch to resting";
    modalBody.value = `Current cycle: ${cyclesTot.value - cyclesLeft.value + 1}/${cyclesTot.value}`;
    notifModal.toggle();
}

// Function that handles the end of the last cycle
function endInterval() {
    clearInterval(interval);
    state.value = "idle";
    if (loaded_session) {
        updateSession();
        loaded_session = false;
    }
    modalTitle.value = `${cyclesTot.value} cycles completed!`;
    modalBody.value = `Well done!`;
    notifModal.toggle();
    document.getElementById("start-btn").textContent = "START STUDYING";
    reset_tomato_animation();
    toggleControlButtons(true);
    enable_form_inputs();
    document.getElementById('timer-display').textContent = "00:00";
}

// Disables all inputs in the form; used to prevent the user from editing the form while a study/rest phase is active
function disable_form_inputs() {
    const input_list = document.querySelectorAll("#times-form input, #avail-time-form input");
    for (const el of input_list) {
        el.disabled = true;
    }
    document.getElementById("searchFriendInput").disabled = false;
}

// Enables all inputs in the form
function enable_form_inputs() {
    const input_list = document.querySelectorAll("#times-form input, #avail-time-form input");
    for (const el of input_list) {
        el.disabled = false;
    }
}

// Called when the notification modal appears to "freeze" everything going on below it
function pause() {
    start_pause_time = Date.now();
    document.getElementById("tomato-body").style.animationPlayState = "paused";
    clearInterval(interval);
}

// Called when the notification modal is dismissed to resume
function resume() {
    end_pause_time = Date.now();
    let time_in_pause = end_pause_time - start_pause_time;
    end_time += time_in_pause;

    document.getElementById("tomato-body").style.animationPlayState = "running";
    if (cyclesLeft.value > 0) interval = setInterval(intervalLoop, 0);
}

// Enables/disables the form's control buttons (submit, skip, skip cycle, restart cycle)
// If the submit button is enabled, the other ones must be disabled, and viceversa
// enableSubmit: if true, submit button should be enabled and the other buttons should be disabled
//               if false, submit button should be disabled and the other buttons should be enabled
function toggleControlButtons(enableSubmit) {
    const submit_btn = document.getElementById("start-btn");
    const skip_next_btn = document.getElementById("skip-next-btn");
    const restart_btn = document.getElementById("restart-btn");
    const skip_cycle_btn = document.getElementById("skip-cycle-btn");
    submit_btn.disabled = !enableSubmit;
    skip_next_btn.disabled = enableSubmit;
    restart_btn.disabled = enableSubmit;
    skip_cycle_btn.disabled = enableSubmit;
}

// Handles the "skip" button press; simply "moves" the end time to now and lets the interval function deal with the consequences
function handleSkip() {
    end_time = Date.now();
}

// Handles the "skip cycle" button press; decreases the number of remaining cycles and either proceeds with the next cycle or ends the
function handleSkipCycle() {
    const submit_btn = document.getElementById("start-btn");

    cyclesLeft.value--;

    if (cyclesLeft.value > 0) { // Proceed with the study phase of the following cycle
        startStudying();
    }
    else { // The skipped cycle was the last one; end interval repetition and re-enable the form
        endInterval();
    }
}

// Handles the "restart cycle" button press; simply reverts to the beginning of the study phase for the current cycle
function handleRestart() {
    startStudying();
}

// Function used to deal with the passage of time during study and rest phases
function intervalLoop() {
    const now = Date.now();
    const difference = end_time - now; // Time left for the current study/rest phase, in milliseconds

    if (difference <= 0) { // Current study/rest phase ended
        if (state.value == "studying") { // The ongoing phase was a study phase, switch to resting
            startResting();
        }
        else if (state.value == "resting") { // The ongoing phase was a rest phase; decrement the number of cycles left and either proceed with the next one or end the interval function
            cyclesLeft.value--;

            if (cyclesLeft.value > 0) {
                startStudying();
            }
            else {
                endInterval();
            }
        }
    }
    else {
        // Minutes and seconds left
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // Display remaining time on #timer-display
        document.getElementById('timer-display').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

// Handles the "start studying" button press (submits the form)
function handleSubmit() {
    const expand_collapse = document.getElementById("expand-collapse");

    toggleControlButtons(false); // Disables submit button, enables skip/skip cycle/restart cycle buttons
    disable_form_inputs(); // Disables the inputs in the form
    if (expand_collapse.classList.contains("expanded")) // If the suggestions box is currently expanded, collapse it
        expandCollapse();

    if (!loaded_session) cyclesLeft.value = cyclesTot.value;

    if (state.value == "resting") startResting();
    else startStudying();

    // Indefinitely run the intervalLoop function, which deals with the passage of time during cycles
    interval = setInterval(intervalLoop, 0);
}

// Computed available time based on the corresponding inputs in the form
let availTime = computed(() => {
    return availH.value * 60 + availM.value;
});

watch(availM, (newAvailM, oldAvailM) => {
    if (newAvailM > 59) {
        const remainder = newAvailM % 60;
        availM.value = remainder;
        availH.value += 1;
    }

    else if (newAvailM < 0) availM.value = 59;
})

// Whenever available time changes, update the calculated suggestions and eventually expand/collapse the suggestions box
watch(availTime, (newAvailTime, oldAvailTime) => {
    for (let i = 0; i < suggestionsStructsArray.length; i++) {
        const suggestionStruct = suggestionsStructsArray[i];
        const numOfCycles = calcNumOfCycles(newAvailTime, suggestionStruct.studyDuration + suggestionStruct.restDuration);
        suggestionStruct.button.innerHTML = `${numOfCycles}&times;(${suggestionStruct.studyDuration}+${suggestionStruct.restDuration})`;
        suggestionStruct.cyclesNum = numOfCycles;
    }

    const el = document.getElementById("expand-collapse");

    // Expand suggestions box if previously there were no suggestions and now there's at least one
    // Collapse suggestions box if previously there were suggestions and now not anymore
    if ((el.classList.contains("collapsed") && boxShouldBeDisplayed()) ||
        (el.classList.contains("expanded") && !boxShouldBeDisplayed())) {
        expandCollapse();
    }
});

// Calculates how many cycles of minsPerCycle minutes fit in totMin minutes
function calcNumOfCycles(totMin, minsPerCycle) {
    return Math.floor(totMin / minsPerCycle);
}

// Sets the values for the study time, rest time and cycles number inputs in the form
function setDisplayed(studyTime, restTime, cyclesNum) {
    studyT.value = studyTime;
    restT.value = restTime;
    cyclesTot.value = cyclesNum;
}

function boxShouldBeDisplayed() {
    return suggestionsStructsArray.some((elem) => elem.cyclesNum > 0);
}

// True if suggestion button with the provided index should be displayed (more than 0 cycles), false otherwise
function buttonShouldBeDisplayed(index) {
    if (!suggestionsStructsArray[index] || suggestionsStructsArray[index].cyclesNum == 0)
        return false;
    return true;
}

// Expand/collapse the suggestions box
function expandCollapse() {
    const el = document.getElementById("expand-collapse")
    el.classList.toggle('expanded')
    el.classList.toggle('collapsed')
}

async function saveSession() {
    var sessionObj = {
        user: atob(token.split('.')[1]),
        ...currentSession.value
    }
    let res = await axios.post(`${pomodoro_sessions_api_url}create`, sessionObj);
}

async function updateSession() {
    let res = await axios.post(`${pomodoro_sessions_api_url}update`, currentSession.value);
}

async function searchFriends() {
    if (friendSearch.value.length >= 2) {
        try {
            const response = await axios.get(`${api_url}user/friends/searchByPrefix?prefix=${friendSearch.value}&currentUser=${atob(token.split('.')[1])}`);
            friendSuggestions.value = response.data;
            await nextTick();
        } catch (error) {
            console.error(error);
        }
    } else {
        friendSuggestions.value = [];
    }
}

async function inviteFriend(username) {
    const user = atob(token.split('.')[1]);
    const data = { 
        studyTime: studyT.value, 
        restTime: restT.value, 
        totCycles: cyclesTot.value
    };
    
    await axios.post(`${api_url}user/sendMessage`, { toUser: username, fromUser: user, message: "pomodoro", data: data });
    alert(`Invitation sent to ${username}`);
    friendSearch.value = '';
    friendSuggestions.value = [];
}

</script>

<style scoped>
@import '../assets/styles/pomodoroVariables.css';
@import '../assets/styles/pomodoroKeyframes.css';

body {
    background-color: var(--my-white);
    color: var(--my-black);
    width: 100vw;
    height: 100vh;
}

main {
    width: 100%;
    height: 100%;
}

main *:not(.modal) {
    transition: all 0.3s;
}

#times-form {
    font-family: "Nunito", serif;
    width: 100%;
    height: 50vh;
}

#times-form .row {
    margin-bottom: 1rem;
}

#avail-time-form {
    font-family: "Nunito", serif;
    width: 100%;
}

.row>.badge {
    vertical-align: middle;
}

#suggestions-box {
    background-color: #60d394;
    padding: 0.5em;
}

#suggestions-box>label {
    color: white;
    font-family: "Nunito", serif;
}

.suggestion-btn {
    font-size: 0.75em;
    font-family: "Source Code Pro", sans-serif;
}

#expand-container {
    overflow: hidden;
}

#expand-collapse {
    margin-top: -100%;
    transition: all 0.3s;
}

#expand-collapse.expanded {
    margin-top: 0;
}

@media(width < 768px) {
    #avail-time-form {
        margin-bottom: 2rem;
    }

    /* If #avail-time-form is followed by the expanded suggestions box, remove bottom margin from the form and give it to the suggestions box */
    #avail-time-form:has(+ #expand-container > .expanded) {
        margin-bottom: 0;
    }

    #expand-collapse.expanded {
        margin-bottom: 2rem;
    }

}

.input-subtext {
    font-size: 60%;
}

#times-form button {
    padding: 0.5em 2em;
    border: 0;
}

#start-btn {
    background-color: var(--my-tomato);
    color: var(--my-black);
}

#start-btn:hover {
    background-color: var(--my-yellow-dark);
    color: var(--my-white);
}

#start-btn:active {
    background-color: var(--my-green);
}

#start-btn:disabled {
    background-color: gray;
    color: white;
}

.control-btn {
    background-color: #aaf683;
    color: black;
}

.control-btn:disabled {
    background-color: gray;
    color: white;
}

.control-btn:hover {
    background-color: #60d394;
}

#timer-display {
    font-family: "Monoton", "Nunito", sans-serif;
    font-size: 3rem;
    color: var(--my-black);
}

label {
    letter-spacing: 0.2em;
    font-weight: 700;
    color: var(--my-green);
}


.invite-friend-container {
    width: 100%;
    max-width: 400px;
    text-align: center;
}

.invite-friend-container .form-control {
    margin-bottom: 10px;
}

.invite-friend-container .list-group-item {
    cursor: pointer;
}

#inviteModalToggleBtn{
    font-size: 0.5rem;
}

#tomato {
    position: relative;
    width: 100%;
    height: 200px;
    top: 0px;
    pointer-events: none;
}

#tomato * {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
}

#tomato>div {
    width: 150px;
    height: 150px;
    position: relative;
}

#tomato-body {
    width: 80%;
    height: 40%;
    background-color: var(--my-unripe-tomato);
    border-radius: 40%;
    animation-fill-mode: forwards;
}

#tomato-stem {
    position: absolute;
    background-color: var(--my-green);
    clip-path: polygon(0 100%, 20% 33%, 40% 33%, 40% 0, 60% 0, 60% 33%, 80% 33%, 100% 100%, 60% 66%, 50% 100%, 40% 66%);
    width: 20%;
    height: 10%;
    top: 37px;
}

#tomato-leg-l {
    clip-path: polygon(45% 0, 55% 0, 55% 100%, 0 100%, 0 90%, 45% 90%);
    background-color: var(--my-black);

    width: 20%;
    height: 10%;
    bottom: 40px;
    left: 30px;
}

#tomato-leg-r {
    clip-path: polygon(45% 0, 55% 0, 55% 90%, 100% 90%, 100% 100%, 45% 100%);
    background-color: var(--my-black);

    width: 20%;
    height: 10%;
    bottom: 40px;
    right: 30px;
}

#tomato-table {
    background-color: brown;
    clip-path: polygon(0 70%, 100% 70%, 100% 75%, 90% 75%, 90% 100%, 85% 100%, 85% 75%, 15% 75%, 15% 100%, 10% 100%, 10% 75%, 0 75%);
    width: 100%;
    height: 70%;
    bottom: 22px;
}

.tomato-eye {
    background-color: white;
    aspect-ratio: 1;
    border-radius: 50%;
    height: 10%;
    width: 10%;
}

#tomato-eye-l {
    left: 50px;
    top: 65px;
}

#tomato-eye-r {
    right: 50px;
    top: 65px;
}

.closed-tomato-eye {
    background-color: black;
    clip-path: polygon(0 45%, 100% 45%, 100% 50%, 0 50%);
    aspect-ratio: 1;
    height: 20%;
    width: 10%;
}

#closed-tomato-eye-l {
    left: 50px;
    top: 65px;
    display: none;
}

#closed-tomato-eye-r {
    right: 50px;
    top: 65px;
    display: none;
}

#tomato-mouth {
    clip-path: polygon(0 45%, 100% 45%, 100% 50%, 0 50%);
    background-color: var(--my-black);
    width: 80px;
    height: 20px;
    left: 22.5%;
    bottom: 55px;
}

.tomato-pupil {
    background-color: var(--my-black);
    aspect-ratio: 1;
    border-radius: 50%;
    height: 50%;
    width: 50%;
    left: 3px;
    bottom: 0;
}

#tomato-bed {
    display: block;
    max-width: 300px;
    max-height: 250px;
    width: auto;
    height: auto;
    top: -25px;
    display: none;
}

#tomato-book {
    clip-path: polygon(0 80%, 25% 75%, 50% 80%, 75% 75%, 100% 80%, 100% 100%, 0 100%);
    background-color: white;
    width: 40%;
    height: 20%;
    left: 45px;
    bottom: 53px;
}

#tomato-book-cover {
    clip-path: polygon(0 100%, 0 90%, 40% 90%, 50% 85%, 60% 90%, 100% 90%, 100% 100%);
    background-color: blue;
    width: 40%;
    height: 20%;
    left: 45px;
    bottom: 53px;
}

/****** Animated background credit: https://codepen.io/BjornRombaut/pen/mOLGgX **********/

@keyframes cube {
    from {
        transform: scale(0) rotate(0deg) translate(-50%, -50%);
        opacity: 1;
    }

    to {
        transform: scale(20) rotate(960deg) translate(-50%, -50%);
        opacity: 0;
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
    background: #ffe1cd;
    overflow: hidden;
    z-index: -100;
}

.background li {
    position: absolute;
    top: 80vh;
    left: 45vw;
    width: 10px;
    height: 10px;
    border: solid 1px #e5cab8;
    color: transparent;
    transform-origin: top left;
    transform: scale(0) rotate(0deg) translate(-50%, -50%);
    animation: cube 22s ease-in forwards infinite;
}

undefined .background li:nth-child(0) {
    animation-delay: 0s;
    left: 86vw;
    top: 79vh;
    border-color: #fff7e1;
}

.background li:nth-child(1) {
    animation-delay: 2s;
    left: 26vw;
    top: 19vh;
    border-color: #fff7e1;
}

.background li:nth-child(2) {
    animation-delay: 4s;
    left: 71vw;
    top: 33vh;
    border-color: #fff7e1;
}

.background li:nth-child(3) {
    animation-delay: 6s;
    left: 7vw;
    top: 4vh;
}

.background li:nth-child(4) {
    animation-delay: 8s;
    left: 36vw;
    top: 51vh;
    border-color: #fff7e1;
}

.background li:nth-child(5) {
    animation-delay: 10s;
    left: 57vw;
    top: 90vh;
}


/******************************************************************/
</style>