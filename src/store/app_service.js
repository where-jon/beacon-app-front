import Vue from 'vue'

export const state = () => ({
  pots: [],
  pot: {},
  led: {},
  sensors: [],
  deviceIds: [],
  potImages: [],
  areas: [],
  area: {},
  exbs: [],
  exb: {},
  txs: [],
  tx: {},
  categories: [],
  category: {},
  groups: [],
  group: {},
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
  zones: [],
  zone: {},
  settings: [],
  sensorHistories: [],
  forceFetchPot: true,
  forceFetchTx: true,
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

