import * as AuthHelper from '../sub/helper/AuthHelper'
import * as MenuHelper from '../sub/helper/MenuHelper'
import * as StateHelper from '../sub/helper/StateHelper'
import * as HttpHelper from '../sub/helper/HttpHelper'
import { APP } from '../sub/constant/config'
import { LOGIN_MODE } from '../sub/constant/Constants'

export default function (context) {
  console.debug('checkAuth')
  AuthHelper.setApp(context.app.router, context.app.store)
  StateHelper.setApp(context.app.store, context.app.i18n)
  HttpHelper.setApp(context)
  if (!process.browser) {
    return
  }

  if (context.route.path == APP.LOGIN_PAGE
    ||context.route.path == APP.ERROR_PAGE) { // Login Page is always OK
  }
  else if (APP.LOGIN_MODE != LOGIN_MODE.NO_LOGIN && !AuthHelper.checkSession()) { // check Session
    console.warn('checkauth ng')
    context.app.router.push(APP.LOGIN_PAGE)
  }
  else { // check tenant feature
    let tenantFeatureList = context.store.state.tenantFeatureList
    if (!tenantFeatureList || tenantFeatureList.length == 0) {
      console.error('No tenant feature List', context.route.path)
      context.app.router.push(APP.ERROR_PAGE)
      return
    }
    const isTenantAdmin = JSON.parse(window.localStorage.getItem('login')).tenantAdmin
    if (!isTenantAdmin && tenantFeatureList && !MenuHelper.featureOk(context.route.path, tenantFeatureList)) {
      if (MenuHelper.featureOk(APP.TOP_PAGE, tenantFeatureList)) {
        context.app.router.push(APP.TOP_PAGE)
      }
      else {
        context.app.router.push(APP.LOGIN_PAGE)
      }
    }
  }
}
