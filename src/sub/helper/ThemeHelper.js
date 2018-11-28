import { THEME } from "../constant/Constants"
import { DISP } from '../constant/config'
export const getButtonTheme = (loginId) => {
  const theme = getTheme(loginId)
  return theme !== 'default' ? theme : 'buttonDefault'
}

export const getThemeColor = (loginId) => {
  const themeName = getTheme(loginId)
  return THEME.find((theme) => theme.name == themeName).color
}

export const getTheme = (loginId) => {
  if (!loginId || loginId == null) {
    return DISP.THEME
  }
  const theme = window.localStorage.getItem(loginId + '-theme')
  return theme && theme !== 'undefined' ? theme : DISP.THEME
}

export const getThemeClasses = (loginId) => {
  const theme = getTheme(loginId)
  const obj = {}
  THEME.forEach((e) => {
    obj[e.name] = e.name === theme
  })
  return obj
}
