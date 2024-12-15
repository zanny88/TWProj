import { createApp, createSSRApp, VueElement, ref, provide } from 'vue';
import App from './App.vue';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import '../node_modules/bootstrap/dist/js/bootstrap';
import router from './routes';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import {
    BIconPlayFill
} from "bootstrap-icons-vue";


const app = createApp(App);

app.use(router);

const loggedIn = ref();
app.provide('loggedIn', loggedIn);

const api_url = "http://localhost:3000/";
//const api_url = "https://site232415.tw.cs.unibo.it/";
app.provide('api_url', api_url);

const pomodoro_sessions_api_url = `${api_url}pomodoro/sessions/`;
app.provide('pomodoro_sessions_api_url', pomodoro_sessions_api_url);

const notes_api_url = `${api_url}getNotes/`;
app.provide('notes_api_url', notes_api_url);

const token = ref(localStorage.getItem('token'));
app.provide('IDtoken',token);

app.component('VueDatePicker', VueDatePicker);

//Bootstrap Icons
app.component("BIconPlayFill", BIconPlayFill);

app.mount('#app');
