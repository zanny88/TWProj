<template>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">

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

                        <div class="row h-75">
                            <div class="col container preview-img-container d-none d-sm-block"><img src="../assets/slothCalendar1.png" class="img-fluid preview-img"/></div>
                            <div class="col d-flex flex-column preview-info">
                                <div>Calendar preview</div>
                                <div id="calendar-preview-info">(Eventi di oggi)</div>
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

                        <div class="hstack h-50">
                            <div class="col d-flex flex-column preview-info">
                                <div>Latest:</div>
                                <div id="pomodoro-preview-info">
                                    <router-link 
                                        v-if="latestPomodoroSession != ''"
                                        id="resume-pomodoro-link"
                                        :to="`/pomodoro/${latestPomodoroSession}`">
                                            RESUME
                                    </router-link>
                                </div>
                            </div>
                            <div class="col-1 vr ms-3 me-3" style="color: #B8BDB5;"></div>
                            <div class="col"><router-link :to="'/pomodoro'"><button class="btn badge-pill btn-light fw-bold p-2" id="new-session-btn">NEW SESSION</button></router-link></div>
                            <div class="col container preview-img-container d-none d-sm-block"><img src="../assets/slothTomato.png" class="img-fluid preview-img"/></div>
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

                        <div class="row h-75">
                            <div class="col container preview-img-container d-none d-sm-block"><img src="../assets/slothStudying.png" class="img-fluid preview-img"/></div>
                            <div class="col d-flex flex-column preview-info align-items-center">
                                <div style="margin-bottom: 0.5rem">Latest note:</div>

                                <div class="card" style="width: 14rem;" v-if="latestNoteId != ''" id="latest-note-card">
                                    <div class="card-body">
                                      <h5 class="card-title">
                                        <router-link 
                                            
                                            id="latest-note-link"
                                            :to="`/note/${latestNoteId}`">{{latestNoteHeading}}
                                        </router-link>
                                        </h5>
                                        <hr>
                                      <p class="card-text" v-if="latestNoteContent != ''">{{latestNoteContent}}</p>
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

.container-fluid{
    height: 80vh;
}
*:not(.background){
    transition: all 1s;
}
.preview{
    width: 80%;
    height: 24vh;
    border-radius: 2em;
    text-align: center;
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.648);
}

#calendar-preview{
    background-color: #885A5A;
    color: white;
}

#pomodoro-preview{
    background-color: #353A47;
    color: white;
}

#notes-preview{
    background-color: #DC136C;
    color: white;
}

/*
#calendar-preview{
    background-color: #60d394;
    color: white;
}

#pomodoro-preview{
    background-color: #723D46;
    color: white;
}

#notes-preview{
    background-color: #d90368;
    color: white;
}
*/

.preview-title{
    font-family: Poppins, sans-serif;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-decoration: none;
    color: white;

    &:hover{
        letter-spacing: 0.5em;
        text-shadow: 1px 1px 1px black;
    }
}

#resume-pomodoro-link, #new-session-btn{
    background-color: white;
    font-size: 0.8em;
    padding: 0.2rem;
    border-radius: 5px;
    color: black;
    mix-blend-mode: screen;
    text-decoration: none;

    &:hover{
        background-color: var(--my-tomato);
        color: white;
        transition: 200ms all;
    }
}

#pomodoro-preview-info{
    font-size: 0.8em;
}

#latest-note-link{
    color: black;
    text-decoration: none;
    text-transform: uppercase;

    &:hover{
        transform: scale(1.2, 1.2);
        transition: 500ms all;
        text-decoration: underline;
    }
}

#latest-note-card{
    hr{
        margin: 1px;
    }

    .card-body{
        padding: 8px;
    }

    .card-title{
        margin-bottom: 0;
        font-size: 1rem;
    }

    .card-text{
        font-size: 0.75rem;
        opacity: 0.4;
    }
}

.vr{
    width: 1px;
    height: 95%;
}

.preview-img{
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

.floating1{
    animation-name: floating1;
}

.floating2{
    animation-name: floating2;
}

.floating3{
    animation-name: floating3;
}

@keyframes floating1 {
    0% { transform: translate(0,  0px); }
    25%  { transform: translate(0, 3px); }
    75%   { transform: translate(0, -3px); }    
    100%   { transform: translate(0, 0px); }    
}
@keyframes floating2 {
    0% { transform: translate(0,  3px); }
    50%  { transform: translate(0, -3px); }
    75%   { transform: translate(0, 0px); }    
    100%   { transform: translate(0, 3px); }    
}
@keyframes floating3 {
    0% { transform: translate(0,  -3px); }
    50%  { transform: translate(0, 3px); }
    75%   { transform: translate(0, 0px); }    
    100%   { transform: translate(0, -3px); }    
}

/*****************Animated background credit: https://codepen.io/mohaiman/pen/MQqMyo*************************/

@keyframes animate {
    0%{
        transform: translateY(0) rotate(0deg);
        opacity: 1;
        border-radius: 0;
    }
    100%{
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
import {inject, ref, onMounted} from "vue";

import axios from 'axios';

const api_url = inject('api_url');
const pomodoro_sessions_api_url = inject('pomodoro_sessions_api_url');
const notes_api_url = inject('notes_api_url');
const token = localStorage.getItem('token');

let latestPomodoroSession = ref('');
let latestNoteId =  ref('');
let latestNoteHeading =  ref('');
let latestNoteContent = ref('');

async function get_latest_pomodoro_stats(){
    const target = document.getElementById("pomodoro-preview-info");

    // const user = (await axios.post(`${api_url}getUser`)).data.name;
    var user;

    if(token != null){
        user = atob(token.split('.')[1]);
    }

    var session = await axios.post(`${pomodoro_sessions_api_url}read/latest`, {user: user});
    if(session.data){
        const data = session.data;
        latestPomodoroSession.value = data._id;
        target.insertAdjacentHTML('afterbegin', `<div>Study: ${data.studyTime} min.</div>
                            <div>Rest: ${data.restTime} min.</div>
                            <div>Cycles: ${data.completedCycles}/${data.totCycles}</div>`);
    }
    else
        target.innerText = "No session exists.";
}

async function get_latest_note_heading(){

    // const user = (await axios.post(`${api_url}getUser`)).data.name;
    var user;

    if(token != null){
        user = atob(token.split('.')[1]);
    }

    var note = await axios.post(`${notes_api_url}latest`, {user: user});

    if(note.data){
        const data = note.data;
        latestNoteId.value = data._id;
        latestNoteHeading.value = data.heading.substring(0, 20) + (data.heading.length > 20 ? '...' : '');
        if(data.content){
            let tmpContent = data.content.substring(0, 20) + (data.content.length > 20 ? '...' : '');
            latestNoteContent.value = tmpContent;
        }
    }
}

onMounted(() => {
    get_latest_pomodoro_stats();
    get_latest_note_heading();
});

</script>