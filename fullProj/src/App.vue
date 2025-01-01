<template>
  <navbar></navbar>
  <router-view></router-view>
  <TimeMachine ref="timeMachine" />
</template>

<script setup>
import Navbar from './components/Navbar.vue';
import TimeMachine from './components/TimeMachine.vue';
import axios from "axios";
import { onMounted, inject, watch, provide, ref, nextTick, useTemplateRef } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const api_url = inject('api_url');
var loggedIn = inject("loggedIn");

const timeMachineRef = useTemplateRef('timeMachine');

async function checkLogged() {
  if (localStorage.getItem('token') === null) {
    console.log("fai il login");
    console.log(localStorage.getItem('token'));
    router.push({ path: "/login" });
  }
}

// Watch for route changes and set expanded to false
watch(router.currentRoute, async() => {
  await nextTick();
  if (timeMachineRef.value) {
    timeMachineRef.value.setExpanded(false);
    if(router.currentRoute.value.path.includes("/pomodoro")) {
      timeMachineRef.value.setDisabled(true);
    } else {
      timeMachineRef.value.setDisabled(false);
    }
  }
});

// Check if the user is logged in when the component is mounted
onMounted(() => {
  checkLogged();
});
</script>

<style scoped>
@font-face {
  font-family: Ginto;
  src: url('/public/fonts/ABCGintoNormal-Regular-Trial-BF651b7b7846685.otf');
}
</style>
