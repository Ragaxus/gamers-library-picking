<script>

import SetBadge from "./SetBadge.vue"
import CardNameInput from "./CardNameInput.vue";
import axios from "axios";

export default {
    props: {
        boxInfo: {
            type: Object
        }
    },
    components: {
        SetBadge: SetBadge,
        CardNameInput: CardNameInput,
    },
    data() {
        return {
            box: {},
            editing: false,
            startCardSetOptions: [],
            endCardSetOptions: [],
        }
    },
    methods: {
        getInfoForCard: async function (cardName) {
            var resp = await this.axios.get(`api/card?name=${cardName}`);
            return resp.data;
        },
        saveBox: async function() {
            this.editing = false;
            await this.axios.put(`api/boxes/${this.boxInfo._id}`, this.boxInfo);
        },
        updateCardBoundary: async function(cardName, target) {
            const {color, sets} = await this.getInfoForCard(cardName);
            if (target === 'start') {
                this.startCardSetOptions = sets;
                this.box.startCard.color = color;
            }
            else { 
                this.endCardSetOptions = sets;
                this.box.endCard.color = color;
            }
        }
    },
    mounted() { 
        this.box = this.boxInfo; 
    },
    watch: {
        box: {
            handler(newBox, oldBox) {
                if (newBox.startCard !== undefined && (oldBox.startCard === undefined || newBox.startCard.name !== oldBox.startCard.name)) {
                    this.startCardSetOptions = this.getInfoForCard(newBox.startCard.name)
                }
                if (newBox.endCard !== undefined && (oldBox.endCard === undefined || newBox.endCard.name !== oldBox.endCard.name)) {
                    this.endCardSetOptions = this.getInfoForCard(newBox.endCard.name)
                }
            },
            deep: true
        }
    }
}
</script>

<template>
    <article>
        <div name="viewBoxInfo" v-if="!editing">
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
            <button @click="editing = true">Edit</button>
            <button @click="deleteBox(box._id)">Delete</button>
        </div>
        <div name="editBoxInfo" v-if="editing">
            <input v-model="box.name" />
            <p>Type: <select v-model="box.type">
                    <option value="core">Core</option>
                    <option value="standard">Standard</option>
                    <option value="supplemental">Supplemental</option>
                </select>
            </p>
            <p>Release Date: <input type="date" v-model="box.releaseDate" /></p>
            <p v-if="!!box.startCard">
                <div class="card-row">
                    <CardNameInput v-model="box.startCard.name" @input="updateCardBoundary(box.startCard.name, 'start')" />
                    <input list="start-card-sets" v-model="box.startCard.set">
                    <datalist id="start-card-sets">
                        <option v-for="set in this.startCardSetOptions" :value="set" />
                    </datalist>
                </div>
                <div class="card-row">
                    <CardNameInput v-model="box.endCard.name" @input="updateCardBoundary(box.endCard.name, 'end')" />
                    <input list="end-card-sets" v-model="box.endCard.set">
                    <datalist id="end-card-sets">
                        <option v-for="set in this.endCardSetOptions" :value="set" />
                    </datalist>
                </div>
            </p>
            <p v-if="!!box.sets">
                <SetBadge v-for="set in box.sets" :set="set" />
            </p>
            <button @click="saveBox">Save</button>
        </div>
    </article>
</template>

<style>
div.card-row {
    display: flex;
}

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
