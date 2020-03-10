/**
 * 認証に関するヘルパーモジュール
 * @module helper/base/AuthHelper
 */

import axios from 'axios'
import _ from 'lodash'
import { APP } from '../../constant/config'
import { FEATURE, KEY } from '../../constant/Constants'
import * as BrowserUtil from '../../util/BrowserUtil'
import * as Util from '../../util/Util'
import * as ConfigHelper from '../dataproc/ConfigHelper'
import * as OptionHelper from '../dataproc/OptionHelper'
import * as HttpHelper from './HttpHelper'
import * as LocaleHelper from './LocaleHelper'
import * as LocalStorageHelper from './LocalStorageHelper'
import * as MenuHelper from '../dataproc/MenuHelper'
import * as MasterHelper from '../domain/MasterHelper'

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
  await authByAppService(loginId, password, success, err)
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
  return {frontRev, serviceRev: serviceRev && serviceRev[1]}
}

/**
 * ユーザ情報を取得する。
 * @method
 * @async
 * @param {Boolean} isTenantAdmin 
 * @return {{tenant: Object, tenantFeatureList: Object[], user: Object, featureList: Object[], menu: Object[], currentRegion: Object, setting: Object[]}}
 */
export const getUserInfo = async (isTenantAdmin) => {
  // Get feature, tenant, region, user
  const httpInfos = [
    {name:'masterFeatureList', url: '/meta/feature'},
    {name:'currentTenant', url: '/meta/tenant/currentTenant'},
    {name:'user', url: '/meta/user/currentUser'},
    {name:'currentRegion', url: '/core/region/current'},
  ]
  const {masterFeatureList, currentTenant, user, currentRegion} = await HttpHelper.fetchConcurrent(httpInfos)

  store.commit('app_service/replaceAS', {features: masterFeatureList})

  if (user.providerUserId != null) {
    user.role = {roleId: -1, roleName: 'isTenantAdmin'}
  }
  Util.debug(user)

  const tenantFeatureList = currentTenant.tenantFeatureList.map(tenantFeature => tenantFeature.feature.path)
  Util.debug({tenantFeatureList})
  const featureList = _(user.role.roleFeatureList).map(roleFeature => {
    return {path: roleFeature.feature.path, mode: roleFeature.mode}
  }).sortBy(val => val.path.length * -1).value()

  const menu = await MenuHelper.fetchNav(masterFeatureList.map(m => m.path), tenantFeatureList, featureList, user.providerUserId != null, isTenantAdmin)

  LocalStorageHelper.setLocalStorage(KEY.CURRENT.REGION, currentRegion.regionId)

  // get setting (again in case failed on init or reload)
  const setting = await HttpHelper.getAppService('/meta/setting/wsByTenant/' + getTenantCd('default') + '/' + getRegionId(currentRegion.regionId))

  // get all master
  await MasterHelper.loadMaster()

  return {currentTenant, tenantFeatureList, user, featureList, menu, currentRegion, setting}
}

export const storeMagicNumberList = async () => {
  // await StateHelper.load('sensor')
  const retMap = OptionHelper.getMagicNumberList(store.state.app_service.features)
  Util.debug(retMap)
  await HttpHelper.putAppService('/core/region/storeMagicNumberList', retMap)
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
    let params = new URLSearchParams()
    let tenantCd = getTenantCd(null, true)
    params.append('username', (tenantCd? tenantCd+':':'') + loginId) // username: Spring Boot Security reserved name
    params.append('password', password)
    let data = await HttpHelper.postAppService('/login', params, false)
    HttpHelper.setApiKey(data.apiKey)

    const regionId = LocalStorageHelper.getLocalStorage(KEY.CURRENT.REGION)
    if(Util.hasValue(regionId)){
      const regionRes = await HttpHelper.putAppService(`/core/region/current/${regionId}`)
      if(Util.getValue(regionRes, 'status')) {
        LocalStorageHelper.removeLocalStorage(KEY.CURRENT.REGION)
        LocalStorageHelper.removeLocalStorage(KEY.CURRENT.AREA)
      }
    }

    const userInfo = await getUserInfo(data.isTenantAdmin)
    resetConfig(data.isTenantAdmin, userInfo.setting)

    const userRegionIdList = Util.getValue(userInfo, 'user.userRegionList', []).map(val => val.userRegionPK.regionId)
    const allRegionMove = Util.getValue(userInfo, 'user.role.roleFeatureList', []).some(val => val.feature.featureName == FEATURE.NAME.ALL_REGION && val.mode != 0)
    // Login process
    let isAd = false
    if (loginId.length>50) { // AD Loginの場合
      loginId = userInfo.user.loginId
      isAd = true
      // eslint-disable-next-line require-atomic-updates
      APP.MENU.LOGIN_PAGE = APP.MENU.AZLOGIN_PAGE
    }

    await login({loginId, ...userInfo,
      isTenantAdmin: data.tenantAdmin, // テナント管理画面を表示するか(サーバ側も変数がisTenantAdminだがjson化時にtenantAdminになってしまうため)
      apiKey: data.apiKey,
      isProviderUser: userInfo.user.providerUserId != null,
      userRegionIdList, allRegionMove: allRegionMove, isAd })

    success()

    LocaleHelper.setLocale(LocaleHelper.getLocale())
    store.commit('setLang', LocaleHelper.getLocale(BrowserUtil.getLangShort()))

    // send magic number list (id and locale name)
    await storeMagicNumberList()

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
  LocalStorageHelper.removeLocalStorage(KEY.CURRENT.REGION)
  LocalStorageHelper.removeLocalStorage(KEY.CURRENT.AREA)
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
  LocalStorageHelper.removeLocalStorage(KEY.CURRENT.AREA)
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

    const userInfo = await getUserInfo(loginInfo.isTenantAdmin)
    resetConfig(loginInfo.isTenantAdmin, userInfo.setting)

    await login({...loginInfo, ...userInfo})
  } catch (e) {
    console.error(e)
  }
}

/**
 * ログイン情報を各ストレージに保存する
 * 
 * ADユーザIDはトークンのため、名前に変更する。
 * 
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
  HttpHelper.getAppService('/logout', null, true)        
  const login = LocalStorageHelper.getLogin()
  if (login && login.isAd) {
    window.localStorage.clear()
    router && router.push(APP.MENU.AZLOGIN_PAGE)  
  }
  else {
    LocalStorageHelper.removeLocalStorage('login')
    if (store) {
      store.commit('clearAll')
      store.commit('app_service/clearAll')
      store.commit('main/clearAll')
      store.commit('setting/clearAll')  
    }
    router && router.push(APP.MENU.LOGIN_PAGE)  
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
    tenantCd = Util.getValue(login, 'currentTenant.tenantCd')
  }
  return tenantCd || def
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

export const getADTenantStatus = async (token, register = 0, tenantName = '') => {
  return await HttpHelper.getAppServiceNoCrd(`/meta/tenant/statusOrAdRegister?token=${token}&register=${register}&tenantName=${tenantName}`)
}