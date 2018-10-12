import { ROLE_FEATURE, MENU } from "../constant/Constants"
import { THEME } from "../constant/config"

let store

export const setStore = (pStore) => {
  store = pStore
}

export const fetchNav = (featureList) => {
  let retNav = _.map(MENU, (group) => {
    let pages = _.filter(group.pages, (page) => {
      return getMode(page.feature, featureList) > ROLE_FEATURE.MODE.RO_SYS
    })
    return {...group, pages}
  })

  retNav = _.filter(retNav, (group) => {
    return group.pages.length > 0
  })
  return retNav
}

export const getMode = (path, featureList = store.state.featureList) => {
  let feature = _.find(featureList, (feature) => {
    if (feature.path.endsWith("*") && path.startsWith(feature.path.slice(0, -1))
      || feature.path == path) {
        return true
    }
  })
  console.debug("feature.mode", path, feature && feature.mode || ROLE_FEATURE.MODE.RW)

  return feature && feature.mode || ROLE_FEATURE.MODE.RW
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