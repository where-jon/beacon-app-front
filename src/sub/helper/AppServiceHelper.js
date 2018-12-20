import _ from 'lodash'
import { DEV } from '../constant/config'
import { UPDATE_ONLY_NN, IGNORE } from '../constant/Constants'
import * as mock from '../../assets/mock/mock'
import * as HttpHelper from './HttpHelper'

export const fetchList = async (target, sortBy, pMock) => {
  let data = pMock? pMock: DEV.USE_MOCK_APS? mock[target]:
    await HttpHelper.getAppService(target + '?_=' + new Date().getTime())
  if (!sortBy) {
    return data
  }
  return _(data).sortBy((val) => val[sortBy]).compact().value()
}

export const fetch = async (target, id) => {
  const path = target + '/'
  let data = DEV.USE_MOCK_APS? mock[path + id]:
    await HttpHelper.getAppService(path + id + '?_=' + new Date().getTime())
  return data
}

export const fetchMapImage = async (path) => {
  return await HttpHelper.getAppService(path + '?_=' + new Date().getTime())
  // let data = await HttpHelper.getAppService(path + "?_=" + new Date().getTime(), {responseType: 'arraybuffer'})
  // return new Buffer(data, 'binary').toString('base64')
}

export const save = async (target, entity, updateOnlyNN = UPDATE_ONLY_NN.NONE) => {
  const path = target
  var params = new URLSearchParams()
  _.forEach(entity, (value, key) => {
    params.append(key, value || '')
  })

  let data = DEV.USE_MOCK_APS? mock[target]:
    await HttpHelper.postAppService(path + '?updateOnlyNN=' + updateOnlyNN + '&_=' + new Date().getTime(), params)

  return data
}

export const update = async (target, entity, updateOnlyNN = UPDATE_ONLY_NN.NONE) => {
  const path = target
  var params = new URLSearchParams()
  _.forEach(entity, (value, key) => {
    params.append(key, value || '')
  })

  let data = DEV.USE_MOCK_APS? mock[target]:
    await HttpHelper.putAppService(path + '?updateOnlyNN=' + updateOnlyNN + '&_=' + new Date().getTime(), params)

  return data
}

export const bulkSave = async (target, entities, updateOnlyNN = UPDATE_ONLY_NN.NONE, ignoreImage = IGNORE.OFF) => {
  const path = target + '/bulk/?updateOnlyNN=' + updateOnlyNN + '&ignoreImage=' + ignoreImage + '&_=' + new Date().getTime()
  let data = DEV.USE_MOCK_APS? mock[target]:
    await HttpHelper.postAppService(path, entities)

  return data
}

export const deleteEntity = async (target, id) => {
  const path = target + '/'
  let data = DEV.USE_MOCK_APS? mock[path + id]:
    await HttpHelper.deleteAppService(path + id + '?_=' + new Date().getTime())
  return data
}
