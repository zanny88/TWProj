<template>
    <div class="container mt-4" v-if="note"><!--l'html viene caricato solo quando i dati della nota sono presenti-->
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body">
                        <div style="display: flex; justify-content: space-between;">
                            <h5 class="card-title">{{ note.heading }}</h5>
                            <button class="btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
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
                            <small class="text-muted">Written by {{ note.user }} in {{ note.place }} on {{ new Date(note.date).toDateString() }}</small>
                        </p>
                        <p class="card-text">
                            <div style="display: flex; justify-content: space-between;">
                                <small class="text-muted">Tags: {{ note.tags.map(tag => "#"+tag).join(', ') }}</small>
                                <small class="text-muted">Last modify: {{ new Date(note.last_modify).toDateString() }}</small>
                            </div>
                        </p>
                        <!--<button type="button" class="btn-close" aria-label="Close" @click="deleteNote(note._id)"></button>-->
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import {ref, onMounted, inject} from "vue";
    import axios from "axios";
    import {useRouter} from "vue-router";
    const router = useRouter();
    const props = defineProps(['id']);
    var note = ref(null);
    const api_url = inject('api_url');

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
        }catch(error){
            console.log("Error",error);
        }
    }

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
        return content
            .replace(/#+\s(.*?)(\n|$)/g, '<h1>$1</h1>') // Titoli
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')     // Grassetto
            .replace(/\*(.*?)\*/g, '<i>$1</i>')         // Corsivo
            .replace(/\n/g, '<br>');
    }

    //appena il componente viene caricato si esegue la funzione per la ricerca dei dati della nota da visualizzare
    onMounted(async () => {
        await getNote();
    });
</script>
