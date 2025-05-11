<template>
    <div class="lateral-menu" :class="{ open: isOpen}">
      <div v-if="isOpen" class="overlay" @click="toggleMenu"></div>
  
      <transition name="slide">
        <div v-if="isOpen" class="sidebar">
          <h5>Send msg to users</h5>
          <div class="row">
            <input type="text" v-model="receiver" placeholder="User username: " @input="searchUser()"/>

            <div class="list-group position-absolute w-100" style="top: 58px; z-index: 1053; width: 100rem;" id="friends" v-if="receiver.length > 0 && userFound">
                <div
                    v-for="(el,index) in users"
                    :key = "index"
                    class="list-group-item list-group-item-action"
                    @click="receiver = el.name; userFound = false;"
                >
                    {{ el.name }}
                </div>
            </div>

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
    import { ref, inject, watch } from "vue";
    import { useRouter } from "vue-router";
    import axios from "axios";
    import { sendMessage } from "./messageUtils";

    const isOpen = ref(false);
    const router = useRouter();
    const emit = defineEmits(["menuToggled"]);

    var receiver = ref('');
    var msg = ref('');
    const api_url = inject('api_url');

    var userFound = ref(false);
    var users = ref([]);

    const toggleMenu = () => {
        isOpen.value = !isOpen.value;
        receiver.value = '';
        msg.value = '';
        emit("menuToggled", isOpen.value);
    };

    async function submit_msg(){
        const r = await axios.post(`${api_url}userSearch`,{username: receiver.value});
        if(!r.data){
            const user = atob(localStorage.getItem('token').split('.')[1]);
            sendMessage(receiver.value,user,msg.value,api_url);
            toggleMenu();
        }else{
            alert("User not found");
            receiver.value = '';
            msg.value = '';
        }
    }

    async function searchUser(){
        const user = atob(localStorage.getItem('token').split('.')[1]);
        if(receiver.value != ""){
            var friendPayload = {
                user: user,
                query: receiver.value,
                filter: "friends",
                friends: false
            }
            try{
                const r = await axios.post(`${api_url}search`,friendPayload);
                if(r.data.length > 0){
                    users.value = r.data.map(e => ({
                        name: e.username
                    }));
                    userFound.value = true;
                }else{
                    users.value = [];
                    userFound.value = false;
                }
            }catch(error){
                console.error("Error while searching for friends: ",error);
                userFound.value = false;
                users.value = [];
            }
        }
    }

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
  