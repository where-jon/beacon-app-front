import _ from 'lodash'
import jschardet from 'jschardet'
import Encoding from 'encoding-japanese'
import Papa from 'papaparse'
import moment from 'moment'
import { DEV, APP } from '../constant/config'
import { FONT } from '../constant/Constants'

// sleep (for test)
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const single2multi = (str) => str.endsWith('y')? str.slice(0, -1) + 'ies' : str + 's'

export const concatCamel = (...strs) => strs.map((str, idx) => idx == 0? str: `${str.charAt(0).toUpperCase()}${str.slice(1)}`).join('')

export const snake2camel = (str) => str.replace(/_./g, (s) => s.charAt(1).toUpperCase())

export const addNoSelect = (option) => option.unshift({value: null, text: ''})

export const getByteLength = (str) => encodeURI(str == null? '': str).replace(/%../g, '*').length

export const numberRange = (start, end) => new Array(end - start + 1).fill().map((d, i) => {return {key: i + start}})

export const formatDateRange = (date, by) => {
  const zMonth = `00${date.getMonth() + 1}`.slice(-2)
  const zDate = `00${date.getDate()}`.slice(-2)
  let key = `${date.getFullYear()}/${zMonth}/${zDate}`
  if(by == 'day'){
    return {key: `${key} 00:00`, text: key}
  }
  if(by == 'hour'){
    return {
      key: `${key} ${`00${date.getHours()}`.slice(-2)}:00`,
    }
  }
  return {
    key: `${key} ${`00${date.getHours()}`.slice(-2)}:${`00${date.getMinutes()}`.slice(-2)}`,
  }
}

export const dateRange = (start, end, by) => {
  const ret = []
  const date = new Date(start)
  if(by == 'day'){
    for(; date < end; date.setDate(date.getDate() + 1)) {
      ret.push(formatDateRange(date, by))
    }
    ret.push(formatDateRange(date, by))
    return ret
  }
  if(by == 'hour'){
    for(; date < end; date.setHours(date.getHours() + 1)) {
      ret.push(formatDateRange(date, by))
    }
    ret.push(formatDateRange(date, by))
    return ret
  }
  for(; date < end; date.setMinutes(date.getMinutes() + 1)) {
    ret.push(formatDateRange(date, by))
  }
  ret.push(formatDateRange(date, by))
  return ret
}

export const str2booleanComplate = (str) => str.toLowerCase() == 'true'? true: str.toLowerCase() == 'false'? false: str

export const str2boolean = (str) => hasValue(str) && str.toLowerCase() != 'false'

export const isIos = () => /(iPhone|iPod|iPad)/.test(navigator.userAgent)

export const isAndroid = () => /(Android)/.test(navigator.userAgent)

export const isAndroidOrIOS = () => isIos() || isAndroid()

export const formatDate = (timestamp, format = 'YYYY/MM/DD HH:mm:ss') => moment(timestamp).format(format)

export const sanitize = (str) => str && str.replace? str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;'): str

export const cutOnLong = (val, max) => {
  if (!val || !max) {
    return val
  }

  if (typeof val == 'string' && val.length > max) {
    return val.substr(0, max) + '...'
  }
  return val
}

export const luminance = (hex) => {
  const num = parseInt(hex, 16)
  const r = num >> 16
  const g = num >> 8 & 0xff
  const b = num & 0xff
  return 0.298912 * r + 0.586611 * g + 0.114478 * b
}

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

export const debug = function(log) {
  if (DEV.DEBUG) {
    console.debug(...arguments)
  }
}

export const colorCd4db = (obj) => {
  if(!obj){
    return '000000'
  }
  const str = obj.hex? obj.hex: obj
  const color = str.replace('#', '')
  return `000000${color}`.slice(-6)
}

export const colorCd4display = (obj, defaultColor = '#000000') => {
  if(!obj){
    return defaultColor
  }
  let color = obj.hex? obj.hex: obj
  return '#' + color.replace('#', '').slice(0, 6)
}

export const isArray = (obj) => Object.prototype.toString.call(obj) === '[object Array]'
export const hasValue = (obj) => obj != null && obj.length !== 0
export const detectEncoding = (str) => jschardet.detect(str)

export const supportInputType = (type) => {
  let input = document.createElement('input')
  input.setAttribute('type', type)
  const support = input.type === type
  input = null
  return support
}

export const arrayBuffer2str = (buffer) => {
  const view = new Uint8Array(buffer)
  const str = []
  for (let i = 0; i < view.length; i++) {
    str.push(view[i])
  }
  return String.fromCharCode.apply(null, str)
}

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
 * オプジェクトから階層を辿って値を取得する。
 * 
 * @param {*} obj 
 * @param {*} path オブジェクトのメンバー以下を.でつなげる。配列は添字を使う。
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

export const extraCheckCsvObj = (papaResult) => {
  if(!papaResult || !hasValue(papaResult.data) || !hasValue(papaResult.data[0])){
    return papaResult
  }
  const columnNum = papaResult.data[0].length
  for(let idx = 1; idx < papaResult.data.length; idx++){
    if(!hasValue(papaResult.data[idx]) || papaResult.data[idx].length < columnNum){
      papaResult.errors.push({
        row: idx,
      })
    }
  }
  return papaResult
}

