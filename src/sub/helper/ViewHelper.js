import _ from 'lodash'
import * as Util from '../util/Util'


export const addLabelByKey = (i18n, objArr) => {
  return _.map(objArr, (val) => {
    return {...val, label: i18n.t("label." + (val.label || val.key))}
  })
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

  console.log("extract", {ret})
  return ret
}