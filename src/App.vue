<template>
  <div id="app">
    <NavBar />
    <DashBoard />
  </div>
</template>

<script>
import DashBoard from './components/DashBoard.vue';
import NavBar from './components/NavBar.vue';

export default {
  components: {
    DashBoard,
    NavBar
  },
};
</script>
