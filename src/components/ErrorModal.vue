<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal">
      <h3>Xatolik</h3>
      <p>{{ message }}</p>
      <button @click="$emit('close')">Yopish</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    show: Boolean,
    message: String
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
}
.modal {
  background: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 400px;
  text-align: center;
}
button {
  margin-top: 10px;
}
</style>