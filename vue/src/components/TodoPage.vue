<template>
    <button @click.prevent="click">click</button>
</template>

<script setup>
import axios from 'axios';

    async function click(){
        await axios.get('http://localhost:3000/prova');
    }
</script>