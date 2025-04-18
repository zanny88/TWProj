import { createApp, createSSRApp, VueElement, ref, provide } from 'vue';
import App from './App.vue';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import '../node_modules/bootstrap/dist/js/bootstrap';
import router from './routes';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { BIconPlayFill, BIconHourglassSplit, BIconCheckCircle, BIconXCircle } from "bootstrap-icons-vue";
import { createPinia } from 'pinia';



const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia);

const loggedIn = ref();
app.provide('loggedIn', loggedIn);

const api_url = "http://localhost:3000/";
//const api_url = "http://192.168.1.196:3000/";
//const api_url = "https://site232415.tw.cs.unibo.it/"; [PER IL DISI] cambiare url api
app.provide('api_url', api_url);

const pomodoro_sessions_api_url = `${api_url}pomodoro/sessions/`;
app.provide('pomodoro_sessions_api_url', pomodoro_sessions_api_url);

const notes_api_url = `${api_url}getNotes/`;
app.provide('notes_api_url', notes_api_url);

const token = ref(localStorage.getItem('token'));
app.provide('IDtoken', token);

app.component('VueDatePicker', VueDatePicker);

//Bootstrap Icons
app.component("BIconPlayFill", BIconPlayFill);
app.component("BIconHourglassSplit", BIconHourglassSplit);
app.component("BIconCheckCircle", BIconCheckCircle);
app.component("BIconXCircle", BIconXCircle);

app.mount('#app');
