
import Vue from 'vue'
import * as Util from '../sub/util/Util'

export const state = () => ({
  locales: ['en', 'ja'],
  locale: 'ja',
  featureList: [],
  menu: [],
  error: null,
  currentTenant: {},
  currentRegion: {},
  showProgress: false,
  reload: false,
  showInfo: false,
  showAlert: false,
  showWarn: false,
})

const initState = state()

export const mutations = {
  replace(state, obj) {
    Util.debug('replace', obj)
    if (obj) {
      for (let key in obj) {
        Vue.set(state, key, obj[key])
      }
    }
  },
  setLang(state, locale) {
    if (state.locales.indexOf(locale) !== -1) {
      state.locale = locale
      this.$i18n.locale = locale
    }
  },
  clearAll(state) {
    for (let key in initState) {
      Vue.set(state, key, initState[key])
    }
  }
}

export const actions = {
  showProgress({ commit }) {
    commit('replace', {showProgress: true})
  },
  hideProgress({ commit }) {
    commit('replace', {showProgress: false})
  },
  showErrorModal({commit}, payload) {
    Util.debug('modalRootError')
    commit('replace', {error: payload})
    this.$router.app.$root.$emit('bv::show::modal', 'modalRootError')
  },
}
