/**
 * 配列に関するユーティリティモジュール
 * @module util/ArrayUtil
 */

import { hasValue } from './Util'

/**
 * 配列かチェックする。
 * @method
 * @param {Object} obj
 * @return {Boolean}
 */
export const isArray = obj => Object.prototype.toString.call(obj) === '[object Array]'

/**
 * 空の選択肢を追加する。
 * @method
 * @param {Object[]} option - 選択肢情報
 */
export const addNoSelect = option => option.unshift({value: null, text: ''})

/**
 * 配列同士で比較を行う。いずれかの比較対象が存在しない場合は同値として扱われる。
 * @method
 * @param {Any[]} a 
 * @param {Any[]} b 
 * @return {Number}　0：同値。1：aのほうが大きい。-1：bのほうが大きい。
 */
export const compareArray = (a, b) => {
  for(let idx = 0; idx < a.length || idx < b.length; idx++){
    if(idx >= a.length){
      return 1
    }
    if(idx >= b.length){
      return -1
    }
    if(a[idx] != b[idx]){
      return a[idx] <= b[idx]? -1: 1
    }
  }
  return 0
}

/**
 * 配列同士で比較を行う。
 * @method
 * @param {Any[]} aAry 
 * @param {Any[]} bAry 
 * @return {Number} 0：同値。1：aAryのほうが大きい。-1：bAryのほうが大きい。
 */
export const sortByArray = (aAry, bAry) => {
  if(!hasValue(aAry) && !hasValue(bAry)){
    return 0
  }
  if(!hasValue(aAry)){
    return -1
  }
  if(!hasValue(bAry)){
    return 1
  }

  const max = aAry.length < bAry.length? bAry.length: aAry.length
  for(let idx = 0; idx < max; idx++){
    if(aAry.length <= idx){
      return -1
    }
    if(bAry.length <= idx){
      return 1
    }
    if(aAry[idx] == bAry[idx]){
      continue
    }
    return aAry[idx] < bAry[idx]? -1: 1
  }
  return 0
}

/**
 * 指定したプロパティを比較して、リストを並べ替える。
 * @method
 * @param {Object[]} list
 * @param {String} by ソート軸。list要素に含まれているプロパティ名
 */
export const sortIgnoreCase = (list, by) => {
  if (!list) return
  list.sort((a, b) => {
    const byA = a[by]
    const byB = b[by]
    if ((byA instanceof Date && byB instanceof Date) || (typeof byA === 'number' && typeof byB === 'number')) {
      if (byA < byB) {
        return -1
      } else if (byA > byB) {
        return 1
      } else {
        return 0
      }
    } else {
      // 文字列ソート時は b-table でのソート（数値優先）に合わせている
      return (byA?byA:'').toUpperCase().localeCompare((byB?byB:'').toUpperCase(), undefined, { numeric: true })
    }
  })
}

/**
 * 指定した文字列が含まれているか。ただし大文字小文字は考慮しない。
 * @method
 * @param {String[]} ary 検索対象
 * @param {String} col 検索する文字列
 * @return {Boolean}
 */
export const includesIgnoreCase = (ary, col) => {
  if (!ary || ary.length < 1) {
    return false
  }
  return ary.find(val => val.toLowerCase() == col.toLowerCase())? true: false
}

/**
 * 指定した数値から始まる連番が格納された配列を作成する。
 * @method
 * @param {Number} start 0番目要素に代入する数値
 * @param {Number} stop 最終番目要素に代入する数値
 * @param {Number} [step = 1] 隣接要素との数値差
 * @return {Number[]}
 */
export const range = (start, stop, step = 1) => Array(Math.ceil((stop + step - start) / step)).fill(start).map((start, i) => start + i * step)

/**
 * 引数値範囲内の数値が入った配列を作成する。
 * @method
 * @param {Number} start 開始数値
 * @param {Number} end 終了数値
 * @return {Number[]}
 */
export const numberRange = (start, end) => new Array(end - start + 1).fill().map((d, i) => {return {key: i + start}})

/**
 * ArrayBufferから文字列を作成する。
 * @method
 * @param {Buffer} buffer 
 * @return {String}
 */
export const arrayBuffer2str = buffer => {
  const view = new Uint8Array(buffer)
  const str = []
  for (let i = 0; i < view.length; i++) {
    str.push(view[i])
  }
  return String.fromCharCode.apply(null, str)
}

/**
 * 指定した要素を含むか。
 * @method
 * @param {Object} target 検索項目
 * @param {Object[]} arr 検索対象
 * @return {Boolean}
 */
export const equalsAny = (target, arr) => {
  if (!target || !arr) {
    return false
  }
  if (Array.isArray(target)) {
    return target.some(e => arr.includes(e))
  }
  return arr.includes(target)
}

/**
 * listからentityに相当するデータを検索する。
 * @method
 * @param {Object[]} list 検索対象
 * @param {Object} entity 検索項目
 * @param {String[]} ids 検索キー
 * @return {Object}
 */
export const getEntityFromIds = (list, entity, ids) => {
  for(let index = 0; index < ids.length; index++){
    const id = ids[index]
    if(entity[id]){
      const matchEntity = list.find((val) => val[id] == entity[id])
      if(matchEntity){
        return matchEntity
      }
    }
  }
  return null
}

/**
 * 配列をnumで指定された要素数で区切る
 * @method
 * @param {Object[]} array パーティショニング元配列
 * @param {Number} num 1つのパーティションの要素数
 * @return {Object[]}
 */
export const partitioningArray = (array, num) => {
  const len = array.length
  const c = []
  for (let i = 0 ; i < len ; i += num) {
    c.push(array.slice(i, (i + num)))
  }
  return c
}

/**
 * 配列を指定したキーで集約する
 * @param {Object[]} data 
 * @param {String} key 
 */
 export const sumData = (data, key) => {
  return data.reduce( (sum, obj) => {
    const v = obj[key]
    if(!sum[v]){
      sum[v] = []
    }
    sum[v].push(obj)
    return sum
  }, [])
}
