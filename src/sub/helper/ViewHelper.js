import _ from 'lodash'
import * as Util from '../util/Util'

let i18n

export const setApp = (pi18n) => {
  i18n = pi18n
}

export const addLabelByKey = (i18n, objArr) => {
  return _(objArr).map((val) => {
    return val? {...val, label: i18n? i18n.tnl('label.' + (val.label || val.key)): val.label || val.key}: null
  })
    .filter((val) => val != null).value()
}

export const applyDef = (obj, def) => {
  if (!obj || !def) return obj

  _.forEach(def, (val, key) => {
    if (obj[key] === undefined) {
      obj[key] = val
    }
  })
}

export const extract = (obj, fields) => {
  if (!obj || !fields) return obj

  let ret = {}
  _.forEach(fields, (field) => {
    let {val, lastKey} = Util.getValue(obj, field)
    ret[lastKey] = val
  })

  console.log('extract', {ret})
  return ret
}

export const createBreadCrumbItems = (...columns) => {
  const ret = []
  columns.forEach(column => {
    const isString = typeof column == 'string'
    ret.push({
      text: i18n.tnl(`label.${isString? column: column.text}`),
      active: isString? true: column.href == null,
      href: isString? null: column.href,
    })
  })
  return ret
}

// 3桁 もしくは 6桁のHEXをRGBAに変換する
export const getRGBA = (colorCode, opacity) => {
  console.log('getRGBA: ' + colorCode)
  if (colorCode.substring(0,1) == '#') {
    colorCode = colorCode.slice(1)
  }
  console.log('colorCode: ' + colorCode)

  if (colorCode && colorCode.length < 6) {
    if (colorCode.length == 3) {
      let red   = parseInt(colorCode.substring(0,1) + colorCode.substring(0,1), 16)
      let green = parseInt(colorCode.substring(1,2) + colorCode.substring(1,2), 16)
      let blue  = parseInt(colorCode.substring(2,3) + colorCode.substring(2,3), 16)
      let alpha = opacity? opacity: 1
      return 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')'
    } else {
      console.log('getRGBA', {colorCode})
      return ''
    }
  } else {
    let red   = parseInt(colorCode.substring(0,2), 16)
    let green = parseInt(colorCode.substring(2,4), 16)
    let blue  = parseInt(colorCode.substring(4,6), 16)
    let alpha = opacity? opacity: 1
    return 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')'
  }
}
