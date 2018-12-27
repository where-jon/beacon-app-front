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
  if(theme){
    return theme
  }
  const login = JSON.parse(window.localStorage.getItem('login'))
  if(login){
    if(login.tenantAdmin){
      return THEME[0].name
    }
    if(login.isProvider){
      return THEME[4].name
    }
  }
  return DISP.THEME
}

export const getThemeClasses = () => {
  const theme = getTheme()
  const obj = {}
  THEME.forEach((e) => {
    obj[e.name] = e.name === theme
  })
  return obj
}
