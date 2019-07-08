/**
 * 文字コードに関するヘルパーモジュール
 * @module helper/base/CharSetHelper
 */

import { CHAR_SET } from '../../constant/Constants'
import * as LocalStorageHelper from './LocalStorageHelper'

/**
 * 現在の文字セットを取得する。
 * @method
 * @param {String} loginId 
 * @return {String}
 */
export const getCharSet = loginId => {
  if (loginId == null) {
    return CHAR_SET[0].name
  }
  const charSet = LocalStorageHelper.getLocalStorage(loginId + '-charSet')
  return charSet ? charSet : CHAR_SET[0].name
}

/**
 * 一括登録時に適用する文字セットを設定する。
 * @method
 * @param {String} loginId 
 * @param {Number} charSetId 
 */
export const setBulkCharSet = (loginId, charSetId) => {
  if (loginId == null) {
    return
  }
  const selected = CHAR_SET.find(e => e.id === charSetId)
  const charSet = selected != null ? selected.name : CHAR_SET[0].name
  LocalStorageHelper.setLocalStorage(loginId + '-bulkCharSet', charSet)
}

/**
 * 一括登録時に適用する文字セットを取得する。
 * @method
 * @param {String} loginId 
 * @return {String}
 */
export const getBulkCharSet = loginId => loginId == null? null: LocalStorageHelper.getLocalStorage(loginId + '-bulkCharSet')

/**
 * 一括登録時に適用する文字セットを取得する。取得できなかった場合は通常時に適用する文字セットを取得する。
 * @method
 * @param {String} loginId 
 * @return {String}
 */
export const detectBulkCharSet = loginId => {
  if(loginId == null){
    return CHAR_SET[0].name
  }
  const bulkCharSet = getBulkCharSet(loginId)
  return bulkCharSet? bulkCharSet: getCharSet(loginId)
}
