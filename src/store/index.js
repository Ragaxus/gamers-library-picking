// src/store/index.js
import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    cardNames: [],
    setDirectory: {},
  },
  mutations: {
    setList(state, newList) {
      state.cardNames = newList;
    },
    setSetDirectory(state, newSetDirectory) {
      state.setDirectory = newSetDirectory;
    },
    addElement(state, payload) {
      state.setDirectory[payload.type].splice(payload.position, 0, payload.name);
    },
    removeElement(state, {type, index}) {
      if (index >= 0 && index < state.setDirectory[type].length) {
        state.setDirectory[type].splice(index, 1);
      }
    }

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
    async fetchSetDirectory({ commit }) {
      const response = await axios.get('/api/setDirectory');
      commit('setSetDirectory', response.data);
    },
    async addSet({commit}, {type, name, position}) {
      commit('addElement', {type, name, position});
      this.dispatch('saveSetDirectory');
    },
    async removeSet({commit}, {type, idx}) {
      commit('removeElement', {type, index:idx});
      this.dispatch('saveSetDirectory');
    },
    async saveSetDirectory(context) {
      await axios.post('/api/setDirectory', this.state.setDirectory);
    }
  },
});
