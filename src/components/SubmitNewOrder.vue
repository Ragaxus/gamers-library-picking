<script>

import OrderEntry from "../components/OrderEntry.vue"
import CardNameInput from "../components/CardNameInput.vue"

export default {
    data: function () {
        return {
            order: {
                customer_name: "",
                contact_info: "",
                cards: [],
                comment: ""
            },
            new_item: {
                new_item_quantity: 0,
                new_item_name: ""
            },
            mass_entry: ''
        }
    },
    components: { 
        OrderEntry: OrderEntry,
        CardNameInput: CardNameInput,
    },
    props: ["cardnames", "existingOrder"],
    mounted: function () {
        if (this.existingOrder) this.order = this.existingOrder;
        var names = this.cardnames;
        var new_item = this.new_item;

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
                let original_name = this.new_item.new_item_name;
                var new_item = {
                    quantity: this.new_item.new_item_quantity,
                    name: this.findCorrectedName(original_name),
                    original_name: original_name
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
            this.$emit('new-order', this.order);
            if (this.existingOrder) {
                this.order = this.existingOrder;
            }
            else {
                this.order.cards = [];
                this.order.name = "";
                this.customer_name = "";
            }
            this.$emit('close');
        },
        findCorrectedName(entered_name) {
            return fuzzysort.go(entered_name, this.cardnames, { limit: 1 })
                .map(r => r.target)[0];
        },
        massEntry() {
            var entriesAsText = this.mass_entry.split("\n");
            const re = /((\d+) )?(.*)/
            var entries = entriesAsText.map(e => {
                var found = e.match(re);
                if (found) {
                    var quantity = found[2];
                    if (!quantity) quantity = 1;
                    var original_name = found[3];
                    const name = this.findCorrectedName(original_name);
                    return { quantity, name, original_name };
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
        <div class="modal-default-button" @click="$emit('close')">
            X
        </div>
        <div class="customer-info">
            <div>
                <label for="customer-name">Customer Name: </label>
                <input type="text" name="customer-name" v-model="order.customer_name" />
            </div>
            <div>
                <label for="contact-info">Contact info: </label>
                <input type="text" name="contact-info" v-model="order.contact_info" />
            </div>
        </div>
        <div id="cards-in-order">
            <order-entry v-for="(entry, index) in order.cards" :key="index" :id="index" :quantity="entry.quantity"
                :name="entry.name" :originalname="entry.original_name" @delete-entry="deleteItem"> </order-entry>
        </div>
        <div id="newItem">
            <input id="new-item-quantity" size="2" @keyup.enter="addItem" v-model="new_item.new_item_quantity" />
            <!-- <input id="new-item-name" @keyup.enter="addItem" v-model="new_item.new_item_name" /> -->
            <CardNameInput id="new-item-name" @keyup.enter="addItem" v-model="new_item.new_item_name" />
            <button @click="addItem" :disabled='this.new_item.new_item_name == ""'>+</button>
        </div>
        <div id="massEntry">
            <textarea id="txtMassEntry" v-model="mass_entry"></textarea>
            <button @click="massEntry"> Process </button>
        </div>
        <div id="comment">
            <label for="txtComment">Additional notes: </label>
            <textarea id="txtComment" v-model="order.comment"></textarea>
        </div>
        <button id="btnSubmit" @click="submit" :disabled=orderIsInvalid>Submit Order</button>
</div>
</template>

<style>
.customer-info {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.customer-info label {
    padding-right: 5px;
}

#newItem,#massEntry,#comment{
    margin: 5px 0px;
}

#comment *{
    display:block;
}

div#cards-in-order {
    height: 150px;
    overflow: scroll;
}

textarea {
    width: 98%;
}

#btnSubmit {
    margin-top: 10px;
}
</style>