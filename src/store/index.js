
import Vue from 'vue'

export const state = () => ({
  locales: ['en', 'ja'],
  locale: 'ja',
  serviceRev: null,
  frontRev: null,
  loginId: '',
  pass: '',
  role: '',
  featureList: [],
  menu: [],
  error: null,
  currentRegion: {},
  showProgress: false,
  reload: false,
})

const initState = state()

export const mutations = {
  replace(state, obj) {
    console.debug('replace')
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
  }
}
