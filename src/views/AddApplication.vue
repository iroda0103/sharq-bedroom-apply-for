<template>
    <div class="apply">
        <Form>  </Form>
    </div>
</template>

<script>
import Form from '../components/Form.vue'

export default {
    name: 'AddApplication',
    components: {
        Form
    }
}
</script>

<style>
#apply {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    /* margin-top: 60px; */
}

.apply {
    position: relative;
    position: relative;
    /* padding: 130px 0; */
    height: 100%;
    width: 100%;
}

.apply {
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
