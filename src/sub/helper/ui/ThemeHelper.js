/**
 * テーマカラーに関するヘルパーモジュール
 * @module helper/ui/ThemeHelper
 */

import { DISP } from '../../constant/config'
import { THEME } from '../../constant/Constants'
import * as LocalStorageHelper from '../base/LocalStorageHelper'

/**
 * ボタンのテーマ名称を取得する。
 * @method
 * @param {Boolean} [isOutline = true]
 * @return {String}
 */
export const getButtonTheme = (isOutline = true) => {
  const theme = getTheme()
  const prefix = isOutline? 'outline-': ''
  return prefix + (theme !== 'default' ? theme : 'buttonDefault')
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
    if(login.isTenantAdmin){
      return THEME[0].name
    }
    if(login.isProviderUser){
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
