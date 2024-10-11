<template>
    <h1>Compose</h1>
    <div class="compose-container">
        <div class="form-container">
            <form @submit.prevent="submit">
                <div id="row" style="text-align: center;">
                    <label for="noteB">Note:</label>
                    <input type="radio" id="noteB" name="typeNote" value="note" checked @click="typeI = 0"/><!--@click indica l'azione da compiere quando il bottone viene cliccato, ovvero cambiare la visualizzazione della label per la textarea del body del post-->
                    <label for="todoB">ToDo:</label>
                    <input type="radio" id="todoB" name="typeNote" value="todo" @click="typeI = 1"/>
                    <label for="publicCheck">Public:</label>
                    <input type="checkbox" id="public" v-model="publicCheck"/>
                </div>
                <div class="row" style="position: relative; justify-content: center; align-items: center;">
                    <div class="col-lg-4 col-md-4 col-sm-4">
                        <div class="form-floating">
                            <input type="text" v-model="title" class="form-control" id="notetitle"/>
                            <label for="notetitle" id="titleLabel">Title</label>
                        </div>
                    </div>
                </div>
                <div class="row" style="position: relative; justify-content: center; align-items: center;">
                    <div class="col-lg-4 col-md-4 col-sm-4">
                        <div class="form-floating">
                            <textarea v-model="post" class="form-control" placeholder="Write note here" id="textArea" style="height: 100px; white-space: pre-wrap;" wrap="off" required></textarea>
                            <label for="textArea">{{ insertType[typeI] }}</label>
                        </div>
                    </div>
                </div>
                <div class="row" style="position: relative; align-items: center; justify-content: center;">
                    <div class="col-lg-4 col-md-4 col-sm-4">
                        <div class="form-floating">
                            <textarea v-model="tags" class="form-control" placeholder="Write tags" id="tagsArea"></textarea>
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
                <div class="row" style="position: relative; justify-content: center; align-items: center;">
                    <div class="col-lg-4 col-md-4 col-sm-4">
                        <div class="form-floating">
                            <input type="text" class="form-control" id="share" @input="searchFriend()" v-model="friendName"/>
                            <label for="share">Friends to share</label>
                        </div>
                    </div>
                </div>
                <div id="friends" v-if="friendName.length > 0 && friendsFound">
                    <div
                        v-for="(el,index) in friends"
                        :key = "index"
                    >
                        {{ el.name }}
                    </div>
                </div>
                <div class="row" style="position: relative; justify-content: center; align-items: center;">
                    <div class="cool-lg-4 col-md-4 col-sm-4" style="position: relative; text-align: center;">
                        <button type="submit" class="btn btn-outline-info" style="margin-top: 10px;" id="publishB" :disabled="!publishDisabled">Publish</button>
                    </div>
                </div>
            </form>
        </div>
        <div class="preview-container">
            <h2>Preview</h2>
            <div v-if="post.value !== ''" v-html="renderedContent" style="padding: 10px; border: 1px solid #ccc; border-radius: 5px;">

            </div>
        </div>
    </div>
</template>

<script setup>
    import {ref,onMounted,computed} from "vue";
    import axios from 'axios';
    import {useRouter,useRoute} from "vue-router";
    const api_url = "http://localhost:3000/";
    const router = useRouter();//oggetto utilizzato per spostarsi tra i diversi componenti
    const route = useRoute();//oggetto utilizzato per utilizzare i dati passati come payload da un altro componente (funzione note_modify in Note.vue)
    var sent_to_modify = ref(null);//oggetto dove viene salvato il post da modificare quando viene richiesta una modifica
    const user = atob(localStorage.getItem('token').split('.')[1]);

    //variabili collegate ai diversi tag input con v-modal per ottenere il valore inserito nel tag
    var typeI = ref(0);
    var title = ref('');
    var post = ref('');
    var tags = ref('');
    var place = ref('');
    var publicCheck = ref(false);
    var insertType = ref(["Note","To do list, put only one task for line"]);//array utilizzato per il display delle informazioni del tipo di post che si vuole salvare
    //viene utilizzato ref perchè per accedere agli elementi si utilizza come indice typeI altra variabile ref che può cambiare durante la visualizzazione del componente
    var friendName = ref('');
    var friendFound = ref(false);
    var friends = ref([]);

    var start_todo_index = 0;
    var final_todo_index = 0;

    function convertToHTML(data){
        return data
            .replace(/#+\s(.*?)(\n|$)/g, '<h1>$1</h1>') // Titoli
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')     // Grassetto
            .replace(/\*(.*?)\*/g, '<i>$1</i>')         // Corsivo
            .replace(/\n/g, '<br>');
    }

    const renderedContent = computed(() => {
        return convertToHTML(post.value);
    })

    const publishDisabled = computed(() => {
        return title.value && post.value && tags.value && place.value;
    })

    //funzione per cercare la parte della nota, se presente, dove si è indicato di voler creare un to-do con il simbolo [todo]
    //calcola l'indice di inizio e fine della zona del to-do ed estrae la sottostringa dal corpo della nota
    //la sottostringa del to-do non viene tolta dal corpo della nota
    function check_for_todo(text) {
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
    }

    //funzione di submit per il salvataggio del post
    async function submit(){
        var todos_data = null;
        var todo_objs = null;
        console.log(`tipo post in gestione: ${typeI.value}`);
        //se si vuole salvare una nota viene cercato il simbolo [todo]
        if(typeI.value == 0){//!!!NOTA!!! --> modificare per avere un array di più to-do obj
            todos_data = check_for_todo(post.value);
            todo_objs = create_todo_obj(todos_data);
        }
        //payload per il salvataggio del post di base
        console.log("tolgo i todo dal corpo della nota");
        console.log(`il primo todo inizia all'indice: ${start_todo_index} e l'ultimo todo finisce all'indice: ${final_todo_index}`);
        const newPost = {
            ID: sent_to_modify.value != null ? sent_to_modify.value._id : null,//se si stava modificando un post già esistente viene aggiunto l'ID di questo 
            parent_id: null,
            heading: title.value,
            content: post.value,
            tags: tags.value,
            place: place.value,
            public: publicCheck.value,
            post_type: typeI.value,
            todo_children: todo_objs.length > 0,
            author: user
        };
        console.log(`Main post obj:\n${newPost}`);
        var res = await axios.post(`${api_url}compose`,newPost);
        console.log("prima richiesta riuscita");

        var promises = [];
        //getione creazione to-do trovato dentro al corpo di una nota 
        if(todo_objs.length > 0){
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
        }
        router.push({path: "/"});
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
        }
       
    }

    async function searchFriend(){
        var friendPayload = {
            user: user,
            query: friendName.value,
            filter: "friends",
            friends: false
        }
        try{
            const r = await axios.post(`${api_url}search`,friendPayload);
            if(r.data.length > 0){
                friends.value = r.data.map(e => ({
                    name: e.name
                }));
                friendFound.value = true;
            }else{
                friends.value = [];
                friendFound.value = false;
            }
        }catch(error){
            console.log("Error while searching for friends: ",error);
            friendFound.value = false;
            friends.value = [];
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
    .compose-container{
        display: flex;
        flex-wrap: wrap;
    }
    .form-container, .preview-container{
        flex: 1;
        min-width: 300px;
        margin: 10px;
    }
    .preview-container{
        border-left: 1px solid #ccc;
        padding: 10px;
    }
</style>