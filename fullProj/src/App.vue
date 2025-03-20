<template>
  <navbar></navbar>
  <button class="menu-button" :style="buttonStyle" :class="{ open: isMenuOpen }" @click="toggleMenu">☰</button>
  <LateralMenu ref="lateralMenu" @menuToggled="handleMenuToggle" />
  <router-view></router-view>
  <TimeMachine ref="timeMachine" />
</template>

<script setup>
import Navbar from './components/Navbar.vue';
import TimeMachine from './components/TimeMachine.vue';
import LateralMenu from './components/LateralMenu.vue';
import axios from "axios";
import { onMounted, inject, watch, provide, ref, nextTick, useTemplateRef, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const api_url = inject('api_url');
var loggedIn = inject("loggedIn");

const timeMachineRef = useTemplateRef('timeMachine');

const lateralMenuRef = useTemplateRef('lateralMenu');
const isMenuOpen = ref(false);
const menuWidth = 400; // Larghezza del menù in px


// Funzione per aprire il menù dal Navbar
const toggleMenu = async () => {
  await nextTick(); // Assicura che Vue aggiorni il riferimento prima di accedere a toggleMenu()
  if (lateralMenuRef.value) {
    lateralMenuRef.value.toggleMenu();
  } else {
    console.error("Errore: lateralMenuRef è null");
  }
};

const handleMenuToggle = (state) => {
  isMenuOpen.value = state;
};

const buttonStyle = computed(() => ({
  transform: isMenuOpen.value ? `translateX(-${menuWidth}px)` : "translateX(0)",
  transition: "transform 0.3s ease-in-out"
}));

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
.menu-button {
  position: fixed;
  top: 58px;
  right: 0px; /* Posizionato al margine destro */
  background: black;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 10px 15px;
  border-radius: 5px;
  z-index: 1000;
}

@font-face {
  font-family: Ginto;
  src: url('/public/fonts/ABCGintoNormal-Regular-Trial-BF651b7b7846685.otf');
}
</style>
