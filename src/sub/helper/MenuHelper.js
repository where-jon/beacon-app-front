import { ROLE_FEATURE, MENU, ROLE } from '../constant/Constants'
import * as Util from '../util/Util'

let store

export const setStore = (pStore) => {
  store = pStore
}

export const fetchNav = (featureList, tenantFeatureList, role, isTenantAdmin) => {
  let retNav = _.map(MENU, (group) => {
    let pages = _.filter(group.pages, (page) => {
      if (!isTenantAdmin && group.base == 'provider/') {
        return false
      }
      return role.isSuperAdmin || tenantOk('/' + group.base + page.path, tenantFeatureList) && getMode(page.feature, featureList) > ROLE_FEATURE.MODE.RO_SYS
    })
    return {...group, pages}
  })

  retNav = _.filter(retNav, (group) => {
    return group.pages.length > 0
  })
  return retNav
}

export const tenantOk = (target, tenantFeatureList) => {
  return tenantFeatureList.find((path) => Util.pathMatch(target, path)) != null
}

export const getMode = (path, featureList = store.state.featureList) => {
  let feature = _.find(featureList, (feature) => {
    if (Util.pathMatch(path, feature.path)) {
      return true
    }
  })
  console.debug('feature.mode', path, feature && feature.mode)

  let ret = feature && feature.mode
  return ret != null? ret: ROLE_FEATURE.MODE.RW
}

export const isEditable = (path) => {
  return getMode(path) == ROLE_FEATURE.MODE.RW
}

export const getThemeClasses = (selectedTheme) => {
  return {
    default: selectedTheme === 'default',
    primary: selectedTheme === 'primary',
    secondary: selectedTheme === 'secondary',
    success: selectedTheme === 'success',
    info: selectedTheme === 'info',
    warning: selectedTheme === 'warning',
    danger: selectedTheme === 'danger',
    light: selectedTheme === 'light',
    dark: selectedTheme === 'dark',
  }
}

export const isShowMenu = (page, role) => {
  if (page.roles == null || page.roles.length < 1) {
    return true
  }

  const result = page.roles.find((e) => {
    return role === e
  })

  return result != null
}

export const useMaster = (feature) => {
  const role = store.state.role
  if (role.isSuperAdmin) {
    return true
  }
  const featureList = store.state.tenantFeatureList
  const path = '/master/' + feature
  return tenantOk(path, featureList)
}

export const isMenuEntry = (path) => {
  const menus = store.state.menu
  const pathList = []
  _.forEach(menus, (menu) => {
    const base = '/' + menu.base
    _.forEach(menu.pages, (page) => {
      pathList.push(base + page.path)
    })
  })

  return _.some(pathList, (pth) => pth === path)
}
