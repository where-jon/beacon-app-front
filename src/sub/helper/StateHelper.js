import _ from 'lodash'
import * as AppServiceHelper from './AppServiceHelper'
import * as Util from '../util/Util'


// TODO: 全体的にState管理を共通化する

let store
let i18n

export const setApp = (pStore, pi18n) => {
    store = pStore
    i18n = pi18n
}

const appStateConf = {
  sensors: {
    path: '/core/sensor',
    sort: 'sensorId',
    beforeCommit: (arr) => {
      return arr
    }
  },
  regions: {
    path: '/meta/region',
    sort: 'regionId',
  },
  areas: {
    path: '/core/area/withImage',
    sort: 'areaId',
  },
  exbs: {
    path: '/core/exb/withLocation',
    sort: 'exbId',
    beforeCommit: (arr) => {
      return arr.map((exb) => {
        const location = exb.location
        const area = location? location.area: null
        return {
          ...exb,
          deviceIdX: exb.deviceId.toString(16).toUpperCase(),
          locationName: location? location.locationName: null,
          posId: location? location.posId: null,
          areaName: area? area.areaName: null,
          x: location? location.x: null,
          y: location? location.y: null,
          sensor: i18n.t('label.' + Util.getValue(exb, 'exbSensorList.0.sensor.sensorName', 'normal'))
        }
      })
    }
  },
  txs: {
    path: '/core/tx',
    sort: 'txId',
  },
  pots: {
    path: '/basic/pot',
    sort: 'potId',
  },
  categories: {
    path: '/basic/category',
    sort: 'categoryId',
  },
  groups: {
    path: '/basic/group',
    sort: 'groupId',
  },
  users: {
    path: '/meta/user',
    sort: 'userId',
    beforeCommit: (arr) => {
      return arr.map((val) => ({...val, roleName: val.role.roleName}))
    }
  },
  roles: {
    path: '/meta/role',
    sort: 'roleId',
  },
}

export const load = async (target, force) => {
  if (!target.endsWith("s")) {
    target = target.endsWith("y")? target.slice(0, -1) + "ies" : target + "s"
  }
  console.debug(target, appStateConf[target])
  if (!appStateConf[target]) {
    return
  } 
  let {path, sort, beforeCommit} = appStateConf[target]
  let arr = store.state.app_service[target]
  if (!arr || arr.length == 0 || force) {
    arr = await AppServiceHelper.fetchList(path, sort)
    if (beforeCommit) {
      arr = beforeCommit(arr)
    }
    store.commit('app_service/replaceAS', {[target]:arr})
  }
}
