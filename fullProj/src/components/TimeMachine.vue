<template>
    <div class="time-machine">
        <div>
            <label for="time-input">Set Time:</label>
            <input id="time-input" type="datetime-local" v-model="newTime" @change="updateTime" />
        </div>
        <button @click="resetTime">Reset Time</button>
        <div>Current Time: {{ currentTime }}</div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTimeMachineStore } from '../stores/timeMachine';

const timeMachineStore = useTimeMachineStore();
const newTime = ref(timeMachineStore.getCurrentTime.format('YYYY-MM-DDTHH:mm'));

const updateTime = () => {
    timeMachineStore.setTime(newTime.value);
};

const resetTime = () => {
    timeMachineStore.resetTime();
    newTime.value = timeMachineStore.getCurrentTime.format('YYYY-MM-DDTHH:mm');
};

const currentTime = computed(() => timeMachineStore.getCurrentTime.format('YYYY-MM-DD HH:mm:ss'));
</script>

<style scoped>
.time-machine {
    position: fixed;
    bottom: 10px;
    right: 10px;
    background-color: white;
    border: 1px solid #ccc;
    padding: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
}
</style>