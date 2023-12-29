<script>
import { mapState } from 'vuex';
import fuzzysort from 'fuzzysort';
export default {
    props: ['value'],
    mounted: function () {
        var names = this.cardNames;
        var component = this;
        $(`#${this._uid}`).autocomplete({
            minLength: 3,
            select: function (event, ui) {
                var name = ui.item.value;
                component.$emit('input', name);
            },
            source: function (req, respCallback) {
                const results = fuzzysort.go(req.term, names, { limit: 5 })
                    .map(r => r.target);
                respCallback(results);
            }
        })
    },
    computed: {
        ...mapState(['cardNames'])
    }
}
</script>

<template>
    <input :id="_uid" v-bind:value="value" />
</template>