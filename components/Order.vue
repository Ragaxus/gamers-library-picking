<script>
export default {
    props: ['info', 'id'],
    methods: {
        updateStatus() {
            this.$emit('update-status', this.info._id, this.info.status)
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
            </select>
            <!-- <span>{{ info.status}}</span> -->
        </div>
        <li v-for="card in info.cards"> {{ card.quantity }} {{ card.name }} </li>
    </div>
</template>

<style>
div.order-view {
    border: 1px solid black;
    width: 500px;
}

div.status-picked {
    background: #000;
    color: #fff;
}

div.status-placed {
    background: lightblue;
}
</style>
