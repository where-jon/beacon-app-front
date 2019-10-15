/**
 * 汎用的なユーティリティモジュール
 * @module util/Util
 */

import _ from 'lodash'
import { DEV } from '../constant/config'

/**
 * 処理を停止する。テスト用のメソッド。
 * @method
 * @param {Number} ms 停止ミリ秒
 */
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * オブジェクトの要素をマージする。
 * @method
 * @param {Object} obj マージ先
 * @param {Object} def マージ元
 * @param {Object} vm vueオブジェクト
 * @return {Object} 失敗した場合にobjを返す。正常終了時はnull
 */
export const applyDef = (obj, def, vm) => {
  if (!obj || !def) return obj

  _.forEach(def, (val, key) => {
    if (obj[key] === undefined) {
      vm? vm.$set(obj, key, val) : obj[key] = val
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
    let {val, lastKey} = getValue(obj, field)
    ret[lastKey] = val
  })

  debug('extract', {ret})
  return ret
}

/**
 * オブジェクトの内容をマージする。
 * @method
 * @param {Object} dest
 * @param {Object} src
 * @param {String[]} excludeKeys マージ対象から除外するプロパティ名
 * @return {Object}
 */
export const merge = (dest, src, excludeKeys = []) => {
  const temp = Object.assign({}, src)
  excludeKeys.forEach(key => delete temp[key])
  return Object.assign(dest, temp)
}

/**
 * デバッグモードの場合にデータリストのログを出力する。
 * @method
 * @param {Object} label コンソール出力するデータリストの名称
 * @param {Object} log コンソール出力するデータリスト。console.tableが使用可能な場合のみ表示される
 */
export const table = (label, log) => {
  if (DEV.DEBUG) {
    if (console.table) {
      console.log(label)
      console.table(log)
    }
    else {
      console.log(label, log)
    }
  }
}

/**
 * デバッグモードの場合にログを出力する。
 * @method
 * @param {...Any} log
 */
export const debug = function(log) {
  if (DEV.DEBUG) {
    console.debug(...arguments)
  }
}

/**
 * 文字列、または要素が存在するかチェックする。
 * @method
 * @param {String|Array} obj lengthプロパティが存在するオブジェクト全般
 * @return {Boolean}
 */
export const hasValue = obj => obj != null && obj.length !== 0

/**
 * 引数候補のうち、少なくとも1つに文字列、または要素が存在するかチェックする。
 * @method
 * @param {String|Array} obj lengthプロパティが存在するオブジェクト全般
 * @return {Boolean}
 */
export const hasValueAny = (...obj) => obj.some(val => hasValue(val))

/**
 * オプジェクトから階層を辿って値を取得する。
 * @method
 * @param {Object} obj 
 * @param {String} path オブジェクトのメンバー以下を.でつなげる。配列は添字を使う。
 * @param {*} def 省略すると、値と最後のキー値のペアを返す。省略しないとnullのときdefを返す
 */
export const getValue = (obj, path, def) => {
  let pathSpl = path.split('.')
  let val = obj
  let lastKey
  for (let i=0; i<pathSpl.length; i++) {
    lastKey = pathSpl[i]
    val = val instanceof Object? val[lastKey]: null
  }
  if (def !== undefined) {
    return val != null? val: def
  }
  return {val, lastKey}
}

/**
 * オプジェクトから階層を辿って値を設定する。
 * @method
 * @param {Object} obj 
 * @param {String} path オブジェクトのメンバー以下を.でつなげる。配列は添字を使う。
 * @param {*} val
 */
export const setValue = (obj, path, val) => {
  if(obj == null || val == null){
    return
  }
  let target = obj
  path.split('.').forEach((p, idx, ary) => {
    if(idx == ary.length - 1){
      target[p] = val
      return
    }
    if(target[p] == null){
      target[p] = !isNaN(p)? []: {}
    }
    target = target[p]
  })
}

const intervals = []

/**
 * 定期的にメソッドを実行する対象に含める。
 * @method
 * @param {Function} func
 * @param {Number} period 実行間隔
 */
export const registerInterval = (func, period) => intervals.push(setInterval(func, period))

/**
 * 定期的にメソッドを実行する対象から、直近に含めた1つを除外する。
 * @method
 */
export const removeInterval = () => {
  while (intervals.length > 0) {
    window.clearInterval(intervals.shift())
  }
}

/**
 * パラメータが「undefined」か判定する。
 * @method
 * @param {Object} param
 * @return {Boolean}「undefined」の場合true
 */
export const isUndefined = (param) => {
  if (param === undefined) {
    return true
  }
  return false
}

