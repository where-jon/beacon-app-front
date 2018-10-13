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
  _.forEach(obj, (val, key) => {
    if (val instanceof Object && !Util.isArray(val)) {
      // ret[key] = {}
      _.forEach(val, (cval, ckey) => {
        if (_.includes(fields, key + "." + ckey)) {
          // ret[key][ckey] = cval
          ret[ckey] = cval 
        }
      })
    }
    else if (_.includes(fields, key)) {
      ret[key] = val
    }
  })

  console.log("extract", {ret})
  return ret
}