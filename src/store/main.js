import Vue from 'vue'
import axios from 'axios'

export const state = () => ({
  positions: [],
  orgPositions: [],
  selectedArea: null,
  selectedTx: {},
  eachAreas: [],
  eachZones: [],
  sample: 'sample', // sample
  positionHistores: []
})

const initState = state()

export const mutations = {
  replaceMain(state, obj) {
    if (obj) {
      for (let key in obj) {
        Vue.set(state, key, obj[key])
      }
    }
  },
  clearAll(state) {
    for (let key in initState) {
      Vue.set(state, key, initState[key])
    }
  }
}

export const getters = { // Sample
  find: (state) => (id) => {
    return state.positions.filter(pos => pos.id == id)
  }
}

export const actions = { // Sample
  async getIP ({ commit, state }) {
    const ip = await axios.get('http://icanhazip.com')
    commit('sample', ip)
  },
}
