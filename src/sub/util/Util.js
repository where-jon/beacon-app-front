import _ from 'lodash'

// sleep (for test)
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const snake2camel = (str) => str.replace(/_./g, (s) => s.charAt(1).toUpperCase())

export const addNoSelect = (option) => option.unshift({value: undefined, text: ""})

export const getByteLength = (str) => encodeURI(str == null? "": str).replace(/%../g, "*").length

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

export const csv2Obj = (keyArray, valueArray) => {
  const data = {}
  keyArray.forEach((key, index) => data[key] = valueArray[index])
  return data
}

export const parseCsv = (str, autoInsertId) => {
  let headers = []
  return str.split('\n').reduce((table, row, index) => {
    if(!table){
      return
    }
    if(!row){
      return table
    }
    const values = row.split(",").map((val) => val.trim().replace(/^"/, "").replace(/"$/, ""))
    if(index === 0){
      headers = values
    }
    else{
      let csvObj = csv2Obj(headers, values, autoInsertId)
      autoInsertId.forEach((val) => csvObj[val] = (-1 - index))
      table.push(csvObj)
    }
    return table
  }, [])
}

export const readCsvFile = (fileObject, onLoad, autoInsertId = []) => {
  const fileReader = new FileReader()
  fileReader.readAsText(fileObject)
  let data = null
  fileReader.onload = ((event) => {
    data = parseCsv(fileReader.result, autoInsertId)
    onLoad && onLoad(data)
  })
}
