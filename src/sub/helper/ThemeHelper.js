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

export const getTheme = (loginId) => {
  if (!loginId || (typeof loginId) === 'undefined') {
    return 'default'
  }
  return window.localStorage.getItem(loginId + '-theme')
}