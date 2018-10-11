import Vue from 'vue'

export const state = () => ({
  persons: [],
  person: {},
  led: {},
  deviceIds: [],
  personImages: [],
  areas: [],
  areaImages: [],
  area: {},
  exbs: [],
  exb: {},
  txs: [],
  tx: {},
  categories: [],
  category: {},
  categoryStyles: [],
  groups: [],
  group: {},
  groupStyles: [],
  things: [],
  thing: {},
  thingImages: [],
  regions: [],
  region: {},
  user: {},
  users: [],
  roleOptions: [],
  roles: [],
  role: {},
  features: [],
  roleFeatures: [],
  roleFeature: {},
})

const initState = state()

export const mutations = {
  replaceAS(state, obj) {
    console.debug("replaceAS")
    if (obj) {
      for (let key in obj) {
        Vue.set(state, key, obj[key])
      }
    }
  },
  clear(state, obj) {
    console.debug("clear", obj)
    if (obj) {
      for (let key in obj) {
        Vue.set(state, key, {})
      }
    }
  },
  clearAll(state) {
    for (let key in initState) {
      Vue.set(state, key, initState[key])
    }
  }
}

