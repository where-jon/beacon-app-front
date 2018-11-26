
import Vue from 'vue'

export const state = () => ({
  locales: ['en', 'ja'],
  locale: 'ja',
  serviceRev: null,
  frontRev: null,
  loginId: '',
  role: '',
  featureList: [],
  menu: [],
  error: null,
  currentRegion: {},
  showProgress: false,
})

const initState = state()

export const mutations = {
  replace(state, obj) {
    console.debug("replace")
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
      window.localStorage.setItem('langShort', locale)
    }
  },
  clearAll(state) {
    for (let key in initState) {
      Vue.set(state, key, initState[key])
    }
  }
}
