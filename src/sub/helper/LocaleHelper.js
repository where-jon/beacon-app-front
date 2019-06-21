import * as LocalStorageHelper from './LocalStorageHelper'

/**
 * 言語情報を取得する。
 * @method
 * @param {String} [defaultLocale = ''] 取得できなかった場合に適用される言語 
 * @return {String}
 */
export const getLocale = (defaultLocale = '') => {
  const locale = LocalStorageHelper.getLocalStorage(`${document.domain}-locale`)
  return locale? locale : defaultLocale
}

/**
 * 言語情報を設定する。
 * @method
 * @param {String} locale 
 */
export const setLocale = locale => {
  LocalStorageHelper.setLocalStorage(`${document.domain}-locale`, locale)
}
