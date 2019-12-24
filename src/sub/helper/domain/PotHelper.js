/**
 * POTに関するヘルパーモジュール
 * @module helper/domain/PotHelper
 */

import { APP } from '../../constant/config'

/**
 * POT設定カテゴリを返す。
 * @method
 * @param {String} potTypeName
 * @return {String}
 */
export const getSettingName = potTypeName => (potTypeName? potTypeName: 'pot').toUpperCase()

/**
 * 適用するPOT設定を返す。
 * @method
 * @param {String} potTypeName
 * @return {Object}
 */
export const getSetting = potTypeName => APP[getSettingName(potTypeName)]

/**
 * POT拡張項目配列を返す。
 * @method
 * @param {String} potTypeName
 * @return {String[]}
 */
export const getPotExt = potTypeName => {
  const settings = getSetting(potTypeName)
  return settings.WITH.filter(e => _.some(settings.EXT_DEF, ext => ext.key == e)).map(e => settings.EXT_DEF.find(ext => ext.key == e))
}

/**
 * POT拡張項目のキー配列を返す。
 * @method
 * @param {String} potTypeName
 * @param {String} addPrefix
 * @return {String[]}
 */
export const getPotExtKeys = (potTypeName, addPrefix) => {
  return getPotExt(potTypeName).map(e => (addPrefix? 'extValue.': '') + e.key)
}

/**
 * POTで使用する値・拡張値についてb-listにわたすオブジェクト配列を作成する
 * 
 * @method
 * @param {String} potTypeName
 * @param {Boolean} isCsv 
 * @return {String[]}
 */
export const createCustomColumn = (potTypeName, isCsv) => {
  const settings = getSetting(potTypeName)
  return settings.WITH.filter(val => val != 'thumbnail').map(val => {
    if(['user'].includes(val)){
      return null
    }
    const ext = _.find(settings.EXT_DEF, e => e.key == val)
    if (ext && !ext.showlist && !isCsv) {
      return null
    }
    if ((ext || val == 'ruby') && isCsv) {
      return {key: val}
    }
    const ret = {key: val, label: val, tdClass: 'thumb-rowdata'}
    // extValue.rubyなど.を含むとソートできないため.は抜きにする
    if (val == 'ruby'){
      ret.sortable = true
    }
    else if (ext) {
      ret.sortable = ext.sort
    }
    else {
      ret.sortable = true
    }
    if(['category', 'group'].includes(val)){
      ret.key = val + 'Name'
    }
    return ret
  }).filter(val => val)
}

