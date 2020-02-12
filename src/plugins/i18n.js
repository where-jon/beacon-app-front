import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { setI18n as setI18nConstants } from '../sub/constant/Constants'
import { getLangShort, getDomainCd } from '../sub/util/BrowserUtil'
import * as LocaleHelper from '../sub/helper/base/LocaleHelper'

Vue.use(VueI18n)

const lang = LocaleHelper.getLocale(process.browser? getLangShort(): 'ja')

export default async ({ app, store }, inject) => {
  console.log('i18n init start')
  app.i18n = new VueI18n({
    locale: lang,
    messages: {
      'en': _.merge(require('~/sub/locales/en.json'), await LocaleHelper.getMessageData('en'), await LocaleHelper.getMessageData(`${getDomainCd()}_en`)),
      'ja': _.merge(require('~/sub/locales/ja.json'), await LocaleHelper.getMessageData('ja'), await LocaleHelper.getMessageData(`${getDomainCd()}_ja`)),
    }
  })
  if(!app.i18n.messages[lang]){
    app.i18n.locale = 'en'
  }
  app.i18n.tnl = (path, param) => {
    const message = app.i18n.t(path, param)
    return /^label\..*$/.test(message)? message.replace(/^label\./, ''): message
  }
  app.i18n.tdef = (path, param = null, defValue = null) => {
    return app.i18n.te(path)? app.i18n.tnl(path, param): defValue
  }
  app.i18n.tline = (path, param, showLine = true) => {
    return (showLine && param && param.line? app.i18n.t('message.csvLine', param).concat(': '): '').concat(app.i18n.t(path, param))
  }
  app.i18n.terror = (path, param) => {
    const messageCode = param && param.code? app.i18n.tnl('message.failedCode', param): ''
    return app.i18n.tnl(path, param).concat(messageCode)
  }
  inject('i18n', app.i18n)
  setI18nConstants(app.i18n)
  store.commit('setLang', getLangShort())
  console.log('i18n init end')
}

