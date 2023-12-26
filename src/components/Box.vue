<script>

import SetBadge from "../components/SetBadge.vue"
import SubmitNewOrder from "../components/SubmitNewOrder.vue"

export default {
    props: {
        boxInfo: {
            type: Object
        }
    },
    components: {
        SetBadge: SetBadge,
        SubmitNewOrder: SubmitNewOrder
    },
    data() {
        return {
            box: {},
            editing: false,
        }
    },
    mounted() { this.box = this.boxInfo; }, 
}
</script>

<template>
    <div>
        <div>
            <h2>{{ box.name }}</h2>
            <p>Type: {{ box.type }}</p>
            <p>Release Date: {{ box.releaseDate }}</p>
            <p v-if="!!box.startCard">
                Start Card: {{ box.startCard.name }} ({{ box.startCard.set }})
            </p>
            <p v-if="!!box.endCard">
                End Card: {{ box.endCard.name }} ({{ box.endCard.set }})
            </p>
            <p v-if="!!box.sets && box.sets.length > 0">Sets: {{ box.sets.join(', ') }}</p>
        </div>
        <button @click="editBox(box)">Edit</button>
        <button @click="deleteBox(box._id)">Delete</button>
    </div>
</template>

<style>
div.order-view {
    border: 1px solid black;
    width: 500px;
}

div.order-card-summary {
    display: flex;
}

div.order-card-summary input {
    width: 30px;
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
