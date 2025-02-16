<template>
    <h1>Inbox <span v-if="msgs.length <= 0">- empty</span></h1>
    <div v-if="!selectedMsg">
        <div class="container" style="justify-content: center; align-items: center;" v-if="msgs.length > 0">
            <div class="col-lg-6 col-md-6 col-sm-6">
                <div class="row" v-for="(msg,index) in msgs" @click="selectedMsg = msg">
                    <span class="col-6" style="flex-grow: 1">Nuovo messaggio da {{ msg.from }}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="col-1 bi bi-envelope-fill" viewBox="0 0 16 16">
                        <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z"/>
                    </svg>
                </div>
            </div>
        </div>
    </div>
    <div v-else>
        <div class="card">
            <div class="card-header">
                    Messaggio da {{ selectedMsg.from }}
            </div>
            <div class="card-body">
                <p class="card-text" v-if="selectedMsg.type == 'amicizia'">Friend request</p>
                <p class="card-text" v-if="selectedMsg.type == 'condivisione'">Note sharing request</p>
                <p class="card-text" v-if="selectedMsg.type == 'pomodoro'">Join me for a Pomodoro session! Study Time: {{ selectedMsg.data.studyTime }} mins, Rest Time: {{ selectedMsg.data.restTime }} mins, Total Cycles: {{ selectedMsg.data.totCycles }}</p>
                <p class="card-text" v-if="selectedMsg.type != 'amicizia' && selectedMsg.type != 'condivisione' && selectedMsg.type != 'pomodoro'">{{ selectedMsg.type }}</p>
                <div style="display: flex; justify-content: space-between;">
                    <button class="btn btn-primary" @click="selectedMsg = null">Torna indietro</button>
                    <div>
                        <svg style="margin-right: 10px;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16" @click="accept_msg(selectedMsg)">
                            <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16" @click="delete_msg(selectedMsg)">
                            <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, nextTick, inject} from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
const api_url = inject('api_url');
const router = useRouter();
var token = localStorage.getItem('token');
var user = atob(token.split('.')[1]);
var msgs = ref([]);
var selectedMsg = ref(null);

async function getMsg(){
    try{
        var r = await axios.get(`${api_url}user/getMessages?user=${user}`);
        msgs.value = r.data;
        await nextTick();

        r = await axios.post(`${api_url}user/checkMessages`,{messages: msgs.value,u: user});
    }catch(error){
        console.log("Errore nella gestione dei messaggi: ",error);
    }
}

async function accept_msg(msg){
    try{
        var r = await axios.post(`${api_url}user/messages/${msg._id}/accept`,{u: user});
        if(msg.type == 'pomodoro'){
            router.push({path: `/pomodoro/${r.data.newSessionId}`});
        } else {
            router.push({path: '/'});
        }
    }catch(error){
        console.log("Error while accepting message [in vue component]: ",error);
    }
}

async function delete_msg(msg){
    try{
        var r = await axios.post(`${api_url}user/messages/${msg._id}/delete`,{u: user});
        router.push({path: '/'});
    }catch(error){
        console.log("Error while deleting message [in vue component]: ",error);
    }
}

onMounted(async () => {
    await getMsg();
})

</script>

<style scoped>
.bi:hover{
    cursor: pointer;
}
span:hover{
    cursor: pointer;
}
</style>