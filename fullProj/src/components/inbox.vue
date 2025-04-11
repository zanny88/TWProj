<template>
    <div class="inbox-container">
        <h1 class="inbox-title">Inbox <span v-if="msgs.length <= 0" class="empty-inbox">- empty</span></h1>
        <div v-if="!selectedMsg">
            <div class="message-list" v-if="msgs.length > 0">
                <div class="message-card" v-for="(msg, index) in msgs" :key="index" @click="selectedMsg = msg">
                    <span class="message-text">New message from {{ msg.from }}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="message-icon bi bi-envelope-fill" viewBox="0 0 16 16">
                        <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z"/>
                    </svg>
                </div>
            </div>
        </div>
        <div v-else>
            <div class="card">
                <div class="card-header">
                    Message from {{ selectedMsg.from }}
                </div>
                <div class="card-body">
                    <p class="card-text" v-if="selectedMsg.type == 'amicizia'">Friend request</p>
                    <p class="card-text" v-if="selectedMsg.type == 'condivisione'">Note sharing request</p>
                    <p class="card-text" v-if="selectedMsg.type == 'pomodoro'">
                        Join me for a Pomodoro session! Study Time: {{ selectedMsg.data.studyTime }} mins, Rest Time: {{ selectedMsg.data.restTime }} mins, Total Cycles: {{ selectedMsg.data.totCycles }}
                    </p>
                    <p class="card-text" v-if="selectedMsg.type != 'amicizia' && selectedMsg.type != 'condivisione' && selectedMsg.type != 'pomodoro'">
                        {{ selectedMsg.type }}
                    </p>
                    <div class="action-buttons">
                        <button class="btn btn-primary" @click="selectedMsg = null">Back</button>
                        <div>
                            <svg class="action-icon accept-icon bi bi-check-lg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" @click="accept_msg(selectedMsg)">
                                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>
                            </svg>
                            <svg class="action-icon delete-icon bi bi-trash-fill" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" @click="delete_msg(selectedMsg)">
                                <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
                            </svg>
                        </div>
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
/* General container styling */
.inbox-container {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
}

.inbox-title {
    font-family: 'Poppins', sans-serif;
    font-size: 2rem;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20px;
}

.empty-inbox {
    font-size: 1rem;
    color: #6c757d;
}

/* Message list styling */
.message-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.message-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    border: 1px solid #dee2e6;
    border-radius: 5px;
    background-color: #f8f9fa;
    transition: background-color 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
}

.message-card:hover {
    background-color: #e9ecef;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.message-text {
    font-size: 1rem;
    color: #495057;
}

.message-icon {
    color: #00916e;
}

/* Card styling */
.card {
    margin-top: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-header {
    background-color: #00916e;
    color: white;
    padding: 15px;
    border-radius: 10px 10px 0 0;
    font-size: 1.25rem;
}

.card-body {
    padding: 20px;
}

/* Action buttons */
.action-buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
}

.action-icon {
    cursor: pointer;
    margin-left: 10px;
    transition: transform 0.2s ease;
}

.action-icon:hover {
    transform: scale(1.2);
}

.accept-icon {
    color: #28a745;
}

.delete-icon {
    color: #dc3545;
}
</style>