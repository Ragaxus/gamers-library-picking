<script>
import SetBadge from "../components/SetBadge.vue"
export default {
    props: ["cardstopick"],
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
            },
            cardsPicked: {}
        }
    },
    methods: {
            updateBoxIndex() {
                axios.post(`/box-locations`, { cards: this.cardstopick }).then(response => {
                    this.boxData = response.data;
                });
            },
            modifyPicked(name, amount) {
                if (!(name in this.cardsPicked)) this.cardsPicked[name] = 0;
                this.cardsPicked[name] += amount;
                if (this.cardsPicked[name] <= 0 ) this.cardsPicked[name] = 0;
                console.log(this.cardsPicked)
                this.$forceUpdate();
            }
        },
        watch: {
            cardstopick(newVal, oldVal) { this.updateBoxIndex(); }
        }
    }
</script>
<template>
    <div class="pick-locations" v-if="this.cardstopick">
        <div v-for="boxinfo in this.boxData" class="pick-locations-box">
            <h2>{{ boxinfo.box_name }}: </h2>
            <div v-for="boxset in boxinfo.cards_by_set">
                <set-badge :set="boxset.set"></set-badge>
                <div v-for="boxsetcolor in boxset.cards_by_color">
                    <h3>{{ color_lookup[boxsetcolor.color] }}:</h3>
                        <div class="card-in-orders" v-for="card in boxsetcolor.cards" v-bind:class="{completed: cardsPicked[card.name] >= card.quantity}"> 
                            <span>{{ card.name }}, {{ card.name in cardsPicked ? cardsPicked[card.name] : 0}} / {{ card.quantity }}</span>
                            <button @click="modifyPicked(card.name, 1)">⬆️</button>
                            <button @click="modifyPicked(card.name, -1)">⬇️</button>
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