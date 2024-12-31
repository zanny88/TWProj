<template>
    <div class="time-machine" 
    :class="{ 'expanded d-flex flex-column align-items-center gap-3': expanded, 'collapsed': !expanded }">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">

        <button id="show-hide-btn" class="p-1" @click="toggleExpanded" :disabled="disabled">
            {{ expanded ? 'HIDE' : 'TIME MACHINE' }}
        </button>
        <div v-if="expanded" class="d-flex flex-column align-items-center gap-3">
                <div>
                    <label for="time-input">GO TO:&nbsp;</label>
                    <input id="time-input" type="datetime-local" v-model="newTime" @change="updateTime" />
                </div>
                <button @click="resetTime">RESET TO REAL TIME</button>
                <div>CURRENT TIME: {{ currentTime }}</div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTimeMachineStore } from '../stores/timeMachine';

const timeMachineStore = useTimeMachineStore();
const newTime = ref(timeMachineStore.getCurrentTime.format('YYYY-MM-DDTHH:mm'));
const expanded = ref(false);
const disabled = ref(false);

const toggleExpanded = () => {
    expanded.value = !expanded.value;
};

const updateTime = () => {
    timeMachineStore.setTime(newTime.value);
};

const resetTime = () => {
    timeMachineStore.resetTime();
    newTime.value = timeMachineStore.getCurrentTime.format('YYYY-MM-DDTHH:mm');
};

const currentTime = computed(() => timeMachineStore.getCurrentTime.format('YYYY-MM-DD HH:mm:ss'));

// Expose a method to set expanded to false
const setExpanded = (value) => {
    expanded.value = value;
};

const setDisabled = (value) => {
    disabled.value = value;
};

defineExpose({ setExpanded, setDisabled });
</script>

<style scoped>
.time-machine {
    z-index: 1001;
    position: fixed;
    bottom: 10px;
    right: 10px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 10px;
    font-family: 'Montserrat', sans-serif;
    text-transform: uppercase;
}

.expanded {
    background-color: #fff;
    padding: 2em;
}

.collapsed {
    background-color: transparent;
    border: none;
}

.time-machine.disabled {
    pointer-events: none;
    opacity: 0.5;
}
</style>