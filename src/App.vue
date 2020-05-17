<template>
  <div id="app">
    <Covid19PerDay msg="Covid19 cases per day"/>
  </div>
</template>

<script>
import Covid19PerDay from './components/Covid19PerDay.vue';

export default {
  name: 'App',
  components: {
    Covid19PerDay,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
