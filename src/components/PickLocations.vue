<script>
import SetBadge from "../components/SetBadge.vue"
export default {
    props: ["orderstopick", "cardspicked"],
    components: {
        SetBadge: SetBadge
    },
    data() {
        return {
            boxData: [],
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
            types: [
                "core",
                "standard",
                "supplemental",
                "basics"
            ],
            ascending: true,
            groupByType: true,
            mostRecentlyUpdatedCard: null,
            dotVisibility: {}
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
        },
        priceData() {
            var availableSets = this.boxData.map(box => box.cards_by_set.map(setInfo => setInfo.set)).flat();
            var cardPrices = this.orderstopick.reduce((acc, order) => {
                order.cards.filter(card => !!card.name).forEach(card => {
                    acc[card.name] = card.prices;
                    var cheapestSet = Object.keys(card.prices)
                        .filter(set => availableSets.includes(set) && !!card.prices[set])
                        .sort((setA, setB) => card.prices[setA] - card.prices[setB])
                    [0];
                    acc[card.name]["cheapest"] = cheapestSet;
                });
                return acc;
            }, {});

            return cardPrices;
        },
        sortedBoxes() {
            return this.boxData.sort((a, b) => {
                // compare the type first
                let typeA = this.types.indexOf(a.type);
                let typeB = this.types.indexOf(b.type);
                if (this.groupByType && typeA !== typeB) return typeA - typeB;
                // if the type is the same, compare the release date
                if (this.ascending) {
                    return a.releaseDate.localeCompare(b.releaseDate);
                } else {
                    return b.releaseDate.localeCompare(a.releaseDate);
                }
            });
        }
    },
    methods: {
        updateBoxIndex() {
            this.axios.post(`/api/box-locations`, { cards: this.cardstopick }).then(response => {
                this.boxData = response.data;
            });
        },
        modifyPicked(line_data, amount) {
            this.mostRecentlyUpdatedCard = line_data.join('-');
            let name = line_data[2];
            let newVal = (name in this.cardspicked) ? this.cardspicked[name] : 0;
            newVal += amount;
            if (newVal < 0) newVal = 0;
            else {
                this.$emit("modify-picked", name, amount);
            }
            this.$set(this.cardspicked, name, newVal);
            this.$forceUpdate();
        },
        pickedStatus(card) {
            let currentlyPicked = (card.name in this.cardspicked) ? this.cardspicked[card.name] : 0;
            let needed = card.quantity;
            return currentlyPicked + " / " + needed;
        },
        isCardCompleted(card) {
            return (card.name in this.cardspicked && this.cardspicked[card.name] >= card.quantity);
        },
        isCheapest(cardName, set) {
            return set === this.priceData[cardName]["cheapest"]
        },
        ordersOfCard(cardName) {
            return this.orderstopick
                .filter(order => order.cards.some(card => card.name === cardName))
                .map(order => order.customer_name);
        },
        toggleOrder() { this.ascending = !this.ascending; },
        confirmUpdate() {
            this.$set(this.dotVisibility, this.mostRecentlyUpdatedCard, true);

            setTimeout(() => {
                this.$set(this.dotVisibility, this.mostRecentlyUpdatedCard, false);
            }, 1300);
        }
    },
    watch: {
        orderstopick(newVal, oldVal) { this.updateBoxIndex(); }
    }
}
</script>
<template>
    <div class="pick-locations" v-if="this.cardstopick.length > 0">
        <button @click="toggleOrder">Reverse order</button>
        <label for="groupByType">Group by type</label>
        <input id="groupByType" type="checkbox" v-model="groupByType" />
        <div v-for="boxinfo in sortedBoxes" class="pick-locations-box">
            <div class="pick-locations-box-header">
                <h2>{{ boxinfo.box_name }}: </h2>
            </div>
            <div class="pick-locations-box-content">
                <div v-for="boxset in boxinfo.cards_by_set">
                    <set-badge :set="boxset.set"></set-badge>
                    <div v-for="boxsetcolor in boxset.cards_by_color">
                        <h3>{{ color_lookup[boxsetcolor.color] }}:</h3>
                        <div class="card-in-orders" v-for="card in boxsetcolor.cards"
                            v-bind:class="{ completed: isCardCompleted(card), cheapest: isCheapest(card.name, boxset.set) }">
                            <div class="card-in-orders-display">
                                <span>{{ card.name }} (${{ priceData[card.name][boxset.set] }}),
                                    {{ pickedStatus(card) }}</span>
                                <button @click="modifyPicked([boxinfo.box_name, boxset.set, card.name], 1)">⬆️</button>
                                <button @click="modifyPicked([boxinfo.box_name, boxset.set, card.name], -1)">⬇️</button>
                                <div v-if="dotVisibility[[boxinfo.box_name, boxset.set, card.name].join('-')]"
                                    :class="'green-dot ' + [boxinfo.box_name, boxset.set, card.name].join('-')"></div>
                            </div>
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
.card-in-orders-display {
    display: flex;
    align-items: center;
}

.pick-locations-box {
    border: 1px solid black;
    margin: 10px;
}

div.completed span {
    text-decoration: line-through;
    font-style: italic;
    color: gray;
}

div.cheapest span {
    color: blue;
}

.pick-locations button {
    margin-right: 5px;
}

.green-dot {
    width: 10px;
    height: 10px;
    background: radial-gradient(circle, rgb(18, 229, 18) 50%, transparent 100%);
    border-radius: 50%;
    margin-left: 5px;
    animation: fadeInOut 1.3s ease-out;
}

@keyframes fadeInOut {

    0%,
    100% {
        opacity: 0;
    }

    50% {
        opacity: 1;
    }
}
</style>