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

    var start_todo_index = 0;
    var final_todo_index = 0;

    var usersToShare = ref([]);
    var submitFlag;
    async function appendUser(friend_name){
        console.log("appending friend");
        const r = await axios.post(`${api_url}userSearch`,{username: friend_name});
        console.log(`risultato ricerca utente ${friend_name}: ${r.data}`);
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
        console.log(`[DEBUG]: LISTA UTENTI DI SHARE - ${usersToShare.value[0]}`);
        console.log(`[DEBUG]: INDICE DA ELIMINARE - ${index}`);
        let new_share = [];
        usersToShare.value.forEach((e,i) => {
            if ( i != index ) {
                new_share.push(e);
            }
        });
        usersToShare.value = new_share;
        console.log(`[DEBUG]: LISTA DI SHARE DOPO ELIMINAZIONE - ${usersToShare.value}`);
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

    //funzione per cercare la parte della nota, se presente, dove si è indicato di voler creare un to-do con il simbolo [todo]
    //calcola l'indice di inizio e fine della zona del to-do ed estrae la sottostringa dal corpo della nota
    //la sottostringa del to-do non viene tolta dal corpo della nota
    /*function check_for_todo(text) {
        var results = [];
        var startIndex = 0;

        text = text.toLowerCase();  // Converti tutto il testo in minuscolo per cercare in modo case-insensitive.

        while (true) {
            // Trova il primo indice di "[todo]" a partire da startIndex.
            const firstTodoIndex = text.indexOf("[todo]", startIndex);
            console.log("todo trovato al'indice, ",firstTodoIndex);

            if(!start_todo_index){
                console.log("non avevo ancora trovato todo e quindi mi salvo l'indice");
                start_todo_index = firstTodoIndex;
            }

            if (firstTodoIndex === -1) {
                if(start_todo_index == -1){
                    start_todo_index = 0;
                }
                break;  // Esce dal ciclo se non ci sono più "[todo]" nel testo.
            }

            // Trova il secondo indice di "[todo]" dopo il primo.
            const secondTodoIndex = text.indexOf("[todo]", firstTodoIndex + "[todo]".length);

            if (secondTodoIndex !== -1) {
                final_todo_index = secondTodoIndex;
                // Estrae la sottostringa tra il primo e il secondo "[todo]".
                let extractedText = text.substring(firstTodoIndex + "[todo]".length, secondTodoIndex).trim();
                if(/<\/?[^>]+(>|$)/g.test(extractedText)){
                    extractedText = extractedText.replace(/<\/?[^>]+(>|$)/g,'').trim();
                }
                console.log("extract text for todo: ",extractedText);
                results.push(extractedText);  // Aggiunge la sottostringa alla lista dei risultati.
                startIndex = secondTodoIndex + "[todo]".length;  // Aggiorna startIndex per cercare la prossima occorrenza.
            } else {
                break;  // Esce dal ciclo se non c'è un secondo "[todo]".
            }
        }

        return results.length > 0 ? results : null;
    }

    //funzione per la creazione del payload per la richiesta di creazione del to-do trovato all'interno della nota
    function create_todo_obj(data){
        var addTodos = [];
        if(data){
            for(let t of data){                
                var tasks = t.split("\n").map(task => task.trim()).filter(item => item != "");
                var x = {
                    ID: null,
                    parent_id: null,
                    heading: tasks.shift(),
                    content: tasks.join("\n"),
                    tags: tags.value,
                    place: place.value,
                    public: publicCheck.value,
                    post_type: 1,
                    todo_children: false,
                    author: user
                }
                addTodos.push(x);
            }
        }
        return addTodos;
    }*/

    //funzione di submit per il salvataggio del post
    async function submit(){
        submitFlag = true;

        if (userName.value != ''){
            appendUser(userName.value);
            if (!submitFlag){
                return;
            }
        }

        /*var todos_data = null;
        var todo_objs = null;
        console.log(`tipo post in gestione: ${typeI.value}`);
        //se si vuole salvare una nota viene cercato il simbolo [todo]
        if(typeI.value == 0){//!!!NOTA!!! --> modificare per avere un array di più to-do obj
            todos_data = check_for_todo(post.value);
            todo_objs = create_todo_obj(todos_data);
        }*/
        //payload per il salvataggio del post di base
        console.log("tolgo i todo dal corpo della nota");
        //console.log(`il primo todo inizia all'indice: ${start_todo_index} e l'ultimo todo finisce all'indice: ${final_todo_index}`);
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
        console.log(`Main post obj:\n${newPost}`);
        var res = await axios.post(`${api_url}compose`,newPost);
        console.log("prima richiesta riuscita");

        var promises = [];
        //getione creazione to-do trovato dentro al corpo di una nota 
        /*if(todo_objs.length > 0){
            //se si stava creando una nuova nota allora il server restituirà il messaggio per l'aggiunta di un to-do
            if(res.data.message == "Add todo children"){

                console.log("Aggiungo il todo creato nella nota che ha id: ",res.data.id);
                for(let t of todo_objs){
                    t.parent_id = res.data.id;  //viene aggiunto l'ID della nota "padre"
                    console.log(t);
                    promises.push(await axios.post(`${api_url}compose`,t));
                }
                var r = await Promise.all(promises);
                
            }else if(res.data.message == "Modify todo children"){
                //se si stava modificando una nota il server restiuirà il messaggio per la modifica dei to-do con la lista degli ID
                //la parte commentata è la gestione del caso in cui durante la modifica della nota venga cancellato un to-do
                //in questo caso vengono cancellati tutti i to-do creati in origine dalla nota e poi vengono salvati quelli ancora presenti
                console.log(todo_objs.length);
                console.log(res.data.t_child.length);
                if(res.data.t_child.length > todo_objs.length){
                    console.log("TODO ELIMINATO DALLA NOTA");
                    for(let child of res.data.t_child){
                        promises.push(await axios.post(`${api_url}todos/delete`,{ID: child}));
                    }
                    await Promise.all(promises);
                    promises = [];
                    for(let t of todo_objs){
                        t.parent_id = res.data.parent_id;
                        promises.push(await axios.post(`${api_url}compose`,t));
                    }
                    await Promise.all(promises);
                }else{
                    //se invece vengono solo modificati i to-do allora si invia una richiesta di modifica del to-do, questo avviene grazie al salvataggio dell'ID del to-do nel payload
                    //queseta operazione viene svolta con un ciclo perchè l'idea era quella di poter creare più to-do dentro ad una nota ma per ora il tutto è stato testato con un solo to-do
                    for(let i=0;i<res.data.t_child.length;i++){
                        todo_objs[i].ID = res.data.t_child[i];
                        promises.push(await axios.post(`${api_url}compose`,todo_objs[i]));
                    }
                    var r = await Promise.all(promises);
                }
            }
        }*/
        router.push({path: "/showNote"});
    }

    function uploadToModify(){
        if(sent_to_modify.value.el_type == "Todo"){
            title.value = sent_to_modify.value.heading;
            post.value = sent_to_modify.value.tasks.join("\n");
            tags.value = sent_to_modify.value.tags.join(",");
            place.value = sent_to_modify.value.place;
            publicCheck.value = sent_to_modify.value.public;
            typeI.value = 1;
        }else{
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
                console.log("Error while searching for friends: ",error);
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
