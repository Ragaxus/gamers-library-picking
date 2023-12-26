// src/store/index.js
import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    cardNames: [],
  },
  mutations: {
    setList(state, newList) {
      state.cardNames = newList;
    },
  },
  actions: {
    async fetchList({ commit }) {
      try {
        const response = await axios.get('/api/cardNames'); 
        commit('setList', response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
  },
});
