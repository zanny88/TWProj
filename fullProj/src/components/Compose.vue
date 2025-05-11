<template>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <div class="background"></div>
    <div id="compose" class="container-fluid">
        <h1 class="ps-4">Compose a new note</h1>
        <div class="compose-container">
            <div class="form-container">
                <div class="row" style="position: relative; justify-content: center; align-items: center;">
                    <div class="col-lg-4 col-md-4 col-sm-4">
                        <div class="form-floating">
                            <input type="text" v-model="title" class="form-control" id="notetitle" required/>
                            <label for="notetitle" id="titleLabel">Title<span class="required-star">*</span></label>
                        </div>
                    </div>
                </div>
                <div class="row" style="position: relative; justify-content: center; align-items: center;">
                    <div class="col-lg-4 col-md-4 col-sm-4">
                        <div class="form-floating">
                            <textarea v-model="post" class="form-control" id="textArea" style="height: 100px; white-space: pre-wrap;" wrap="off" required></textarea>
                            <label for="textArea">Note body<span class="required-star">*</span></label>
                        </div>
                    </div>
                </div>
                <div class="row" style="position: relative; align-items: center; justify-content: center;">
                    <div class="col-lg-4 col-md-4 col-sm-4">
                        <div class="form-floating">
                            <textarea v-model="tags" class="form-control" id="tagsArea"></textarea>
                            <label for="tagsArea">Tags</label>
                        </div>
                    </div>
                </div>
                <div class="row" style="position: relative; justify-content: center; align-items: center;">
                    <div class="col-lg-4 col-md-4 col-sm-4">
                        <div class="form-floating">
                            <input type="text" v-model="place" class="form-control" id="placeArea"/>
                            <label for="placeArea">Place</label>
                        </div>
                    </div>
                </div>

                <div id="row" style="text-align: center;">
                    <input type="checkbox" id="public" v-model="publicCheck"/>
                    <label for="public"> Public</label>
                </div>

                <div v-if="!publicCheck" class="row d-flex position-relative" style="justify-content: center; align-items: center;" id="input_friends">
                    <div class="col-lg-4 col-md-4 col-sm-4 position-relative">
                        <div class="form-floating">
                            <textarea type="text" class="form-control" id="share" @input="searchUser()" @keydown.enter.prevent="appendUser(userName)" v-model="userName" style="width: 100%;"></textarea>
                            <label for="search">Add users to view list:</label>
                        </div>
                    </div>
                    <div class="list-group position-absolute w-100" style="top: calc(100% + 5px); z-index: 1050; width: 100%;" id="friends" v-if="userName.length > 0 && userFound">
                        <div
                            v-for="(el,index) in users"
                            :key = "index"
                            class="list-group-item list-group-item-action"
                            @click="appendUser(el.name)"
                        >
                            {{ el.name }}
                        </div>
                    </div>
                    <div class="col-lg-4 col-md-4 col-sm-4" v-if="usersToShare.length > 0">
                        <div v-for="(friend,index) in usersToShare" :key="index" class="d-inline-block me-2">
                            <span>{{ friend }}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" id="del_friend" viewBox="0 0 16 16" @click="deleteFriend(index)">
                                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                            </svg>
                        </div>
                    </div>
                </div>
                
                <div class="row" style="position: relative; justify-content: center; align-items: center;">
                    <div class="cool-lg-4 col-md-4 col-sm-4" style="position: relative; text-align: center;">
                        <button type="button" class="btn btn-success" style="margin-top: 10px;" id="publishB" :disabled="publishDisabled" @click.prevent="submit">Publish</button>
                    </div>
                </div>
            </div>
            <div v-if="post !== ''" class="preview-container">
                <h4>Preview</h4>
                <div v-html="renderedContent" style="background-color: white; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">

                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import {ref,onMounted,computed,inject,nextTick} from "vue";
    import axios from 'axios';
    import {useRouter,useRoute} from "vue-router";
    import { useTimeMachineStore } from '../stores/timeMachine';
    import { marked } from "marked";
    const timeMachineStore = useTimeMachineStore();

    const api_url = inject('api_url');
    const router = useRouter();//oggetto utilizzato per spostarsi tra i diversi componenti
    const route = useRoute();//oggetto utilizzato per utilizzare i dati passati come payload da un altro componente (funzione note_modify in Note.vue)
    var sent_to_modify = ref(null);//oggetto dove viene salvato il post da modificare quando viene richiesta una modifica
    const user = atob(localStorage.getItem('token').split('.')[1]);

    //********************************************************************************************************************
    //TIME MACHINE
    const currentTime = computed(() => timeMachineStore.getCurrentTime.format('YYYY-MM-DD HH:mm:ss'));
    //********************************************************************************************************************


    //variabili collegate ai diversi tag input con v-modal per ottenere il valore inserito nel tag
    var typeI = ref(0);
    var title = ref('');
    var post = ref('');
    var tags = ref('');
    var place = ref('');
    var publicCheck = ref(false);
    var insertType = ref(["Note","To do list, put only one task for line"]);//array utilizzato per il display delle informazioni del tipo di post che si vuole salvare
    //viene utilizzato ref perchè per accedere agli elementi si utilizza come indice typeI altra variabile ref che può cambiare durante la visualizzazione del componente
    var userName = ref('');
    var userFound = ref(false);
    var users = ref([]);

    var usersToShare = ref([]);
    var submitFlag;
    async function appendUser(friend_name){
        const r = await axios.post(`${api_url}userSearch`,{username: friend_name});
        if (!r.data){
            userName.value = '';
            userFound.value = false;
            usersToShare.value.push(friend_name);
        }else{
            alert("utente non trovato");
            submitFlag = false;
        }
    }

    async function deleteFriend(index){
        let new_share = [];
        usersToShare.value.forEach((e,i) => {
            if ( i != index ) {
                new_share.push(e);
            }
        });
        usersToShare.value = new_share;
        await nextTick();
    }

    function convertToHTML(data){
        return marked.parse(data);
    }

    const renderedContent = computed(() => {
        return convertToHTML(post.value);
    })

    const publishDisabled = computed(() => {
        return !title.value || !post.value;
    })

    //funzione di submit per il salvataggio del post
    async function submit(){
        submitFlag = true;

        if (userName.value != ''){
            appendUser(userName.value);
            if (!submitFlag){
                return;
            }
        }

        const newPost = {
            ID: sent_to_modify.value != null ? sent_to_modify.value._id : null,//se si stava modificando un post già esistente viene aggiunto l'ID di questo 
            parent_id: null,
            heading: title.value,
            content: post.value,
            tags: tags.value,
            place: place.value,
            date: currentTime.value,
            public: publicCheck.value,
            post_type: typeI.value,
            author: user,
            share: [...usersToShare.value].join('-')
        };
        var res = await axios.post(`${api_url}compose`,newPost);

        router.push({path: "/showNote"});
    }

    function uploadToModify(){
        title.value = sent_to_modify.value.heading;
        post.value = sent_to_modify.value.content;
        tags.value = sent_to_modify.value.tags.join(",");
        place.value = sent_to_modify.value.place;
        publicCheck.value = sent_to_modify.value.public;
        typeI.value = 0;
        for(let user of sent_to_modify.value.view_list){
            usersToShare.value.push(user);
        }
    }

    async function searchUser(){
        if(userName.value != ""){
            var friendPayload = {
                user: user,
                query: userName.value,
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

    onMounted(() => {
        if(route.query.data){
            try{
                sent_to_modify.value = JSON.parse(route.query.data);
                uploadToModify();
            }catch(error){
                console.log("Failed to parse data from query",error);
            }
        }
    })
</script>

<style scoped>
    .background{
        position: fixed;
        width: 100vw;
        height: 100vh;
        top: 0;
        left: 0;
        margin: 0;
        padding: 0;
        background-color: #ffc;
        background-image: url('/src/assets/textured-paper.png');
        z-index: -1;
    }
    .compose-container{
        color:#000;
        background-color: #ffc;
        background-image: url('/src/assets/textured-paper.png');
    }
    .required-star{
        color: red;
    }
    #del_friend:hover{
        cursor: pointer;
        color: red;
    }
    .compose-container{
        display: flex;
        flex-wrap: wrap;
    }
    .form-container, .preview-container{
        flex: 2;
        min-width: 300px;
        margin: 10px;
        background-color: rgb(237, 237, 185);
        background-image: url('/src/assets/textured-paper.png');
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        padding: 20px;
        border: 1px solid #ccc;
    }

    .preview-container{
        padding: 10px;
    }

    h1, h2, h3, h4 {
        font-family: Montserrat, sans-serif;
        font-weight: 700;
        color: #333;
    }

    .preview-container h4{
        text-align: center;
        font-size: 24px;
        color: #333;
    }
</style>
