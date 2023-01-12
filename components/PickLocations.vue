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
            }
        }
    },
    methods: {
            updateBoxIndex() {
                axios.post(`/box-locations`, { cards: this.cardstopick }).then(response => {
                    this.boxData = response.data;
                });
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
                    {{ color_lookup[boxsetcolor.color] }}:
                    <ul>
                        <li v-for="card in boxsetcolor.cards"> {{ card }} </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>
<style>
.pick-locations-box {
    border: 1px solid black;
}
</style>