import {createApp, createSSRApp, VueElement} from 'vue';
import App from './App.vue';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import '../node_modules/bootstrap/dist/js/bootstrap';
import router from './routes';


const app = createApp(App);

app.use(router);

app.mount('#app');