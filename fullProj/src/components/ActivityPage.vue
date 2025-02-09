<template>
    <div class="container mt-5">
        <h2>Activity form</h2>
        <div class="mb-3">
            <label for="title" class="form-label">Title</label>
            <input type="text" id="title" class="form-control" v-model="activity.title" placeholder="Enter activity title"  :class="{'is-invalid': titleError}" :disabled="isReadOnly" />
            <div v-if="titleError" class="invalid-feedback">
                Title is mandatory!
            </div>
        </div>
        
        <div class="mb-3">
            <label for="description" class="form-label">Description</label>
            <textarea type="text" id="description" class="form-control" v-model="activity.description" placeholder="Enter a description (optional)" :disabled="isReadOnly" />
        </div>

        <div class="mb-3">
            <label for="endDate" class="form-check-label">
                End date
                <VueDatePicker v-model="activity.end" id="endDate" locale="it" :preview-format="format" :format="format" :enable-time-picker="false" v-if="isLoaded"
                 placeholder="Select End Date (optional)" name="Activity end date" :disabled="isReadOnly" :class="{'is-invalid': endDateError}" />
                 <div v-if="endDateError" class="invalid-feedback">
                    End date not valid: date in the past!
                </div>
            </label>
        </div>
        
        <div class="mb-3 row">
            <label for="isCompleted" class="col-form-label col-sm-2">Completed</label>
            <div class="col-sm-10 d-flex align-items-center form-switch">
                <input type="checkbox" id="isCompleted" class="form-check-input form-switch" v-model="activity.is_completed" :disabled="isReadOnly" />
            </div>
        </div>
        
        
        
        <div v-if="Friends.length > 0 && (formType === 'Create' || User === activity.owner)" class="mb-3 form-switch">
            <input type="checkbox" id="addParticipants" class="form-check-input" v-model="activity.addParticipants" :disabled="isReadOnly" />
            <label for="addParticipants" class="form-check-label switch-label-margin">Add participants</label>
        </div>
        <div v-if="activity.addParticipants && (formType === 'Create' || User === activity.owner)">
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
                        <input type="checkbox" class="form-check-input" v-model="activity.selectedParticipants" :value="friend.username" :disabled="isReadOnly" />
                    </td>
                    <td>{{ friend.username }}</td>
                    <td>{{ friend.name }}</td>
                    <td>
                        <BIconHourglassSplit v-if="activity.participants_waiting.includes(friend.username)" class="text-secondary" title="Waiting" />
                        <BIconCheckCircle v-else-if="activity.participants_accepted.includes(friend.username)" class="text-success" title="Accepted" />
                        <BIconXCircle v-else-if="activity.participants_refused.includes(friend.username)" class="text-danger" title="Refused" />
                    </td>
                </tr>
            </tbody>
            </table>
        </div>

      
        
        <div v-if="formType === 'Save' && User !== activity.owner">
            --- This activity is editable only by the owner ---
        </div>

        <div class="mt-4 d-flex justify-content-between align-items-center gap-2">
            <div class="d-flex gap-2">
                <button v-if="formType === 'Create' || User === activity.owner" type="button" class="btn btn-outline-primary" @click="submit">{{ formType }}</button>
                <button type="button" class="btn btn-outline-secondary" @click="cancel">Cancel</button>
            </div>
            <button v-if="formType === 'Save' && User === activity.owner" type="button" :class="isModifying ? 'btn btn-primary' : 'btn btn-outline-primary'" @click="toggleModify">Modify</button>
            <!--<button type="button" class="btn btn-outline-danger" @click="remove" v-if="props.id!=-1">Remove</button>-->
            <button type="button" class="btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#confirmDeleteModal" v-if="formType === 'Save' && User === activity.owner">Remove</button>
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
import { onMounted, ref, nextTick, inject, computed, reactive } from 'vue';
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
const endDateError = ref(false);
const Friends = ref([]);


const formType = ref('');

const activity = reactive({
    owner: '',
    title: '',
    description: '',
    end: null,
    is_completed: false,
    addParticipants: false,
    selectedParticipants: [],
    participants_waiting: [],
    participants_accepted: [],
    participants_refused: [],
});



const user = atob(localStorage.getItem('token').split('.')[1]);
const User = ref(user);
const isLoaded = ref(false);
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
    return `${day}/${month}/${year}`;
}


function validateEndDate() {
    if (props.id != '-1') {
        endDateError.value = false;
    } else {
        const today = new Date();
        const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (!activity.end || activity.end >= todayMidnight) {
            endDateError.value = false;
        } else {
            endDateError.value = true;
        }
    }
}


async function getActivity(activityId){
    try{
        //const res = await axios.get(api_url + "getActivities/" + user + "/" + activityId);
        const res = await axios.get(api_url + "getActivities/-1/" + activityId);
        const Activities = res.data;
        await nextTick();
        if (Activities.length > 0){
            const act = Activities[0];
            activity.owner = act.owner;
            activity.title = act.title;
            activity.description = act.description;
            if (act.end != null){
                const activityEnd = dayjs(act.end).toDate();
                activity.end = new Date(activityEnd.getFullYear(), activityEnd.getMonth(), activityEnd.getDate());   //toglie le ore dalla data
            }
            activity.addParticipants = act.addParticipants;
            activity.selectedParticipants = act.selectedParticipants;
            activity.participants_waiting = act.participants_waiting;
            activity.participants_accepted = act.participants_accepted;
            activity.participants_refused = act.participants_refused;
        }
    }catch(error){
        console.error("Error fetching activity: ",error);
        //alert("error="+error);
    }
}



async function submit(){
    if (activity.title.trim() === ''){
        titleError.value = true;
        return;
    } else{
        titleError.value = false;
    }
    validateEndDate();
    if (endDateError.value) {
        return;
    }
    if (props.id == '-1'){  //Aggiunta di un'attività
        try{
            const newActivity = {
                owner: user,
                title: activity.title,
                description: activity.description,
                end: (activity.end == null ? null : new Date(activity.end.getFullYear(), activity.end.getMonth(), activity.end.getDate())),   //toglie le ore dalla data
                is_completed: activity.is_completed,
                addParticipants : activity.addParticipants,
                selectedParticipants : activity.selectedParticipants,
                participants_waiting : activity.participants_waiting,
                participants_accepted : activity.participants_accepted,
                participants_refused : activity.participants_refused
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
            alert("Error: "+error);
        }
    }else{  //Modifica di un'attività
        try{
            const act = {
                owner: user,
                activityId: props.id,
                title: activity.title,
                description: activity.description,
                end: (activity.end == null ? null : new Date(activity.end.getFullYear(), activity.end.getMonth(), activity.end.getDate())),
                is_completed: activity.is_completed,
                addParticipants : activity.addParticipants,
                selectedParticipants : activity.selectedParticipants,
                participants_waiting : activity.participants_waiting,
                participants_accepted : activity.participants_accepted,
                participants_refused : activity.participants_refused
            };
            const r = await axios.post(api_url + 'editActivity', act);
            if(r.data.message == "OK"){
                callbackToCalendar();
            }else{
                console.log(r.data.message);
                //alert("Message= " + r.data.message);
            }
        }catch(error){
            console.error("Errore: ", error);
            //alert("Error: "+error);
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
    if (props.id == '-1'){
        formType.value = 'Create';
        isModifying.value = true;
    }else{
        formType.value = 'Save';
        isModifying.value = false;
        await getActivity(props.id);
    }
    await readFriends();
    isLoaded.value = true;
});
</script>

<style scoped>
    .container {
        max-width: 800px;
    }
</style>
