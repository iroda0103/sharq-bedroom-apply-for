<template>
  <div class="app">

    <HelloWorld msg="Welcome to Your Vue.js App" />

  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* margin-top: 60px; */
}

.app {
  position: relative;
  position: relative;
  /* padding: 130px 0; */
  height: 100%;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

main {
  flex: 1;
}

.logo {
  width: 250px;
  color: #000;
  margin-bottom: 20px;

}

header {
  /* background: linear-gradient(to right, #00455ede, #1b6ae9ee); */
  padding: 1rem;
  text-align: center;
}
</style>
