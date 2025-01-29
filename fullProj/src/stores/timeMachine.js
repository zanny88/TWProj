import { defineStore } from 'pinia';
import { inject } from 'vue';
import dayjs from 'dayjs';
import axios from 'axios';
const api_url = 'http://localhost:3000/';

export const useTimeMachineStore = defineStore('timeMachine', {
    state: () => ({
        currentTime: dayjs(), // Initialize with the current date and time
    }),
    actions: {
        async setTime(newTime) {
            this.currentTime = dayjs(newTime);
            await axios.post(`${api_url}setTime`,{u: atob(localStorage.getItem('token').split('.')[1]),time: this.currentTime.toISOString()});
        },
        async resetTime() {
            this.currentTime = dayjs();
            await axios.post(`${api_url}setTime`,{u: atob(localStorage.getItem('token').split('.')[1]),time: this.currentTime.toISOString()});
        },
    },
    getters: {
        getCurrentTime: (state) => state.currentTime,
    },
});