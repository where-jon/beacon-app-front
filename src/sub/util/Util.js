import _ from 'lodash'
import jschardet from 'jschardet'
import Encoding from 'encoding-japanese'
import Papa from 'papaparse'
import moment from 'moment'
import { DEV } from '../constant/config';

// sleep (for test)
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const snake2camel = (str) => str.replace(/_./g, (s) => s.charAt(1).toUpperCase())

export const addNoSelect = (option) => option.unshift({value: null, text: ""})

export const getByteLength = (str) => encodeURI(str == null? "": str).replace(/%../g, "*").length

export const numberRange = (start, end) => new Array(end - start + 1).fill().map((d, i) => i + start)

export const str2boolean = (str) => hasValue(str) && str.toLowerCase() != "false"

export const isIos = () => /(iPhone|iPod|iPad)/.test(navigator.userAgent)

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
    return "000000"
  }
  const str = obj.hex? obj.hex: obj
  const color = str.replace("#", "")
  return color.slice(0, 8)
}

export const colorCd4display = (obj, defaultColor = "#000000") => {
  if(!obj){
    return defaultColor
  }
  let color = obj.hex? obj.hex: obj
  return "#" + color.replace("#", "").slice(0, 8)
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
  if (path.endsWith("*")) {
    path = path.slice(0, -1)
    if (path.endsWith("/")) {
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
  let pathSpl = path.split(".")
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
  str = str.replace("\xEF\xBB\xBF", "") // remove bom
  str = convert2Unicode(str)
  str = removeCrLfDup(str)
  return extraCheckCsvObj(convertCsv2Obj(str))
}

export const convert2Unicode = (str) => {
  let sArr = str2Array(str)
  let uniArray = Encoding.convert(sArr, 'UNICODE', detectEncoding(str))
  return Encoding.codeToString(uniArray)
}

export const removeCrLfDup = (str) => {
  if (!str) return str
  str = str.replace(/\r?\n/g,"\n")
  str = str.replace(/\r/g,"\n")
  let strArr = _.filter(str.split("\n"), (line) => {
    return line && line.trim() != ""
  })
  return strArr.join("\n")
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
    let result = header.split(".")
    return result ? result[result.length - 1] : header
  })
  let header = '"' + outputHeaders.join('","') + '"\n'
  let body = _.map(array, (row) => {
    return '"' + headers.map((key) => {
      let val = getValue(row, key).val
      if (typeof val === 'object' || typeof val === 'array') {
        if(val === null){
          return val
        }
        return JSON.stringify(val).split('"').join("'")
      }
      else {
        return val
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
  const byteString = atob( base64.split( "," )[1] )
  const mimeType = base64.match( /(:)([a-z\/]+)(;)/ )[2]
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
