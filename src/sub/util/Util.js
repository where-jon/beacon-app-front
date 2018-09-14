import _ from 'lodash'
import jschardet from 'jschardet'
import Encoding from 'encoding-japanese'
import Papa from 'papaparse'

// sleep (for test)
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const snake2camel = (str) => str.replace(/_./g, (s) => s.charAt(1).toUpperCase())

export const detectEncoding = (str) => jschardet.detect(str)

export const convert2Unicode = (str) => {
  let sArr = str2Array(str)
  let uniArray = Encoding.convert(sArr, 'UNICODE', detectEncoding(str))
  return Encoding.codeToString(uniArray)
}

export const str2Array = (str) => {
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
  let header = '"' + headers.join('","') + '"\n'
  let body = _.map(array, (row) => {
    return '"' + headers.map((key) => {
      let val = row[key]
      if (typeof val === 'object' || typeof val === 'array') {
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
