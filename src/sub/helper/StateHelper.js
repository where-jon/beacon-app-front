import md5 from 'md5'
import _ from 'lodash'
import * as HttpHelper from './HttpHelper'
import * as AppServiceHelper from './AppServiceHelper'
import { APP, LOCAL_LOGIN } from '../constant/config'


// TODO: 全体的にState管理を共通化する

let store

export const setApp = (pStore) => {
    store = pStore
}

export const loadAreas = async (force) => {
  let areas = store.state.app_service.areas
  if (areas.length == 0 || force) {
    areas = await AppServiceHelper.fetchList('/core/area/withImage', 'areaId')
    store.commit('app_service/replaceAS', {areas})
  }
}

