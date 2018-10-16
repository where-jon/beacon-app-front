import * as AuthHelper from '../sub/helper/AuthHelper'
import * as MenuHelper from '../sub/helper/MenuHelper'
import * as StateHelper from '../sub/helper/StateHelper'
import { APP } from '../sub/constant/config'
import { LOGIN_MODE } from '../sub/constant/Constants'

export default function (context) {
  console.debug("checkAuth")
  AuthHelper.setApp(context.app.router, context.app.store)
  StateHelper.setApp(context.app.store)
  if (!process.browser) {
    return
  }

  if (context.route.path == APP.LOGIN_PAGE) { // Login Page is always OK
  }
  else if (APP.LOGIN_MODE != LOGIN_MODE.NO_LOGIN && !AuthHelper.checkSession()) { // check Session
    console.warn("checkauth ng")
    context.app.router.push(APP.LOGIN_PAGE)
  }
  else { // check tenant feature
    let tenantFeatureList = context.store.state.tenantFeatureList
    if (tenantFeatureList && !MenuHelper.tenantOk(context.route.path, tenantFeatureList)) {
      context.app.router.push(APP.TOP_PAGE)
    }
  }
}
