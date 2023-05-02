import Vue from 'vue'
import Home from './views/home.vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import Meta from 'vue-meta'

Vue.config.productionTip = false
Vue.use(VueAxios, axios);
Vue.use(BootstrapVue);
Vue.use(Meta);

new Vue({
  render: h => h(Home),
}).$mount('#app')
