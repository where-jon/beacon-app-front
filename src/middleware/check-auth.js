import { APP } from '../sub/constant/config'
import { LOGIN_MODE, FORCE_PUSH_MENU, ROLE_FEATURE, LOCAL_STORAGE } from '../sub/constant/Constants'
import * as BrowserUtil from '../sub/util/BrowserUtil'
import * as Util from '../sub/util/Util'
import * as AuthHelper from '../sub/helper/base/AuthHelper'
import * as BulkHelper from '../sub/helper/dataproc/BulkHelper'
import * as HttpHelper from '../sub/helper/base/HttpHelper'
import * as LocaleHelper from '../sub/helper/base/LocaleHelper'
import * as LocalStorageHelper from '../sub/helper/base/LocalStorageHelper'
import * as MenuHelper from '../sub/helper/dataproc/MenuHelper'
import * as OptionHelper from '../sub/helper/dataproc/OptionHelper'
import * as ProhibitHelper from '../sub/helper/domain/ProhibitHelper'
import * as PositionHelper from '../sub/helper/domain/PositionHelper'
import * as SensorHelper from '../sub/helper/domain/SensorHelper'
import * as SettingHelper from '../sub/helper/domain/SettingHelper'
import * as StateHelper from '../sub/helper/dataproc/StateHelper'
import * as ValidateHelper from '../sub/helper/dataproc/ValidateHelper'
import * as ViewHelper from '../sub/helper/ui/ViewHelper'
import * as VueSelectHelper from '../sub/helper/ui/VueSelectHelper'

const getRedirectUrl = route => {
  const param = { path: route.path, fullPath: route.fullPath }

  if(Util.hasValue(Object.keys(route.query))) {
    LocalStorageHelper.setLocalStorage(LOCAL_STORAGE.KEY.REDIRECT_URL, JSON.stringify(param))
    return
  }

  const popParam = LocalStorageHelper.popLocalStorage(LOCAL_STORAGE.KEY.REDIRECT_URL)
  if(!Util.hasValue(popParam) || param.path != popParam.path) {
    return
  }

  return popParam.fullPath
}

export default function (context) {
  Util.debug('checkAuth')
  const lang = LocaleHelper.getLocale(process.browser? BrowserUtil.getLangShort(): 'ja')
  context.app.i18n.locale = context.app.i18n.messages[lang]? lang: 'en'

  AuthHelper.setApp(context.app.router, context.app.store)
  StateHelper.setApp(context.app.store, context.app.i18n)
  PositionHelper.setApp(context.app.store)
  ViewHelper.setApp(context.app.i18n)
  HttpHelper.setApp(context)
  SettingHelper.setApp(context.app.i18n)
  BulkHelper.setApp(context.app.i18n)
  OptionHelper.setApp(context.app.i18n)
  ProhibitHelper.setApp(context.app.i18n)
  ValidateHelper.setApp(context.app.i18n)
  SensorHelper.setApp(context.app.i18n)
  VueSelectHelper.setApp(context.app.i18n)
  if (!process.browser) {
    return
  }

  const redirectUrl = getRedirectUrl(context.route)

  if (context.route.path == APP.MENU.LOGIN_PAGE || context.route.path == APP.MENU.ERROR_PAGE) { // Login Page is always OK
    return
  }

  if (Util.hasValue(redirectUrl)) {
    context.app.router.push(redirectUrl)
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
  const loginInfo = LocalStorageHelper.getLogin()
  const isTenantAdmin = loginInfo.tenantAdmin
  const isProvider = loginInfo.isProvider

  const extraMenu = FORCE_PUSH_MENU.find(menu => menu.parent == context.route.path && menu.isPush())
  if(extraMenu){
    context.redirect(extraMenu.path)
    return
  }
  if (!isProvider && !isTenantAdmin && (!tenantFeatureList || tenantFeatureList.length == 0)) {
    console.error('No tenant feature List', context.route.path)
    AuthHelper.logout()
    context.redirect('/')
    context.app.router.push(APP.MENU.LOGIN_PAGE)
    return
  }
  const roleFeatureList = context.store.state.featureList
  const isUser = !isProvider && !isTenantAdmin
  const notAuthTenantFeature = tenantFeatureList && !MenuHelper.featureOk(context.route.path, tenantFeatureList)
  const notAuthRoleFeature = roleFeatureList && (MenuHelper.getMode(context.route.path, roleFeatureList) & ROLE_FEATURE.MODE.SYS_ALL) == 0
  if (isUser && (notAuthTenantFeature || notAuthRoleFeature)) {
    if (MenuHelper.featureOk(APP.MENU.TOP_PAGE, tenantFeatureList) && (MenuHelper.getMode(APP.MENU.TOP_PAGE, roleFeatureList) & ROLE_FEATURE.MODE.SYS_ALL) != 0) {
      context.redirect(APP.MENU.TOP_PAGE)
    }
    else {
      AuthHelper.logout()
      context.redirect('/')
      context.app.router.push(APP.MENU.LOGIN_PAGE)
    }
  }
}
