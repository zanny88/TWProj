<template>
    <div id="header" style="display: flex; justify-content: space-between;">
        <h1>Todo Page</h1>
        <button type="button" class="btn btn-outline-info">
            <router-link to="/create">Add Todo</router-link>
        </button>
    </div>
    <div class="container col-lg-4 col-md-4 col-sm-12" style="position: relative; margin-left: auto; margin-right: auto;" id="todoContainer" v-if="isTodoLoaded">
        <div v-for="(todo,i) in Todos" @click="showTodo(i)" class="row" id="todoDiv" style="cursor: pointer; position: relative;">
            <Modal v-if="showModal[i]"><!--componente Modal.vue mostrato solo se il valore all'indice del to-do dentro a showModal è true-->
                <h5 id="todoTitle">{{ todo.heading }}</h5>
                <div class="container" id="tasksDiv">
                    <div v-for="(task,j) in todo.tasks" style="display: flex; justify-content: space-between; align-items: center;">
                        <div id="task${j}" style="flex-grow: 1;" :class="{'task-completed': todo.completed[j]}">{{ task }}</div>
                        <div class="task-actions" style="display: flex;">
                            <button type="button" class="btn task-icon" id="checkTask" @click="taskActions(todo._id,i,j,'check')">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16">
                                    <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>
                                </svg>
                            </button>
                            <button type="button" class="btn task-icon" id="deleteTask" @click="taskActions(todo._id,i,j,'delete')">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <p>
                    <small class="text-muted" id="by-where-when">
                        Written by {{ todo.user }} in {{ todo.place }} on {{ new Date(todo.date).toDateString() }}
                    </small>
                </p>
                <p>
                    <small class="text-muted" id="tags">
                        Tags: {{ todo.tags.map(tag => "#" + tag).join(' - ') }}
                    </small>
                </p>
                <button id="closeModal" @click.stop="closeTodo(i)">
                    Close
                </button>
            </Modal>
            {{ todo.heading }}
            <div style="z-index: 2; position: absolute; right: 0%; width: 40px;">
                <button class="btn" type="button" data-bs-toggle="dropdown" aria-expanded="false" @click.stop>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                    </svg><!--robe strane di bootstrap per l'icona dei tre puntini per il menù di azioni-->
                </button>
                <ul class="dropdown-menu">
                    <li class="dropdown-item" @click.stop="todo_modify(todo._id,i)">Modify to-do</li>
                    <li class="dropdown-item" @click.stop="todo_delete(todo._id,i)">Delete to-do</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup>
    import axios from "axios";
    import {computed,ref,nextTick,onMounted} from "vue";
    import Modal from './Modal.vue';
    import { useRouter } from "vue-router";

    const api_url = "http://localhost:3000/";
    const router = useRouter();

    var Todos = ref([]);
    var showModal = ref([])
    const isTodoLoaded = computed(() => Todos.value.length > 0);//stesso controllo come in NotePage.vue

    async function getTodos(){
        try{
            const r = await axios.post(`${api_url}getTodos/-1`);
            Todos.value = r.data;
            showModal.value = Todos.value.map(() => false);
            await nextTick();
        }catch(error){
            console.log("Error: ",error);
        }
    }

    function showTodo(i){
        showModal.value[i] = true;
    }

    function closeTodo(i){
        showModal.value[i] = false;
    }

    //le azioni di taskActions, todo_delete sul task/to-do vengono eseguite anche lato client (linee 102-107) per poter riscontrare la modifica anche lato client
    //credo si potrebbe ovviare richiedendo nuovamente i dati dei to-do dal server
    async function taskActions(t_id,todo_index,task_index,action){
        const payload = {
            todo_id: t_id,
            task_index: task_index
        };
        try{
            const r = axios.post(`${api_url}todos/tasks/${action}`,payload);
            
            if(action == 'check'){
                Todos.value[todo_index].completed[task_index] = true;
            }else{
                Todos.value[todo_index].tasks.splice(task_index,1);
                Todos.value[todo_index].completed.splice(task_index,1);
            }
            showModal.value[todo_index] = false;
            await nextTick();
        }catch(error){
            console.log("Error: ",error);
        }
    }

    async function todo_delete(todo_id,todo_index){
        const payload = {
            ID: todo_id
        }
        try{
            const r = await axios.post(`${api_url}Todos/delete`,payload);
            Todos.value.splice(todo_index,1);
            location.reload();
        }catch(error){
            console.log("Error: ",error);
        }
    }

    //uguale funzionamento di note_modify dentro a Note.vue
    async function todo_modify(todo_id){
        const get_payload = {
            ID: todo_id
        }
        const r = await axios.post(`${api_url}todos/get`,get_payload);
        var modify_payload = r.data[0];
        router.push({
            path: "/create",
            query: {data: JSON.stringify(modify_payload)}
        });
    }

    onMounted(async () => {
        await getTodos();
    })
</script>
<style scoped>
.task-completed{
    background-color: green;
}
.task-icon{
    margin-right: 2px;
    padding: 2px;
}
</style>