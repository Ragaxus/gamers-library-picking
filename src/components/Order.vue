<script>



import SetBadge from "../components/SetBadge.vue"
import SubmitNewOrder from "../components/SubmitNewOrder.vue"

export default {
    props: {
        info: {
            type: Object
        },
        id: {
            type: Number
        },
        cardNames: {
            type: Array
        }
    },
    components: {
        SetBadge: SetBadge,
        SubmitNewOrder: SubmitNewOrder
    },
    data() {
        return {
            order: {},
            showFound: true,
            color_lookup: {
                'L': "Land",
                'C': "Colorless",
                'M': "Multicolored",
                'W': "White",
                'U': "Blue",
                'B': "Black",
                'R': "Red",
                'G': "Green"
            },
            editingComment: false,
            editingOrder: false,
            collapsed: true,
            foundCollapsed: true
        }
    },
    mounted() {
        this.order = this.info;
    },
    computed: {
        missingCards() {
            var missingCards = [];
            var info = this.order;
            var cards_found = info.cards_found;
            if (cards_found) {
                info.cards.forEach(card => {
                    var missing_card = structuredClone(card)
                    var corresponding_found_card = cards_found.find(c => c.name == card.name);
                    if (corresponding_found_card) missing_card.quantity -= corresponding_found_card.quantity;
                    if (missing_card.quantity > 0) missingCards.push(missing_card);
                });
                return missingCards;
            }
        },
        numberOfCards() {
            return this.info.cards.reduce((acc, card) => acc + parseInt(card.quantity), 0);
        },
        cardOrCards() {
            return (this.numberOfCards > 1) ? "cards" : "card";
        },
        numCardsFound() {
            return this.info.cards_found.reduce((acc, card) => acc + parseInt(card.quantity), 0);
        }
    },
    methods: {
        updateStatus() {
            if (this.order.status == 'picked' && this.info.cards_found == 0) {
                this.order.cards_found = JSON.parse(JSON.stringify(this.info.cards)) //deep copy
            }
            this.updateOrderInfo()
        },
        updateOrderInfo() {
            this.$emit('update-order-info', this.order._id, this.order)
        },
        updatePicks() {
            this.$emit('update-picks', this.order._id)
        },
        orderCreatedTimestamp() {
            const created_date = new Date(this.order.created_date);
            return `${created_date.toLocaleDateString()} ${created_date.toLocaleTimeString()}`;
        },
        editComment() {
            this.editingComment = !this.editingComment;
            this.updateOrderInfo();
        },
        printingInfo(card) {
            let printings = card.sets.map( set => { return {set: set, price: parseFloat(card.prices[set])}});
            printings.sort((a,b) => a.price - b.price);
            return printings;
        }
    },
    watch: {
        info(newVal, oldVal) { this.$forceUpdate(); }
    }
}
</script>

<template>
    <div class="order-view">
        <div :class="'order-view-header status-' + info.status">
            <span>{{ info.customer_name }} {{ orderCreatedTimestamp() }}</span>
            <select name="status" id="status" v-model="info.status" @change="updateStatus">
                <option value="placed">Placed</option>
                <option value="picked">Picked</option>
                <option value="priced">Priced</option>
                <option value="sold">Sold</option>
                <option value="cancelled">Cancelled</option>
            </select>
        </div>
        <div class="order-view-contact-info">
            {{ info.contact_info }}
        </div>
        <div class="order-view-info" v-if="!editingOrder">
            <button @click="editingOrder = !editingOrder">Edit</button>
            <div class="order-cards-ordered">
                <div class="order-cards-ordered-header">
                    <span>{{ numberOfCards }} {{ cardOrCards }} in order </span>
                    <button @click="collapsed = !collapsed">
                        {{ collapsed ? "Show" : "Hide" }}
                    </button>
                </div>
                <div v-if="!collapsed" class="order-cards-ordered-allcards">
                    <div v-for="card in info.cards" class="order-view-card">
                        {{ card.quantity }} {{ card.name }} ({{ color_lookup[card.color] }})
                        <div class="set-badges">
                            <set-badge v-for="{set, price} in printingInfo(card)" :set="set" :price="price" :key="set"></set-badge>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="info.cards_found" class="order-cards-found">
            <div class="order-cards-found-header">
                <span>{{ numCardsFound }} cards found </span>
                <button @click="foundCollapsed = !foundCollapsed">
                    {{ foundCollapsed ? "Show cards found info" : "Hide cards found info" }}
                </button>
            </div>
            <div v-if="!foundCollapsed" class="order-cards-found-info">
                <button @click="showFound = !showFound">
                    {{ showFound ? "Show missing" : "Show/edit found" }}
                </button>
                <div v-if="showFound" class="order-cards-found-found">
                    <div v-for="card in info.cards_found" class="order-cards-found-card">
                        <span v-if="!card.edit" @click="$set(card, 'edit', !card.edit)">
                            {{ card.quantity }} {{ card.name }}
                        </span>
                        <span v-if="card.edit">
                            <input type="number" v-model.number="card.quantity" /> {{ card.name }}
                            <button @click="$set(card, 'edit', !card.edit); updateOrderInfo()"> ✅
                            </button>
                        </span>
                    </div>
                </div>
                <div v-else class="order-cards-found-missing">
                    <div v-for="card in missingCards" class="order-cards-missing-card">
                        <span> {{ card.quantity }} {{ card.name }} </span>
                    </div>
                </div>
            </div>
        </div>
        <div class="order-comment">
            <div v-if="!editingComment">
                <p v-if="info.comment && !editingComment"> Notes: {{ order.comment }}</p>
                <button @click="editingComment = !editingComment">Edit notes</button>
            </div>
            <div v-if="editingComment">
                <textarea id="order-edit-comment" v-model="order.comment"></textarea>
                <button @click="editComment">✅</button>
            </div>
        </div>
        <label for="pick">Pick order</label>
        <input id="pick" type="checkbox" :checked="info.toPick" @change="updatePicks()" />
        <div class="order-edit" v-if="editingOrder">
            <submit-new-order :cardnames="cardNames" :existingOrder="order" @new-order="updateOrderInfo"
                @close="editingOrder = !editingOrder">
            </submit-new-order>
        </div>
    </div>
</template>

<style>
div.order-view {
    border: 1px solid black;
    width: 500px;
}

.set-badges {
    display: flex;
    overflow-x: auto;
}

div.status-picked {
    background: gold;
}

div.status-sold {
    background: #000;
    color: #fff;
}

div.status-cancelled {
    background: #000;
    color: #fff;
}
</style>
