<script>
import ViewOrders from "../components/ViewOrders.vue"
import SubmitNewOrder from "../components/SubmitNewOrder.vue";
import { mapState } from 'vuex';
export default {
    name: 'Home',
    metaInfo: {
        title: "Gamer's Library Orders",
        script: [
            { src: "https:/unpkg.com/vue@2.4.2/dist/vue.js", async: true, defer: true },
            { src: "https:/cdnjs.cloudflare.com/ajax/libs/axios/1.2.0/axios.min.js", async: true, defer: true },
            { src: "https:/code.jquery.com/jquery-3.6.0.js"},
            { src: "https:/code.jquery.com/ui/1.13.2/jquery-ui.js"},
            { src: "https:/cdn.jsdelivr.net/npm/fuzzysort@2.0.4/fuzzysort.min.js", async: true, defer: true },
        ],
        link: [
            { rel: 'stylesheet', href: '//code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css' }
        ]
    },
    components: {
        ViewOrders: ViewOrders,
        SubmitNewOrder: SubmitNewOrder
    },
    data: function () {
        return {
            order: {
                customer_name: "",
                cards: [],
                comment: ""
            },
            new_item: {
                new_item_quantity: 0,
                new_item_name: ""
            },
            orders: [],
            search_criteria: {
                showInactiveOrders: false
            },
            display_criteria: "placed",
            pick_all: false,
            showModal: false
        }
    },
    mounted() {
        this.axios.get('/api/init').then(res => {
            this.orders = res.data.order_data;
            this.orders.forEach( order => {
                if (order.toPick == null) this.$set(order, "toPick", false);
            });
        });
    },
    methods: {
        addNewOrder(newOrder) {
            this.axios.post('/api/order', newOrder).then(res => {
               let newOrder = {...res.data, toPick: false};
               this.orders.push(newOrder);
            }); 
        }
    },
    computed: {
        ...mapState(['cardNames'])
    }
}
</script>
<template>
    <div id="app" class="home">
        <button @click="showModal = true">New order</button>
        <view-orders :displaycriteria="display_criteria" :orders="orders" :cardnames="cardNames"></view-orders>
        <transition name="modal" v-if="showModal">
            <div class="modal-mask">
                <div class="modal-wrapper">
                    <submit-new-order class="modal-container" :cardnames="cardNames" @new-order="addNewOrder"
                        @close="showModal = false"></submit-new-order>
                </div>
            </div>
        </transition>
    </div>
</template>
<style lang="scss">
@import '@/css/modals.scss';

</style>