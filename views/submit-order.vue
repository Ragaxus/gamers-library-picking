<script>
import { axios as _axios2 } from "axios" // the reference to axios shows up as _axios2 on the client, idk why
import OrderEntry from "../components/OrderEntry.vue"


export default {
    data: function () {
        return {
            order: {
                customer_name: "",
                cards: [],
                comment: ""
            },
            new_item: {
                new_item_quantity: 0,
                new_item_name: ""
            },
            card_names: [],
            mass_entry: ''
        } // Overwritten by renderVue in routes file 
    },
    components: { OrderEntry: OrderEntry },
    mounted: function () {
        var names = this.card_names;
        var new_item = this.new_item;
        $("#new-item-name").autocomplete({
            minLength: 3,
            select: function( event, ui ) {
                new_item.new_item_name = ui.item.value;
            },
            source: function(req, respCallback) {
                const results = fuzzysort.go(req.term, names, { limit: 5, threshold: -100 })
                .map(r => r.target);
                respCallback(results);
            } 
        });
    },
    
    computed: {
        orderIsInvalid() {
            if (this.order.customer_name === "") return true;
            if (this.order.cards.length < 1) return true;
            return false;
        }
    },
    methods: {
        addItem(event) {
            if (this.new_item.new_item_name != "") {
                var new_item = {
                    quantity: this.new_item.new_item_quantity,
                    name: this.new_item.new_item_name
                }
                if (new_item.quantity < 1) new_item.quantity = 1;
                this.order.cards.push(new_item);
                this.new_item.new_item_quantity = "";
                this.new_item.new_item_name = "";
                document.getElementById("new-item-quantity").focus();
            }
        },
        deleteItem(itemIdx) {
            this.order.cards.splice(itemIdx, 1);
        },
        submit() {
            axios.post('/order', this.order).then(res => {
                alert("Submitted");
                this.order.cards = [];
                this.order.name = "";
            });
        },
        massEntry() {
            var entriesAsText = this.mass_entry.split("\n");
            const re = /((\d+) )?(.*)/
            var entries = entriesAsText.map(e => {
                console.log(e);
                var found = e.match(re);
                if (found) {
                    var quantity = found[2];
                    if (!quantity) quantity = 1;
                    var entered_name = found[3];
                    const name = fuzzysort.go(entered_name, this.card_names, { limit: 1, threshold: -100 })
                    .map(r => r.target)[0];
                    return {quantity, name};
                }
                else { return null; }
            }).filter(e => e !== null);
            this.order.cards.push.apply(this.order.cards, entries);
            this.mass_entry = "";
        }
    }
}
</script>

<template>
    <div id="submit-order">
        <h1>Submit Order</h1>
        <label for="customer-name">Customer Name: </label>
        <input type="text" name="customer-name" v-model="order.customer_name" />
        <order-entry v-for="(entry, index) in order.cards" :key="index" :id="index" :quantity="entry.quantity"
            :name="entry.name" @delete-entry="deleteItem"> </order-entry>
        <div id="newItem">
            <input id="new-item-quantity" size="2" @keyup.enter="addItem" v-model="new_item.new_item_quantity" />
            <input id="new-item-name" @keyup.enter="addItem" v-model="new_item.new_item_name" />
            <button @click="addItem" :disabled='this.new_item_name == ""'>+</button>
        </div>
        <div id="massEntry">
            <textarea id="txtMassEntry" v-model="mass_entry"></textarea>
            <button @click="massEntry"> Process </button>
        </div>
        <div id="comment">
            <label for="comment">Additional notes: </label>
            <textarea id="txtComment" v-model="order.comment"></textarea>
        </div>
        <button @click="submit" :disabled=orderIsInvalid>Submit Order</button>
        <a href="/view-orders"> View existing orders</a>
    </div>
</template>

<style>
div.newItem {
    display: inline;
}
</style>