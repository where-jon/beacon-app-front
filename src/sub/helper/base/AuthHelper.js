/**
 * 認証に関するヘルパーモジュール
 * @module helper/base/AuthHelper
 */

import axios from 'axios'
import _ from 'lodash'
import md5 from 'md5'
import { APP, LOCAL_LOGIN } from '../../constant/config'
import { LOGIN_MODE, FEATURE } from '../../constant/Constants'
import * as BrowserUtil from '../../util/BrowserUtil'
import * as Util from '../../util/Util'
import * as AppServiceHelper from '../dataproc/AppServiceHelper'
import * as ConfigHelper from '../dataproc/ConfigHelper'
import * as HttpHelper from './HttpHelper'
import * as LocaleHelper from './LocaleHelper'
import * as LocalStorageHelper from './LocalStorageHelper'
import * as MenuHelper from '../dataproc/MenuHelper'
import * as StateHelper from '../dataproc/StateHelper'

let router
let store

/**
 * vue.jsで使用するオブジェクトを設定する。
 * @method
 * @param {Object} pRouter
 * @param {Object} pStore
 */
export const setApp = (pRouter, pStore) => {
  router = pRouter
  store = pStore
}

/**
 * ログイン認証を行う。
 * @method
 * @async
 * @param {String} loginId 
 * @param {String} password 
 * @param {Function} success 認証成功時に実行するメソッド
 * @param {Function} err 認証失敗時に実行するメソッド
 */
export const auth = async (loginId, password, success, err) => {
  switch(APP.LOGIN_MODE) {
  case LOGIN_MODE.APP_SERVICE:
    await authByAppService(loginId, password, success, err)
    break
  case LOGIN_MODE.LOCAL:
    await authByLocal(loginId, password, success, err)
    break
  case LOGIN_MODE.NO_LOGIN:
    success()
    break
  }
}

/**
 * ローカルログインの認証を行う。
 * @method
 * @async
 * @param {String} loginId 
 * @param {String} password 
 * @param {Function} success 認証成功時に実行するメソッド
 * @param {Function} err 認証失敗時に実行するメソッド
 */
export const authByLocal = async (loginId, password, success, err) => {
  // Util.debug(md5(loginId + ":" + password)) // for create
  if (_.includes(LOCAL_LOGIN.ID_PASS, md5(loginId + ':' + password))) {
    await login(loginId)
    success()
  }
  else {
    err()
  }
}

/**
 * 改訂情報を取得する。
 * @method
 * @async
 * @return {{frontRev: String, serviceRev: String}}
 */
export const getRevInfo = async () => {
  const frontRev = (await axios.get('/head.txt')).data
  const apsIndex = await HttpHelper.getAppServiceNoCrd('/', false) // pre network check
  const serviceRev = apsIndex.match(new RegExp('Head:([0-9a-zA-Z]+)'))
  return {frontRev: frontRev, serviceRev: serviceRev && serviceRev[1]}
}

/**
 * ユーザ情報を取得する。
 * @method
 * @async
 * @param {Boolean} tenantAdmin 
 * @return {{tenant: Object, tenantFeatureList: Object[], user: Object, featureList: Object[], menu: Object[], currentRegion: Object, setting: Object[]}}
 */
export const getUserInfo = async (tenantAdmin) => {
  // get feature list
  const master = await HttpHelper.getAppService('/meta/feature')
  const masterFeatureList = master.map(m => m.path)

  // get tenant feature list
  const tenant = await HttpHelper.getAppService('/meta/tenant/currentTenant')
  const tenantFeatureList = tenant.tenantFeatureList.map(tenantFeature => tenantFeature.feature.path)
  Util.debug({tenantFeatureList})

  // get role feature list
  const user = await AppServiceHelper.getCurrentUser()
  Util.debug(user)
  const featureList = _(user.role.roleFeatureList).map(roleFeature => {
    return {path: roleFeature.feature.path, mode: roleFeature.mode}
  }).sortBy(val => val.path.length * -1).value()
  const menu = await MenuHelper.fetchNav(masterFeatureList, tenantFeatureList, featureList, user.providerUserId != null, tenantAdmin)

  // get region
  const currentRegion = await HttpHelper.getAppService('/core/region/current')
  await StateHelper.load('region', true)

  // get setting (again in case failed on init or reload)
  const setting = await HttpHelper.getAppService('/meta/setting/wsByTenant/' + getTenantCd('default') + '/' + getRegionId(currentRegion.regionId))
  return {tenant, tenantFeatureList, user, featureList, menu, currentRegion, setting}
}

/**
 * 設定情報をリセットする。
 * @method
 * @async
 * @param {Boolean} isTenantAdmin 
 * @param {Object[]} setting 
 */
export const resetConfig = async (isTenantAdmin, setting) => {
  ConfigHelper.initConfig()
  ConfigHelper.applyAppServiceSetting(setting)  
  if (isTenantAdmin) {
    APP.MENU.TOP_PAGE = '/provider/tenant'
  }
}

/**
 * サービス側でログイン認証を行う。
 * @method
 * @async
 * @param {String} loginId 
 * @param {String} password 
 * @param {Function} success 認証成功時に実行するメソッド
 * @param {Function} err 認証失敗時に実行するメソッド
 */
