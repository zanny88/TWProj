<template>
    <div class="background"></div>
    <div class="container mt-4" v-if="note"><!--l'html viene caricato solo quando i dati della nota sono presenti-->
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body">
                        <div style="display: flex; justify-content: space-between;">
                            <h5 class="card-title"><b>{{ note.heading }}</b></h5>
                            <button :class="['btn',{'disabled': isMenuDisabled}]" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                                    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                                </svg>
                            </button>
                            <ul class="dropdown-menu">
                                <li class="dropdown-item" @click="duplicate(note._id)">Duplicate note</li>
                                <li class="dropdown-item" @click="deleteNote(note._id)">Delete note</li>
                                <li class="dropdown-item" @click="note_modify(note._id)">Modify note</li>
                            </ul>
                        </div>
                        <p class="card-text" v-html="formatContent(note.content)"></p>
                        <p class="card-text">
                            <small class="text-muted">Written by {{ note.user }} {{note.place!=='' ? "in " + note.place : ''}} on {{ new Date(note.date).toDateString() }}</small>
                        </p>
                        <div class="card-text">
                            <div style="display: flex; justify-content: space-between;">
                                <small class="text-muted">Tags: {{ note.tags == [] ? note.tags.map(tag => "#"+tag).join(', ') : "(none)" }}</small>
                                <small class="text-muted">Last modified: {{ new Date(note.last_modify).toDateString() }}</small>
                            </div>
                        </div>
                        <!--<button type="button" class="btn-close" aria-label="Close" @click="deleteNote(note._id)"></button>-->
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import {ref, onMounted, inject,watch} from "vue";
    import axios from "axios";
    import {useRouter,useRoute} from "vue-router";
    import { marked } from "marked";
    const router = useRouter();
    const route = useRoute();
    const props = defineProps(['id']);
    var note = ref(null);
    const api_url = inject('api_url');
    const user = atob(localStorage.getItem('token').split('.')[1]);

    var isMenuDisabled = ref(false);

    async function duplicate(id){
        const res = await axios.post(api_url + "duplicateNote/" + id);
        router.push({path: "/showNote"});
    }

    //funzione per la richiesta dei dati della nota da visualizzare
    async function getNote(){
        try{
            const payload = {ID: props.id};
            const res = await axios.post(`${api_url}notes/get`,payload);
            note.value = res.data[0];
            if (user != note.value.user){
                isMenuDisabled.value = true;
            }else{
                isMenuDisabled.value = false;
            }
        }catch(error){
            console.log("Error",error);
        }
    }

    watch(() => route.params.id, async (newId) => {
        if (newId) {
            await getNote();
        }
    })

    async function deleteNote(id){
        const payload = {
            ID: id
        }
        try{
            const res = await axios.post(`${api_url}Notes/delete/`,payload);
            router.push({path: "/showNote"});
        }catch(error){
            console.log("Error: ",error);
        }
    }

    //funzione per la modifica della nota
    //la nota viene richiesta all'api con il payload get
    //viene poi creato un nuovo payload con i dati della nota e inviato ad un altro componente 
    //la seconda "richiesta" è più un cambio di componente visualizzato, ovvero si carica il componente Compose.vue e gli si passano (nel parametro query) i dati della nota
    async function note_modify(note_id){
        const get_payload = {
            ID: note_id
        }
        const r = await axios.post(`${api_url}notes/get`,get_payload);
        var modify_payload = r.data[0];
        router.push({
            path: "/create",
            query: {data: JSON.stringify(modify_payload)}
        });
    }

    function formatContent(content){
        return marked.parse(content);
    }

    //appena il componente viene caricato si esegue la funzione per la ricerca dei dati della nota da visualizzare
    onMounted(async () => {
        await getNote();
        
    });
</script>

<style scoped>
    .background {
        position: fixed;
        width: 100vw;
        height: 100vh;
        top: 0;
        left: 0;
        margin: 0;
        padding: 0;
        background-color: #38726c;
        background-image: url("/src/assets/wood-pattern.png");
        overflow: hidden;
        z-index: -1;
    }

    .card {
        margin-top: 20px;
        margin-bottom: 20px;
        padding: 20px;
        color:#000;
        background-color: #ffc;
        background-image: url('/src/assets/textured-paper.png');
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease-in-out;
        max-width: 800px;
        margin-left: auto;
        margin-right: auto;
        z-index: 1;
    }
</style>