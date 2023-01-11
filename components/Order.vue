<script>
import SetBadge from "../components/SetBadge.vue"

export default {
    props: {
        info: {
            type: Object
        },
        id: {
            type: Number
        }
    },
    components: {
        SetBadge: SetBadge
    },
    data() {
        return {
            showFound: true,
            toPick: false
        }
    },
    computed: {
        missingCards() {
            var missingCards = [];
            var info = this.info;
            if (info.cards_found) {
                info.cards.forEach(card => {
                   var missing_card = structuredClone(card)
                   var corresponding_found_card = info.cards_found.find(c => c.name == card.name);
                   if (corresponding_found_card) missing_card.quantity -= corresponding_found_card.quantity;
                   if (missing_card.quantity > 0) missingCards.push(missing_card);
                });
            return missingCards;
            }
        }
    },
    methods: {
        updateStatus() {
            console.log(this.info.status);
            if (this.info.status == 'picked' && this.info.cards_found == 0) {
                this.info.cards_found = JSON.parse(JSON.stringify(this.info.cards)) //deep copy
            }
            this.$emit('update-order-info', this.info._id, this.info)
        },
        updateOrderInfo() {
            this.$emit('update-order-info', this.info._id, this.info)
        },
        updatePicks() {
            this.$emit('update-picks', this.info._id, this.toPick)
        },
        orderCreatedTimestamp() {
            const created_date = new Date(this.info.created_date);
            return `${created_date.toLocaleDateString()} ${created_date.toLocaleTimeString()}`;
        }
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
        <div class="order-cards-ordered">
            <div v-for="card in info.cards" class="order-view-card">
                {{ card.quantity }} {{ card.name }} ({{ card.color }})
                <div class="set-badges">
                    <set-badge v-for="set in card.sets" :set="set"></set-badge>
                </div>
            </div>
        </div>
        <div v-if="info.cards_found && showFound" class="order-cards-found">
            <span>Cards found: <button @click="showFound = !showFound">Show missing</button> </span>
            <div v-for="card in info.cards_found" class="order-cards-found-card">
              <span v-if="!card.edit" @click="$set(card, 'edit', !card.edit)"> {{card.quantity}} {{card.name}} </span>
              <span v-if="card.edit"> <input v-model="card.quantity" /> {{card.name}} <button @click="$set(card, 'edit', !card.edit); updateOrderInfo()"> ✅ </button></span>
            </div>
        </div>
        <div v-if="info.cards_found && !showFound" class="order-cards-missing">
            <span>Cards missing: <button @click="showFound = !showFound">Show/edit found</button> </span>
            <div v-for="card in missingCards" class="order-cards-missing-card">
              <span> {{card.quantity}} {{card.name}} </span>
            </div>
        </div>
        <div class="order-view-comment">
            <p v-if="info.comment"> Notes: {{ info.comment }}</p>
        </div>
        <label for="pick">Pick order</label>
        <input id="pick" type="checkbox" v-model="toPick" @change="updatePicks()"/>
    </div>

</template>

<style>
div.order-view {
    border: 1px solid black;
    width: 500px;
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
