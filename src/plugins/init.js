import Vue from 'vue'
import * as config from '../sub/constant/config'
import { SETTING } from '../sub/constant/Constants'
import * as Util from '../sub/util/Util'
import * as AuthHelper from '../sub/helper/base/AuthHelper'
import * as ConfigHelper from '../sub/helper/dataproc/ConfigHelper'
import * as HttpHelper from '../sub/helper/base/HttpHelper'
import * as LocalStorageHelper from '../sub/helper/base/LocalStorageHelper'
import * as MenuHelper from '../sub/helper/dataproc/MenuHelper'
import * as StateHelper from '../sub/helper/dataproc/StateHelper'
import * as MasterHelper from '../sub/helper/domain/MasterHelper'
import * as ToiletHelper from '../sub/helper/domain/ToiletHelper'
import * as OptionHelper from '../sub/helper/dataproc/OptionHelper'
import * as BrowserUtil from '../sub/util/BrowserUtil'
import * as AnalysisHelper from '../sub/helper/domain/AnalysisHelper'
import * as BulkHelper from '../sub/helper/dataproc/BulkHelper'
import * as IconHelper from '../sub/helper/ui/IconHelper'
import * as LocaleHelper from '../sub/helper/base/LocaleHelper'
import * as MessageHelper from '../sub/helper/domain/MessageHelper'
import * as ProhibitHelper from '../sub/helper/domain/ProhibitHelper'
import * as PositionHelper from '../sub/helper/domain/PositionHelper'
import * as TxDetailHelper from '../sub/helper/domain/TxDetailHelper'
import * as PlanHelper from '../sub/helper/domain/PlanHelper'
import * as SensorHelper from '../sub/helper/domain/SensorHelper'
import * as LegendHelper from '../sub/helper/domain/LegendHelper'
import * as SettingHelper from '../sub/helper/domain/SettingHelper'
import * as TooltipHelper from '../sub/helper/domain/TooltipHelper'
import * as ValidateHelper from '../sub/helper/dataproc/ValidateHelper'
import * as ViewHelper from '../sub/helper/ui/ViewHelper'
import * as VueSelectHelper from '../sub/helper/ui/VueSelectHelper'

export default async (context, inject) => {
  console.log('App Init') // If you need common initialize procedure, write here.

  setContextToHelper(context)

  LocalStorageHelper.setLocalStorage('defaultConfig', JSON.stringify(config)) // TODO: なぜローカルストレージに
  LocalStorageHelper.setLocalStorage('defaultConfigConstants', JSON.stringify({ // TODO: 未使用なら削除
    type: SETTING.getType(),
    svc: SETTING.getDefault(),
  }))
  await ConfigHelper.loadConfigJson()
  try {
    const login = LocalStorageHelper.getLogin()
    HttpHelper.setApiKey(login && login.apiKey? login.apiKey: null)
    // ページデザインのため画面表示に関する設定を取得：サーバ側でセッションが維持されているかどうかで、CORSの設定が異なるリクエストを送る。最初のエラーを抑止したいがブラウザのコンソールに出てしまう。
    let setting = await HttpHelper.getAppService('/meta/setting/wsByTenant/' + AuthHelper.getTenantCd('default') + '/' + AuthHelper.getRegionId(), {}, true)
    if (setting == null) {
      setting = await HttpHelper.getAppServiceNoCrd('/meta/setting/byTenant/' + AuthHelper.getTenantCd('default') + '/' + AuthHelper.getRegionId())
    }
    ConfigHelper.applyAppServiceSetting(setting) 
    if (login && login.isAd) {
      // eslint-disable-next-line require-atomic-updates
      config.APP.MENU.LOGIN_PAGE = config.APP.MENU.AZLOGIN_PAGE
    }
    if (login) {
      // get all master
      const start = new Date().getTime()
      await MasterHelper.loadMaster()
      console.log('master get', new Date().getTime() - start, 'msec')
    }
  }
  catch (e) {
    console.error(e) // ignore
  }

  // check session
  setTimeout(() => {
    AuthHelper.checkSession()
  }, 500)

  // loading chunk failed対策 Loading chunk 6 failed.
  setInterval(() => {
    Util.debug('check chunk')
    let error = document.querySelector('.__nuxt-error-page .error .title')
    if (error && error.innerText && error.innerText.match(/Loading chunk (\d)+ failed/g)) {
      location.reload()
    }
  }, 3000)
  
}

Vue.filter('number_format', (value) => {
  if (!value) {
    return value
  }
  let formatter = new Intl.NumberFormat('ja-JP')
  return formatter.format(value)
})

if (String.prototype.includes) {
  console.info('Adding methods. Don\'t use methods in IE before this is called.')
  String.prototype.includes = function(search, start) {
    'use strict'
    if (typeof start !== 'number') {
      start = 0
    }
    
    if (start + search.length > this.length) {
      return false
    } else {
      return this.indexOf(search, start) !== -1
    }
  }
}

if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function(searchElement, fromIndex) {

      if (this == null) {
        throw new TypeError('"this" is null or not defined')
      }

      var o = Object(this)
      var len = o.length >>> 0
      if (len === 0) {
        return false
      }

      var n = fromIndex | 0
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0)

      function sameValueZero(x, y) {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y))
      }

      while (k < len) {
        if (sameValueZero(o[k], searchElement)) {
          return true
        }
        k++
      }

      return false
    }
  })
}

if (!String.prototype.repeat) {
  String.prototype.repeat = function(count) {
    return Array(count*1+1).join(this)
  }
}

// IE11がremove()をサポートしていないため追加
if (!('remove' in Element.prototype)) {
  Element.prototype.remove = function() {
    if (this.parentNode) {
      this.parentNode.removeChild(this)
    }
  }
}

const setContextToHelper = (context) => {
  const lang = LocaleHelper.getLocale(process.browser? BrowserUtil.getLangShort(): 'ja')
  context.app.i18n.locale = context.app.i18n.messages[lang]? lang: 'en'

  MenuHelper.setStore(context.store)
  AnalysisHelper.setApp(context.app.i18n)
  AuthHelper.setApp(context.app.router, context.app.store)
  MasterHelper.setApp(context.app.store, context.app.i18n)
  StateHelper.setApp(context.app.store, context.app.i18n)
  SensorHelper.setApp(context.app.store, context.app.i18n)
  LegendHelper.setApp(context.app.i18n)
  PositionHelper.setApp(context.app.store, context.app.i18n)
  TxDetailHelper.setApp(context.app.i18n)
  PlanHelper.setApp(context.app.store, context.app.i18n)
  ToiletHelper.setApp(context.app.store, context.app.i18n)
  ViewHelper.setApp(context.app.i18n)
  HttpHelper.setApp(context)
  IconHelper.setApp(context.app.i18n)
  SettingHelper.setApp(context.app.i18n)
  BulkHelper.setApp(context.app.i18n)
  MessageHelper.setApp(context.app.i18n)
  OptionHelper.setApp(context.app.i18n)
  ProhibitHelper.setApp(context.app.i18n)
  TooltipHelper.setApp(context.app.i18n)
  ValidateHelper.setApp(context.app.i18n)
  VueSelectHelper.setApp(context.app.i18n)
}
