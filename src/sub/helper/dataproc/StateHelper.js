/**
 * vueステートに関するヘルパーモジュール
 * @module helper/dataproc/StateHelper
 */

import _ from 'lodash'
import { mapState } from 'vuex'
import { APP } from '../../constant/config'
import { FEATURE } from '../../constant/Constants'
import * as DateUtil from '../../util/DateUtil'
import * as StringUtil from '../../util/StringUtil'
import * as AppServiceHelper from './AppServiceHelper'
import * as Util from '../../util/Util'
import * as BrowserUtil from '../../util/BrowserUtil'

const areaImages = [] // Use normal variable instead of state

let store
let i18n

/**
 * vue.jsで使用するオブジェクトを設定する。
 * @method
 * @param {Object} pStore
 * @param {Object} pi18n
 */
export const setApp = (pStore, pi18n) => {
  store = pStore
  i18n = pi18n
}

/** 
 * 本番環境ではマスタ, positionsについてはVuexを使用しない。
 */
const master = {}
const main = {}

export const setMaster = (key, val) => {
  master[key] = val
}
export const getMaster = (key) => {
  if (BrowserUtil.isDev()) {
    return key? store.state.app_service[key]: store.state.app_service
  }
  else {
    return key? master[key]: master
  }
}

/**
 * ストアにコミットする。
 * ※本番環境ではストアに保存しない。
 * 
 * @param {}} key 
 * @param {*} val 
 */
export const storeCommit = (key, val) => {
  if (BrowserUtil.isDev()) {
    store.commit('app_service/replaceAS', {[key]:val})
  }
  else {
    setMaster(key, val)
  }
}

/**
 * mainのデータをセット
 * ※本番環境ではストアに保存しない。
 * 
 * @param {*} key 
 * @param {*} val 
 */
export const setMain = (key, val) => {
  if (BrowserUtil.isDev()) {
    store.commit('main/replaceMain', {[key]: val})
  }
  else {
    console.error(val)
    main[key] = val
  }
}

export const setPositions = (positions) => {
  setMain('positions', positions)
}

export const getPositions = () => {
  if (BrowserUtil.isDev()) {
    return store.state.main.positions
  }
  else {
    return main.positions
  }
}

export const refreshRegion = () => {
  if (!BrowserUtil.isDev()) {
    const regions = master.regions
    master.regions = regions
  }
}


export const exMapState = (namespace, map) => {
  if (BrowserUtil.isDev()) {
    return mapState(namespace, map)
  }
  else { // 本番ではマスタではVuexを使用しない
    let ret = {}
    map.forEach(e => {
      ret[e] = {
        get: function() {return master[e]},
        set: function(val) {
          console.warn('This should not be called.', e, val)
        }
      }
    })
    return ret
  }
}

/**
 * マスタデータの強制更新フラグを取得する。
 * @method
 * @param {String} name マスタ名称
 * @return {Boolean}
 */
export const getForceFetch = name => {
  const storeName = `forceFetch${name.charAt(0).toUpperCase()}${name.slice(1)}`
  return store.state.app_service[storeName]
}

/**
 * マスタデータの強制更新フラグを設定する。
 * @method
 * @param {String} name 
 * @param {Boolean} force 
 */
export const setForceFetch = (name, force) => {
  const storeName = `forceFetch${name.charAt(0).toUpperCase()}${name.slice(1)}`
  store.commit('app_service/replaceAS', {[storeName]:force})
}

const appStateConf = {
  newsList: {
    path: '/news',
    sort: 'newsDate',
    beforeCommit: arr => {
      return arr.map(val => ({
        ...val,
        newsDt: DateUtil.formatDate(val.newsDate),
        dispState: i18n.tnl(`label.${val.dispFlg == 0? 'hide': 'display'}`),
        newsContent: StringUtil.cutOnLong(val.content, 16),
      }))
    }
  },
  topNewsList: {
    path: '/news/disp',
    sort: 'newsDate',
    beforeCommit: arr => {
      return _.orderBy(arr, ['newsDate'], ['desc'])
    }
  },
  features: {
    path: '/meta/feature',
    sort: 'featureName',
    beforeCommit: arr => {
      return arr.filter(val => !FEATURE.HIDE_LIST.includes(val.featureName)).map(val => ({
        ...val,
        featureName: val.featureType == 0? StringUtil.toLowerCaseTop(val.featureName): val.featureName,
      }))
    }
  },
  settings: {
    path: '/meta/setting',
    sort: 'settingId',
  },
  tenants: {
    path: '/meta/tenant',
    sort: 'tenantId',
    beforeCommit: arr => {
      return  arr.map(val => ({
        ...val,
        createDt: DateUtil.formatDate(val.createDt),
      }))
    }
  },
}

/**
 * マスタデータをサーバから取得する。
 * @method
 * @async
 * @param {String} target マスタ種類
 * @param {Boolean} force 強制取得する
 * @param {Object} option 追加設定
 */
export const load = async (target, force, option) => {
  const forceFetchTarget = target
  if (!target.endsWith('s')) {
    target = target.endsWith('y')? target.slice(0, -1) + 'ies' : target + 's'
  }else if(['news', 'topNews'].includes(target)){
    target = `${target}List`
  }
  if (!appStateConf[target]) {
    return
  } 
  let {path, sort, beforeCommit} = appStateConf[target]
  let arr = store.state.app_service[target]
  const expiredKey = `${target}Expired`
  if (!arr || arr.length == 0 || force || getForceFetch(forceFetchTarget) || DateUtil.isExpired(store.state.app_service[expiredKey])) {
    arr = await AppServiceHelper.fetchList(path, sort, option)
    if (beforeCommit) {
      arr = beforeCommit(arr)
    }
    store.commit('app_service/replaceAS', {[target]:arr})
    const expiredTime = (new Date()).getTime() + APP.SYS.STATE_EXPIRE_TIME
    store.commit('app_service/replaceAS', {[expiredKey]: expiredTime})
    setForceFetch(forceFetchTarget, false)
  }
}

/**
 * エリア画像をサーバから取得する。
 * @method
 * @async
 * @param {Number} areaId 
 * @param {Boolean} force 強制取得する
 */
export const loadAreaImage = async (areaId, force) => {
  if (areaId == null) {
    Util.debug('empty areas', areaId)
    return
  }
  if (areaImages[areaId] && !force) {
    Util.debug('FOUND areas', areaId)
    return areaImages[areaId]
  }
  Util.debug('load areas', areaId)
  let base64 = await AppServiceHelper.fetchMapImage('/core/area/' + areaId + '/mapImage')
  // eslint-disable-next-line require-atomic-updates
  areaImages[areaId] = base64
  return base64
}

/**
 * すべてのエリア画像をサーバから取得する。
 * @method
 * @async
 */
export const loadAreaImages = async () => {
  store.state.app_service.areas.forEach(async (area) => {
    await loadAreaImage(area.areaId)
  })
}

/**
 * メッセージ表示フラグをすべて初期化する。
 * @method
 */
export const initShowMessage = () => {
  store.commit('replace', {showInfo: false, showWarn: false, showAlert: false})
}

/**
 * エリアのマップイメージを返す。
 * @method
 * @param {Number} areaId 
 * @return {String}
 */
export const getMapImage = areaId => {
  return areaImages[areaId]
}

/**
 * areaImagesを全削除する
 */
export const clearAreaImages = () => {
  areaImages.length = 0
}
