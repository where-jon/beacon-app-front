import * as Util from '../util/Util'
import * as StringUtil from '../util/StringUtil'
import { BULK } from '../constant/Constants'

export const isPrimaryKeyHeader = (headerName) => headerName == BULK.PRIMARY_KEY

export const setPrimaryKey = (entity, headerName, val, dummyKey) => {
  setNumberKey(entity, headerName, val, {isNullable: true})
  entity[headerName] = entity[BULK.PRIMARY_KEY] = val? val: dummyKey
  return entity
}

export const setNumberKey = (entity, headerName, val, option = {isNullable: false, errorName: null}) => {
  if(!Util.hasValue(val)){
    entity[headerName] = null
    return Util.getValue(option, 'isNullable', false)? entity: addInvalid(entity, headerName, val, Util.getValue(option, 'errorName', null))
  }
  const num = Number(val)
  entity[headerName] = num
  return !isNaN(num)? entity: addInvalid(entity, headerName, val,Util.getValue(option, 'errorName', null))
}

export const setBooleanKey = (entity, headerName, val, option = {isNullable: false, errorName: null}) => {
  if(!Util.hasValue(val)){
    return Util.getValue(option, 'isNullable', false)? entity: addInvalid(entity, headerName, val, Util.getValue(option, 'errorName', null))
  }
  if(['true', 'false'].includes(val.toLowerCase())){
    entity[headerName] = StringUtil.str2boolean(val)
    return entity
  }
  return addInvalid(entity, headerName, val, Util.getValue(option, 'errorName', null))
}

export const setHexKey = (entity, headerName, val, option = {isNullable: false, errorName: null}) => {
  if(!Util.hasValue(val)){
    entity[headerName] = null
    return Util.getValue(option, 'isNullable', false)? entity: addInvalid(entity, headerName, val, Util.getValue(option, 'errorName', null))
  }
  entity[headerName] = val
  return !isNaN('0x' + val)? entity: addInvalid(entity, headerName, val,Util.getValue(option, 'errorName', null))
}

export const setStringKey = (entity, headerName, val, regExp = null, option = {isNullable: false, errorName: null}) => {
  if(!Util.hasValue(val)){
    entity[headerName] = null
    return Util.getValue(option, 'isNullable', false)? entity: addInvalid(entity, headerName, val, Util.getValue(option, 'errorName', null))
  }
  entity[headerName] = val
  return regExp && !regExp.test(val)? addInvalid(entity, headerName, val,Util.getValue(option, 'errorName', null)): entity
}

export const addInvalid = (entity, headerName, val, errorName) => {
  entity[errorName? errorName: headerName + 'Name'] = val
  return entity
}
