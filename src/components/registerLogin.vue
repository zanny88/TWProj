<template>
    <div class="container" style="text-align: center; margin-top: 10px;">
        <h5 id="title"> {{ formType }} form</h5>
        <form id="mainForm">
            <div class="row" style="position: relative; justify-content: center; align-items: center;">
                <div class="col-lg-4 col-md-4 col-sm-12">
                    <div class="form-floating">
                        <input type="text" v-model="name" id="username" name="username" class="form-control"/>
                        <label for="username">Username: </label>
                    </div>
                </div>
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
    const api_url = "http://localhost:3000/";
    var loggedIn = inject('loggedIn');

    var name = ref('');
    var passwd = ref('');

    //ho utilizzato una srtinga invece di un indice perchè riutilizzerò il valore di formType per la richiesta al server 
    var formType = ref("Login");
    var outlines = {
        "Login":["Non hai un account?","Registrati"],
        "Register":["Hai già un account?","Fai il login"]
    };

    function changeForm(){
        formType.value = formType.value === "Login" ? "Register" : "Login";
    }

    async function submit(){
        try{
            const newUser = {
                username: name.value,
                password: passwd.value
            }
            const r = await axios.post(api_url + "user/" + formType.value, newUser);
            
            if(r.data.message == "OK"){
                loggedIn.value = true;//modifica della variabile globale per sbloccare la navbar e poter navigare l'applicazione
                router.push({path: "/"});
            }else{
                console.log(r.data.message);
            }
        }catch(error){
            console.log("Errore: ", error);
        }

    }
</script>