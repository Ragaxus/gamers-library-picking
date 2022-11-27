<script>
import Order from "../components/Order.vue"

export default {
    data: function () {
        return {}
    },
    components: {Order: Order}
}
</script>

<template>
    <div id="vue-view-orders">
        <Order v-for="(order,index) in orders" :key="index" :info="order"> </Order>
    </div>
</template>