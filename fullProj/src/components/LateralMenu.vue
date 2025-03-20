<template>
    <div class="lateral-menu" :class="{ open: isOpen }">
      <div v-if="isOpen" class="overlay" @click="toggleMenu"></div>
  
      <transition name="slide">
        <div v-if="isOpen" class="sidebar">
          <h5>Send msg to users</h5>
          <div class="row">
            <input type="text" v-model="receiver" placeholder="User username: "/>
            <textarea v-model="msg" placeholder="Message: "></textarea>
          </div>
          <div class="row">
            <button class="btn btn-outline-info" @click="submit_msg">Send</button>
          </div>
        </div>
      </transition>
    </div>
</template>
  
<script setup>
    import { ref, inject } from "vue";
    import { useRouter } from "vue-router";
    import axios from "axios";
    import { sendMessage } from "./messageUtils";

    const isOpen = ref(false);
    const router = useRouter();
    const emit = defineEmits(["menuToggled"]);

    var receiver = ref('');
    var msg = ref('');
    const user = atob(localStorage.getItem('token').split('.')[1]);
    const api_url = inject('api_url');

    // 🔥 Toggle per aprire/chiudere il menù
    const toggleMenu = () => {
        isOpen.value = !isOpen.value;
        emit("menuToggled", isOpen.value);
    };

    async function submit_msg(){
        console.log("Msg info: ",{to: receiver.value, msg: msg.value, from: user});
        sendMessage(receiver.value,user,msg.value,api_url);
        toggleMenu();
    }

    // 🔥 Espone la funzione per essere chiamata da App.vue
    defineExpose({ toggleMenu });
</script>
  
<style scoped>
    .lateral-menu {
        transition: margin-right 0.3s ease-in-out;
    }

    .lateral-menu.open {
        margin-right: 250px;
    }

    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1051;
    }

    .sidebar {
        position: fixed;
        top: 57px;
        right: 0;
        width: 400px;
        height: calc(100vh - 57px);
        background-color: #333;
        color: white;
        padding: 20px;
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.2);
        z-index: 1052;
    }

    .slide-enter-active,
    .slide-leave-active {
        transition: transform 0.3s ease-out;
    }

    .slide-enter-from,
    .slide-leave-to {
        transform: translateX(100%);
    }
</style>
  