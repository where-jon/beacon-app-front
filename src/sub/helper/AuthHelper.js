import md5 from 'md5'
import _ from 'lodash'
import * as HttpHelper from './HttpHelper'
import * as MenuHelper from './MenuHelper'
import * as ConfigHelper from './ConfigHelper'
import { APP, LOCAL_LOGIN } from '../constant/config'
import { LOGIN_MODE, MENU } from '../constant/Constants'

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
    if (_.includes(LOCAL_LOGIN.ID_PASS, md5(loginId + ":" + password))) {
        await login(loginId)
        success()
    }
    else {
        err()
    }
}

export const authByAppService = async (loginId, password, success, err) => {
    try {
        var params = new URLSearchParams()
        params.append('username', loginId) // username: Spring Boot Security reserved name
        params.append('password', password)
        let data = await HttpHelper.postAppService('/login', params)

        // get tenant feature list
        let tenant = await HttpHelper.getAppService('/meta/tenant/currentTenant')
        let tenantFeatureList = tenant.tenantFeatureList.map((tenantFeature) => tenantFeature.feature.path)
        console.log({tenantFeatureList})

        // get role feature list
        let user = await HttpHelper.getAppService('/meta/user/currentUser')
        console.log(user)
        let featureList = _(user.role.roleFeatureList).map((roleFeature) => {
            return {path: roleFeature.feature.path, mode: roleFeature.mode}
        }).sortBy((val) => val.path.length * -1).value()
        let menu = MenuHelper.fetchNav(featureList, tenantFeatureList)

        // get setting
        let setting = await HttpHelper.getAppService('/meta/setting')
        ConfigHelper.applyAppServiceSetting(setting)
        await login({loginId, username:user.name, role:data.role, featureList, menu}, setting)
        success()
    } catch (e) {
        console.error(e)
        err(e)
    }
}

export const login = (login, setting) => {
    store.commit('replace', login)
    window.localStorage.setItem('login', JSON.stringify({...login, dt: new Date().getTime()}))
    window.localStorage.setItem('setting', JSON.stringify(setting))
  }

export const logout = () => {
    window.localStorage.removeItem('login')
    window.localStorage.removeItem('setting')
    store.commit('clearAll')
    store.commit('app_service/clearAll')
    store.commit('main/clearAll')
    store.commit('monitor/clearAll')
    router.push(APP.LOGIN_PAGE)
    if (APP.LOGIN_MODE == LOGIN_MODE.APP_SERVICE) {
        HttpHelper.getAppService('/logout')
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
