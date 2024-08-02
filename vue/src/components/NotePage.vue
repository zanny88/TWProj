<template>
    <div id="header" style="display: flex; justify-content: space-between;">
        <h1>Note Page</h1>
        <button type="button" class="btn btn-outline-info">
            <router-link to="/create">Add Note</router-link>
        </button>
    </div>
    <div class="row row-cols-1 row-cols-md-3 g-4" style="width: 100vw; margin-left: 1px;" v-if="isNoteLoaded"><!--il codice html non viene caricato fino a quando i dati delle note non sono stati ottenuti-->
        <div class="col" v-for="note in Notes" :key="note._id">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">{{note.heading}}</h5>
                    <p>{{note.content.substring(0,100)}}...</p>
                </div>
                <div class="card-footer">
                    <small class="text-body-secondary">Written by {{ note.user }} in {{note.place}} on {{new Date(note.date).toDateString()}}<br/></small>
                    <small class="text-body-secondary">Tags: {{note.tags.join('-')}}</small>
                </div>
                <button type="button" class="btn btn-outline-info" @click="gotoNotePage(note._id)">Read more</button>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { onMounted, computed, ref, nextTick } from "vue";
    import axios from 'axios';
    import {useRouter} from "vue-router";
    const api_url = "http://localhost:3000/";
    const router = useRouter();

    var Notes = ref([]);

    //a differenza del componente Note.vue dove il codice html non veniva caricato finchè ad un oggetto non veniva assegnato un valore qui bisogna controllare che l'array Notes abbia almento un elemento
    //per fare ciò bisogna continuare a controllare la lunghezza dell'array
    //alla variabile isNoteLoaded verrà assegnato continuamente il valore restituito dalla funzione che controlla la lunghezza dell'array Notes definita dentro a computed
    const isNoteLoaded = computed(() => Notes.value.length > 0);

    async function getNotes(){
        try{
            const res = await axios.post(api_url + "getNotes/-1");
            Notes.value = res.data;
            await nextTick();
        }catch(error){
            console.log("Error fetching notes: ",error);
        }
    }

    function gotoNotePage(id){
        router.push({path: "/note/"+id});//passaggio al componente Note.vue
    }

    onMounted(async () => {
        await getNotes();
    });
</script>