export const authByAppService = async (loginId, password, success, err) => {
  try {
    const revInfo = await getRevInfo()

    let params = new URLSearchParams()
    let tenantCd = getTenantCd(null, true)
    params.append('username', (tenantCd? tenantCd+':':'') + loginId) // username: Spring Boot Security reserved name
    params.append('password', password)
    let data = await HttpHelper.postAppService('/login', params, false)
    HttpHelper.setApiKey(data.apiKey)

    const userInfo = await getUserInfo(data.tenantAdmin)
    resetConfig(data.tenantAdmin, userInfo.setting)

    const userRegionIdList = Util.getValue(userInfo, 'user.userRegionList', []).map(val => val.userRegionPK.regionId)
    const allRegionMove = Util.getValue(userInfo, 'user.role.roleFeatureList', []).some(val => val.feature.featureName == FEATURE.NAME.ALL_REGION && val.mode != 0)
    // Login process
    await login({loginId, username:userInfo.user.name, role: userInfo.user.role, featureList: userInfo.featureList, tenantFeatureList: userInfo.tenantFeatureList, 
      menu: userInfo.menu, currentRegion: userInfo.currentRegion, frontRev: revInfo.frontRev, serviceRev: revInfo.serviceRev, tenantAdmin: data.tenantAdmin,
      isProvider: userInfo.user.providerUserId != null, currentTenant: userInfo.tenant, userRegionIdList: userRegionIdList, allRegionMove: allRegionMove, apiKey: data.apiKey })
    success()
    LocaleHelper.setLocale(LocaleHelper.getLocale())
    store.commit('setLang', LocaleHelper.getLocale(BrowserUtil.getLangShort()))

  } catch (e) {
    console.error(e)
    err(e)
  }
}

/**
 * テナントを切り替える
 * @method
 * @async
 * @param {Number} tenantId 
 */
export const switchTenant = async (tenantId) => {
  await HttpHelper.putAppService(`/meta/tenant/current/${tenantId}`)
  await switchAppService()
}

/**
 * リージョンを切り替える
 * @method
 * @async
 * @param {Number} regionId 
 */
export const switchRegion = async (regionId) => {
  await HttpHelper.putAppService(`/core/region/current/${regionId}`)
  await switchAppService()
}

/**
 * ログイン情報を再取得する。
 * @method
 * @async
 */
export const switchAppService = async () => {
  try {
    const loginInfo = LocalStorageHelper.getLogin()

    const revInfo = await getRevInfo()
    const userInfo = await getUserInfo(loginInfo.tenantAdmin)
    resetConfig(loginInfo.tenantAdmin, userInfo.setting)

    loginInfo.featureList = userInfo.featureList
    loginInfo.tenantFeatureList = userInfo.tenantFeatureList
    loginInfo.menu = userInfo.menu
    loginInfo.currentRegion = userInfo.currentRegion
    loginInfo.frontRev = revInfo.frontRev
    loginInfo.serviceRev = revInfo.serviceRev
    loginInfo.currentTenant = userInfo.tenant
    loginInfo.role = userInfo.user.role
    loginInfo.featureList = userInfo.featureList

    await login(loginInfo)
  } catch (e) {
    console.error(e)
  }
}

/**
 * ログイン情報を各ストレージに保存する
 * @method
 * @async
 * @param {Object} login ログイン情報
 */
export const login = async (login) => {
  Util.debug({login})
  store.commit('replace', login)
  LocalStorageHelper.setLocalStorage('login', JSON.stringify({...login, dt: new Date().getTime()}))
}

/**
 * 各ストレージからログイン情報を削除する。
 * @method
 * @async
 */
export const logout = () => {
  LocalStorageHelper.removeLocalStorage('login')
  store.commit('clearAll')
  store.commit('app_service/clearAll')
  store.commit('main/clearAll')
  store.commit('setting/clearAll')
  router.push(APP.MENU.LOGIN_PAGE)
  if (APP.LOGIN_MODE == LOGIN_MODE.APP_SERVICE) {
    HttpHelper.getAppService('/logout', null, true)        
  }
}

/**
 * セッションの有効期限を確認する。タイムアウトした場合はログアウトする。
 * @method
 * @return {Boolean} 有効期限が更新された
 */
export const checkSession = () => {
  const login = LocalStorageHelper.getLogin()
  if (login) {
    const now = new Date().getTime()
    if (now - Number(login.dt) < APP.SYS.TIMEOUT) {
      LocalStorageHelper.setLocalStorage('login', JSON.stringify({...login, dt: now}))
      store.commit('replace', login)
      return true
    }
    logout()
  }
  return false
}

/**
 * テナントCdを取得する。
 * @method
 * @param {String} def 現在のテナントCdが取得できなかった場合に適用されるテナントCd
 * @param {Boolean} providerOk プロバイダユーザを考慮する
 * @return {String}
 */
export const getTenantCd = (def, providerOk) => { // xxx.saas.ドメインの場合、先頭がtenantCdとなる。
  let tenantCd
  if (location.host.includes(APP.SAAS_DOMAIN)) {
    tenantCd = location.host.split('.')[0]
  }
  if (!providerOk && tenantCd == 'provider') {
    const login = LocalStorageHelper.getLogin()
    tenantCd = Util.getValue(login, 'currentTenant.tenantCd', null)
  }
  return 'provider'
  // return tenantCd || def
}

/**
 * リージョンIDを取得する。
 * @method
 * @param {Number} [def = 0] 現在のリージョンIDが取得できなかった場合に適用されるリージョンID
 * @return {Number}
 */
export const getRegionId = (def = 0) => {
  const login = LocalStorageHelper.getLogin()
  return Util.getValue(login, 'currentRegion.regionId', def)
}

/**
 * シングルテナントか確認する。
 * @method
 * @return {Boolean}
 */
export const isSingleTenant = () => getTenantCd()? false: true
