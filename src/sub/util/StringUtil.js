/**
 * 文字列に関するユーティリティモジュール
 * @module util/StringUtil
 */

import Encoding from 'encoding-japanese'
import jschardet from 'jschardet'
import _ from 'lodash'
import { hasValue } from './Util'

/**
 * オブジェクト同士で比較を行う。
 * @method
 * @param {String} a
 * @param {String} b
 * @param {String} locale
 * @param {Object} option
 * @return {Number} 0：同値。1：aのほうが大きい。-1：bのほうが大きい。
 */
export const localeCompare = (a, b, locale, option) => JSON.stringify(a).localeCompare(JSON.stringify(b), locale, option)

/**
 * 文字列同士で比較を行う。ただし数値に変換可能な文字列同士の比較は、その数値の大小で比較する。
 * @method
 * @param {String} a 
 * @param {String} b 
 * @param {String} locale 
 * @return {Number} 0：同値。1：aのほうが大きい。-1：bのほうが大きい。
 */
export const sortByString = (a, b, locale) => {
  const hasA = hasValue(a)
  const hasB = hasValue(b)
  if(!hasA && !hasB){
    return 0
  }
  if(!hasA){
    return -1
  }
  if(!hasB){
    return 1
  }
  if(!isNaN(a) && !isNaN(b)){
    const aNum = Number(a)
    const bNum = Number(b)
    return aNum < bNum? -1: aNum > bNum? 1: 0
  }
  const aCodeArr = a.toString().split('')
  const bCodeArr = b.toString().split('')
  for(let cnt = 0; cnt < aCodeArr.length && cnt < bCodeArr.length; cnt++){
    const result = localeCompare(aCodeArr[cnt], bCodeArr[cnt], locale)
    if(result != 0){
      return result
    }
  }
  return aCodeArr.length < bCodeArr.length? 1: aCodeArr.length < bCodeArr.length? -1: 0
}

/**
 * 複数形の表記を取得する。
 * @method
 * @param {String} str 単数形の単語
 * @return {String}
 */
export const single2multi = str => str.endsWith('y')? str.slice(0, -1) + 'ies' : str + 's'

/**
 * 先頭文字のみ子文字にした文字列を取得する。
 * @method
 * @param {String} str
 * @return {String}
 */
export const toLowerCaseTop = str => `${str.slice(0, 1).toLowerCase()}${str.slice(1)}`

/**
 * キャメルケースで連結した文字列を取得する。
 * @method
 * @param  {...String} strs
 * @return {String}
 */
export const concatCamel = (...strs) => strs.filter(val => val).map((str, idx) => idx == 0? str: `${str.charAt(0).toUpperCase()}${str.slice(1)}`).join('')

/**
 * キャメルケースにした文字列を取得する。
 * @method
 * @param {String} str スネークケースの文字列
 * @return {String}
 */
export const snake2camel = str => str.replace(/_./g, (s) => s.charAt(1).toUpperCase())

/**
 * スネークケースにした文字列を取得する。
 * @method
 * @param {String} str キャメルケースの文字列
 * @return {String}
 */
export const camel2snake = str => str.replace(/[A-Z]/g, s => '_' + s.toLowerCase())

/**
 * バイトサイズを取得する。
 * @method
 * @param {String} str
 * @return {Number}
 */
export const getByteLength = str => encodeURI(str == null? '': str).replace(/%../g, '*').length

/**
 * 文字列を真偽値に変換する。
 * @method
 * @param {String} str
 * @return {Boolean|String} strが'true'または'false'以外の場合、引数値と同値の文字列。この時、大文字と小文字は考慮しない。
 */
export const str2booleanComplate = str => str.toLowerCase() == 'true'? true: str.toLowerCase() == 'false'? false: str

/**
 * 文字列を真偽値に変換する。
 * @method
 * @param {String} str
 * @return {Boolean} 引数が'false'の場合のみfalse。この時、大文字と小文字は考慮しない。
 */
