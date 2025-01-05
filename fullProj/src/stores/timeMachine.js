import { defineStore } from 'pinia';
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
            await axios.get(`${api_url}setTime?time=${this.currentTime.toISOString()}`);
        },
        async resetTime() {
            this.currentTime = dayjs();
            await axios.get(`${api_url}setTime?time=${this.currentTime.toISOString()}`);
        },
    },
    getters: {
        getCurrentTime: (state) => state.currentTime,
    },
});