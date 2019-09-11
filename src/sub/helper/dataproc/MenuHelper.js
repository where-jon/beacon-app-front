/**
 * メニューに関するヘルパーモジュール
 * @module helper/dataproc/MenuHelper
 */

import { ROLE_FEATURE, MENU } from '../../constant/Constants'
import * as StringUtil from '../../util/StringUtil'
import * as Util from '../../util/Util'
import * as AuthHelper from '../base/AuthHelper'
import * as LocalStorageHelper from '../base/LocalStorageHelper'
import axios from 'axios'
import { APP } from '../../constant/config'

let store

/**
 * vue.jsで使用するオブジェクトを設定する。
 * @method
 * @param {Object} pStore
 */
export const setStore = pStore => {
  store = pStore
}

/**
 * メニュー情報を取得する。
 * @method
 * @param {Object[]} masterFeatureList m_featureデータ
 * @param {Object[]} tenantFeatureList r_tenant_featureデータ
 * @param {Object[]} featureList r_role_featureデータ
 * @param {Boolean} isProvider 
 * @param {Boolean} isTenantAdmin 
 * @return {Object[]}
 */
export const fetchNav = async (masterFeatureList, tenantFeatureList, featureList, isProvider, isTenantAdmin) => {
  let retNav = _.map(MENU, group => {
    let pages = _.filter(group.pages, page => {
      if(page.exserver && !APP.SVC.POS.EXSERVER){ // EXSERVERは静的に設定する必要有り
        return false
      }
      if (isTenantAdmin && group.tenantOnly) {
        return true
      }
      if (isProvider && group.providerOnlyForce && page.providerOnlyForce) {
        return true
      }
      if (AuthHelper.isSingleTenant() && isProvider && group.singleOnlyForce && page.singleOnlyForce) {
        return true
      }
      if(!featureOk('/' + group.base + page.path, masterFeatureList)){
        return false
      }
      if (!isProvider && group.providerOnly) {
        return false
      }
      if(isTenantAdmin || isProvider){
        return true
      }
      return featureOk('/' + group.base + page.path, tenantFeatureList) && getMode('/' + group.base + page.path, featureList) & ROLE_FEATURE.MODE.SYS_ALL
    })
    return {...group, pages}
  })

  retNav = _.filter(retNav, group => {
    return group.pages.length > 0
  })

  const IFRAME_BASE_DIR = 'plugin/'

  return await axios.get(IFRAME_BASE_DIR + 'menu.json').then(res => {
    const length = retNav.length
    const splice = Array.prototype.splice
    res.data
    .map((d) => {
      d.base = IFRAME_BASE_DIR
      d.pages.forEach(p => {
        if (p.path && p.path.length > 0) {
          p.path = `iframe?path=${p.path}`
        }
      })
      return d
    })
    .filter((d) => d.order !== null && d.order !== undefined && d.order < length)
    .forEach((d) => splice.apply(retNav, [d.order,0].concat([d])))
    const nonOrders = res.data.filter((d) => d.order === null || d.order === undefined || d.order >= length)
    return retNav.concat(nonOrders)
  })
  .catch(error => {
    console.error(error)
    return retNav
  })
}

/**
 * 指定した機能が使用可能か確認する。
 * @method
 * @param {String} target 
 * @param {Object[]} featurePathList 
 * @return {Boolean}
 */
export const featureOk = (target, featurePathList) => {
  return featurePathList.find(path => StringUtil.pathMatch(target, path)) != null
}

/**
 * 指定した機能のアクセス権限を取得する。
 * @method
 * @param {String} path 
 * @param {Object[]} [featureList = storeに保存されているfeatureList]
 * @return {NUmber} ビット値
 */
export const getMode = (path, featureList = store.state.featureList) => {
  let feature = _.find(featureList, feature => {
    if (StringUtil.pathMatch(path, feature.path)) {
      return true
    }
  })
  Util.debug('feature.mode', path, feature && feature.mode)

  let ret = feature && feature.mode
  return ret != null? ret: ROLE_FEATURE.MODE.SYS_ALL
}

