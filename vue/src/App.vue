<template>
  <navbar></navbar>
  <router-view></router-view>
</template>

<script>
import Home from './components/Home.vue';
import Navbar from './components/Navbar.vue';

export default {
  name: 'App',
  components: {
    Navbar,
    Home
  }
}
</script>

