<script>
import Order from "../components/Order.vue"
import PickLocations from "../components/PickLocations.vue"

export default {
    data: function () {
        return {
            orders: [],
            search_criteria: {
                showInactiveOrders: false
            }
        }
    },
    components: {
        Order: Order,
        PickLocations: PickLocations
    },
    computed: {
        cardsToPick() {
            return this.orders
                .filter(order => order.toPick)
                .map(order => order.cards)
                .flat();
        }
    },
    methods: {
        updateOrderInfo(_id, order_info) {
            axios.put(`/order/${_id}`, order_info);
        },
        updatePicks(_id, newPickStatus) {
            console.log("updating order ", _id, " to ", newPickStatus);
            let order = this.orders.find(order => order._id == _id);
            order.toPick = newPickStatus;
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
                @update-order-info="updateOrderInfo"
                @update-picks="updatePicks"></Order>
        </div>
        <pick-locations :cardstopick="cardsToPick"></pick-locations>
    </div>
</template>

<style>
div.order-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>