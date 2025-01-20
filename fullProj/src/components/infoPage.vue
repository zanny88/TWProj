<template>
    <Modal v-if="changeData">
        <div style="position: relative; display: flex; justify-content: flex-end;">
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-x" id="del_friend" viewBox="0 0 16 16" @click="changeData = false">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
            </svg>
        </div>
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
                    <input type="text" id="username" name="username" class="form-control" v-model="userInfo[2]" @input="showDismissibleAlert = false" required/>
                    <label for="username">Username: </label>
                </div>
            </div>
        </div>
        <div v-show="showDismissibleAlert" style="background: red; color: black;">
            Username già in uso!
        </div>
        <div class="row" style="position: relative; justify-content: center; align-items: center;">
            <div class="col-lg-8 col-md-8 col-sm-12">
                <div class="form-floating" style="position: relative;">
                    <input :type="passwordType" id="passwd" name="passwd" class="form-control" v-model="userInfo[3]" required/>
                    <label for="passwd">Password:</label>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" :class="['bi','eye-icon',eye_class]" viewBox="0 0 16 16" @click="passwVisib()" v-html="eye_icon"></svg>
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
        <div class="card-body" style="display: flex; flex-wrap: wrap;">
            <div style="flex: 1;">
                <p class="card-text" v-for="(val,index) in ['Nome','Cognome','Username','Password','Mail']">
                    {{ val }}: {{ userInfo[index] }}
                </p>
                <button class="btn btn-primary" @click="changeData = true;">Modifica dati</button>
            </div>
            <div style="flex: 1; border-left: 1px solid lightgray; padding: 10px;">
                Amici <span v-if="userFriends.length <= 0"> - None</span>:
                <ul>
                    <li v-for="(friend,index) in userFriends">{{ friend }}</li>
                </ul>
            </div>
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
var userFriends = ref([]);
var changeData = ref(false);
var showDismissibleAlert = ref(false);

var passwordType = ref('password');
var eye_class = ref('bi-eye-slash-fill');
var eye_icon = ref(`
    <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z"/>
    <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/>
`);

function passwVisib(){
    if(passwordType.value == 'password'){
        passwordType.value = 'text';
        eye_icon.value = `
            <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
            <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
        `;
        eye_class.value = 'bi-eye-fill';
    }else{
        passwordType.value = 'password';
        eye_icon.value = `
            <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z"/>
            <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/>
        `;
        eye_class.value = 'bi-eye-slash-fill';
    }
    
}

async function saveUserData(){
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
            showDismissibleAlert.value = false;
            changeData.value = false;
            router.go(0);
        }else{
            userInfo.value[2] = "";
            showDismissibleAlert.value = true;
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

        userFriends.value = utente.friends;
        console.log(userInfo.value);
    }catch(error){
        console.log("Errore: ",error);
    }
}

onMounted(() => {
    getUserInfo();
})
</script>

<style scoped>
    .bi-x:hover{
        color: red;
    }
    .eye-icon{
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
    }
</style>