/**
 * 指定した機能に対するCrud権限を所持しているか確認する。
 * @method
 * @param {String} path 
 * @return {Boolean}
 */
export const isActionable = path => {
  return isDetailReferenceable(path) || isUpdatable(path) || isDeleteable(path)
}

/**
 * 指定した機能に対する詳細確認権限を所持しているか確認する
 * @method
 * @param {String} path 
 * @return {Boolean}
 */
export const isDetailReferenceable = path => {
  return (!isUpdatable(path)) && (getMode(path) & ROLE_FEATURE.MODE.DETAIL_REFERENCE? true: false)
}

/**
 * 指定した機能に対する更新権限を所持しているか確認する。
 * @method
 * @param {String} path
 * @return {Boolean} 
 */
export const isUpdatable = path => {
  return (getMode(path) & ROLE_FEATURE.MODE.UPDATE)? true: false
}

/**
 * 指定した機能に対する削除権限を所持しているか確認する。
 * @method
 * @param {String} path 
 * @return {Boolean}
 */
export const isDeleteable = path => {
  return getMode(path) & ROLE_FEATURE.MODE.DELETE
}

/**
 * 指定した機能に対する登録権限を所持しているか確認する。
 * @method
 * @param {String} path 
 * @return {Boolean}
 */
export const isRegistable = path => {
  return (getMode(path) & ROLE_FEATURE.MODE.REGIST? true: false)
}

/**
 * 指定した機能に対する一括登録権限を所持しているか確認する。
 * @method
 * @param {String} path 
 * @return {Boolean}
 */
export const isBulkRegistable = path => {
  return (getMode(path) & ROLE_FEATURE.MODE.BULK_REGIST? true: false)
}

/**
 * 指定した機能に対するcsvダウンロード権限を所持しているか確認する。
 * @method
 * @param {String} path 
 * @return {Boolean}
 */
export const isBulkReferenceable = path => {
  return (getMode(path) & ROLE_FEATURE.MODE.BULK_REFERENCE? true: false)
}

/**
 * 指定した機能に対する編集権限を所持しているか確認する。
 * @method
 * @param {String} path 
 * @return {Boolean}
 */
export const isEditable = path => {
  return isUpdatable(path) || isDeleteable(path)
}

/**
 * 指定したテーマを適用するためのcss情報を取得する
 * @method
 * @param {String} selectedTheme 
 * @return {{default: Boolean, primary: Boolean, secondary, Boolean, success: Boolean, info: Boolean, warning: Boolean, danger: Boolean, light: Boolean, dark: Boolean}}
 */
export const getThemeClasses = selectedTheme => {
  return {
    default: selectedTheme === 'default',
    primary: selectedTheme === 'primary',
    secondary: selectedTheme === 'secondary',
    success: selectedTheme === 'success',
    info: selectedTheme === 'info',
    warning: selectedTheme === 'warning',
    danger: selectedTheme === 'danger',
    light: selectedTheme === 'light',
    dark: selectedTheme === 'dark',
  }
}

/**
 * 指定したマスタ機能が使用可能か確認する。
 * @method
 * @param {String} feature 
 * @return {Boolean}
 */
export const useMaster = feature => {
  if (LocalStorageHelper.getLogin().tenantAdmin) {
    return true
  }
  const featureList = store.state.tenantFeatureList
  const path = '/master/' + feature
  return featureOk(path, featureList)
}

/**
 * 指定した機能がメニューから選択可能か確認する。
 * @method
 * @param {String} path 
 * @return {Boolean}
 */
export const isMenuEntry = path => {
  const menus = store.state.menu
  const pathList = []
  _.forEach(menus, menu => {
    const base = '/' + menu.base
    _.forEach(menu.pages, page => {
      pathList.push(base + page.path)
    })
  })

  return _.some(pathList, pth => pth === path)
}

/**
 * 指定したキーに相当するメニューが有効か
 * @method
 * @param {String} key 
 * @return {Boolean}
 */
export const isEnabledMenu = key => {
  for(let group of store.state.menu){
    for(let page of group.pages){
      if(page.key == key){
        return true
      }
    }
  }
  return false
}
