import * as AuthHelper from '../sub/helper/AuthHelper'
import * as MenuHelper from '../sub/helper/MenuHelper'
import * as StateHelper from '../sub/helper/StateHelper'
import * as HttpHelper from '../sub/helper/HttpHelper'
import * as ViewHelper from '../sub/helper/ViewHelper'
import * as SettingHelper from '../sub/helper/SettingHelper'
import { APP } from '../sub/constant/config'
import { LOGIN_MODE, FORCE_PUSH_MENU } from '../sub/constant/Constants'

export default function (context) {
  console.debug('checkAuth')
  AuthHelper.setApp(context.app.router, context.app.store)
  StateHelper.setApp(context.app.store, context.app.i18n)
  ViewHelper.setApp(context.app.i18n)
  HttpHelper.setApp(context)
  SettingHelper.setApp(context.app.i18n)
  if (!process.browser) {
    return
  }

  if (context.route.path == APP.MENU.LOGIN_PAGE || context.route.path == APP.MENU.ERROR_PAGE) { // Login Page is always OK
    return
  }
  if(context.route.path == '/'){
    context.app.router.push(APP.MENU.LOGIN_PAGE)
    return
  }
  if (APP.LOGIN_MODE != LOGIN_MODE.NO_LOGIN && !AuthHelper.checkSession()) { // check Session
    console.warn('checkauth ng')
    context.redirect('/')
    context.app.router.push(APP.MENU.LOGIN_PAGE)
    return
  }
  if(context.route.path.slice(-1) == '/'){
    context.app.router.push(`${context.route.path.slice(0, -1)}${context.route.hash? '': '#'}`)
  }
  // check tenant feature
  let tenantFeatureList = context.store.state.tenantFeatureList
  const loginInfo = JSON.parse(window.localStorage.getItem('login'))
  const isTenantAdmin = loginInfo.tenantAdmin
  const isProvider = loginInfo.isProvider

  const extraMenu = FORCE_PUSH_MENU.find(menu => menu.parent == context.route.path && menu.isPush())
  if(extraMenu){
    context.redirect(extraMenu.path)
    return
  }
  if (!isProvider && !isTenantAdmin && (!tenantFeatureList || tenantFeatureList.length == 0)) {
    console.error('No tenant feature List', context.route.path)
    context.app.router.push(APP.MENU.ERROR_PAGE)
    return
  }
  if (!isProvider && !isTenantAdmin && tenantFeatureList && !MenuHelper.featureOk(context.route.path, tenantFeatureList)) {
    if (MenuHelper.featureOk(APP.MENU.TOP_PAGE, tenantFeatureList)) {
      context.redirect(APP.MENU.TOP_PAGE)
    }
    else {
      AuthHelper.logout()
      context.redirect('/')
      context.app.router.push(APP.MENU.LOGIN_PAGE)
    }
  }
}
