/**
 * POTに関するヘルパーモジュール
 * @module helper/domain/PotHelper
 */

import { APP } from '../../constant/config'

/**
 * POT拡張項目配列を返す。
 * @method
 * @return {String[]}
 */
export const getPotExt = () => {
  return APP.POT.WITH.filter(e => _.some(APP.POT.EXT_DEF, ext => ext.key == e)).map(e => APP.POT.EXT_DEF.find(ext => ext.key == e))
}

/**
 * POT拡張項目のキー配列を返す。
 * @method
 * @return {String[]}
 */
export const getPotExtKeys = (addPrefix) => {
  return getPotExt().map(e => (addPrefix? 'extValue.': '') + e.key)
}

/**
 * POTで使用する値・拡張値についてb-listにわたすオブジェクト配列を作成する
 * 
 * @method
 * @param {Boolean} isCsv 
 * @return {String[]}
 */
export const createCustomColumn = (isCsv) => {
  return APP.POT.WITH.map(val => {
    if(['user'].includes(val)){
      return null
    }
    const ext = _.find(APP.POT.EXT_DEF, e => e.key == val)
    if (ext && !ext.showlist && !isCsv) {
      return null
    }
    if ((ext || val == 'ruby') && isCsv) {
      return {key: val}
    }
    const ret = {key: val, label: val, tdClass: 'thumb-rowdata'}
    // extValue.rubyなど.を含むとソートできないため.は抜きにする
    if (val == 'ruby'){
      ret.key = 'extValue' + val
      ret.sortable = true
    }
    else if (ext) {
      ret.key = 'extValue' + ext.key
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

