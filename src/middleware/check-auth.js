import { APP } from '../sub/constant/config'
import { FORCE_PUSH_MENU, ROLE_FEATURE } from '../sub/constant/Constants'
import * as ArrayUtil from '../sub/util/ArrayUtil'
import * as Util from '../sub/util/Util'
import * as AuthHelper from '../sub/helper/base/AuthHelper'
import * as HttpHelper from '../sub/helper/base/HttpHelper'
import * as LocalStorageHelper from '../sub/helper/base/LocalStorageHelper'
import * as MenuHelper from '../sub/helper/dataproc/MenuHelper'
import * as StateHelper from '../sub/helper/dataproc/StateHelper'
import * as MasterHelper from '../sub/helper/domain/MasterHelper'

export default function (context) {
  Util.debug('checkAuth')

  if (!process.browser) {
    return
  }

  if (context.route.path.startsWith(APP.MENU.AZLOGIN_PAGE)) { // ADログインの場合、ログイページ書き換え TODO: init.jsに移せないか
    APP.MENU.LOGIN_PAGE = APP.MENU.AZLOGIN_PAGE
    return
  }

  if (ArrayUtil.equalsAny(context.route.path, [APP.MENU.LOGIN_PAGE, APP.MENU.LOGIN_PAGE + '/', APP.MENU.ERROR_PAGE, APP.MENU.ERROR_PAGE + '/'])) { // Login Page is always OK
    return
  }

  if(context.route.path == '/'){ // ルートパスはログインページに遷移させる
    context.app.router.push(APP.MENU.LOGIN_PAGE)
    return
  }
  if (!AuthHelper.checkSession()) { // check Session
    console.warn('checkauth ng')
    context.redirect('/')
    context.app.router.push(APP.MENU.LOGIN_PAGE)
    return
  }
  if(context.route.path.slice(-1) == '/'){ // TODO: 要コメント
    const query = HttpHelper.createQuery(context.route.query)
    if(Util.hasValue(query)) {
      context.redirect(context.route.path.slice(0, -1))
    }
    context.app.router.push(`${context.route.path.slice(0, -1)}${Util.hasValue(query)? '?' + query: ''}${context.route.hash? '': '#'}`)
  }
  // check tenant feature
  const tenantFeatureList = context.store.state.tenantFeatureList
  const loginInfo = LocalStorageHelper.getLogin()
  const isTenantAdmin = loginInfo.isTenantAdmin
  const isProviderUser = loginInfo.isProviderUser

  const extraMenu = FORCE_PUSH_MENU.find(menu => menu.parent == context.route.path && menu.isPush())
  if(extraMenu){
    context.redirect(extraMenu.path)
    return
  }
  if (!isProviderUser && !isTenantAdmin && (!tenantFeatureList || tenantFeatureList.length == 0)) {
    console.error('No tenant feature List', context.route.path)
    AuthHelper.logout()
    context.redirect('/')
    context.app.router.push(APP.MENU.LOGIN_PAGE)
    return
  }
  const roleFeatureList = context.store.state.featureList
  const isUser = !isProviderUser && !isTenantAdmin
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
      return
    }
  }

  // マスタのキャッシュ時間を過ぎた場合、再ロード
  if (new Date().getTime() - context.store.state.app_service.lastMasterFetchTime > APP.SYS.STATE_EXPIRE_TIME) {
    MasterHelper.loadMaster()
    StateHelper.clearAreaImages()
  }

}
