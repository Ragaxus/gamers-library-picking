import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from './views/home.vue'
import Boxes from './views/boxes.vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import Meta from 'vue-meta'
import store from './store'
import { mapState, mapActions } from 'vuex';

Vue.config.productionTip = false
Vue.use(VueAxios, axios);
Vue.use(BootstrapVue);
Vue.use(Meta);
Vue.use(VueRouter);

const routes = [
  {path: '/home', component: Home},
  {path: '/boxes', component: Boxes},
]

const router = new VueRouter({routes})

const app = new Vue({
  store,
  router,
  computed: { ...mapState(['cardNames']), },
  methods: { ...mapActions(['fetchList']), },
  mounted: function () { this.fetchList(); }
}).$mount('#app')