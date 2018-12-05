import Vue from 'vue'
import {getOptions, getValue} from '../sub/util/Util'
import {CATEGORY} from '../sub/constant/Constants'

export const state = () => ({
  pots: [],
  pot: {},
  positionList: [],
  positions: [],
  led: {},
  sensors: [],
  deviceIds: [],
  potImages: [],
  areas: [],
  areaImages: [],
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
  forceFetchExb: true,
  forceFetchZone: true,
  listMessage: null,
  defaultConfig: {},
  showLine: false,
  pageSendParam: null,
})

const initState = state()

export const getters = {
  categoryOptions(state) {
    return getOptions('category', state.categories)
  },
  categoryOptionsForPot(state) {
    let categorys = _.filter(state.categories, (cat) => {
      return CATEGORY.POT_AVAILABLE.includes(cat.categoryType)
    })
    return getOptions('category', categorys)
  },
  groupOptions(state) {
    return getOptions('group', state.groups)
  },
}

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
