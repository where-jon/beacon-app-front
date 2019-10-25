import _ from 'lodash'
import * as config from '../sub/constant/config'
import * as Util from '../sub/util/Util'
import * as AuthHelper from '../sub/helper/base/AuthHelper'
import * as ConfigHelper from '../sub/helper/dataproc/ConfigHelper'
import * as HttpHelper from '../sub/helper/base/HttpHelper'
import * as LocalStorageHelper from '../sub/helper/base/LocalStorageHelper'
import * as MenuHelper from '../sub/helper/dataproc/MenuHelper'

export default async (context, inject) => {
  console.log('App Init') // If you need common initialize procedure, write here.
  LocalStorageHelper.setLocalStorage('defaultConfig', JSON.stringify(config))
  MenuHelper.setStore(context.store)
  HttpHelper.setApp(context)
  await ConfigHelper.loadConfigJson()
  try {
    const login = LocalStorageHelper.getLogin()
    HttpHelper.setApiKey(login && login.apiKey? login.apiKey: null)
    let setting = await HttpHelper.getAppService('/meta/setting/wsByTenant/' + AuthHelper.getTenantCd('default') + '/' + AuthHelper.getRegionId(), {}, true)
    if (setting == null) {
      setting = await HttpHelper.getAppServiceNoCrd('/meta/setting/byTenant/' + AuthHelper.getTenantCd('default') + '/' + AuthHelper.getRegionId())
    }
    ConfigHelper.applyAppServiceSetting(setting) 
    if (login && login.isAd) {
      // eslint-disable-next-line require-atomic-updates
      config.APP.MENU.LOGIN_PAGE = config.APP.MENU.AZLOGIN_PAGE
    }
  }
  catch (e) {
    console.error(e) // ignore
  }

  // load map image
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