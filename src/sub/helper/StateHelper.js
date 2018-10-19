import _ from 'lodash'
import * as AppServiceHelper from './AppServiceHelper'
import * as Util from '../util/Util'
import { CATEGORY } from '../constant/Constants'


// TODO: 全体的にState管理を共通化する

let store
let i18n

export const setApp = (pStore, pi18n) => {
    store = pStore
    i18n = pi18n
}

export const getCategoryTypeName = (category) => {
  const categoryTypeName = CATEGORY.getTypes().find((tval) => tval.value === category.categoryType)
  return categoryTypeName != null? categoryTypeName.text: null
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
    path: '/core/region',
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
    path: '/core/tx/withPot',
    sort: 'txId',
    beforeCommit: (arr) => {
      return arr.map((tx) => {
        return {
          ...tx,
          displayName: Util.getValue(tx, 'pot.displayName', null),
          description: Util.getValue(tx, 'pot.description', null),
          category: Util.getValue(tx, 'pot.potCategoryList.0.category.categoryName', null),
          sensor: i18n.t('label.' + Util.getValue(tx, 'txSensorList.0.sensor.sensorName', 'normal'))
        }
      })
  }
  },
  pots: {
    path: '/basic/pot/withThumbnail',
    sort: 'potId',
    beforeCommit: (arr) => {
      let potImages = arr.map((val) => val.thumbnail)
      store.commit('app_service/replaceAS', {['potImages']:potImages})
      return arr.map((val) => ({
        ...val,
        txIdName: val.txId? Util.getValue(val, 'tx.txName', '') + '(' + val.txId + ')': null,
        txName: val.txId? Util.getValue(val, 'tx.txName', '') : null,
        groupName: Util.getValue(val, 'potGroupList.0.group.groupName', ''),
        groupId: Util.getValue(val, 'potGroupList.0.group.groupId', ''),
        categoryName: Util.getValue(val, 'potCategoryList.0.category.categoryName', ''),
        categoryId: Util.getValue(val, 'potCategoryList.0.category.categoryId', ''),
        extValue: val.extValue ? val.extValue : this.extValueDefault,
        thumbnail: ""
      })) // omit images to avoid being filtering target
    }
  },
  categories: {
    path: '/basic/category',
    sort: 'categoryId',
    beforeCommit: (arr) => {
      return arr.map((val) => ({
        ...val,
        categoryTypeName: getCategoryTypeName(val),
      }))
    }
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
  features: {
    path: '/meta/feature',
    sort: 'featureId',
  },
  locations: {
    path: '/core/location',
    sort: 'locationId',
  },
  zones: {
    path: '/core/zone/coordinates',
    sort: 'zoneId',
    beforeCommit: (arr) => {
      return  arr.map((val) => ({
        zoneId: val.zoneId,
        zoneName: val.zoneName,
        areaId: Util.hasValue(val.area)? val.area.areaId: null,
        areaName: Util.hasValue(val.area)? val.area.areaName: null,
        locationId: Util.hasValue(val.locationZoneList)? val.locationZoneList[0].locationZonePK.locationId: null,
        locationName: Util.hasValue(val.locationZoneList)? val.locationZoneList[0].location.locationName: null,
        categoryId: Util.hasValue(val.zoneCategoryList)? val.zoneCategoryList[0].zoneCategoryPK.categoryId: null,
        categoryName: Util.hasValue(val.zoneCategoryList)? val.zoneCategoryList[0].category.categoryName: null,
      }))
    }
  },
  settings: {
    path: '/meta/setting',
    sort: 'settingId',
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
