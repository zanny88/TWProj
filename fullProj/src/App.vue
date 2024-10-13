<template>
  <navbar></navbar>
  <router-view></router-view>
</template>

<script setup>
import Navbar from './components/Navbar.vue';
import axios from "axios";
import {onMounted, inject, watch, provide} from "vue";
import {useRouter} from "vue-router";

const router = useRouter();
const api_url = inject('api_url');
var loggedIn = inject("loggedIn");

async function checkLogged(){
  if(localStorage.getItem('token') === null){
    console.log("fai il login");
    console.log(localStorage.getItem('token'));
    router.push({path: "/login"});
  }
}

//appena App.vue viene caricata si controlla se l'utente è loggato in caso negativo si carica la pagina di login
onMounted(() => {
  checkLogged();
})

</script>

<style scoped>
@font-face {
  font-family: Ginto;
  src: url('/public/fonts/ABCGintoNormal-Regular-Trial-BF651b7b7846685.otf');
}
</style>
