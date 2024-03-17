<script>

import SetBadge from "./SetBadge.vue"
import CardNameInput from "./CardNameInput.vue";
import axios from "axios";
import { mapState } from "vuex";


export default {
    props: {
        boxInfo: {
            type: Object
        },
        isEditOnly: {
            type: Boolean
        }
    },
    components: {
        SetBadge: SetBadge,
        CardNameInput: CardNameInput,
    },
    data() {
        return {
            box: {},
            editing: this.isEditOnly || false,
            startCardSetOptions: [],
            endCardSetOptions: [],
            currentSetToAdd: ""
        }
    },
    methods: {
        getInfoForCard: async function (cardName) {
            var resp = await this.axios.get(`api/card?name=${cardName}`);
            return resp.data;
        },
        saveBox: async function () {
            this.editing = !this.editing;
            console.log(this.box);
            this.$emit('save', this.box);
        },
        updateCardBoundary: async function (cardName, target) {
            const { color, sets } = await this.getInfoForCard(cardName);
            if (target === 'start') {
                this.startCardSetOptions = sets;
                this.box.startCard.color = color;
            }
            else {
                this.endCardSetOptions = sets;
                this.box.endCard.color = color;
            }
        },
        addCardBoundaries: function () {
            this.box.startCard = { color: "", set: "", name: "" }
            this.box.endCard = { color: "", set: "", name: "" }
        },
        removeCardBoundaries: function (box) {
            this.box.startCard = undefined;
            this.box.endCard = undefined;
        },
        addSetList: function () {
            this.box.sets = [];
        },
        removeSetList: function () {
            this.box.sets = undefined;
        },
        clearSets: function () {
            if (this.box.sets !== undefined) {this.box.sets = [];}
        },
        removeSet: function (box, idx) {
            box.sets.splice(idx, 1);
        },
        addSet: function (box) {
            box.sets.push(this.currentSetToAdd);
            this.currentSetToAdd = "";
        },
        deleteBox: function () {
            this.$emit('delete', this.box._id);
        },
        cancelEdit: function () {
            if (this.isEditOnly) this.deleteBox(); else this.editing = false;
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
    },
    computed: {
        ...mapState(['setDirectory']),
        boxSetOptions() {
            return this.setDirectory[this.box.type]
        },
    }
}
</script>

<template>
    <article>
        <div name="viewBoxInfo" v-if="!editing">
            <div>
                <h2 class="box-name">{{ box.name }}</h2>
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
            <button @click="deleteBox">Delete</button>
        </div>
        <div name="editBoxInfo" v-if="editing">
            <input class="box-name" v-model="box.name" />
            <p>Type: <select v-model="box.type" @change="clearSets">
                    <option value="core">Core</option>
                    <option value="standard">Standard</option>
                    <option value="supplemental">Supplemental</option>
                </select>
            </p>
            <p>Release Date: <input type="date" v-model="box.releaseDate" /></p>
            <div v-if="box.startCard !== undefined">
                <div class="card-row">
                    <CardNameInput v-model="box.startCard.name" @input="updateCardBoundary(box.startCard.name, 'start')" />
                    <input list="start-card-sets" v-model="box.startCard.set" class="card-row-set">
                    <datalist id="start-card-sets">
                        <option v-for="set in this.startCardSetOptions" :value="set" />
                    </datalist>
                </div>
                <div class="card-row">
                    <CardNameInput v-model="box.endCard.name" @input="updateCardBoundary(box.endCard.name, 'end')" />
                    <input list="end-card-sets" v-model="box.endCard.set" class="card-row-set">
                    <datalist id="end-card-sets">
                        <option v-for="set in this.endCardSetOptions" :value="set" />
                    </datalist>
                </div>
                <button @click="removeCardBoundaries">Remove card boundaries</button>
            </div>
            <div v-else>
                <button @click="addCardBoundaries">Add card boundaries</button>
            </div>
            <div v-if="!!box.sets">
                <div class="set-badges">
                    <div v-for="(set, idx) in box.sets" class="set-control">
                        <SetBadge :set="set" />
                        <button @click="removeSet(box, idx)">X</button>
                    </div>
                </div>
                <div class="addSet">
                    <select name="setToAdd" v-model="currentSetToAdd">
                        <option v-for="set in this.boxSetOptions" :value="set">{{ set }}</option>
                    </select>
                    <button @click="addSet(box)">Add set</button>
                </div>
                <button @click="removeSetList">Remove set list</button>
            </div>
            <div v-else>
                <button @click="addSetList">Add set list</button>
            </div>
            <button @click="saveBox">Save</button>
            <button @click="cancelEdit">Cancel</button>
        </div>
    </article>
</template>

<style>
.box-name {
    margin-bottom: 5px;
}

.set-badges {
    display: flex;
    overflow-x: auto;
}

.set-control {
    display: flex;
}

.card-row {
    display: flex;
    margin-bottom: 5px;
}

.card-row-set {
    width: 5em;
    margin-left: 5px;
}

</style>
