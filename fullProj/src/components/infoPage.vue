<template>
    <Modal v-if="changeData">
        <div class="modal-header">
            <h5 class="modal-title">Edit User Data</h5>
            <button type="button" class="btn-close" @click="changeData = false"></button>
        </div>
        <div class="modal-body">
            <div class="row">
                <div class="col-lg-6 col-md-6 col-sm-12">
                    <div class="form-floating mb-3">
                        <input type="text" id="firstName" name="firstName" class="form-control" v-model="userInfo[0]" required />
                        <label for="firstName">First Name</label>
                    </div>
                </div>
                <div class="col-lg-6 col-md-6 col-sm-12">
                    <div class="form-floating mb-3">
                        <input type="text" id="lastName" name="lastName" class="form-control" v-model="userInfo[1]" required />
                        <label for="lastName">Last Name</label>
                    </div>
                </div>
            </div>
            <div class="form-floating mb-3">
                <input type="text" id="username" name="username" class="form-control" v-model="userInfo[2]" @input="showDismissibleAlert = false" required disabled />
                <label for="username">Username</label>
                <div v-show="showDismissibleAlert" class="alert alert-danger mt-2">
                    Username already in use!
                </div>
            </div>
            <div class="form-floating mb-3 position-relative">
                <input :type="passwordType" id="passwd" name="passwd" class="form-control" v-model="userInfo[3]" required />
                <label for="passwd">Password</label>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" :class="['bi', 'eye-icon', eye_class]" viewBox="0 0 16 16" @click="passwVisib()" v-html="eye_icon"></svg>
            </div>
            <div class="form-floating mb-3">
                <input type="email" id="mail" name="mail" class="form-control" v-model="userInfo[4]" required />
                <label for="mail">Email</label>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="changeData = false">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveUserData()">Save</button>
        </div>
    </Modal>

    <div class="card">
        <div class="card-header">
            <h5 class="user-data-title">User Data</h5>
        </div>
        <div class="card-body d-flex flex-wrap">
            <div class="user-info">
                <p v-for="(val, index) in ['Name', 'Surname', 'Username', 'Password', 'Mail']" :key="index">
                    <strong>{{ val }}:</strong> {{ userInfo[index] }}
                </p>
                <button class="btn btn-primary mt-3" @click="changeData = true;">Edit Data</button>
            </div>
            <div class="friends-list">
                <h6>Friends</h6>
                <span v-if="userFriends.length <= 0">None</span>
                <ul v-else>
                    <li v-for="(friend, index) in userFriends" :key="index">{{ friend }}</li>
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
        var r = await axios.post(`${api_url}user/updateData`,newUserData);
        const newToken = r.data.token;
        localStorage.setItem('token',newToken);
        showDismissibleAlert.value = false;
        changeData.value = false;
        router.go(0);
    }catch(error){
        console.log("Errore: ",error);
    }

    /*
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
        */
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
/* Modal styling */
.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 10px;
}

.modal-title {
    font-size: 1.25rem;
    font-weight: bold;
}

.modal-body {
    padding: 20px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding-top: 10px;
    border-top: 1px solid #dee2e6;
}

.user-data-title {
    font-family: 'Poppins', sans-serif;
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 20px;
    text-align: center;
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
}

.card-body {
    display: flex;
    flex-wrap: wrap;
    padding: 20px;
}

.user-info {
    flex: 1;
    padding-right: 20px;
}

.friends-list {
    flex: 1;
    border-left: 1px solid #dee2e6;
    padding-left: 20px;
}

/* Form styling */
.form-floating {
    margin-bottom: 15px;
}

.eye-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
}

/* Button styling */
.btn-primary {
    background-color: #00916e;
    border: none;
    transition: background-color 0.3s ease;
}

.btn-primary:hover {
    background-color: #00785c;
}

.btn-secondary {
    background-color: #6c757d;
    border: none;
    transition: background-color 0.3s ease;
}

.btn-secondary:hover {
    background-color: #5a6268;
}

/* Alert styling */
.alert {
    font-size: 0.9rem;
    padding: 10px;
    border-radius: 5px;
}
</style>