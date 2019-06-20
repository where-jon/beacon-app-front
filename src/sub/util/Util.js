import _ from 'lodash'
import Papa from 'papaparse'
import { DEV, APP } from '../constant/config'
import { convert2Unicode, getFileName } from './StringUtil'
import { isArray } from './ArrayUtil'

/**
 * 処理を停止する。テスト用のメソッド。
 * @method
 * @param {Number} ms 停止ミリ秒
 */
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * オブジェクトの内容をマージする。
 * @method
 * @param {Object} dest
 * @param {Object} src
 * @param {String[]} excludeKeys マージ対象から除外するプロパティ名
 * @return {Object}
 */
export const merge = (dest, src, excludeKeys) => {
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
 * 指定したオブジェクトに空項目がないかチェックする。
 * @method
 * @param {Object} papaResult papaparseで作成した結果オブジェクト
 * @return {Object}
 */
export const extraCheckCsvObj = papaResult => {
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

/**
 * csv形式の文字列をcsvオブジェクトに変換する。
 * @method
 * @param {String} str csv形式の文字列
 * @param {String} forceCharSet strをこの文字コードとして扱う
 * @return {Object} papaparseの結果オブジェクト
 */
export const csv2Obj = (str, forceCharSet) => {
  str = str.replace('\xEF\xBB\xBF', '') // remove bom
  str = convert2Unicode(str, forceCharSet)
  str = removeCrLfDup(str)
  return extraCheckCsvObj(convertCsv2Obj(str))
}

/**
 * 改行文字の変換を行う。その後、連続した改行文字を単一の改行文字に変換する。
 * @method
 * @param {String} str
 * @return {String}
 */
export const removeCrLfDup = str => {
  if (!str) return str
  str = str.replace(/\r?\n/g,'\n')
  str = str.replace(/\r/g,'\n')
  let strArr = _.filter(str.split('\n'), (line) => {
    return line && line.trim() != ''
  })
  return strArr.join('\n')
}

/**
 * csv形式の文字列をcsvオブジェクトに変換する。
 * @method
 * @param {String} str csv形式の文字列
 * @return {Object}
 */
export const convertCsv2Obj = str => {
  if (!str) {
    return {errors: ['message.emptyFile']}
  }
  return Papa.parse(str)
}

/**
 * csv形式の文字列に変換する。
 * @method
 * @param {Object[]} array
 * @param {String[]} headers ヘッダ名
 * @param {String} outputKeyNames カスタムヘッダ名。定義されている場合、ヘッダ名の代わりに適用される。
 * @return {String}
 */
export const converToCsv = (array, headers, outputKeyNames) => {
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

  return outputKeyNames? outputKeyNames + body: header + body
}

/**
 * base64をblobに変換する。
 * @method
 * @param {Buffer} base64
 * @return {Blob}
 */
export const base64ToBlob = base64 => {
  const byteString = atob( base64.split( ',' )[1] )
  const mimeType = base64.match( /(:)([a-z/]+)(;)/ )[2]
  const byteLength = byteString.length
  const content = new Uint8Array(byteLength)
  for( let i = 0; i < byteLength; i++ ) {
    content[i] = byteString.charCodeAt(i)
  }
  return new Blob([content], {type: mimeType})
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
 * 編集画面の状態を示す文字列を取得する。
 * @method
 * @param {Number} id
 * @return {String} 更新の場合は'update'。新規作成の場合は'addSetting'
 */
export const getDetailCaptionKey = id => {
  return `${hasValue(id)? 'update': 'addSetting'}`
}

/**
 * パスの拡張子を参照し、画像ファイルかチェックする。
 * @method
 * @param {String} key パス
 * @return {Boolean}
 */
export const isImageFile = key => hasValue(key) && /^.*\.(png$)|(jpg$)|(jpeg$)|(gif$)$/.test(key) && !/^.*(__MACOSX\/).*$/.test(key) && !/^\..*/.test(getFileName(key))

/**
 * 比率を計算する。
 * @method
 * @param {Number} secTime 秒
 * @param {Number} [digit = 設定値「APP.STAY_SUM.PARSENT_DIGIT」と同値] 出力する桁数
 * @param {Number} [baseSecTime = getStayBaseSec()の算出値] 基盤となる秒
 * @return {String}
 */
export const getRatio = (secTime, digit = APP.STAY_SUM.PARSENT_DIGIT, baseSecTime = getStayBaseSec()) => {
  return (Math.round((secTime / baseSecTime) * 100 * digit) / digit).toFixed(String(digit).length-1)
}

/**
 * 滞在時間の基準秒を算出する。
 * @method
 * @return {Number}
 */
export const getStayBaseSec = () => {
  let from = ((Math.floor(APP.STAY_SUM.FROM / 100) * 60) + Math.floor(APP.STAY_SUM.FROM % 100)) * 60
  let to = ((Math.floor(APP.STAY_SUM.TO / 100) * 60) + Math.floor(APP.STAY_SUM.TO % 100)) * 60
  return to - from
}

