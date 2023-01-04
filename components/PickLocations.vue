<script>
import axios, { axios as _axios2 } from "axios"
export default {
    props: ["cards-to-pick"],
    data: function () {
        return {
            boxIndex: {}
        }
    },
    methods: {
        updateBoxIndex() {
            axios.get(`/box-locations`, { data: { cards: cardsToPick } }).then(response => {
                this.boxIndex = response;
            });
        }
    },
    watch: {
        cardstopick(newVal, oldVal) { this.updateBoxIndex(); }
    }
}
</script>
<template>
    <div class="pick-locations">
        {{ this.boxIndex }}
    </div>
</template>
<style>

</style>