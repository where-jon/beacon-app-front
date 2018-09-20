import Vue from 'vue'

export const state = () => ({
  theme: 'default',
})

const initState = state()

export const mutations = {
  replaceSetting(state, obj) {
    if (obj) {
      console.log(obj)
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

