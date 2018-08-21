import { ROLE_FEATURE, MENU } from "../constant/Constants"

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
