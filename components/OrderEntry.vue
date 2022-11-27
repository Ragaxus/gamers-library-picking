<script>
export default {
  props: ['quantity', 'name', 'id'],
  methods: {
    deleteEntry() {
        this.$emit('delete-entry', this.id);
    }
  }
}
</script>

<template>
  <div class="order-entry">
  <span>{{ quantity }} {{ name }}</span>
  <button @click="deleteEntry">Delete</button>
  </div>
</template>
