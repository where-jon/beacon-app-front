import { THEME } from "../constant/config"

export const getThemeClasses = (keyPrefix = '') => {
  const obj = {}
  const login = JSON.parse(window.localStorage.getItem('login'))
  const selected = login !== null ? window.localStorage.getItem(login.loginId + '-theme') : 'default'
  const targetClass = (selected && (typeof selected) !== 'undefined') ? selected : 'default'
  THEME.forEach((e) => {
    obj[keyPrefix + e.name] = targetClass === e.name
  })
  return obj
}

export const getButtonTheme = (loginId) => {
  const theme = getTheme(loginId)
  return theme !== 'default' ? theme : 'primary'
}

export const getTheme = (loginId) => {
  if (!loginId || (typeof loginId) === 'undefined') {
    return 'default'
  }
  const theme = window.localStorage.getItem(loginId + '-theme')
  return theme && ((typeof theme) !== 'undefined') ? theme : 'default'
}

export const themeColors = {
  default: '#337ab7',
  primary: '#007bff',
  secondary: '#868e96',
  success: '#28a745',
  info: '#17a2b8',
  warning: '#ffc107',
  danger: '#dc3545',
  light: '#f8f9fa',
  dark: '#343a40'
}