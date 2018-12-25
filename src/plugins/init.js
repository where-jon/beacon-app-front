import * as MenuHelper from '../sub/helper/MenuHelper'
import * as ConfigHelper from '../sub/helper/ConfigHelper'
import * as HttpHelper from '../sub/helper/HttpHelper'
import * as StateHelper from '../sub/helper/StateHelper'
import * as AuthHelper from '../sub/helper/AuthHelper'
import * as config from '../sub/constant/config'
import _ from 'lodash'

export default async (context, inject) => {
  console.log("App Init") // If you need common initialize procedure, write here.
  window.localStorage.setItem("defaultConfig", JSON.stringify(_.cloneDeep(config)))
  MenuHelper.setStore(context.store)
  await ConfigHelper.loadConfigJson()
  try {
    let setting = await HttpHelper.getAppServiceNoCrd('/meta/setting/byTenant/default')
    ConfigHelper.applyAppServiceSetting(setting)  
  }
  catch (e) {
    console.error(e) // ignore
  }

  // load map image
  setTimeout(() => {
    if (AuthHelper.checkSession()) {
      StateHelper.loadAreaImages()
    }
  }, 500)

  // loading chunk failed対策 Loading chunk 6 failed.
  setInterval(() => {
    console.debug("check chunk")
    let error = document.querySelector(".__nuxt-error-page .error .title")
    if (error && error.innerText && error.innerText.match(/Loading chunk (\d)+ failed/g)) {
      location.reload()
    }
  }, 3000)
  
}
  
if (String.prototype.includes) {
  console.info("Adding methods. Don't use methods in IE before this is called.")
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
