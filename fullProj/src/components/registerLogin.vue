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
                Username già in uso!
            </div>
            <div v-show="showDismissibleAlertUsername" style="background: red; color: black;">
                Nome utente inesistente!
            </div>
            <div class="row" style="position: relative; justify-content: center; align-items: center;">
                <div class="col-lg-4 col-md-4 col-sm-12">
                    <div class="form-floating">
                        <input type="password" v-model="passwd" id="passwd" name="passwd" class="form-control" @input="hideDiv()" required/>
                        <label for="passwd">Password:</label>
                    </div>
                </div>
            </div>
            <div v-show="showDismissibleAlertPassword" style="background: red; color: black;">
                Password errata!
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

    //ho utilizzato una srtinga invece di un indice perchè riutilizzerò il valore di formType per la richiesta al server 
    var formType = ref("Login");
    var outlines = {
        "Login":["Non hai un account?","Registrati"],
        "Register":["Hai già un account?","Fai il login"]
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
            if(error.response.data == "Password incorrect"){
                showDismissibleAlertPassword.value = true;
            }
            if(error.response.data == "No user with that name"){
                showDismissibleAlertUsername.value = true;
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