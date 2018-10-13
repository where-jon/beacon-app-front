import * as AuthHelper from '../sub/helper/AuthHelper'
import * as StateHelper from '../sub/helper/StateHelper'
import { APP } from '../sub/constant/config'
import { LOGIN_MODE } from '../sub/constant/Constants'

export default function (context) {
  console.debug("checkAuth")
  AuthHelper.setApp(context.app.router, context.app.store)
  StateHelper.setApp(context.app.store)
  if (APP.LOGIN_MODE == LOGIN_MODE.NO_LOGIN) {
    return
  }
  if (process.browser && context.route.path != APP.LOGIN_PAGE && !AuthHelper.checkSession()) {
    console.warn("checkauth ng")
    context.app.router.push(APP.LOGIN_PAGE)
  }
}
