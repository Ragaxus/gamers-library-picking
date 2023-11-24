<script>
import Order from "../components/Order.vue"
import PickLocations from "../components/PickLocations.vue"

export default {
    data: function () {
        return {
            search_criteria: {
                showInactiveOrders: false
            },
            display_criteria: "",
            pick_all: false,
            showOrders: false
        }
    },
    components: {
        Order: Order,
        PickLocations: PickLocations
    },
    props: ["orders", "displaycriteria", "cardnames"],
    mounted() {
        this.display_criteria = this.displaycriteria;
    },
    computed: {
        ordersToPick() {
            if (!this.orders) return [];
            return this.orders
                .filter(order => order.toPick && this.shouldDisplayOrder(order));
        },
        cardsPicked() {
            if (!this.orders) return [];
            var cards = this.orders
                .filter(order => order.toPick)
                .map(order => order.cards_found)
                .flat();

            var picked_dict = cards.reduce((acc, card) => {
                let name = card.name;
                if (!(name in acc)) { acc[name] = card.quantity; }
                else { acc[name] += card.quantity; }
                return acc;
            }, {});

            return picked_dict;
        }
    },
    methods: {
        shouldDisplayOrder(order_info) {
            if (this.display_criteria == "all") return true;
            else return (this.display_criteria == order_info.status);
        },
        updateOrderInfo(_id, order_info) {
            this.axios.put(`/api/order/${_id}`, order_info)
                .then(resp => {
                    this.$refs.pickLocations.confirmUpdate();
                });
        },
        updatePicks(_id) {
            let order = this.orders.find(order => order._id == _id);
            this.$set(order, "toPick", !order.toPick);
        },
        modifyFound(cardName, amount) {
            let activeOrders = this.orders.filter(order => order.toPick == true);

            var orderToUpdate;
            if (amount < 0) {
                activeOrders.reverse();
                orderToUpdate = activeOrders.find(order => order.cards_found.some(card => card.name == cardName));
            }
            else {
                orderToUpdate = activeOrders.find(order => {
                    let cardOrderLine = order.cards.find(card => card.name == cardName);
                    if (cardOrderLine == null) return false;
                    let quantityOfNameOrdered = cardOrderLine.quantity;
                    let cardsOfNameFoundForOrder = order.cards_found.find(foundEntry => foundEntry.name == cardName);
                    if (cardsOfNameFoundForOrder != null && cardsOfNameFoundForOrder.quantity >= quantityOfNameOrdered) return false;
                    return true;
                });
            }
            if (orderToUpdate) {
                if (!orderToUpdate.cards_found) { Vue.set(orderToUpdate.cards_found, 0, { name: cardName, quantity: amount }); }
                else {
                    let existing_card_found_idx = orderToUpdate.cards_found.findIndex(card_found => card_found.name == cardName);
                    if (existing_card_found_idx == -1) {
                        orderToUpdate.cards_found.push({ name: cardName, quantity: amount });
                    }
                    else {
                        let existing_card_found = orderToUpdate.cards_found[existing_card_found_idx];
                        existing_card_found.quantity += amount;
                        if (existing_card_found.quantity == 0) {
                            orderToUpdate.cards_found.splice(existing_card_found_idx, 1);
                        }
                    }
                }
                this.updateOrderInfo(orderToUpdate._id, orderToUpdate);
                this.$forceUpdate();
            }
        },
        search() {
            var vue = this;
            vue.showOrders = false;
            this.axios.get(`/api/order`, { params: this.search_criteria }).then(function (response) {
                vue.orders = response.data;
                vue.showOrders = true;
            });
        },
        toggleAllVisibleOrders() {
            this.orders.forEach(order => {
                if (this.shouldDisplayOrder(order)) {
                    this.$set(order, "toPick", this.pick_all)
                }
            });
        },
        shouldShowPickLocations() {
            return this.ordersToPick.length > 0;
        }
    },
    watch: {
        orders(newOrders, oldOrders) {
            if (newOrders.length > 0) {
                this.showOrders = true;
            }
        }
    }
}
</script>

<template>
    <b-tabs content-class="mt-3" id="vue-view-orders">
        <b-tab title="Orders" id="view-orders">
            <div class="search-bar">
                <input id="show-inactive" v-model="search_criteria.showInactiveOrders" type="checkbox" />
                <label for="show-inactive">Show sold and cancelled orders</label>
                <button @click="search">Search</button>
            </div>
            <div class="display-options">
                <input type="radio" v-model="display_criteria" value="placed" />Placed orders
                <input type="radio" v-model="display_criteria" value="picked" />Picked orders
                <input type="radio" v-model="display_criteria" value="contacted" />Contacted orders
                <input type="radio" v-model="display_criteria" value="all" />All orders
            </div>
            <input type="checkbox" v-model="pick_all" @change="toggleAllVisibleOrders" /> Set picking for all orders
            <div v-if="!this.showOrders" class="text-center m-5">
                <b-spinner></b-spinner>
            </div>
            <div v-if="this.showOrders" class="order-list">
                <Order v-for="(order, index) in orders" v-if="shouldDisplayOrder(order)" :key="index" :info="order"
                    :id="index" :card-names="cardnames" @update-order-info="updateOrderInfo" @update-picks="updatePicks">
                </Order>
            </div>
        </b-tab>
        <b-tab title="Pick Locations" :disabled="!shouldShowPickLocations()" id="pick-locations">
            <pick-locations :orderstopick="ordersToPick" :cardspicked="cardsPicked" @modify-picked="modifyFound"
                ref="pickLocations"></pick-locations>
        </b-tab>
    </b-tabs>
</template>

<style>
div.order-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>