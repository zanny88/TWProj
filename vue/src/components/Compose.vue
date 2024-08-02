<template>
    <h1>Compose</h1>
    <form action="">
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
                    <input type="text" v-model="title" class="form-control" id="notetitle" required/>
                    <label for="notetitle" id="titleLabel">Title</label>
                </div>
            </div>
        </div>
        <div class="row" style="position: relative; justify-content: center; align-items: center;">
            <div class="col-lg-4 col-md-4 col-sm-4">
                <div class="form-floating">
                    <textarea v-model="post" class="form-control" placeholder="Write note here" id="textArea" style="height: 100px;" wrap="off" required></textarea>
                    <label for="textArea">{{ insertType[typeI] }}</label>
                </div>
            </div>
        </div>
        <div class="row" style="position: relative; align-items: center; justify-content: center;">
            <div class="col-lg-4 col-md-4 col-sm-4">
                <div class="form-floating">
                    <textarea v-model="tags" class="form-control" placeholder="Write tags" id="tagsArea" required></textarea>
                    <label for="tagsArea">Tags</label>
                </div>
            </div>
        </div>
        <div class="row" style="position: relative; justify-content: center; align-items: center;">
            <div class="col-lg-4 col-md-4 col-sm-4">
                <div class="form-floating">
                    <input type="text" v-model="place" class="form-control" id="placeArea" required/>
                    <label for="placeArea">Place</label>
                </div>
            </div>
        </div>
        <div class="row" style="position: relative; justify-content: center; align-items: center;">
            <div class="cool-lg-4 col-md-4 col-sm-4" style="position: relative; text-align: center;">
                <button type="button" class="btn btn-outline-info" style="margin-top: 10px;" id="publishB" @click.prevent="submit">Publish</button>
            </div>
        </div>
    </form>
</template>

<script setup>
    import {ref,onMounted} from "vue";
    import axios from 'axios';
    import {useRouter,useRoute} from "vue-router";
    const api_url = "http://localhost:3000/";
    const router = useRouter();//oggetto utilizzato per spostarsi tra i diversi componenti
    const route = useRoute();//oggetto utilizzato per utilizzare i dati passati come payload da un altro componente (funzione note_modify in Note.vue)
    var sent_to_modify = ref(null);//oggetto dove viene salvato il post da modificare quando viene richiesta una modifica

    //variabili collegate ai diversi tag input con v-modal per ottenere il valore inserito nel tag
    var typeI = ref(0);
    var title = ref('');
    var post = ref('');
    var tags = ref('');
    var place = ref('');
    var publicCheck = ref(false);
    var insertType = ref(["Note","To do list, put only one task for line"]);//array utilizzato per il display delle informazioni del tipo di post che si vuole salvare
    //viene utilizzato ref perchè per accedere agli elementi si utilizza come indice typeI altra variabile ref che può cambiare durante la visualizzazione del componente

    //funzione per cercare la parte della nota, se presente, dove si è indicato di voler creare un to-do con il simbolo [todo]
    //calcola l'indice di inizio e fine della zona del to-do ed estrae la sottostringa dal corpo della nota
    //la sottostringa del to-do non viene tolta dal corpo della nota
    function check_for_todo(text){
        var result = null;
        if(text.toLowerCase().includes("[todo]")){
            const firstTodoIndex = text.indexOf("[todo]");
            const secondTodoIndex = text.indexOf("[todo]", firstTodoIndex + 1);

            if (firstTodoIndex !== -1 && secondTodoIndex !== -1) {
                const startIndex = firstTodoIndex + "[todo]".length;
                const endIndex = secondTodoIndex;

                result = text.substring(startIndex, endIndex).trim();
            } else {
                console.log("Non è stato possibile trovare entrambi i tag [todo].");
            }
        }
        return result;
    }

    //funzione per la creazione del payload per la richiesta di creazione del to-do trovato all'interno della nota
    function create_todo_obj(data){
        var addTodo = null;
        if(data){
            var tasks = data.split("\n").map(task => task.trim()).filter(item => item != "");
            addTodo = {
                ID: null,
                parent_id: null,
                heading: tasks.shift(),
                content: tasks.join("\n"),
                tags: tags.value,
                place: place.value,
                public: publicCheck.value,
                post_type: 1,
                todo_children: false
            }
        }
        return addTodo;
    }

    //funzione di submit per il salvataggio del post
    async function submit(){
        var todo_data = null;
        var todo_obj = null;
        //se si vuole salvare una nota viene cercato il simbolo [todo]
        if(typeI.value == 0){//!!!NOTA!!! --> modificare per avere un array di più to-do obj
            todo_data = check_for_todo(post.value);
            todo_obj = create_todo_obj(todo_data);
        }
        //payload per il salvataggio del post di base 
        const newPost = {
            ID: sent_to_modify.value != null ? sent_to_modify.value._id : null,//se si stava modificando un post già esistente viene aggiunto l'ID di questo 
            parent_id: null,
            heading: title.value,
            content: post.value,
            tags: tags.value,
            place: place.value,
            public: publicCheck.value,
            post_type: typeI.value,
            todo_children: todo_obj != null
        };
        var res = await axios.post(`${api_url}compose`,newPost);

        var promises = [];
        //getione creazione to-do trovato dentro al corpo di una nota 
        if(todo_obj != null){
            //se si stava creando una nuova nota allora il server restituirà il messaggio per l'aggiunta di un to-do
            if(res.data.message == "Add todo children"){
                console.log("Aggiungo il todo creato nella nota che ha id: ",res.data.id);
                todo_obj.parent_id = res.data.id;//viene aggiunto l'ID della nota "padre"
                console.log(todo_obj);
                res = await axios.post(`${api_url}compose`,todo_obj);
            }else if(res.data.message == "Modify todo children"){
                //se si stava modificando una nota il server restiuirà il messaggio per la modifica dei to-do con la lista degli ID
                //la parte commentata è la gestione del caso in cui durante la modifica della nota venga cancellato un to-do
                //in questo caso vengono cancellati tutti i to-do creati in origine dalla nota e poi vengono salvati quelli ancora presenti
                /*if(res.data.t_child.length < arrTodo.length){
                    var i = 0;
                    for(child in res.data.t_child){
                        promises.push(await axios.post(`${api_url}todos/delete`,{ID: child}));
                    }
                    await Promise.all(promises);
                    promises = [];
                    for(child in res.data.t_child){
                        arrTodo[i].parent_id = res.data.parent_id;
                        promises.push(await axios.post(`${api_url}compose`,arrTodo[i]));
                        i += 1;
                    }
                    await Promise.all(promises);
                }*/
                console.log("aggiungo l'ID del to-do da modificare al'oggetto");
                console.log(`lista degli ID dei to-do figli della nota da modificare: ${res.data.t_child}`);
                //se invece vengono solo modificati i to-do allora si invia una richiesta di modifica del to-do, questo avviene grazie al salvataggio dell'ID del to-do nel payload
                //queseta operazione viene svolta con un ciclo perchè l'idea era quella di poter creare più to-do dentro ad una nota ma per ora il tutto è stato testato con un solo to-do
                for(child in res.data.t_child){
                    todo_obj.ID = child;
                    promises.push(await axios.post(`${api_url}compose`,todo_obj));
                }
                var r = await Promise.all(promises);
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
            typeI = 1;
        }else{
            title.value = sent_to_modify.value.heading;
            post.value = sent_to_modify.value.content;
            tags.value = sent_to_modify.value.tags.join(",");
            place.value = sent_to_modify.value.place;
            publicCheck.value = sent_to_modify.value.public;
            typeI = 0;
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