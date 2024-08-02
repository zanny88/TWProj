<template>
    <div :class="['navbar','navbar-expand-lg', 'navbar-light', 'bg-light',{'disabled-navbar': !val}]"><!--la classe disabled-navbar viene aggiunta in base al valore di nav-->
        <div class="container-fluid">
            <router-link class="navbar-brand" to="/">Note</router-link>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navMenu">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Show
                        </a>
                        <ul class="dropdown-menu" id="navbarDropdownList" aria-labelledby="navbarDropdown" style="z-index: 1051;">
                            <li><router-link class="dropdown-item" to="/showNote">Notes</router-link></li>
                            <li><router-link class="dropdown-item" to="/showTodo">To Do</router-link></li>
                        </ul>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Tomato Timer</a>
                    </li>
                    <form class="d-flex position-relative" role="search" id="searchForm">
                        <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search" id="searchInput" @input="inputSearch()" v-model="searchString" autocomplete="off"/>
                        <div class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" id="filterDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Filtri
                            </a>
                            <ul class="dropdown-menu" id="filterDropdownList" aria-labelledby="filterDropdown" style="z-index: 1051;">
                                <li><input type="radio" name="filterB" value="heading" checked/>Titolo</li>
                                <li><input type="radio" name="filterB" value="heading" />Autore</li>
                                <li><input type="radio" name="filterB" value="heading" />Luogo</li>
                                <li><input type="radio" name="filterB" value="heading" />Data</li>
                                <li><input type="radio" name="filterB" value="heading" />Tag</li>
                                <li><input type="radio" name="filterB" value="heading" />Friends</li>
                            </ul>
                        </div>
                        <button class="btn btn-outline-success" type="submit" @click.prevent="submitSearch()">Search</button><!--il .prevent in @click è utilizzato per evitare che il bottone esegua la sua solita azione di submit del form-->
                        <div class="list-group position-absolute w-100" sytle="z-index: 1050;" id="resultList"></div>
                    </form>
                </ul>
                <button class="btn btn-outline-info" @click="logout()">Logout</button>
            </div>
        </div>
    </div>
</template>

<script setup>
    import {inject,watch,ref} from "vue";
    import axios from "axios";
    import { useRouter } from "vue-router";

    const api_url = "http://localhost:3000/";
    const router = useRouter();

    var loggedIn = inject("loggedIn");//variabile globale ref creata in main.js per controllare se l'utente è loggato o meno
    var val = ref(loggedIn.value);//questo passaggio serve per poter gestire la modifica del valore della variabile loggedIn all'interno del componente
    var searchString = ref('');

    async function logout(){
        const r = await axios.get(`${api_url}user/logout`);
        loggedIn.value = false;
        router.push({path: "/login"});
    }

    watch(loggedIn, (newLog,oldLog) => {
        val.value = newLog;
    });

    function submitSearch(){
        var li_val = $('input[type=radio]:checked')[0].attributes.value.textContent;
        var friendSearch = $('input[type=checkbox]')[0].checked;

        search(searchString.value,li_val,friendSearch);
    }

    function inputSearch(){
        var li_val = $('input[type=radio]:checked')[0].attributes.value.textContent;
        var friendSearch = $('input[type=checkbox]')[0].checked;

        if(searchString.value > 1){
            search(searchString.value,li_val,friendSearch);
        }else{
            $('#resultList').empty().hide();
        }
    }

    async function search(q,f,fs){
        var newSearch = {
            query: q,
            filter: f,
            friends: fs
        };
        const r = await axios.post(`${api_url}search`,newSearch);

        
    }
    
</script>
<style scoped>
/*la classe disabilità la navbar*/
.disabled-navbar{
    pointer-events: none;
    opacity: 0.6;
}
</style>