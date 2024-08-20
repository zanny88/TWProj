<template>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Major+Mono+Display&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap"
            rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Monoton&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet">

        <main>
            <form id="times-form" class="d-flex flex-column align-items-center justify-content-evenly">
                <div class="col-10 col-md-8">
                    <div class="form-group row">
                        <label for="avail-time" class="col-sm-5 col-form-label text-md-end">(OPTIONAL) AVAILABLE TIME</label>
                        <span id="avail-time" class="row col-6">
                            <div class="col-6">
                                <input type="number" class="form-control" id="avail-h" v-model="availH" min="0"><span>
                                    hours</span>
                            </div>
                            <div class="col-6">
                                <input type="number" class="form-control" id="avail-min" v-model="availM" min="0" max="60"><span>
                                    minutes</span>
                            </div>
                        </span>
                    </div>
                    <div id="suggestions-box" class="mt-1 mb-1 d-flex flex-column align-items-center ">
                        <label for="suggestions" class="text-align-center">SUGGESTIONS</label>
                        <div id="suggestions">
                            <button type="button" class="col btn btn-light text-black ms-2 mb-2 suggestion-btn">2&times;(15+5)</button>
                            <button type="button" class="col btn btn-light text-black ms-2 mb-2 suggestion-btn">2&times;(15+5)</button>
                            <button type="button" class="col btn btn-light text-black ms-2 mb-2 suggestion-btn">2&times;(15+5)</button>
                            <button type="button" class="col btn btn-light text-black ms-2 mb-2 suggestion-btn">2&times;(15+5)</button>
                            <button type="button" class="col btn btn-light text-black ms-2 mb-2 suggestion-btn">2&times;(15+5)</button>
                            <button type="button" class="col btn btn-light text-black ms-2 mb-2 suggestion-btn">2&times;(15+5)</button>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="study-time" class="col-sm-5 col-form-label text-md-end">STUDY</label>
                        <div class="col-sm-6">
                            <input type="number" class="form-control" id="study-time" required min="1" value="30"><span>
                                minutes</span>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="rest-time" class="col-sm-5 col-form-label text-md-end">REST</label>
                        <div class="col-sm-6">
                            <input type="number" class="form-control" id="rest-time" required min="1" value="5"><span>
                                minutes</span>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="cycles-num" class="col-sm-5 col-form-label text-md-end">CYCLES</label>
                        <div class="col-sm-6">
                            <input type="number" class="form-control" id="cycles-num" required min="1" value="5">
                        </div>
                    </div>
                </div>
                <button type="submit" @click.prevent="handleSubmit" class="badge badge-pill mt-2" id="start-btn">START STUDYING</button>
                <!--
                <button type="button" class="badge badge-pill" id="reset-btn">RESET</button>
                -->
                <div id="clock" class="blob">
                    <div class="timer" id="timer-display">00:00</div>
                </div>
            </form>
            <div>
            <div id="tomato" class="container-fluid d-flex justify-content-center align-items-start" aria-hidden="true">
                <div>
                    <img src="../assets/vecteezy_bed.png"
                        id="tomato-bed" aria-hidden="true" width="300px">
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
import {inject, computed, watch, ref, onUnmounted, onMounted} from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const api_url = "http://localhost:3000/";
const router = useRouter();

let availH = ref(0);
let availM = ref(0);

var loggedIn = inject("loggedIn");//variabile globale ref creata in main.js per controllare se l'utente è loggato o meno
    
let studying = false;
let resting = false;
let interval;

function get_ready_to_rest() {
    document.getElementById("tomato-eye-l").style.display = "none";
    document.getElementById("tomato-eye-r").style.display = "none";
    document.getElementById("closed-tomato-eye-l").style.display = "block";
    document.getElementById("closed-tomato-eye-r").style.display = "block";
    document.getElementById("tomato-table").style.display = "none";
    document.getElementById("tomato-book").style.display = "none";
    document.getElementById("tomato-book-cover").style.display = "none";
    document.getElementById("tomato-bed").style.display = "block";
}

function get_ready_to_study() {
    document.getElementById("closed-tomato-eye-l").style.display = "none";
    document.getElementById("closed-tomato-eye-r").style.display = "none";
    document.getElementById("tomato-eye-l").style.display = "block";
    document.getElementById("tomato-eye-r").style.display = "block";
    document.getElementById("tomato-table").style.display = "block";
    document.getElementById("tomato-book").style.display = "block";
    document.getElementById("tomato-book-cover").style.display = "block";
    document.getElementById("tomato-bed").style.display = "none";
}