export const csv2Obj = (str) => {
  str = str.replace('\xEF\xBB\xBF', '') // remove bom
  str = convert2Unicode(str)
  str = removeCrLfDup(str)
  return extraCheckCsvObj(convertCsv2Obj(str))
}

export const convert2Unicode = (str) => {
  let sArr = str2Array(str)
  let uniArray = Encoding.convert(sArr, 'UNICODE', detectEncoding(str))
  return Encoding.codeToString(uniArray)
}

export const getSjisCodePoint = (str) => {
  const ary = str2Array(str)
  const ret = []
  ary.forEach((val) => {
    const codes = Encoding.convert([val], 'SJIS', detectEncoding(val))
    codes.unshift(0)
    ret.splice(-1, 0, ...codes.slice(-2))
  })
  return ret
}

export const removeCrLfDup = (str) => {
  if (!str) return str
  str = str.replace(/\r?\n/g,'\n')
  str = str.replace(/\r/g,'\n')
  let strArr = _.filter(str.split('\n'), (line) => {
    return line && line.trim() != ''
  })
  return strArr.join('\n')
}

export const str2Array = (str) => {
  if (!str) {
    return str
  }
  let arr = []
  for (let i=0; i < str.length; i++) {
    arr.push(str.charCodeAt(i))
  }
  return arr
}

export const convertCsv2Obj = (str) => {
  if (!str) {
    return {errors: ['message.emptyFile']}
  }
  return Papa.parse(str)
}

export const converToCsv = (array, headers) => {
  if (!array || array.length == 0) {
    return null
  }

  if (!headers) {
    headers = Object.keys(array[0])
  }
  // ヘッダ出力から"."以降の部分のみ抽出
  const outputHeaders = headers.map((header) => {
    let result = header.split('.')
    return result ? result[result.length - 1] : header
  })
  let header = '"' + outputHeaders.join('","') + '"\n'
  let body = _.map(array, (row) => {
    return '"' + headers.map((key) => {
      let val = getValue(row, key).val
      if (val == null){
        return val
      }
      if (typeof val === 'object' || isArray('array')) {
        return JSON.stringify(val).split('"').join('\'')
      }
      else {
        return val.replace? val.replace(/"/g, '""'): val
      }
    }).join('","') + '"'
  }).join('\n')

  return header + body
}

export const equalsAny = (target, arr) => {
  if (!target || !arr) {
    return false
  }
  return arr.includes(target)
}

export const bitON = (target, bit) => {
  return (target & bit) == bit
}

/**
 * 文字列リストのうち、最も長い文字列のバイト数を返す。
 * 
 * @param {*} list 文字列のリスト
 * @param {*} minMax 最低限の文字数
 */
export const getMaxTextLength = (list, minMax = Infinity) => {
  if (!list) {
    return minMax
  }
  let max = _.max(list.map(item => getByteLength(item)))
  return max > minMax ? minMax : max
}

export const base64ToBlob = (base64) => {
  const byteString = atob( base64.split( ',' )[1] )
  const mimeType = base64.match( /(:)([a-z/]+)(;)/ )[2]
  const byteLength = byteString.length
  const content = new Uint8Array(byteLength)
  for( let i = 0; i < byteLength; i++ ) {
    content[i] = byteString.charCodeAt(i)
  }
  return new Blob([content], {type: mimeType})
}

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
 * 現在の日付の午前0時を表す数値を返す。
 */
export const getMidnightMs = () => {
  const now = new Date()
  const dayMs = 24 * 60 * 60 * 1000
  const offset = APP.POSITION_TIMEZONE * 60 * 60 * 1000
  const nowToday = Math.floor(now.getTime() / dayMs)
  const midnight = (nowToday * dayMs) + offset
  debug('calcurating midnight. now is ', now)
  debug(now.getTime())
  debug('midnight is ', midnight)
  debug(new Date(midnight))
  return midnight
}

export const getDetailCaptionKey = (id) => {
  return `label.${hasValue(id)? 'update': 'addSetting'}`
}

export const getDatetime = (baseDatetime, controlData) => {
  const datetime = new Date(baseDatetime.getTime())
  datetime.setMilliseconds(0)
  if(!controlData){
    return datetime
  }
  datetime.setFullYear(datetime.getFullYear() + (controlData.year? controlData.year: 0))
  datetime.setDate(datetime.getDate() + (controlData.date? controlData.date: 0))
  datetime.setHours(datetime.getHours() + (controlData.hours? controlData.hours: 0))
  datetime.setMinutes(datetime.getMinutes() + (controlData.minutes? controlData.minutes: 0))
  datetime.setSeconds(datetime.getSeconds() + (controlData.seconds? controlData.seconds: 0))
  return datetime
}

export const getSubDatetime = (datetimeFrom, datetimeTo) => {
  const subTime = new Date(datetimeTo.getTime()) - new Date(datetimeFrom.getTime())
  const subDatetime = {}
  subDatetime.minute = subTime / 1000 / 60
  subDatetime.hour = subDatetime.minute / 60
  subDatetime.date = subDatetime.hour / 24
  return subDatetime
}

export const getAdjustFontSize = (getFontSize, isBold = false) => {
  const size = Math.round(getFontSize())
  return `${isBold? 'bold ': ''}${(size < FONT.SIZE.MIN? FONT.SIZE.MIN: size)}${FONT.TYPE}`
}
