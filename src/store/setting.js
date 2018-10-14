import Vue from 'vue'

export const state = () => ({
  theme: 'default',
  charSet: 'UTF8',
})

const initState = state()

export const mutations = {
  replaceSetting(state, obj) {
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

