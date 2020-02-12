/**
 * csvに関するユーティリティモジュール
 * @module util/CsvUtil
 */

import _ from 'lodash'
import Papa from 'papaparse'
import { isArray } from './ArrayUtil'
import { convert2Unicode } from './StringUtil'
import { hasValue, getValue } from './Util'

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
 * @return {Object} papaparseの結果オブジェクト
 */
export const csv2Obj = (str) => {
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
      let val = getValue(row, key)
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

