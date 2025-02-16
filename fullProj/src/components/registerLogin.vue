<template>
    <div class="container" style="text-align: center; margin-top: 10px;">
        <h5 id="title"> {{ formType }} form</h5>
        <form id="mainForm">
            <div class="row" style="position: relative; justify-content: center; align-items: center;" v-if="formType == 'Register'">
                <div class="col-lg-2 col-md-2 col-sm-4">
                    <div class="form-floating">
                        <input type="text" v-model="firstName" id="firstName" name="firstName" class="form-control" required/>
                        <label for="firstName">First name: </label>
                    </div>
                </div>
                <div class="col-lg-2 col-md-2 col-sm-4">
                    <div class="form-floating">
                        <input type="text" v-model="lastName" id="lastName" name="lastName" class="form-control" required/>
                        <label for="lastName">Last name: </label>
                    </div>
                </div>
            </div>
            <div class="row" style="position: relative; justify-content: center; align-items: center;">
                <div class="col-lg-4 col-md-4 col-sm-12">
                    <div class="form-floating">
                        <input type="text" v-model="name" id="username" name="username" class="form-control" @input="hideDiv()" required/>
                        <label for="username">Username: </label>
                    </div>
                </div>
            </div>
            <div v-show="showDismissibleAlert" style="background: red; color: black;">
                Username already taken!
            </div>
            <div v-show="showDismissibleAlertUsername" style="background: red; color: black;">
                Username not found!
            </div>
            <div class="row" style="position: relative; justify-content: center; align-items: center;">
                <div class="col-lg-4 col-md-4 col-sm-12">
                    <div class="form-floating" style="position: relative;">
                        <input :type="passwordType" v-model="passwd" id="passwd" name="passwd" class="form-control" @input="hideDiv()" required/>
                        <label for="passwd">Password:</label>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" :class="['bi','eye-icon',eye_class]" viewBox="0 0 16 16" @click="passwVisib()" v-html="eye_icon"></svg>
                    </div>
                </div>
            </div>
            <div v-show="showDismissibleAlertPassword" style="background: red; color: black;">
                Wrong password!
            </div>
            <div class="row" style="position: relative; justify-content: center; align-items: center;" v-if="formType == 'Register'">
                <div class="col-lg-4 col-md-4 col-sm-12" >
                    <div class="form-floating">
                        <input type="email" v-model="mail" id="mail" name="mail" class="form-control" required/>
                        <label for="mail">Mail: </label>
                    </div>
                </div>
            </div>
            <div class="row" style="position: relative; justify-content: center; align-items: center; margin-top: 10px;">
                <div class="col-lg-2 col-md-2 col-sm-4">
                    <button type="button" class="btn btn-outline-info" id="mainButton" @click="submit()">{{ formType }}</button>
                </div>
            </div>
        </form>
        <div class="row" style="position: relative; justify-content: center; align-items: center;">
            <div class="col-lg-4 col-md-4 col-sm-12">
                <p id='bottomText'>
                    <b>
                        {{ outlines[formType][0] }}
                        <a href='#' @click.prevent='changeForm()'>
                            {{ outlines[formType][1] }}
                        </a>
                    </b>
                </p>
            </div>
        </div>
    </div>
</template>
<script setup>
    import {ref,inject} from "vue";
    import axios from "axios";
    import {useRouter} from "vue-router";

    const router = useRouter();
    const api_url = inject('api_url');
    var loggedIn = inject('loggedIn');
    var token = inject('IDtoken');

    var name = ref('');
    var passwd = ref('');
    var firstName = ref('');
    var lastName = ref('');
    var mail = ref('');
    var showDismissibleAlert = ref(false);
    var showDismissibleAlertPassword = ref(false);
    var showDismissibleAlertUsername = ref(false);

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

    //ho utilizzato una srtinga invece di un indice perchè riutilizzerò il valore di formType per la richiesta al server 
    var formType = ref("Login");
    var outlines = {
        "Login":["You don't have an account?","Register"],
        "Register":["You already have an account?","Login"]
    };

    function changeForm(){
        name.value = '';
        passwd.value = '';
        formType.value = formType.value === "Login" ? "Register" : "Login";
    }

    async function submit(){
        try{
            const newUser = {
                username: name.value,
                password: passwd.value,
                name: {first: firstName.value,last: lastName.value},
                email: mail.value
            }
            const r = await axios.post(api_url + "user/" + formType.value, newUser);
            

            if(r.data.message == "already user"){
                showDismissibleAlert.value = true;
            }else if(formType.value == "Login"){
                localStorage.setItem('token',r.data.token);
                token.value = r.data.token;
                loggedIn.value = true;
                router.push({path: "/"});
            }else if(formType.value == "Register"){
                changeForm();
            }
        }catch(error){
            name.value = "";
            passwd.value = "";
            if (error.response) {
                if(error.response.data == "Password incorrect"){
                    showDismissibleAlertPassword.value = true;
                }
                if(error.response.data == "No user with that name"){
                    showDismissibleAlertUsername.value = true;
                }
            }
            console.log("Errore: ", error);
        }

    }
    function hideDiv(){
        showDismissibleAlert.value = false;
        showDismissibleAlertPassword.value = false;
        showDismissibleAlertUsername.value = false;
    }
</script>

<style scoped>
    .eye-icon{
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
    }
</style>