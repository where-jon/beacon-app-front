/**
 * 拡張値カラムに関するヘルパーモジュール
 * @module helper/domain/ExtValueHelper
 */

import * as Util from '../../util/Util'

/**
 * 有効な拡張値カラム情報を取得する。
 * @method
 * @param {Object} masterSetting
 * @return {Object}
 */
export const getExtValue = masterSetting => {
  const masterWith = masterSetting.WITH? masterSetting.WITH: []
  const masterExtDef = masterSetting.EXT_DEF? masterSetting.EXT_DEF: []
  return masterWith.filter(w => masterExtDef.some(ed => ed.key == w))
    .map(w => masterExtDef.find(ed => ed.key == w))
}

/**
 * 有効な拡張値カラム情報のキー値を取得する。
 * @method
 * @param {Object} masterSetting
 * @param {Boolean} prefix
 * @return {String[]}
 */
export const getExtValueKeys = (masterSetting, prefix) => {
  return getExtValue(masterSetting).map(ev => (prefix? 'extValue.': '') + ev.key)
}

/**
 * 一覧に表示するか。
 * @method
 * @param {Object} masterSetting
 * @param {String} key
 * @return {Boolean}
 */
export const isShowList = (masterSetting, key) => {
  const target = getExtValue(masterSetting).find(ev => ev.key == key)
  if(!target) {
    return true
  }
  return target.showlist
}

/**
 * 拡張値カラム情報を親階層にコピーする。
 * @method
 * @param {Object} obj
 */
export const copyToParent = obj => {
  const extVal = Util.getValue(obj, 'extValue', {})
  Object.keys(extVal).forEach(key => obj[key] = extVal[key])
}

/**
 * 拡張値カラム情報を子階層にコピーする。
 * @method
 * @param {Object} obj
 * @param {Object} masterSetting
 * @param {String} [to = 'extValue']
 */
export const copyToChild = (obj, masterSetting, to = 'extValue') => {
  const child = {}
  getExtValueKeys(masterSetting).forEach(key => child[key] = obj[key])
  obj[to] = child
}
