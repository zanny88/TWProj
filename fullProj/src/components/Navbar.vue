<template>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">

    <div :class="['navbar','navbar-expand-lg', 'sticky-top', 'navbar-dark', {'disabled-navbar': !val}]"><!--la classe disabled-navbar viene aggiunta in base al valore di nav-->
        <div class="container-fluid">
            <div class="container-fluid col-5" id="logo-container">
                <router-link class="navbar-brand" to="/">
                  <img src="../assets/slothLogo.png" alt="Logo" width="30" height="30" class="d-inline-block align-text-top">
                  <span id="logoText">SELFIE</span>
                </router-link>
              </div>
            
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navMenu">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item dropdown" v-if="!hamburgerShowing">
                            <a class="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Show
                            </a>
                            <ul class="dropdown-menu" id="navbarDropdownList" aria-labelledby="navbarDropdown" style="z-index: 1051;">
                                <li><router-link class="dropdown-item" to="/calendar">Calendar</router-link></li>
                                <li><router-link class="dropdown-item" to="/showNote">Notes</router-link></li>
                                <li><router-link class="dropdown-item" to="/showTodo">To&nbsp;Do</router-link></li>
                                <li><router-link class="dropdown-item" to="/pomodoro">Pomodoro</router-link></li>
                            </ul>
                        </li>
                    <ul v-if="hamburgerShowing" id="ul-if-hamburgerShowing">
                        <li class="nav-item"><router-link class="nav-link" to="/calendar">Calendar</router-link></li>
                        <li class="nav-item"><router-link class="nav-link" to="/showNote">Notes</router-link></li>
                        <li class="nav-item"><router-link class="nav-link" to="/showTodo">To&nbsp;Do</router-link></li>
                        <li class="nav-item"><router-link class="nav-link" to="/pomodoro">Pomodoro</router-link></li>
                    </ul>
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
                        <button class="btn btn-outline-light" type="submit" @click.prevent="submitSearch()">Search</button><!--il .prevent in @click è utilizzato per evitare che il bottone esegua la sua solita azione di submit del form-->
                        <div class="list-group position-absolute w-100" sytle="z-index: 1050;" id="resultList"></div>
                    </form>
                </ul>
                <button class="btn btn-outline-dark" @click="logout()">Logout</button>
            </div>
        </div>
    </div>
</template>

<script setup>
    import {inject,watch,ref,onMounted} from "vue";
    import axios from "axios";
    import { useRouter, useRoute } from "vue-router";

    const api_url = "http://localhost:3000/";
    const router = useRouter();
    const route = useRoute();

    var loggedIn = inject("loggedIn");//variabile globale ref creata in main.js per controllare se l'utente è loggato o meno
    var val = ref(loggedIn.value);//questo passaggio serve per poter gestire la modifica del valore della variabile loggedIn all'interno del componente
    var searchString = ref('');
    var hamburgerShowing = ref(false);

    function updateCollapsed(){
        let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        if (vw < 992)
            hamburgerShowing.value = true;
        else
            hamburgerShowing.value = false;
    }

    watch(route, () => {
        document.querySelector("#navMenu").classList.remove("show");
    })

    onMounted(() => {
        updateCollapsed();
        window.addEventListener("resize", updateCollapsed);
        window.addEventListener("onload", updateCollapsed);
    });

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

/*la classe disabilita la navbar*/
.navbar{
    background-color: #ffb140;
    margin-bottom: 15px;
}

.navbar * {
    transition: 0.5s all;
}

@media(width >= 768px){
    .navbar{
        margin-bottom: 50px;
    }
}

.navbar *{
    font-family: Poppins, sans-serif;
}

#logoText{
    margin-left: 0.7em;
    letter-spacing: 0.3em;
    font-weight: 800;
}

@media(width < 576px) {
    .navbar-brand{
        margin:auto;
    }
}

#logo-container{
    display: flex;
    justify-content: center;
}

@media screen and (min-width: 992px){
    #logo-container{
        display: flex;
        justify-content: start;
    }
}

.disabled-navbar{
    pointer-events: none;
    opacity: 0.6;
}

#ul-if-hamburgerShowing{
    list-style-type: none; /* Remove bullets */
    padding: 0; 
    margin: 0; 
}

</style>