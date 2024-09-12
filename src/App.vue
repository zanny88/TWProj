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
  const r = await axios.get(`${api_url}user/checkLogged`);
  if(r.data.message == "true"){
      loggedIn.value = true;
  }else{
      loggedIn.value = false;
  }
  if(!loggedIn.value){
    router.push({path: "/login"});
  }
}

//appena App.vue viene caricata si controlla se l'utente è loggato in caso negativo si carica la pagina di login
onMounted(() => {
  checkLogged();
})

</script>
