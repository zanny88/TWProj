<template>
    <div class="container" style="text-align: center; margin-top: 10px;">
        <h5>Add Friend Form</h5>
        <form id="addFriendForm">
            <div class="row" style="position: relative; justify-content: center; align-items: center;">
                <div class="col-lg-4 col-md-4 col-sm-12">
                    <input type="text" v-model="friendName" id="friend_name" name="friend" class="form-control" placeholder="Friend username"/>
                </div>
            </div>
            <div class="row" style="position: relative; justify-content: center; align-items: center;">
                <div class="col-lg-4 col-md-4 col-sm-4" style="position: relative; text-align: center;">
                    <button type="button" class="btn btn-outline-info" style="margin-top: 10px;" id="publishB" @click.prevent="addFriend()">Add friend</button>
                </div>
            </div>
        </form>
    </div>
</template>

<script setup>
import {ref,inject} from "vue";
import axios from "axios";
import {useRouter} from "vue-router";

var friendName = ref('');
const router = useRouter();
const api_url = "http://localhost:3000/";
//const api_url = inject('api_url');
const user = atob(localStorage.getItem('token').split('.')[1]);

async function addFriend(){
    console.log("richiesta api per aggiunta amico");
    try{
        var res = await axios.get(`${api_url}user/addFriend?user=${friendName.value}&ID=${user}`);
    }catch(error){
        console.log("Errore con l'aggiunta di un amico");
        console.log(error);
    }

    router.push({path: "/"});
}
</script>
