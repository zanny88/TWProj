<template>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">

    <div :class="['navbar','navbar-expand-lg', 'sticky-top', 'navbar-dark', {'disabled-navbar': val}]"><!--la classe disabled-navbar viene aggiunta in base al valore di nav-->
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
<!--                                <li><router-link class="dropdown-item" to="/showTodo">To&nbsp;Do</router-link></li>-->
                                <li><router-link class="dropdown-item" to="/pomodoro">Pomodoro</router-link></li>
                            </ul>
                        </li>
                    <ul v-if="hamburgerShowing" id="ul-if-hamburgerShowing">
                        <li class="nav-item"><router-link class="nav-link" to="/calendar">Calendar</router-link></li>
                        <li class="nav-item"><router-link class="nav-link" to="/showNote">Notes</router-link></li>
<!--                        <li class="nav-item"><router-link class="nav-link" to="/showTodo">To&nbsp;Do</router-link></li>-->
                        <li class="nav-item"><router-link class="nav-link" to="/pomodoro">Pomodoro</router-link></li>
                    </ul>
                    <form class="d-flex position-relative" role="search" id="searchForm">
                        <input class="form-control me-2" :type="searchType" placeholder="Search" aria-label="Search" id="searchInput" @input="search()" v-model="searchString" autocomplete="off"/>
                        <div class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" id="filterDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Filters
                            </a>
                            <ul class="dropdown-menu" id="filterDropdownList" aria-labelledby="filterDropdown" style="z-index: 1051; padding: 5px;">
                                <li><input type="radio" name="filterB" value="heading" v-model="filter" checked/>Title</li>
                                <li><input type="radio" name="filterB" value="user" v-model="filter"/>Author</li>
                                <li><input type="radio" name="filterB" value="place" v-model="filter"/>Place</li>
                                <li><input type="radio" name="filterB" value="data" v-model="filter"/>Date</li>
                                <li><input type="radio" name="filterB" value="tag" v-model="filter"/>Tag</li>
                                <li><input type="checkbox" name="friendSearch" value="friends" v-model="friendFilter"/>Friends search</li>
                            </ul>
                        </div>
                        <button class="btn btn-outline-light" type="submit" @click.prevent="search()">Search</button><!--il .prevent in @click è utilizzato per evitare che il bottone esegua la sua solita azione di submit del form-->
                        <div class="list-group position-absolute w-100" id="resultList" v-if="searchString.length > 0 && hasSearchresults">
                            <router-link
                                v-for="(el,index) in searchResults"
                                :key = "index"
                                :to = "el.path"
                                class = "list-group-item list-group-item-action"
                                style="justify-content: space-between; display: flex;"
                                @click="searchString = ''"
                            >
                                <div>{{ el.heading }}</div>
                                <div style="color: gray;" v-if="friendFilter == true">{{ el.author }}</div>
                                <div style="color: gray;" v-if="friendFilter == false && el.author">{{ el.author }}</div>
                            </router-link>
                        </div>
                    </form>
                </ul>
                <div class="me-3" id="user_profile">
                    <router-link class="nav-link" to="/profile" v-html="profile_icon"></router-link>
                </div>
                <button class="btn btn-outline-dark" @click="logout()">Logout</button>
            </div>
        </div>
    </div>
</template>

<script setup>
    import {inject,watch,ref,onMounted,onUnmounted,computed} from "vue";
    import axios from "axios";
    import { useRouter, useRoute } from "vue-router";

    const api_url =inject('api_url');
    const router = useRouter();
    const route = useRoute();

    var profile_icon = ref(``);

    var filter = ref('heading');
    var friendFilter = ref(false);

    var searchResults = ref([]);
    var hasSearchresults = ref(false);

    var loggedIn = inject("loggedIn");//variabile globale ref creata in main.js per controllare se l'utente è loggato o meno
    var token = inject('IDtoken');
    var val = ref(token.value == null);
    //var token = ref(localStorage.getItem('token'));

    var searchString = ref('');
    var hamburgerShowing = ref(false);

    var checkInboxInterval = ref(null);

    const searchType = computed(() => {
        return filter.value == 'data' ? 'date' : 'search';
    });

    watch(token,(newValue) => {
        val.value = (newValue === null);
    })

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

        const checkInbox = async () => {
            if (localStorage.getItem('token') !== null){
                const u = atob(localStorage.getItem('token').split('.')[1]);
                try{
                    const r = await axios.post(`${api_url}user/checkInbox`,{user: u});
                    if (r.data){
                        profile_icon.value = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-person-fill-exclamation" viewBox="0 0 16 16">
                                <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m-9 8c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4"/>
                                <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m-3.5-2a.5.5 0 0 0-.5.5v1.5a.5.5 0 0 0 1 0V11a.5.5 0 0 0-.5-.5m0 4a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1"/>
                            </svg>
                        `;
                    }else{
                        profile_icon.value = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
                                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                            </svg>
                        `;
                    }
                }catch(error){
                    console.log("Error checking user inbox");
                }
                checkInboxInterval.value = setTimeout(checkInbox,5000);
            }
        };

        checkInbox();
    });

    onUnmounted(() =>  {
        if (checkInboxInterval.value){
            clearTimeout(checkInboxInterval.value);
        }
    })

    async function logout(){
        localStorage.removeItem('token');
        token.value = null;
        loggedIn.value = false;
        router.push({path: "/login"});
    }

    /*watch(loggedIn, (newLog,oldLog) => {
        val.value = newLog;
    });*/

    async function search(){
        
        var f = filter.value;
        var fs = friendFilter.value;
        var q;

        if(searchString.value.length >= 1){
            q = searchString.value;
        }else{
            hasSearchresults.value = false;
            return;
        }

        var newSearch = {
            user: atob(token.value.split('.')[1]),
            query: q,
            filter: f,
            friends: fs
        };
        console.log(`faccio una search dalla searchbar nell navbar con payload:`);
        console.log(newSearch);
        try{
            const r = await axios.post(`${api_url}search`,newSearch);
            if(r.data.length > 0){
                searchResults.value = r.data.map(e => ({
                    heading: e.heading,
                    author: e.user != atob(token.value.split('.')[1]) ? e.user : "",
                    path: `/note/${e._id}`
                }));
                hasSearchresults.value = true;
            }else{
                searchResults.value = [];
                hasSearchresults.value = false;
            }

        }catch(error){
            console.log("Error during search: ",error);
            searchResults.value = [];
            hasSearchresults.value = false;
        }
        
    }

    
    
</script>

<style scoped>
#resultList {
    max-height: 300px;
    overflow-y: auto;
    background-color: white;
    border: 1px solid #ccc;
    position: absolute;
    top: calc(100% + 10px);
    left: 0;
    z-index: 1050; 
    width: 100%;
}

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
