<script>
import SetBadge from "../components/SetBadge.vue"
export default {
    props: ["orderstopick", "cardspicked"],
    components: {
        SetBadge: SetBadge
    },
    data() {
        return {
            boxData: {},
            color_lookup: {
                'L': "Land",
                'C': "Colorless",
                'M': "Multicolored",
                'W': "White",
                'U': "Blue",
                'B': "Black",
                'R': "Red",
                'G': "Green"
            }
        }
    },
    computed: {
        cardstopick() {
            var cards = this.orderstopick 
                .map(order => order.cards)
                .flat();

            var cards_combined = cards
                .map((card) => card.name)
                .filter((value, index, self) => {
                    return self.indexOf(value) === index
                })
                .map((name) => {
                    var instances = cards.filter(card => card.name === name);
                    return instances.slice(1).reduce((acc, card) => {
                        acc.quantity = parseInt(acc.quantity) + parseInt(card.quantity);
                        return acc;
                    }, JSON.parse(JSON.stringify(instances[0])))
                });

            return cards_combined;
        }
    },
    methods: {
        updateBoxIndex() {
            this.axios.post(`/api/box-locations`, { cards: this.cardstopick }).then(response => {
                this.boxData = response.data;
            });
        },
        modifyPicked(name, amount) {
            let newVal = (name in this.cardspicked) ? this.cardspicked[name] : 0;
            newVal += amount;
            this.$set(this.cardspicked, name, newVal);
            this.$forceUpdate();
            this.$emit("modify-picked", name, amount);
        },
        pickedStatus(card) {
            let currentlyPicked = (card.name in this.cardspicked) ? this.cardspicked[card.name] : 0;
            let needed = card.quantity;
            return currentlyPicked + " / " + needed;
        },
        isCardCompleted(card) {
            return (card.name in this.cardspicked && this.cardspicked[card.name] >= card.quantity);
        },
        ordersOfCard(cardName) {
            return this.orderstopick
                .filter(order => order.cards.some(card => card.name === cardName))
                .map(order => order.customer_name);
        }
    },
    watch: {
        orderstopick(newVal, oldVal) { this.updateBoxIndex(); }
    }
}
</script>
<template>
    <div class="pick-locations" v-if="this.cardstopick">
        <div v-for="boxinfo in this.boxData" class="pick-locations-box">
            <div class="pick-locations-box-header">
                <h2>{{ boxinfo.box_name }}: </h2>
            </div>
            <div class="pick-locations-box-content">
                <div v-for="boxset in boxinfo.cards_by_set">
                    <set-badge :set="boxset.set"></set-badge>
                    <div v-for="boxsetcolor in boxset.cards_by_color">
                        <h3>{{ color_lookup[boxsetcolor.color] }}:</h3>
                        <div class="card-in-orders" v-for="card in boxsetcolor.cards"
                            v-bind:class="{ completed: isCardCompleted(card) }">
                            <span>{{ card.name }}, {{ pickedStatus(card) }}</span>
                            <button @click="modifyPicked(card.name, 1)">⬆️</button>
                            <button @click="modifyPicked(card.name, -1)">⬇️</button>
                            <ul class="card-in-orders-order-names">
                                <li v-for="ordername in ordersOfCard(card.name)"> {{ ordername }} </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style>
.pick-locations-box {
    border: 1px solid black;
    margin: 10px;
}

div.completed span {
    text-decoration: line-through;
    font-style: italic;
    color: gray;
}
</style>