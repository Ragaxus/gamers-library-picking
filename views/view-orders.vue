<script>
import { axios as _axios2 } from "axios" // the reference to axios shows up as _axios2 on the client, idk why
import Order from "../components/Order.vue"

export default {
    data: function () {
        return {
            orders: [],
            search_criteria: {
                showInactiveOrders: false
            }
        }
    },
    components: { Order: Order },
    methods: {
        updateOrderInfo(_id, order_info) {
            axios.put(`/order/${_id}`, order_info);
        },
        search() {
            var vue = this;
            console.log(this.search_criteria)
            axios.get(`/order`, { params: this.search_criteria }).then(function (response) {
                console.log(response.data)
                vue.orders = response.data;
            });
        }
    }
}
</script>

<template>
    <div id="vue-view-orders">
        <div class="search-bar">
            <input id="show-inactive" v-model="search_criteria.showInactiveOrders" type="checkbox" />
            <label for="show_inactive">Show sold and cancelled orders</label>
            <button @click="search">Search</button>
        </div>
        <div class="order-list">
            <Order v-for="(order, index) in orders" :key="index" :info="order" :id="index"
                @update-order-info="updateOrderInfo"></Order>
        </div>
    </div>
</template>

<style>
div.order-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>