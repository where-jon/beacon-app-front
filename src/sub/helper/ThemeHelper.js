import { THEME } from '../constant/Constants'
import { DISP } from '../constant/config'
import * as LocalStorageHelper from '../helper/LocalStorageHelper'

/**
 * ボタンのテーマ名称を取得する。
 * @method
 * @return {String}
 */
export const getButtonTheme = () => {
  const theme = getTheme()
  return theme !== 'default' ? theme : 'buttonDefault'
}

/**
 * テーマカラーを取得する。
 * @method
 * @return {String}
 */
export const getThemeColor = () => {
  const themeName = getTheme()
  return THEME.find(theme => theme.name == themeName).color
}

/**
 * テーマの名称を取得する。
 * @method
 * @return {String}
 */
export const getTheme = () => {
  const theme = LocalStorageHelper.getLocalStorage(document.domain + '-theme')
  if(theme){
    return theme
  }
  const login = LocalStorageHelper.getLogin()
  if(login){
    if(login.tenantAdmin){
      return THEME[0].name
    }
    if(login.isProvider){
      return THEME[4].name
    }
  }
  return DISP.MENU.THEME
}

/**
 * 全テーマの適用情報を取得する
 * @method
 * @return {Object} - 全テーマの名称をプロパティに持ち、その型はBooleanとなる
 */
export const getThemeClasses = () => {
  const theme = getTheme()
  const obj = {}
  THEME.forEach(e => {
    obj[e.name] = e.name === theme
  })
  return obj
}
