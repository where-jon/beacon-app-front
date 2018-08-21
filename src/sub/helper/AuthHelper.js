import md5 from 'md5'
import _ from 'lodash'
import * as HttpHelper from './HttpHelper'
import * as MenuHelper from './MenuHelper'
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

        // get role feature list
        let user = await HttpHelper.getAppService('/meta/user/currentUser')
        let featureList = _(user.role.roleFeatureList).map((roleFeature) => {
            return {path: roleFeature.feature.path, mode: roleFeature.mode}
        }).sortBy((val) => val.path.length * -1).value()
        let menu = MenuHelper.fetchNav(featureList)

        await login({loginId, role:data.role, featureList, menu})
        success()
    } catch (e) {
        console.error(e)
        err(e)
    }
}

export const login = (login) => {
    store.commit('replace', login)
    window.localStorage.setItem('login', JSON.stringify({...login, dt: new Date().getTime()}))
}

export const logout = () => {
    window.localStorage.removeItem('login')
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
    console.log({login})

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
