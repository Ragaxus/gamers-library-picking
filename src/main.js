import Vue from 'vue'
import Home from './views/home.vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import Meta from 'vue-meta'

Vue.config.productionTip = false
Vue.use(VueAxios, axios);
Vue.use(Meta);

new Vue({
  render: h => h(Home),
}).$mount('#app')
