import Vue from 'vue'
import * as Util from '../sub/util/Util'

export const state = () => ({
  pots: [],
  pot: {},
  positions: [],
  sensors: [],
  potImages: [],
  areas: [],
  area: {},
  exbs: [],
  exb: {},
  locations: [],
  location: {},
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
  roles: [],
  role: {},
  features: [],
  roleFeatures: [],
  roleFeature: {},
  zones: [],
  zone: {},
  templates: [],
  template: {},
  settings: [],
  tenants: [],
  tenant: {},
  topNewsList: [],
  topNews: {},
  newsList: [],
  news: {},
  lastMasterFetchTime: 0,
  listMessage: null,
  showLine: false,
  pageSendParam: null,
  updatedThumbnail: {},
  thumbnailUrls: {},
})

const initState = state()

export const mutations = {
  replaceAS(state, obj) {
    Util.debug('replaceAS')
    if (obj) {
      for (let key in obj) {
        Vue.set(state, key, obj[key])
      }
    }
  },
  clear(state, obj) {
    Util.debug('clear', obj)
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
