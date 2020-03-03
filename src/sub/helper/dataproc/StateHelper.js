/**
 * vueステートに関するヘルパーモジュール
 * @module helper/dataproc/StateHelper
 */

import _ from 'lodash'
import { APP } from '../../constant/config'
import { FEATURE } from '../../constant/Constants'
import * as DateUtil from '../../util/DateUtil'
import * as StringUtil from '../../util/StringUtil'
import * as AppServiceHelper from './AppServiceHelper'

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
  // absentDisplayZones: {
  //   path: '/core/zone/absentDisplayZones'
  // },
  // lostZones: {
  //   path: '/core/zone/lostZones',
  // },
  // prohibits: {
  //   path: '/core/zone/prohibit',
  //   beforeCommit: arr => {
  //     let result = arr.map(val => (val? { // TODO: valがundefinedになる
  //       ...val,
  //       zoneId: val.zoneId,
  //       zoneName:val.zoneName,
  //       x: val.x,
  //       y: val.y,
  //       w: val.w,
  //       h: val.h,
  //       areaId: val.areaId,
  //     }: null))
  //     return result
  //   }
  // },
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

export const storeCommit = (key, val) => {
  store.commit('app_service/replaceAS', {[key]:val})
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
    console.log('empty areas', areaId)
    return
  }
  if (areaImages[areaId] && !force) {
    console.log('FOUND areas', areaId)
    return areaImages[areaId]
  }
  // if (store.state.app_service.areaImages.find(areaImage => areaImage.areaId == areaId) && !force) {
  //   console.log('FOUND areas', areaId)
  //   return
  // }
  console.log('load areas', areaId)
  let base64 = await AppServiceHelper.fetchMapImage('/core/area/' + areaId + '/mapImage')
  // eslint-disable-next-line require-atomic-updates
  areaImages[areaId] = base64
  return base64
  // const areaImages = [{areaId, mapImage: base64}]
  // store.commit('app_service/replaceAS', {areaImages})
}

/**
 * すべてのエリア画像をサーバから取得する。
 * @method
 * @async
 */
export const loadAreaImages = async () => {
  if (store.state.app_service.areas.length == 0) {
    await load('area')
  }
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
  // const areaImage = _.find(store.state.app_service.areaImages, (areaImage) => {
  //   return areaImage.areaId == areaId
  // })
  // return areaImage && areaImage.mapImage

}

