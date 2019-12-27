/**
 * 言語に関するヘルパーモジュール
 * @module helper/base/LocaleHelper
 */

import * as BrowserUtil from '../../util/BrowserUtil'
import * as HttpHelper from './HttpHelper'
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
 * システムが使用する言語情報を取得する。
 * @method
 * @return {String}
 */
export const getSystemLocale = () => getLocale(BrowserUtil.getLangShort())

/**
 * 言語情報を設定する。
 * @method
 * @param {String} locale 
 */
export const setLocale = locale => {
  LocalStorageHelper.setLocalStorage(`${document.domain}-locale`, locale)
}

/**
 * 言語ファイルを取得する。
 * @method
 * @param {String} lang 言語種類を示す文字列
 * @return {String}
 */
export const getMessageData = async (lang) => {
  const fileName = lang + '.json'
  if(!await HttpHelper.existServerFile(fileName)){
    return ''
  }
  return await HttpHelper.getFronServerFile('/' + fileName)
}

