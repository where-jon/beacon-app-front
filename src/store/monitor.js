import Vue from 'vue'

export const state = () => ({
})

const initState = state()

export const mutations = {
  replaceMonitor(state, obj) {
    console.debug('replaceMonitor')
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

