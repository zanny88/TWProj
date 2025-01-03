<template>
    <div class="container">
        <div class="layout-row">
            <div class="col-3 colonna">
                <div class="cerchio">
                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" class="bi bi-person" viewBox="0 0 16 16">
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                    </svg>
                </div>
                <div class="row" style="display: flex; flex-direction: row; align-items: center; width: 100%;">
                    <div style="display: flex; justify-content: center; align-items: center; padding-top: 15px; padding-bottom: 10px; border-bottom: 2px solid lightgray; text-align: center; width: 100%; gap: 10px;">
                        <h5 style="margin: 0;">{{ username }}</h5>
                        <p style="margin: 0;">amici: {{ friend_number }}</p>
                    </div>
                </div>

                <div class="row" style="display: flex; flex-direction: row; align-items: center; padding: 10px;">
                    <router-link class="nav-link" to="/inbox">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div v-html="inbox_icon"></div>
                            <h5 style="margin: 0;">Inbox</h5>
                        </div>
                    </router-link>
                </div>
                <div class="row" style="display: flex; flex-direction: row; align-items: center; padding: 10px;">
                    <router-link class="nav-link" :to="{ path: '/addFriend', query: { action: 'add' } }">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-person-fill-add" viewBox="0 0 16 16">
                                <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0m-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                                <path d="M2 13c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4"/>
                            </svg>
                            <h5 style="margin: 0;">Add Friend</h5>
                        </div>
                    </router-link>
                </div>
                <div class="row" style="display: flex; flex-direction: row; align-items: center; padding: 10px;">
                    <router-link class="nav-link" :to="{ path: '/addFriend', query: { action: 'remove' } }">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-person-fill-dash" viewBox="0 0 16 16">
                                <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M11 12h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1m0-7a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                                <path d="M2 13c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4"/>
                            </svg>
                            <h5 style="margin: 0;">Remove Friend</h5>
                        </div>
                    </router-link>
                </div>
            </div>
            <div class="col-9">
                <router-view></router-view>
            </div>
        </div>
    </div>
</template>
<script setup>
    import { inject, nextTick, ref, onMounted } from "vue";
    import axios from "axios";
    const api_url = inject('api_url');

    var token = localStorage.getItem('token');

    let username = atob(token.split('.')[1]);

    let friend_number = ref('');

    var inbox_icon = ref(`
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-inbox-fill" viewBox="0 0 16 16">
            <path d="M4.98 4a.5.5 0 0 0-.39.188L1.54 8H6a.5.5 0 0 1 .5.5 1.5 1.5 0 1 0 3 0A.5.5 0 0 1 10 8h4.46l-3.05-3.812A.5.5 0 0 0 11.02 4zm-1.17-.437A1.5 1.5 0 0 1 4.98 3h6.04a1.5 1.5 0 0 1 1.17.563l3.7 4.625a.5.5 0 0 1 .106.374l-.39 3.124A1.5 1.5 0 0 1 14.117 13H1.883a1.5 1.5 0 0 1-1.489-1.314l-.39-3.124a.5.5 0 0 1 .106-.374z"/>
        </svg>
    `);

    const handleNewMessage = (data) => {
        inbox_icon.value = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-inbox-fill" viewBox="0 0 16 16">
                <path d="M4.98 4a.5.5 0 0 0-.39.188L1.54 8H6a.5.5 0 0 1 .5.5 1.5 1.5 0 1 0 3 0A.5.5 0 0 1 10 8h4.46l-3.05-3.812A.5.5 0 0 0 11.02 4zm-1.17-.437A1.5 1.5 0 0 1 4.98 3h6.04a1.5 1.5 0 0 1 1.17.563l3.7 4.625a.5.5 0 0 1 .106.374l-.39 3.124A1.5 1.5 0 0 1 14.117 13H1.883a1.5 1.5 0 0 1-1.489-1.314l-.39-3.124a.5.5 0 0 1 .106-.374z"/>
                <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m.5-5v1.5a.5.5 0 0 1-1 0V11a.5.5 0 0 1 1 0m0 3a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"/>
            </svg>
        `;
    };

    const handleNoMessage = (data) => {
        inbox_icon.value = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-inbox-fill" viewBox="0 0 16 16">
                <path d="M4.98 4a.5.5 0 0 0-.39.188L1.54 8H6a.5.5 0 0 1 .5.5 1.5 1.5 0 1 0 3 0A.5.5 0 0 1 10 8h4.46l-3.05-3.812A.5.5 0 0 0 11.02 4zm-1.17-.437A1.5 1.5 0 0 1 4.98 3h6.04a1.5 1.5 0 0 1 1.17.563l3.7 4.625a.5.5 0 0 1 .106.374l-.39 3.124A1.5 1.5 0 0 1 14.117 13H1.883a1.5 1.5 0 0 1-1.489-1.314l-.39-3.124a.5.5 0 0 1 .106-.374z"/>
            </svg>
        `;
    }

    setInterval(async () => {
        if(token.value != null){
            var newMessage = await axios.get(`${api_url}user/checkInbox?user=${atob(token.value.split('.')[1])}`);
            if(newMessage.message){
                handleNewMessage();
            }else{
                handleNoMessage();
            }
        }
    },5000);


    async function friendNumber(){
        try{
            var r = await axios.get(`${api_url}user/info/${username}`);
            await nextTick();

            if(r && r.data && r.data.friends){
                console.log(r);
                friend_number.value = r.data.friends.length;
            }
        }catch(error){
            console.log("Errore (nel componente) durante il fetch dell'utente per le info");
            console.log(error);
        }
    }

    onMounted(() => {
        friendNumber();
    })
</script>
<style scoped>
.layout-row{
    display: flex;
}
.cerchio{
    display: flex;
    width: 100px;
    height: 100px;
    border-radius: 100%;
    background-color: lightgray;
    justify-content: center;
    align-items: center;
}
.colonna{
    width: 20%;
    min-width: 250px;
    position: fixed;
    display: flex;
    flex-direction: column;
    height: 100vh;
    justify-content: flex-start;
    align-items: center;
}

.col-9 {
    flex: 1;
    margin-left: 25%; 
    padding: 20px;
}
</style>