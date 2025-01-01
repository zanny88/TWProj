import { defineStore } from 'pinia';
import dayjs from 'dayjs';

export const useTimeMachineStore = defineStore('timeMachine', {
    state: () => ({
        currentTime: dayjs(), // Initialize with the current date and time
    }),
    actions: {
        setTime(newTime) {
            this.currentTime = dayjs(newTime);
        },
        resetTime() {
            this.currentTime = dayjs();
        },
    },
    getters: {
        getCurrentTime: (state) => state.currentTime,
    },
});