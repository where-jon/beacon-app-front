import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { getLangShort, getMessageData, setApp } from '../sub/util/HtmlUtil'
import { setI18n as setI18nConstants } from '../sub/constant/Constants'

Vue.use(VueI18n)

const lang = process.browser? getLangShort(): 'ja'

export default async ({ app, store }, inject) => {
  app.i18n = new VueI18n({
    locale: lang,
    messages: {
      'en': _.merge(require('~/sub/locales/en.json'), await getMessageData('en')),
      'ja': _.merge(require('~/sub/locales/ja.json'), await getMessageData('ja'))
    }
  })
  app.i18n.tnl = (path, param) => {
    const message = app.i18n.t(path, param)
    return /^label\..*$/.test(message)? message.replace(/^label\./, ""): message
  }
  app.i18n.tline = (path, param, showLine = true) => {
    return (showLine && param && param.line? app.i18n.t("message.csvLine", param).concat(": "): "").concat(app.i18n.t(path, param))
  }
  inject('i18n', app.i18n)
  setI18nConstants(app.i18n)
  setApp(app.i18n)
  store.commit('setLang', getLangShort())
}

