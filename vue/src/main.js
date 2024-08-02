import {createApp, createSSRApp, VueElement,ref} from 'vue';
import App from './App.vue';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import '../node_modules/bootstrap/dist/js/bootstrap';
import router from './routes';


const app = createApp(App);

app.use(router);

const loggedIn = ref();
app.provide('loggedIn',loggedIn);

app.mount('#app');