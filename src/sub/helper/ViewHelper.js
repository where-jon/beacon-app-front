import _ from 'lodash'


export const cannotReadProperty = (str) => new RegExp(/^[0-9].*$/).test(str)

export const renameCannotReadProperty = (str) => "_" + str

export const addLabelByKey = (i18n, objArr) => {
  return _.map(objArr, (val) => {
    return {...val, label: i18n.t("label." + (val.label || val.key))}
  })
}

export const extract = (obj, fields) => {
  if (!obj || !fields) return obj

  let ret = {}
  _.forEach(obj, (val, key) => {
    if (val instanceof Object) {
      // ret[key] = {}
      _.forEach(val, (cval, ckey) => {
        if (_.includes(fields, key + "." + ckey)) {
          // ret[key][ckey] = cval
          if(cannotReadProperty(ckey)){
            ckey = renameCannotReadProperty(ckey)
          }
          ret[ckey] = cval
        }
      })
    }
    else if (_.includes(fields, key)) {
      ret[key] = val
    }
  })
  console.log({ret})
  return ret
}