<!-- TODO edit e delete da dropdown -->
<!-- Capisci sorting-->

<template>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Reenie+Beanie&display=swap" rel="stylesheet">


    <div class="background"></div>


    <div class="container-fluid">

        <div id="header">
            <h1>Notes Viewer</h1>
            <div style="display: flex; align-items: center; gap: 5px;">
                <button id="filter" class="btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Order
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-filter" viewBox="0 0 16 16">
                        <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5"/>
                    </svg>
                </button>
                <ul class="dropdown-menu">
                    <li class="dropdown-item" @click="sortNotes('Nome')">
                        <div>
                            Name
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check" viewBox="0 0 16 16" v-if="sortParam == 'Nome'">
                                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
                            </svg>
                        </div>
                    </li>
                    <li class="dropdown-item" @click="sortNotes('Data')">
                        <div>
                            Date
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
                <button type="button" class="btn" id="add">
                    <router-link to="/create" style="color: black; text-decoration: none;">Add Note</router-link>
                </button>
            </div>
        </div>
    <div id="page-body" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 gx-4 gy-5 justify-content-center" style="width: 100vw; margin-left: 1px;" v-if="isNoteLoaded">
        <div class="col" style="justify-content: center; align-items: center;" v-for="note in Notes" :key="note._id">
            <div class="card h-100" v-on:mouseleave="collapseCardDropdown">
                <div class="card-header d-flex justify-content-end">
                    <button class="btn card-dropdown-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                        </svg>
                    </button>
                    <ul class="dropdown-menu">
                        <li class="dropdown-item" @click="note_modify(note._id)">Edit</li>
                        <li class="dropdown-item" @click="deleteNote(note._id)">Delete</li>
                    </ul>
                </div>
                <router-link :to="`/note/${note._id}`" class="card-body note-link">
                    <h2 class="card-title">{{note.heading.substring(0,20) + (note.heading.length > 20 ? '...' : '')}}</h2>
                    <p>{{note.content.substring(0,20) + (note.content.length > 20 ? '...' : '')}}</p>
                </router-link>
                <div class="card-footer">
                    <small class="text-body-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16">
                            <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
                      </svg> 
                      {{ note.user }} | 
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
                        <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
                      </svg> 
                      {{note.place}} | 
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar" viewBox="0 0 16 16">
                        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
                      </svg> {{new Date(note.date).toDateString()}}<br/></small>
                    <small class="text-body-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-tags-fill" viewBox="0 0 16 16">
                            <path d="M2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586zm3.5 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
                            <path d="M1.293 7.793A1 1 0 0 1 1 7.086V2a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l.043-.043z"/>
                      </svg> {{note.tags.join(', ')}} </small>
                </div>
            </div>
        </div>
    </div>

</div>
</template>

<script setup>
    import { onMounted, computed, ref, nextTick, inject} from "vue";
    import axios from 'axios';
    import {useRouter} from "vue-router";
    const api_url = inject('api_url');
    const router = useRouter();
    const token = localStorage.getItem('token');
    var sorting = true;
    var sortParam = "Data";
    var revSort = true;

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
        var user = atob(token.split('.')[1]);
        try{
            const res = await axios.post(api_url + "getNotes/-1",{ID: user});
            Notes.value = res.data;
            await nextTick();
        }catch(error){
            console.log("Error fetching notes: ",error);
        }
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
        sortNotes("Data");
    });

    function collapseCardDropdown(e){
        const dropdown = e.target.querySelector(".dropdown-menu");

        if(dropdown?.classList.contains('show')) dropdown.classList.toggle("show");
    }

    async function deleteNote(id){
        const payload = {
            ID: id
        }
        try{
            await axios.post(`${api_url}Notes/delete/`, payload);
            Notes.value = Notes.value.filter(el => el._id != id);
        }catch(error){
            console.log("Error: ",error);
        }
    }

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
</script>

<style scoped>
#header{
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    margin-bottom: 2rem;
}

#header h1{
    font-family: Poppins;
    text-transform: uppercase;
    color: white;
}

#page-body h2 {
    font-weight: bold;
    font-size: 2rem;  
}
  
#page-body p {
    font-family: 'Reenie Beanie';
    font-size: 2rem;
}

.note-link{
    text-decoration: none;
}

#page-body .col .card{
    color:#000;
    background-color: #ffc;
    background-image: url('/src/assets/textured-paper.png');
    height:20em;
    width:20em;
    padding:2em;
    box-shadow: 5px 5px 7px rgba(33,33,33,.7);
    transform: rotate(-6deg);
    transition: all 0.5s;
}

#page-body .col:nth-child(2n) .card{
    transform:rotate(4deg);
    position:relative;
    top:5px;
}

#page-body .col:nth-child(3n) .card{
    transform:rotate(-3deg);
    position:relative;
    top:-5px;
}

#page-body .col:nth-child(5n) .card{
    transform:rotate(5deg);
    position:relative;
    top:-10px;
}

#page-body .col .card:hover,
#page-body .col .card:focus{
    box-shadow:10px 10px 7px rgba(0,0,0,.7);
    transform: scale(1.125);
    position:relative;
    z-index:5;
}

#page-body .card .card-header{
    background: none;
    border: none;
}

.card-dropdown-btn{
    border: none;

    &:hover{
        color: #38726c;
        transition: all 500ms;
    }
}

/**/
  

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
    z-index: -101;
}

#filter:hover{
    background: #ccc;
    border: 1px solid black;
    cursor: pointer;
}
#add:hover{
    background: #ccc;
    border: 1px solid black;
    cursor: pointer;
}
</style>
