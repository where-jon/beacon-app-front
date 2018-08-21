import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { getLangShort } from '../sub/util/HtmlUtil'

Vue.use(VueI18n)

const lang = process.browser? getLangShort(): 'ja'

export default ({ app, store }, inject) => {
  console.debug("i18n")
  app.i18n = new VueI18n({
    locale: lang,
    messages: {
      'en': require('~/sub/locales/en.json'),
      'ja': require('~/sub/locales/ja.json')
    }
  })
  inject('i18n', app.i18n)
  store.commit('setLang', getLangShort())
}

