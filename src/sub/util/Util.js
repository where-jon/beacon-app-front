import _ from 'lodash'

// sleep (for test)
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const snake2camel = (str) => str.replace(/_./g, (s) => s.charAt(1).toUpperCase())

export const colorCd4db = (str) => {
  const color = str.replace("#", "")
  return color.slice(0, 8)
}

export const colorCd4display = (str) => {
  if(str === undefined){
    return "#000000"
  }
  return "#" + str.replace("#", "").slice(0, 8)
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

