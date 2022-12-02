<script>
import { axios as _axios2 } from "axios" // the reference to axios shows up as _axios2 on the client, idk why
import Order from "../components/Order.vue"

export default {
    data: function () {
        return {
            orders: [],
            search_criteria: {
                showSoldOrders: false
            }
        }
    },
    components: { Order: Order },
    methods: {
        updateStatus(_id, new_status) {
            axios.put(`/order/${_id}`, { "status": new_status });
        },
        search() {
            var vue = this;
            console.log(this.search_criteria)
            axios.get(`/order`, {params: this.search_criteria}).then(function (response) {
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
            <input v-model="search_criteria.showSoldOrders" type="checkbox">Show sold orders</input>
            <button @click="search">Search</button> 
        </div>
        <div class="order-list">
            <Order v-for="(order, index) in orders" :key="index" :info="order" :id="index"
                @update-status="updateStatus"></Order>
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