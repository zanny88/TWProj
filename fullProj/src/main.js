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
const loggedUser = ref();
app.provide('loggedUser', loggedUser);

const api_url = "http://localhost:3000/";
app.provide('api_url', api_url);

const pomodoro_sessions_api_url = `${api_url}pomodoro/sessions/`;
app.provide('pomodoro_sessions_api_url', pomodoro_sessions_api_url);

app.component('VueDatePicker', VueDatePicker);

//Bootstrap Icons
app.component("BIconPlayFill", BIconPlayFill);

app.mount('#app');
