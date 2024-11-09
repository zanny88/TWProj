<template>
    <div class="container" style="text-align: center; margin-top: 10px;">
        <h5 id="title"> {{ formType }} form</h5>
        <form id="mainForm">
            <div class="row" style="position: relative; justify-content: center; align-items: center;">
                <div class="col-lg-4 col-md-4 col-sm-12">
                    <div class="form-floating">
                        <input type="text" v-model="name" id="username" name="username" class="form-control" @input="hideDiv()"/>
                        <label for="username">Username: </label>
                    </div>
                </div>
            </div>
            <div v-show="showDismissibleAlert" style="background: red; color: black;">
                Username già in uso!
            </div>
            <div class="row" style="position: relative; justify-content: center; align-items: center;">
                <div class="col-lg-4 col-md-4 col-sm-12">
                    <div class="form-floating">
                        <input type="password" v-model="passwd" id="passwd" name="passwd" class="form-control"/>
                        <label for="passwd">Password:</label>
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
    var showDismissibleAlert = ref(false);

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
                password: passwd.value
            }
            const r = await axios.post(api_url + "user/" + formType.value, newUser);
            console.log(r.data.message);
            console.log(formType);

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
            console.log("Errore: ", error);
        }

    }
    function hideDiv(){
        showDismissibleAlert.value=false;        
    }
</script>
