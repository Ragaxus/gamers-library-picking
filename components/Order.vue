<script>
export default {
  props: ['info'],
  methods: {
  }
}
</script>

<template>
  <div class="order-view">
    <div :class="'order-view-header status-' + info.status">
        <span>{{ info.customer_name }} {{ info.created_date }}</span>
        <span>{{ info.status}}</span>
    </div>
  <li v-for="card in info.cards"> {{ card }} </li>
  </div>
</template>

<style>
div.status-picked {
    background: #000;
    color: #fff;
}

div.status-new {
    background: lightblue;
}

</style>
