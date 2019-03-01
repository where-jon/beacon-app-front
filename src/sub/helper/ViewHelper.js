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
