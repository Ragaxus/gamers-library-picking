<script>
export default {
    props: ["cardstopick"],
    data: function () {
        return {
            boxIndex: {}
        }
    },
    methods: {
        updateBoxIndex() {
            axios.post(`/box-locations`, { cards: this.cardstopick }).then(response => {
                this.boxIndex = response.data;
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