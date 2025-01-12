<template>
    <div class="container mt-5">
        <h2>Activity form</h2>
        <div class="mb-3">
            <label for="title" class="form-label">Title</label>
            <input type="text" id="title" class="form-control" v-model="title" placeholder="Enter activity title"  :class="{'is-invalid': titleError}" :disabled="isReadOnly" />
            <div v-if="titleError" class="invalid-feedback">
                Title is mandatory!
            </div>
        </div>
        
        <div class="mb-3">
            <label for="endDate" class="form-check-label">
                End date
                <VueDatePicker v-model="end" id="endDate" locale="it" :preview-format="format" :format="format" :enable-time-picker="false" v-if="isLoaded" placeholder="Select End Date" name="Activity end date" :disabled="isReadOnly" />
            </label>
        </div>
        
        <!--
        <div class="mb-3">
            <label for="participants">Participants:</label>
            <input type="text" v-model="participants" id="participants" name="participants" class="form-control" placeholder="Enter participants"/>
        </div>
        -->
        
        <div class="mb-3 row">
            <label for="isCompleted" class="col-form-label col-sm-2">Completed</label>
            <div class="col-sm-10 d-flex align-items-center form-switch">
                <input type="checkbox" id="isCompleted" class="form-check-input form-switch" v-model="is_completed" :disabled="isReadOnly" />
            </div>
        </div>

        <div class="mt-4 d-flex justify-content-between align-items-center gap-2">
            <div class="d-flex gap-2">
                <button type="button" class="btn btn-outline-primary" @click="submit">{{ formType }}</button>
                <button type="button" class="btn btn-outline-secondary" @click="cancel">Cancel</button>
            </div>
            <button v-if="formType === 'Save'" type="button" :class="isModifying ? 'btn btn-primary' : 'btn btn-outline-primary'" @click="toggleModify">Modify</button>
            <!--<button type="button" class="btn btn-outline-danger" @click="remove" v-if="props.id!=-1">Remove</button>-->
            <button type="button" class="btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#confirmDeleteModal" v-if="props.id != -1">Remove</button>
        </div>
    </div>

    <!-- FINESTRA MODALE DI CONFERMA RIMOZIONE -->
    <div class="modal fade" id="confirmDeleteModal" tabindex="-1" aria-labelledby="confirmDeleteModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="confirmDeleteModalLabel">Confirm Deletion</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div class="modal-body">
                    Are you sure you want to delete this activity?
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
import { onMounted, ref, nextTick, inject, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import dayjs from 'dayjs';
//dayjs().format()
//import customParseFormat from 'dayjs/plugin/customParseFormat';
//dayjs.extend(customParseFormat)

const api_url = inject('api_url');
const router = useRouter();
const props = defineProps(['id','callback']);
const titleError = ref(false);


const formType = ref('');
const title = ref('');
const end = ref(null);
const participants = ref([]);
const is_completed = ref(false);
const isLoaded = ref(false);

//variabili per la gestione dei partecipanti
const addParticipants = ref(false);         // Switch per mostrare/nascondere la lista partecipanti
const selectedParticipants = ref([]);       // Elenco di partecipanti selezionati
const participants_waiting = ref([]);       // Partecipanti in attesa di risposta
const participants_accepted = ref([]);      // Partecipanti che hanno accettato
const participants_refused = ref([]);       // Partecipanti che hanno rifiutato



const user = atob(localStorage.getItem('token').split('.')[1]);
const isModifying = ref(false);
const isReadOnly = computed(() => {
    if (formType.value === 'Create') return false;
    return !isModifying.value;
});

function toggleModify() {
    isModifying.value = !isModifying.value;
}

const format = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `End date: ${day}/${month}/${year}`;
}



async function getActivity(activityId){
    try{
        const res = await axios.get(api_url + "getActivities/" + user + "/" + activityId);
        const Activities = res.data;
        await nextTick();
        if (Activities.length > 0){
            const activity = Activities[0];
            title.value = activity.title;
            if (activity.end != null){
                const activityEnd = dayjs(activity.end).toDate();
                end.value = new Date(activityEnd.getFullYear(), activityEnd.getMonth(), activityEnd.getDate());   //toglie le ore dalla data
            }
            addParticipants.value = activity.addParticipants;
            selectedParticipants.value = activity.selectedParticipants;
            participants_waiting.value = activity.participants_waiting;
            participants_accepted.value = activity.participants_accepted;
            participants_refused = activity.participants_refused;
        }
    }catch(error){
        console.error("Error adding activity: ",error);
        //alert("error="+error);
    }
}



async function submit(){
    if (title.value.trim() === ''){
        titleError.value = true;
        return;
    } else{
        titleError.value = false;
    }
    if (props.id == "-1"){  //Aggiunta di un'attività
        try{
            const newActivity = {
                userName: user,
                title: title.value,
                end: (end.value == null ? null : new Date(end.value.getFullYear(), end.value.getMonth(), end.value.getDate())),   //toglie le ore dalla data
                participants: participants.value,
                is_completed: is_completed.value,
                addParticipants : addParticipants.value,
                selectedParticipants : selectedParticipants.value,
                participants_waiting : participants_waiting.value,
                participants_accepted : participants_accepted.value,
                participants_refused : participants_refused.value
            };
            //alert("bb, api_url="+api_url+", newActivity="+JSON.stringify(newActivity));
            const r = await axios.post(api_url + 'addActivity', newActivity);
            if(r.data.message == "OK"){
                callbackToCalendar();
            }else{
                console.log(r.data.message);
                //alert("Message= " + r.data.message);
            }
        }catch(error){
            console.error("Errore: ", error);
            alert("Errore: "+error);
        }
    }else{  //Modifica di un'attività
        try{
            const activity = {
                userName: user,
                activityId: props.id,
                title: title.value,
                end: (end.value == null ? null : new Date(end.value.getFullYear(), end.value.getMonth(), end.value.getDate())),
                participants: participants.value,
                is_completed: is_completed.value,
                addParticipants : addParticipants.value,
                selectedParticipants : selectedParticipants.value,
                participants_waiting : participants_waiting.value,
                participants_accepted : participants_accepted.value,
                participants_refused : participants_refused.value
            };
            const r = await axios.post(api_url + 'editActivity', activity);
            if(r.data.message == "OK"){
                callbackToCalendar();
            }else{
                console.log(r.data.message);
                //alert("Message= " + r.data.message);
            }
        }catch(error){
            console.error("Errore: ", error);
            //alert("Errore: "+error);
        }
    }
}

function cancel(){
    callbackToCalendar();
}

async function remove(){
    try{
        const activity_ = {
            userName: user,
            activityId : props.id
        };
        const r = await axios.post(api_url + 'deleteActivity', activity_);
        if(r.data.message == "OK"){
            callbackToCalendar();
        }else{
            console.log(r.data.message);
            //alert("Message= " + r.data.message);
        }
    }catch(error){
        console.error("Errore: ", error);
        alert("Error: "+error);
    }
}

function callbackToCalendar(){
    if (props.callback === "Hp"){
        router.push({path: "/"});
    }else{
        const date = props.callback.substring(2);
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
        isModifying.value = true;
    }else{
        formType.value = 'Save';
        isModifying.value = false;
        await getActivity(props.id);
    }
    isLoaded.value = true;
});
</script>

<style scoped>
    .container {
        max-width: 800px;
    }
</style>
