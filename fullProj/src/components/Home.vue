<template>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">

    <div class="container-fluid">
        
            <div class="row mb-5 justify-content-center">
                <div class="col col-xl-8">
                    <div class="preview container-fluid">
                        <div class="row">
                            <router-link class="preview-title col" to="/calendar">CALENDAR</router-link>
                        </div>

                        <div class="row">
                            <div class="col container preview-img-container d-none d-sm-block"><img src="../assets/slothCalendar1.png" class="img-fluid preview-img"/></div>
                            <div class="col d-flex flex-column">
                                <div>Calendar preview</div>
                                <div id="calendar-preview-info"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mb-5 justify-content-center">
                <div class="col col-xl-8">
                    <div class="preview container-fluid">
                        <div class="row">
                            <router-link class="preview-title col" to="/pomodoro">POMODORO</router-link>
                        </div>

                        <div class="row">
                            <div class="col container preview-img-container d-none d-sm-block"><img src="../assets/slothTomato.png" class="img-fluid preview-img"/></div>
                            <div class="col d-flex flex-column">
                                <div>Last Pomodoro session:</div>
                                <div id="pomodoro-preview-info"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mb-5 justify-content-center">
                <div class="col col-xl-8">
                    <div class="preview container-fluid">
                        <div class="row">
                            <router-link class="preview-title col" to="/showNote">NOTES</router-link>
                        </div>

                        <div class="row">
                            <div class="col container preview-img-container d-none d-sm-block"><img src="../assets/slothStudying.png" class="img-fluid preview-img"/></div>
                            <div class="col d-flex flex-column">
                                <div>Notes preview</div>
                                <div id="notes-preview-info"></div>
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
.container-fluid{
    height: 80vh;
}

.preview{
    width: 80%;
    height: 20vh;
    border-radius: 2em;
    background-color: #60d394;
    color: white;
    text-align: center;
}

.preview-title{
    font-family: Poppins, sans-serif;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-decoration: none;
    color: white;
    transition: all 1s;

    &:hover{
        color: #330f0a;
        letter-spacing: 0.9em;
        text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.127);
    }
}

.preview-img{
    max-height: 93px;
    object-fit: cover;
}
</style>

<script setup>
import {inject, computed, watch, ref, onUnmounted, onMounted} from "vue";
import axios from 'axios';

const api_url = inject('api_url');
const pomodoro_sessions_api_url = inject('pomodoro_sessions_api_url');

async function get_latest_pomodoro_stats(){
    const target = document.getElementById("pomodoro-preview-info");

    const user = (await axios.post(`${api_url}getUser`)).data.name;
    var session = await axios.post(`${pomodoro_sessions_api_url}read/latest`, {user: user});
    if(session.data){
        const data = session.data;
        target.innerText = `Study duration: ${data.studyTime} minutes\nRest duration: ${data.restTime} minutes\nCompleted cycles: ${data.completedCycles}/${data.totCycles}`;
    }
    else
        target.innerText = "No session exists.";
}

onMounted(() => {
    get_latest_pomodoro_stats();
});

</script>