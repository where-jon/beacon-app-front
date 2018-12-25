import { THEME } from '../constant/Constants'
import { DISP } from '../constant/config'

export const getButtonTheme = () => {
  const theme = getTheme()
  return theme !== 'default' ? theme : 'buttonDefault'
}

export const getThemeColor = () => {
  const themeName = getTheme()
  return THEME.find((theme) => theme.name == themeName).color
}

export const getTheme = () => {
  const theme = window.localStorage.getItem(document.domain + '-theme')
  return theme && theme !== 'undefined' ? theme : DISP.THEME
}

export const getThemeClasses = () => {
  const theme = getTheme()
  const obj = {}
  THEME.forEach((e) => {
    obj[e.name] = e.name === theme
  })
  return obj
}
