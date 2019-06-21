import _ from 'lodash'
import * as Util from '../util/Util'

let i18n

/**
 * vue.jsで使用するオブジェクトを設定する。
 * @method
 * @param {Object} pi18n
 */
export const setApp = pi18n => {
  i18n = pi18n
}

/**
 * ラベルを言語化する。ラベルが定義されていない場合、keyプロパティ値を言語化してラベルとする。
 * @method
 * @param {Object} i18n 
 * @param {Object[]} objArr 
 * @return {Object[]}
 */
export const addLabelByKey = (i18n, objArr) => {
  return _(objArr).map(val => {
    return val? {...val, label: i18n? i18n.tnl('label.' + (val.label || val.key)): val.label || val.key}: null
  })
    .filter(val => val != null).value()
}

/**
 * オブジェクトの要素をマージする。
 * @method
 * @param {Object} obj マージ先
 * @param {Object} def マージ元
 * @return {Object} 失敗した場合にobjを返す。正常終了時はnull
 */
export const applyDef = (obj, def) => {
  if (!obj || !def) return obj

  _.forEach(def, (val, key) => {
    if (obj[key] === undefined) {
      obj[key] = val
    }
  })
}

/**
 * オブジェクトから指定した要素のみ取り出す。
 * @method
 * @param {Object} obj 
 * @param {String[]} fields 
 * @return {Object} 失敗した場合はobjを返す。正常終了時は成果物を返す。
 */
export const extract = (obj, fields) => {
  if (!obj || !fields) return obj

  let ret = {}
  _.forEach(fields, field => {
    let {val, lastKey} = Util.getValue(obj, field)
    ret[lastKey] = val
  })

  console.log('extract', {ret})
  return ret
}

/**
 * ブレッドクラムに必要なデータを作成する。
 * @method
 * @param  {...Any} columns 各階層で表示するキー名。またはtextプロパティを持つオブジェクト
 * @return {Object[]}
 * @example
 * // 通常のブレッドクラム
 * createBreadCrumbItems('master', 'area'),
 * // textおよびhrefを定義したオブジェクトを使用した場合、リンクとなる。
 * createBreadCrumbItems('master', {text: 'area', href: '/master/area'}),
 */
export const createBreadCrumbItems = (...columns) => {
  const ret = []
  columns.forEach(column => {
    const isString = typeof column == 'string'
    ret.push({
      text: i18n.tnl(`label.${isString? column: column.text}`),
      active: isString? true: column.href == null,
      href: isString? null: column.href,
    })
  })
  return ret
}

/**
 * 3桁 もしくは 6桁のHEXをRGBAに変換する
 * @method
 * @param {String} colorCode 
 * @param {Number} opacity 
 * @return {String}
 */
export const getRGBA = (colorCode, opacity) => {
  if (colorCode.substring(0,1) == '#') {
    colorCode = colorCode.slice(1)
  }

  if (colorCode && colorCode.length < 6) {
    if (colorCode.length == 3) {
      let red   = parseInt(colorCode.substring(0,1) + colorCode.substring(0,1), 16)
      let green = parseInt(colorCode.substring(1,2) + colorCode.substring(1,2), 16)
      let blue  = parseInt(colorCode.substring(2,3) + colorCode.substring(2,3), 16)
      let alpha = opacity? opacity: 1
      return 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')'
    } else {
      console.log('getRGBA-FormatError', {colorCode})
      return ''
    }
  } else {
    let red   = parseInt(colorCode.substring(0,2), 16)
    let green = parseInt(colorCode.substring(2,4), 16)
    let blue  = parseInt(colorCode.substring(4,6), 16)
    let alpha = opacity? opacity: 1
    return 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')'
  }
}
