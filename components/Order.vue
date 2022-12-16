<script>
export default {
    props: ['info', 'id'],
    methods: {
        updateStatus() {
            if (this.info.status == 'picked' && !this.info.cards_found) {
                this.info.cards_found = JSON.parse(JSON.stringify(this.info.cards)) //deep copy
            }
            this.$emit('update-order-info', this.info._id, this.info)
        },
        updateOrderInfo() {
            this.$emit('update-order-info', this.info._id, this.info)
        },
        orderCreatedTimestamp() {
            const created_date = new Date(this.info.created_date);
            return `${created_date.toLocaleDateString()} ${created_date.toLocaleTimeString()}`;
        },
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
                    <div v-for="set in card.sets" class="set-badge">
                        <img :src="`/images/set-icons/${set}.svg`" />
                        <span> {{ set.toUpperCase() }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="info.cards_found" class="order-cards-found">
            Cards found:
            <div v-for="card in info.cards_found" class="order-cards-found-card">
              <span v-if="!card.edit" @click="$set(card, 'edit', !card.edit)"> {{card.quantity}} {{card.name}} </span>
              <span v-if="card.edit"> <input v-model="card.quantity" /> {{card.name}} <button @click="$set(card, 'edit', !card.edit); updateOrderInfo()"> ✅ </button></span>
            </div>
        </div>
        <div class="order-view-comment">
            <p v-if="info.comment"> Notes: {{ info.comment }}</p>
        </div>
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

div.set-badges {
    display: flex;
    overflow-x: auto;

}

div.set-badge {
    flex: none;
    font-size: 15px;
    margin-right: 5px;
    background-color: #4b5257;
    color: white;
    border-radius: 2px;
}

div.set-badge img {
    height: 15px;
    vertical-align: top;
    filter: invert(92%) sepia(100%) saturate(0%) hue-rotate(202deg) brightness(106%) contrast(106%);
}
</style>
