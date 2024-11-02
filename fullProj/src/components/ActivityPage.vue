<template>
    <div class="container" style="text-align: center; margin-top: 10px;">
        <h5 id="title">Activity form</h5>
		<div class="row" style="position: relative; justify-content: center; align-items: center; margin-top: 10px;">
			<div class="col-lg-2 col-md-2 col-sm-4">
				<button type="button" class="btn btn-outline-info" id="deleteButton" @click="remove()">Delete</button>
			</div>
		</div>
        <form id="mainForm">
            <div class="row" style="position: relative; justify-content: center; align-items: center;">
                <div class="col-lg-4 col-md-4 col-sm-12">
                    <div class="form-floating">
                        <input type="text" v-model="title" id="title" name="title" class="form-control"/>
                        <label for="title">Title:</label>
                    </div>
                </div>
            </div>
            <div class="row" style="position: relative; justify-content: center; align-items: center;">
                <div class="col-lg-4 col-md-4 col-sm-12">
                    <div class="form-floating">
                        <!--<input type="text" v-model="end" id="endDate" name="endDate" class="form-control"/>-->
                        <!--<label for="endDate">End date:</label><div>{{ end }}</div>-->
						<VueDatePicker v-model="end" id="endDate" locale="it" :preview-format="format" :format="format" :enable-time-picker="false" v-if="isLoaded" placeholder="Select End Date" name="Event date" />
                    </div>
                </div>
            </div>
            <div class="row" style="position: relative; justify-content: center; align-items: center;">
                <div class="col-lg-4 col-md-4 col-sm-12">
                    <div class="form-floating">
                        <input type="text" v-model="participants" id="participants" name="participants" class="form-control"/>
                        <label for="participants">Participants:</label>
                    </div>
                </div>
            </div>
            <div class="row" style="position: relative; justify-content: center; align-items: center; margin-top: 10px;">
                <div class="col-lg-2 col-md-2 col-sm-4">
                    <button type="button" class="btn btn-outline-info" id="submitButton" @click="submit()">{{ formType }}</button>
                </div>
                <div class="col-lg-2 col-md-2 col-sm-4">
                    <button type="button" class="btn btn-outline-info" id="cancelButton" @click="cancel()">Cancel</button>
                </div>
            </div>
        </form>
    </div>
</template>


<script setup>
    import { onMounted, computed, ref, nextTick, inject } from "vue";
    import axios from 'axios';
    import {useRouter} from "vue-router";
    import VueDatePicker from '@vuepic/vue-datepicker';
    import '@vuepic/vue-datepicker/dist/main.css';
  
    const api_url = inject('api_url');
    const router = useRouter();
	const props = defineProps(['id','callback']);

	const dayjs = require('dayjs')
	dayjs().format()
	var customParseFormat = require("dayjs/plugin/customParseFormat");
	dayjs.extend(customParseFormat)

	var formType = ref('');
	var title = ref('');
    var end = ref(null);
	var participants = ref([]);
    var is_completed = ref(false);
	var isLoaded = ref(false);

	const user = atob(localStorage.getItem('token').split('.')[1]);
	
	const format = (date) => {
		const day = date.getDate();
		const month = date.getMonth() + 1;
		const year = date.getFullYear();
		return `End date: ${day}/${month}/${year}`;
	}
/*
	var owner: String,
	participants: [String],
	participants_state: [Number],          /* 0 per ha rifiutato, 1 per non ha ancora accettato e 2 per ha accettato */
  /*  title: String,
    end: Date,
	creation_date: Date,
    has_deadline: Boolean,
    is_completed: Boolean
*/



	var Activities = ref([]);
    const isActivityLoaded = computed(() => Activities.value.length > 0);
    async function getActivity(activityId){
		try{
			const res = await axios.get(api_url + "getActivities/" + user + "/" + activityId);
			Activities.value = res.data;
			await nextTick();
			if (isActivityLoaded){
				var activity = Activities.value[0];
				title.value = activity.title;
				if (activity.end != null){
					var activityEnd = dayjs(activity.end).toDate();
					end.value = new Date(activityEnd.getFullYear(), activityEnd.getMonth(), activityEnd.getDate());   //toglie le ore dalla data
				}
				participants.value = activity.participants;
			}
		}catch(error){
			console.log("Error adding activity: ",error);
			//alert("error="+error);
		}
    }



	async function submit(){
		if (props.id == "-1"){  //Aggiunta di un'attività
			try{
				const newActivity = {
					userName: user,
					title: title.value,
					end: (end.value == null ? null : new Date(end.value.getFullYear(), end.value.getMonth(), end.value.getDate())),   //toglie le ore dalla data
					participants: participants.value,
					is_completed: is_completed.value
				}
				const r = await axios.post(api_url + "addActivity", newActivity);
				if(r.data.message == "OK"){
					callback();
				}else{
					console.log(r.data.message);
					//alert("Message= " + r.data.message);
				}
			}catch(error){
				console.log("Errore: ", error);
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
					is_completed: is_completed.value
				}
				const r = await axios.post(api_url + "editActivity", activity);
				if(r.data.message == "OK"){
					callback();
				}else{
					console.log(r.data.message);
					//alert("Message= " + r.data.message);
				}
			}catch(error){
				console.log("Errore: ", error);
				//alert("Errore: "+error);
			}
		}
    }
	
	function cancel(){
		callback();
	}

	async function remove(){
		if(confirm("Do you really want to delete the activity?")){
			try{
				const activity_ = {
					userName: user,
					activityId : props.id
				}
				const r = await axios.post(api_url + "deleteActivity", activity_);
				if(r.data.message == "OK"){
					callback();
				}else{
					console.log(r.data.message);
					//alert("Message= " + r.data.message);
				}
			}catch(error){
				console.log("Errore: ", error);
				alert("Error: "+error);
			}
		}
	}
	
	function callback(){
		if (props.callback === "Hp"){
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

    onMounted(async () => {
		if (props.id == "-1"){
			formType.value = 'Create';
		}else{
			formType.value = 'Save';
			await getActivity(props.id);
		}
		isLoaded.value = true;
    });
</script>