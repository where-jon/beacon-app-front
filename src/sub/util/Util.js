import _ from 'lodash'
import jschardet from 'jschardet'
import Encoding from 'encoding-japanese'
import Papa from 'papaparse'

// sleep (for test)
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const snake2camel = (str) => str.replace(/_./g, (s) => s.charAt(1).toUpperCase())

export const addNoSelect = (option) => option.unshift({value: undefined, text: ""})
export const getByteLength = (str) => encodeURI(str == null? "": str).replace(/%../g, "*").length

export const colorCd4db = (str) => {
  if(!str){
    return "000000"
  }
  const color = str.replace("#", "")
  return color.slice(0, 8)
}

export const colorCd4display = (str, defaultColor) => {
  let color = str? str: (defaultColor? defaultColor: "#000000")
  return "#" + color.replace("#", "").slice(0, 8)
}

export const hasValue = (obj) => obj !== undefined && obj !== null && obj.length !== 0
export const detectEncoding = (str) => jschardet.detect(str)

export const csv2Obj = (str) => {
  str = str.replace("\xEF\xBB\xBF", "") // remove bom
  str = convert2Unicode(str)
  str = removeCrLfDup(str)
  return convertCsv2Obj(str)
}

export const convert2Unicode = (str) => {
  let sArr = str2Array(str)
  let uniArray = Encoding.convert(sArr, 'UNICODE', detectEncoding(str))
  return Encoding.codeToString(uniArray)
}

export const removeCrLfDup = (str) => {
  if (!str) return str
  str = str.replace(/\r?\n/g,"\n");
  str = str.replace(/\r/g,"\n");
  let strArr = _.filter(str.split("\n"), (line) => {
    return line && line.trim() != ""
  })
  return strArr.join("\n")
}

export const str2Array = (str,) => {
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
