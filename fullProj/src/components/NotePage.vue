<template>
    <div id="header" style="display: flex; justify-content: space-between; align-items: center;">
        <h1>Note Page</h1>
        <div style="display: flex; align-items: center; gap: 5px;">
            <button class="btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                Ordina
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-filter" viewBox="0 0 16 16">
                    <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5"/>
                </svg>
            </button>
            <ul class="dropdown-menu">
                <li class="dropdown-item" @click="sortNotes('Nome')">
                    <div>
                        Nome
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check" viewBox="0 0 16 16" v-if="sortParam == 'Nome'">
                            <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
                        </svg>
                    </div>
                </li>
                <li class="dropdown-item" @click="sortNotes('Data')">
                    <div>
                        Data
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check" viewBox="0 0 16 16" v-if="sortParam == 'Data'">
                            <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
                        </svg>
                    </div>
                </li>
                <li class="dropdown-item" @click="sortNotes('Tag')">
                    <div>
                        Tag
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check" viewBox="0 0 16 16" v-if="sortParam == 'Tag'">
                            <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
                        </svg>
                    </div>
                </li>
            </ul>
            <button v-html="HTMLS[revSort]" v-if="sorting" class="btn" type="button" @click="reverseSort"></button>
            <button type="button" class="btn btn-outline-info">
                <router-link to="/create">Add Note</router-link>
            </button>
        </div>
        
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
    var sorting = false;
    var sortParam = "";
    var revSort = false;

    const HTMLS = {
        true: `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"/>
            </svg>
        `,
        false: `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-up" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5"/>
            </svg>
        `
    }

    

    var Notes = ref([]);

    //a differenza del componente Note.vue dove il codice html non veniva caricato finchè ad un oggetto non veniva assegnato un valore qui bisogna controllare che l'array Notes abbia almento un elemento
    //per fare ciò bisogna continuare a controllare la lunghezza dell'array
    //alla variabile isNoteLoaded verrà assegnato continuamente il valore restituito dalla funzione che controlla la lunghezza dell'array Notes definita dentro a computed
    const isNoteLoaded = computed(() => Notes.value.length > 0);

    async function getNotes(){
        const token = localStorage.getItem('token');
        try{
            const res = await axios.post(api_url + "getNotes/-1",{ID: token});
            Notes.value = res.data;
            await nextTick();
        }catch(error){
            console.log("Error fetching notes: ",error);
        }
    }

    function gotoNotePage(id){
        router.push({path: "/note/"+id});//passaggio al componente Note.vue
    }

    function sortNotes(param){
        sorting = true;
        if(sortParam != param){
            revSort = false;
        }
        sortParam = param;
        if(param == "Nome"){
            Notes.value.sort((a,b) => !revSort ? a.heading.localeCompare(b.heading) : b.heading.localeCompare(a.heading));
        }else if(param == "Data"){
            Notes.value.sort((a,b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return !revSort ? (dateA - dateB) : (dateB - dateA);
            });
        }else if(param == "Tag"){
            Notes.value.sort((a,b) => !revSort ? a.tags.join("").localeCompare(b.tags.join("")) : b.tags.join("").localeCompare(a.tags.join("")));
        }
    }

    function reverseSort(){
        revSort = !revSort;
        sortNotes(sortParam);
    }

    onMounted(async () => {
        await getNotes();
    });
</script>

<style scoped>
#filter:hover{
    background: #ccc;
    border: 1px solid black;
    cursor: pointer;
}
</style>