<template>
    <Modal v-if="changeData">
        <div class="row" style="position: relative; justify-content: center; align-items: center;">
            <div class="col-lg-4 col-md-4 col-sm-8">
                <div class="form-floating">
                    <input type="text" id="firstName" name="firstName" class="form-control" v-model="userInfo[0]" required/>
                    <label for="firstName">First name: </label>
                </div>
            </div>
            <div class="col-lg-4 col-md-4 col-sm-8">
                <div class="form-floating">
                    <input type="text" id="lastName" name="lastName" class="form-control" v-model="userInfo[1]" required/>
                    <label for="lastName">Last name: </label>
                </div>
            </div>
        </div>
        <div class="row" style="position: relative; justify-content: center; align-items: center;">
            <div class="col-lg-8 col-md-8 col-sm-12">
                <div class="form-floating">
                    <input type="text" id="username" name="username" class="form-control" v-model="userInfo[2]" required/>
                    <label for="username">Username: </label>
                </div>
            </div>
        </div>
        <div class="row" style="position: relative; justify-content: center; align-items: center;">
            <div class="col-lg-8 col-md-8 col-sm-12">
                <div class="form-floating">
                    <input type="password" id="passwd" name="passwd" class="form-control" v-model="userInfo[3]" required/>
                    <label for="passwd">Password:</label>
                </div>
            </div>
        </div>
        <div class="row" style="position: relative; justify-content: center; align-items: center;">
            <div class="col-lg-8 col-md-8 col-sm-12" >
                <div class="form-floating">
                    <input type="email" id="mail" name="mail" class="form-control" v-model="userInfo[4]" required/>
                    <label for="mail">Mail: </label>
                </div>
            </div>
        </div>
        <button class="btn btn-primary" @click="saveUserData()">Save</button>
    </Modal>
    <div class="card">
        <div class="card-header">
            Dati utente
        </div>
        <div class="card-body">
            <p class="card-text" v-for="(val,index) in ['Nome','Cognome','Username','Password','Mail']">
                {{ val }}: {{ userInfo[index] }}
            </p>
            <button class="btn btn-primary" @click="changeData = true;">Modifica dati</button>
        </div>
    </div>
</template>

<script setup>
import axios from "axios";
import { inject, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Modal from './Modal.vue';

const api_url = inject('api_url');
const user = atob(localStorage.getItem('token').split('.')[1]);
const router = useRouter();
var userInfo = ref([]);
var changeData = ref(false);

async function saveUserData(){
    changeData.value = false;
    const newUserData = {
        name: userInfo.value[0].concat(" ",userInfo.value[1]),
        oldUsername: user,
        username: userInfo.value[2],
        passw: userInfo.value[3],
        mail: userInfo.value[4]
    }

    try{
        var r = await axios.post(`${api_url}checkUsername`,{username: userInfo.value[2]});

        if(r.data.message == "OK"){
            r = await axios.post(`${api_url}user/updateData`,newUserData);
            const newToken = r.data.token;
            localStorage.setItem('token',newToken);
            router.go(0);
        }
    }catch(error){
        console.log("Errore: ",error);
    }
}

async function getUserInfo(){
    try{
        const r = await axios.get(`${api_url}user/info/${user}`);
        const utente = r.data;

        userInfo.value.push(utente.name.split(' ')[0]);
        userInfo.value.push(utente.name.split(' ')[1]);
        userInfo.value.push(utente.username);
        userInfo.value.push(utente.passw_chiara);
        userInfo.value.push(utente.mail);
        console.log(userInfo.value);
    }catch(error){
        console.log("Errore: ",error);
    }
}

onMounted(() => {
    getUserInfo();
})
</script>