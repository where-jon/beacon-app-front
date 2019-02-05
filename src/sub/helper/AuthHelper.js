import md5 from 'md5'
import _ from 'lodash'
import axios from 'axios'
import * as HttpHelper from './HttpHelper'
import * as AppServiceHelper from './AppServiceHelper'
import * as StateHelper from './StateHelper'
import * as MenuHelper from './MenuHelper'
import * as ConfigHelper from './ConfigHelper'
import * as LocaleHelper from './LocaleHelper'
import { APP, LOCAL_LOGIN } from '../constant/config'
import { LOGIN_MODE, FEATURE } from '../constant/Constants'
import { getLangShort } from '../util/HtmlUtil'
import * as Util from '../util/Util'

let router
let store

export const setApp = (pRouter, pStore) => {
  router = pRouter
  store = pStore
}

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

export const authByLocal = async (loginId, password, success, err) => {
  // console.log(md5(loginId + ":" + password)) // for create
  if (_.includes(LOCAL_LOGIN.ID_PASS, md5(loginId + ':' + password))) {
    await login(loginId)
    success()
  }
  else {
    err()
  }
}

export const getRevInfo = async () => {
  const frontRev = (await axios.get('/head.txt')).data
  const apsIndex = await HttpHelper.getAppServiceNoCrd('/', false) // pre network check
  const serviceRev = apsIndex.match(new RegExp('Head:([0-9a-zA-Z]+)'))
  return {frontRev: frontRev, serviceRev: serviceRev && serviceRev[1]}
}

export const getUserInfo = async (tenantAdmin) => {
  // get feature list
  const master = await HttpHelper.getAppService('/meta/feature')
  const masterFeatureList = master.map((m) => m.path)

  // get tenant feature list
  const tenant = await HttpHelper.getAppService('/meta/tenant/currentTenant')
  const tenantFeatureList = tenant.tenantFeatureList.map((tenantFeature) => tenantFeature.feature.path)
  console.log({tenantFeatureList})

  // get role feature list
  const user = await AppServiceHelper.getCurrentUser()
  console.log(user)
  const featureList = _(user.role.roleFeatureList).map((roleFeature) => {
    return {path: roleFeature.feature.path, mode: roleFeature.mode}
  }).sortBy((val) => val.path.length * -1).value()
  const menu = MenuHelper.fetchNav(masterFeatureList, tenantFeatureList, featureList, user.providerUserId != null, tenantAdmin)

  // get region
  const currentRegion = await HttpHelper.getAppService('/core/region/current')
  await StateHelper.load('region', true)

  // get setting (again in case failed on init or reload)
  const setting = await HttpHelper.getAppService('/meta/setting/wsByTenant/' + getTenantCd('default'))
  return {tenant, tenantFeatureList, user, featureList, menu, currentRegion, setting}
}

export const resetConfig = async (isTenantAdmin, setting) => {
  ConfigHelper.initConfig()
  ConfigHelper.applyAppServiceSetting(setting)  
  if (isTenantAdmin) {
    APP.TOP_PAGE = '/provider/tenant'
  }
}

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

    const userRegionIdList = userInfo.user.userRegionList? userInfo.user.userRegionList.map((val) => val.userRegionPK.regionId): []
    const allRegionMove = userInfo.user.role && userInfo.user.role.roleFeatureList? userInfo.user.role.roleFeatureList.find((val) => val.feature.featureName == FEATURE.NAME.ALL_REGION)? true: false: false
    // Login process
    await login({loginId, username:userInfo.user.name, role: userInfo.user.role, featureList: userInfo.featureList, tenantFeatureList: userInfo.tenantFeatureList, 
      menu: userInfo.menu, currentRegion: userInfo.currentRegion, frontRev: revInfo.frontRev, serviceRev: revInfo.serviceRev, tenantAdmin: data.tenantAdmin,
      isProvider: userInfo.user.providerUserId != null, currentTenant: userInfo.tenant, userRegionIdList: userRegionIdList, allRegionMove: allRegionMove, apiKey: data.apiKey })
    success()
    StateHelper.loadAreaImages()
    LocaleHelper.setLocale(LocaleHelper.getLocale())
    store.commit('setLang', LocaleHelper.getLocale(getLangShort()))

  } catch (e) {
    console.error(e)
    err(e)
  }
}

export const switchTenant = async (tenantId) => {
  await HttpHelper.putAppService(`/meta/tenant/current/${tenantId}`)
  await switchAppService()
}

export const switchRegion = async (regionId) => {
  await HttpHelper.putAppService(`/core/region/current/${regionId}`)
  await switchAppService()
}

export const switchAppService = async () => {
  try {
    const loginInfo = JSON.parse(window.localStorage.getItem('login'))

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

    await login(loginInfo)
    StateHelper.loadAreaImages()

  } catch (e) {
    console.error(e)
  }
}

export const login = async (login) => {
  console.log({login})
  store.commit('replace', login)
  window.localStorage.setItem('login', JSON.stringify({...login, dt: new Date().getTime()}))
}

export const logout = () => {
  window.localStorage.removeItem('login')
  store.commit('clearAll')
  store.commit('app_service/clearAll')
  store.commit('main/clearAll')
  store.commit('setting/clearAll')
  router.push(APP.LOGIN_PAGE)
  if (APP.LOGIN_MODE == LOGIN_MODE.APP_SERVICE) {
    HttpHelper.getAppService('/logout', null, true)        
  }
}

export const checkSession = () => {
  const login = JSON.parse(window.localStorage.getItem('login'))
  if (login) {
    const now = new Date().getTime()
    if (now - Number(login.dt) < APP.TIMEOUT) {
      window.localStorage.setItem('login', JSON.stringify({...login, dt: now}))
      store.commit('replace', login)
      return true
    }
    logout()
  }
  return false
}

export const getTenantCd = (def, providerOk) => { // xxx.saas.ドメインの場合、先頭がtenantCdとなる。
  let tenantCd
  if (location.host.includes(APP.SAAS_DOMAIN)) {
    tenantCd = location.host.split('.')[0]
  }
  if (!providerOk && tenantCd == 'provider') {
    const login = JSON.parse(window.localStorage.getItem('login'))
    tenantCd = Util.getValue(login, 'currentTenant.tenantCd', null)
  }
  return tenantCd || def
}