export const str2boolean = str => hasValue(str) && str.toLowerCase() != 'false'

/**
 * サニタイジングの結果を取得する。
 * @method
 * @param {String} str
 * @param {Boolean} [light = false] <>のみサニタイジングする
 * @return {String}
 */
export const sanitize = (str, light = false) => {
  if(!str || !str.replace){
    return str
  }
  if(light){
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
}

/**
 * ゼロ埋めを行った結果を取得する。
 * @method
 * @param {Number} num
 * @param {Number} length 出力される文字数
 * @return {String}
 */
export const zeroPad = (num, length) => ('0'.repeat(length) + num).slice(-length)

/**
 * 文字列を指定した長さで省略表記にする。
 * @method
 * @param {String} val
 * @param {Number} max 最大文字数
 * @return {String} 省略される場合は「...」が付与される。省略されない場合は引数文字列と同値
 */
export const cutOnLong = (val, max) => {
  if (!val || !max) {
    return val
  }

  if (typeof val == 'string' && val.length > max) {
    return val.substr(0, max) + '...'
  }
  return val
}

/**
 * 文字列を指定したバイト数で省略表記にする。
 * @method
 * @param {String} val
 * @param {Number} max 最大バイト数
 * @param {Boolean} [addLast = true] 省略表記「...」を付与する
 * @return {String} 省略される場合は「...」が付与される。省略されない場合は引数文字列と同値
 */
export const cutOnLongByte = (val, max, addLast = true) => {
  if (!val || !max) {
    return val
  }

  if (typeof val == 'string' && val.length > max) {
    const parts = val.split('')
    let cnt = 0
    parts.forEach((part) => {
      const length = getByteLength(part) > 1? 2: 1
      if(0 <= max - length){
        cnt++
        max -= length
      }
    })
    return `${val.substr(0, cnt)}${addLast? '...': ''}`
  }
  return val
}

/**
 * 文字列を指定した文字幅数で省略表記にする。
 * @method
 * @param {String} val
 * @param {Number} max 最大文字幅ピクセル
 * @param {Boolean} [addLast = true] 省略表記「...」を付与する
 * @param {Object} [style = {}] 省略判定時に考慮するcssスタイル
 * @return {String} 省略される場合は「...」が付与される。省略されない場合は引数文字列と同値
 */
export const cutOnLongWidth = (val, max, addLast = true, style = {}) => {
  if (!val || !max || typeof val != 'string') {
    return val
  }
  const element = document.createElement('span')
  element.style['white-space'] = 'nowrap'
  element.style.visibility = 'hidden'
  if(style){
    Object.keys(style).forEach(key => {
      element.style[key] = style[key]
    })
  }
  document.body.appendChild(element)

  element.innerHTML = val
  if(element.offsetWidth + 1 < max){
    document.body.removeChild(element)
    return val
  }

  const parts = val.split('')
  const last = addLast? '...': ''

  let ret = ''
  for(let idx = 0; idx < parts.length; idx++){
    const str = ret + parts[idx] + last
    element.innerHTML = str
    const width = element.offsetWidth + 1
    if(max <= width){
      break
    }
    ret += parts[idx]
  }
  document.body.removeChild(element)
  return ret + last
}

/**
 * 先頭に文字列を付与する。既に同値が付与されている場合は何もしない。
 * @method
 * @param {String} text
 * @param {String} prefix 先頭に付与する文字列
 * @return {String}
 */
export const addPrefix = (text, prefix) => (new RegExp(`^${prefix}.*$`, 'g')).test(text)? text: `${prefix}${text}`

/**
 * 指定した文字列データの文字セットを取得する。
 * @method
 * @param {String} str
 * @return {String}
 */
export const detectEncoding = str => jschardet.detect(str)

/**
 * unicode文字列に変換する。
 * @method
 * @param {String} str
 * @param {String} forceCharSet strをこの文字コードとして扱う
 * @return {String}
 */
export const convert2Unicode = (str, forceCharSet) => {
  let sArr = str2Array(str)
  let uniArray = Encoding.convert(sArr, 'UNICODE', forceCharSet? forceCharSet: detectEncoding(str))
  return Encoding.codeToString(uniArray)
}

/**
 * shift-jisの文字コード配列を取得する。
 * @method
 * @param {String} str
 * @return {Number[]}
 */
export const getSjisCodePoint = str => {
  const ary = str2Array(str)
  const ret = []
  ary.forEach(val => {
    const codes = Encoding.convert([val], 'SJIS', detectEncoding(val))
    codes.unshift(0)
    ret.splice(-1, 0, ...codes.slice(-2))
  })
  return ret
}

/**
 * 指定したパスを検証する。
 * @method
 * @param {String} target 遷移先パス
 * @param {String} path チェック用パス
 * @return {Boolean}
 */
export const pathMatch = (target, path) => {
  if (path == target) {
    return true
  }
  if (!path || !target) {
    return false
  }
  if (path.endsWith('*')) {
    path = path.slice(0, -1)
    if (path.endsWith('/')) {
      if (path.slice(0, -1) == target) {
        return true
      }
    }
    return target.startsWith(path)
  }
  return false
}

/**
 * 文字セットの検証を行う。
 * @method
 * @param {String} str
 * @param {String} charSet
 * @return {{match: Boolean, charset: String}}
 */
export const analyseEncode = (str, charSet) => {
  const strCharset = Encoding.detect(str)
  if(!hasValue(str.split('').filter(val => getByteLength(val) > 1))){
    return {match: true}
  }
  return {match: charSet == strCharset, charset: strCharset}
}

/**
 * 文字列をUTF-16コード配列に変換する。
 * @method
 * @param {String} str
 * @return {Number[]}
 */
export const str2Array = str => {
  if (!str) {
    return str
  }
  let arr = []
  for (let i=0; i < str.length; i++) {
    arr.push(str.charCodeAt(i))
  }
  return arr
}

/**
 * 文字列リストのうち、最も長い文字列のバイト数を返す。
 * @method
 * @param {String[]} list
 * @param {Number} minMax 最低限の文字数
 * @return {Number]
 */
export const getMaxTextLength = (list, minMax = Infinity) => {
  if (!list) {
    return minMax
  }
  let max = _.max(list.map(item => getByteLength(item)))
  return max > minMax ? minMax : max
}

/**
 * パスからファイル名を取得する。
 * @method
 * @param {String} key パスを示す文字列
 * @return {String}
 */
export const getFileName = key => key.slice(key.lastIndexOf('/') + 1, key.lastIndexOf('.'))

/**
 * 指定した数値文字列の末尾に数値を加算する。
 * @method
 * @param {String} str 数値を示す文字列（ゼロ埋め可）
 * @param {Number} [add = 0] 加算する数値
 * @return {String}
 */
export const addWithPadding = (str, add = 0) => {
  if(!/^[0-9]+$/.test(str)){
    return str + add
  }
  const strDigit = str.length
  const srcNum = Number(str)
  const srcDigit = srcNum.toString().length
  const destNum = srcNum + add
  const destDigit = destNum.toString().length
  const ret = '0'.repeat(srcDigit + 1).concat(destNum)
  if(srcDigit >= destDigit || strDigit >= destDigit){
    return ret.slice(-1 * strDigit)
  }
  return ret.slice(-1 * (strDigit + 1))
}

/**
 * 指定した値が、いずれかの値で始まっているか否か
 * 
 * @method
 * @param {String} 
 * @param {Array} 
 * @return {Boolean}
 */
export const startsWithAny = (target, arr) => {
  if (!target || !arr) {
    return false
  }
  return arr.some(e => target.startsWith(e))
}
