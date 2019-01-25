import { ROLE_FEATURE, MENU } from '../constant/Constants'
import * as Util from '../util/Util'

let store

export const setStore = (pStore) => {
  store = pStore
}

export const fetchNav = (masterFeatureList, tenantFeatureList, featureList, isProvider, isTenantAdmin) => {
  let retNav = _.map(MENU, (group) => {
    let pages = _.filter(group.pages, (page) => {
      if(!isProvider && !featureOk('/' + group.base + page.path, masterFeatureList)){
        return false
      }
      if (!isTenantAdmin && group.tenantOnly) {
        return false
      }
      if (!isProvider && group.providerOnly) {
        return false
      }
      return isTenantAdmin || featureOk('/' + group.base + page.path, tenantFeatureList) && getMode('/' + group.base + page.path, featureList) & ROLE_FEATURE.MODE.SYS_ALL
    })
    return {...group, pages}
  })

  retNav = _.filter(retNav, (group) => {
    return group.pages.length > 0
  })
  return retNav
}

export const featureOk = (target, featurePathList) => {
  return featurePathList.find((path) => Util.pathMatch(target, path)) != null
}

export const getMode = (path, featureList = store.state.featureList) => {
  let feature = _.find(featureList, (feature) => {
    if (Util.pathMatch(path, feature.path)) {
      return true
    }
  })
  console.debug('feature.mode', path, feature && feature.mode)

  let ret = feature && feature.mode
  return ret != null? ret: ROLE_FEATURE.MODE.SYS_ALL
}

export const isActionable = (path) => {
  return isDetailReferenceable(path) || isUpdatable(path) || isDeleteable(path)
}

export const isDetailReferenceable = (path) => {
  return (!isUpdatable(path)) && (getMode(path) & ROLE_FEATURE.MODE.DETAIL_REFERENCE? true: false)
}

export const isUpdatable = (path) => {
  return (getMode(path) & ROLE_FEATURE.MODE.UPDATE)? true: false
}

export const isDeleteable = (path) => {
  return getMode(path) & ROLE_FEATURE.MODE.DELETE
}

export const isRegistable = (path) => {
  return (getMode(path) & ROLE_FEATURE.MODE.REGIST? true: false)
}

export const isBulkRegistable = (path) => {
  return (getMode(path) & ROLE_FEATURE.MODE.BULK_REGIST? true: false)
}

export const isBulkReferenceable = (path) => {
  return (getMode(path) & ROLE_FEATURE.MODE.BULK_REFERENCE? true: false)
}

export const isEditable = (path) => {
  return isUpdatable(path) || isDeleteable(path)
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

export const useMaster = (feature) => {
  if (JSON.parse(window.localStorage.getItem('login')).tenantAdmin) {
    return true
  }
  const featureList = store.state.tenantFeatureList
  const path = '/master/' + feature
  return featureOk(path, featureList)
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
