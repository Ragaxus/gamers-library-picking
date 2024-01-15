<script>
import { mapState } from 'vuex';
export default {
    data() {
        return {
            currentSetType: "",
            currentEditing: "",
            currentSet: ""
        }
    },
    methods: {
        addAfter(idx) {
            this.currentEditing = idx;
        },
        insertItem() {
            this.$store.dispatch('addSet', { type: this.currentSetType, position: this.currentEditing, name: this.currentSet });
            this.currentSetName = "";
            this.currentEditing = "";
        },
        removeItem(idx) {
            this.$store.dispatch('removeSet', {type: this.currentSetType , idx});
        }
    },
    computed: {
        ...mapState(['setDirectory']),
        setTypes() { var keys = Object.keys(this.setDirectory); keys.splice(keys.indexOf("_id"), 1); return keys; }
    }
}
</script>
<template>
    <div>
        <select v-model="currentSetType">
            <option v-for="type in setTypes"> {{ type }} </option>
        </select>
        <div v-if="currentSetType">
            <div v-if="currentEditing === 0">
                <input v-model="currentSet" />
                <button @click="insertItem"> Add </button>
                <button @click="currentEditing = undefined"> Cancel</button>
            </div>
            <button v-else @click="addAfter(0)">+</button>
            <div class="set-of-type" v-for="(set, idx) in setDirectory[currentSetType]">
                {{ set }}
                <div v-if="idx + 1 === currentEditing">
                    <input v-model="currentSet" />
                    <button @click="insertItem"> Add </button>
                    <button @click="currentEditing = undefined"> Cancel</button>
                </div>
                <div v-else>
                <button @click="addAfter(idx + 1)">+</button>
                <button @click="removeItem(idx)">X</button>
                </div>
            </div>
        </div>
    </div>
</template>