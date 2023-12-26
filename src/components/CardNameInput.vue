<script>
import {mapState} from 'vuex';
import fuzzysort from 'fuzzysort';
export default {
    props: ['value'],
    mounted: function () {
        var names = this.cardNames;
        var component = this;
        $("#new-item-name").autocomplete({
            minLength: 3,
            // select: function (event, ui) {
                // new_item.new_item_name = ui.item.value;
            // },
            select:function(event, ui)
            {
                    var name=ui.item.value;
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
    <input id="card-name-input"
     v-bind:value="value"
     v-on:input="$emit('input', $event.target.value)"
     @keyup.enter="$emit('keyup.enter')"
     />
</template>