function handleSubmit(){
    const submit_btn = document.getElementById("start-btn");
    submit_btn.textContent = "STUDYING...";
    submit_btn.disabled = true;
    studying = true;

    // Convert the inserted study time into an integer, base 10
    const study_time_min = parseInt(document.getElementById('study-time').value, 10);

    // Convert the inserted rest time into an integer, base 10
    const rest_time_min = parseInt(document.getElementById('rest-time').value, 10);

    //Convert the inserted number of cycles into an integer, base 10
    let cycles_num = parseInt(document.getElementById("cycles-num").value, 10);

    //Calculate durations in seconds; used for animations
    const study_time_sec = study_time_min * 60;
    const rest_time_sec = rest_time_min * 60;

    get_ready_to_study();
    document.getElementById("tomato-body").style.animation = `become-ripe ${study_time_sec}s linear forwards`;

    let end_time = Date.now() + study_time_min * 60000;

    // Interval to deal with the passage of time
    interval = setInterval(function () {
        const now = Date.now();
        const difference = end_time - now;

        if (difference <= 0) {
            if (studying) {
                studying = false;
                resting = true;
                end_time = Date.now() + rest_time_min * 60000;
                document.getElementById("tomato-body").style.animation = `become-unripe ${rest_time_sec}s linear forwards`;
                get_ready_to_rest();
                document.getElementById("tomato").style.filter = "brightness(60%)";
                submit_btn.textContent = "RESTING...";
            }
            else if (resting) {
                resting = false;
                cycles_num--;
                if (cycles_num > 0) {
                    studying = true;
                    end_time = Date.now() + study_time_min * 60000;
                    document.getElementById("tomato").style.filter = "brightness(100%)";
                    get_ready_to_study();
                    document.getElementById("tomato-body").style.animation = `become-ripe ${study_time_sec}s linear forwards`;
                    submit_btn.textContent = "STUDYING...";
                }
                else {
                    clearInterval(interval);
                    submit_btn.textContent = "START STUDYING";
                    document.getElementById("tomato").style.filter = "brightness(100%)";
                    submit_btn.disabled = false;
                    document.getElementById('timer-display').textContent = "00:00";
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
    }, 1000);
}

/*
onMounted(() => {
    document.getElementById("tomato-eye-l").style.display = "none";
    document.getElementById("tomato-eye-r").style.display = "none";
    document.getElementById("closed-tomato-eye-l").style.display = "none";
    document.getElementById("closed-tomato-eye-r").style.display = "none";
    document.getElementById("tomato-table").style.display = "none";
    document.getElementById("tomato-book").style.display = "none";
    document.getElementById("tomato-book-cover").style.display = "none";
    document.getElementById("tomato-bed").style.display = "none";
});
*/

onUnmounted(() => {
    clearInterval(interval);
});

let availTime = computed(() => {
    return availH.value*60 + availM.value;
});

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

watch(availTime, (newAvailTime, oldAvailTime) => {
    for (const defCycle of defaultCycles){
        //console.log(`Cycles of ${defCycle.fullDuration} mins: ${calcNumOfCycles(newAvailTime, defCycle.fullDuration)}`);
    }
});

function calcNumOfCycles(totMin, minsPerCycle){
    return Math.floor(totMin / minsPerCycle);
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

#times-form {
    font-family: "Nunito", serif;
    width: 100%;
    height: 50vh;
}

#times-form .col-form-label {
    margin-right: 1em;
}

.row > .badge {
    vertical-align: middle;
}

#suggestions-box{
    background-color: #60d394;
    padding: 0.5em;
    border-radius: 0.5em;
}

#suggestions-box > label {
    color: white;
}

.suggestion-btn{
    font-size: 0.75em;
    font-family: "Source Code Pro", sans-serif;
}

.form-control + span {
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
    color: black;
}

#reset-btn {
    background-color: var(--my-black);
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

#tomato {
    position: relative;
    width: 100%;
    height: 200px;
    top: 50px;
}

@media(width >=576px) {
    #tomato {
        top: 0px;
    }
}

@media(width < 576px){
    main{
        margin-top: 100px;
    }
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
</style>