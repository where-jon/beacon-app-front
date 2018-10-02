import { THEME } from "../constant/config"
import styles from '../../sub/constant/config.scss'

export const getButtonTheme = (loginId) => {
  const theme = getTheme(loginId)
  return theme !== 'default' ? theme : 'primary'
}

export const getTheme = (loginId) => {
  if (!loginId || (typeof loginId) === 'undefined') {
    return 'default'
  }
  const theme = window.localStorage.getItem(loginId + '-theme')
  return theme && theme !== 'undefined' ? theme : 'default'
}

export const getThemeClasses = (loginId) => {
  const theme = getTheme(loginId)
  const obj = {}
  THEME.forEach((e) => {
    obj[e.name] = e.name === theme
  })
  return obj
}

export const themeColors = {
  default: '#588BC1',
  earthcolor : '#5C7886',
  autumn : '#927760',
  vivid : '#D50057',
}