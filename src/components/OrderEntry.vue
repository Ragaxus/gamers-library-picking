<script>
export default {
  props: ['quantity', 'name', 'id', 'originalname'],
  methods: {
    deleteEntry() {
        this.$emit('delete-entry', this.id);
    }
  }
}
</script>

<template>
  <div class="order-entry">
  <span>{{ quantity }}</span> 
  <div class="order-entry-name">
    <span>{{ name }}</span>
    <span class="original-name" v-if="originalname != name">(customer entered: {{ originalname }})</span>
  </div>
  <button @click="deleteEntry">Delete</button>
  </div>
</template>

<style>
.order-entry {
  display: flex;
}
.order-entry-name {
  display: flex;
  flex-direction: column;
}
.original-name {
  font-size: 10px;
  font-style: italic;
  color: grey;
}
button {
  height: fit-content;
}
</style>
