<script>
import ViewOrders from "../components/ViewOrders.vue"
import SubmitNewOrder from "../components/SubmitNewOrder.vue";
export default {
    name: 'Home',
    metaInfo: {
        title: "Gamer's Library Orders",
        script: [
            { src: "https:/unpkg.com/vue@2.4.2/dist/vue.js", async: true, defer: true },
            { src: "https:/cdnjs.cloudflare.com/ajax/libs/axios/1.2.0/axios.min.js", async: true, defer: true },
            { src: "https:/code.jquery.com/jquery-3.6.0.js", async: true, defer: true },
            { src: "https:/code.jquery.com/ui/1.13.2/jquery-ui.js", async: true, defer: true },
            { src: "https:/cdn.jsdelivr.net/npm/fuzzysort@2.0.4/fuzzysort.min.js", async: true, defer: true },
            { src: "https:/cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.min.js", async: true, defer: true }
        ],
        link: [
            { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css' },
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
            card_names: [],
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
            this.card_names = res.data.card_names;
            this.orders = res.data.order_data;
            this.orders.forEach( order => {
                if (order.toPick == null) this.$set(order, "toPick", false);
            });
        });
    },
    methods: {
        addNewOrder(newOrder) {
            this.axios.post('/api/order', newOrder).then(res => {
               this.orders.push(res.data);
            }); 
        }
    }
}
</script>
<template>
    <div id="app" class="home">
        <button @click="showModal = true">New order</button>
        <view-orders :displaycriteria="display_criteria" :orders="orders" :cardnames="card_names"></view-orders>
        <transition name="modal" v-if="showModal">
            <div class="modal-mask">
                <div class="modal-wrapper">
                    <submit-new-order class="modal-container" :cardnames="card_names" @new-order="addNewOrder"
                        @close="showModal = false"></submit-new-order>
                </div>
            </div>
        </transition>
    </div>
</template>
<style>
.modal-mask {
    position: fixed;
    z-index: 99;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: table;
    transition: opacity 0.3s ease;
}

.modal-wrapper {
    display: table-cell;
    vertical-align: middle;
}

.modal-container {
    width: 300px;
    margin: 0px auto;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    transition: all 0.3s ease;
    font-family: Helvetica, Arial, sans-serif;
    overflow-y: auto;
}

.modal-header h3 {
    margin-top: 0;
    color: #42b983;
}

.modal-body {
    margin: 20px 0;
}

.modal-default-button {
    float: right;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
    opacity: 0;
}

.modal-leave-active {
    opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
}
</style>