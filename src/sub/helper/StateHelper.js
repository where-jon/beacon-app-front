import _ from 'lodash'
import * as AppServiceHelper from './AppServiceHelper'
import * as Util from '../util/Util'
import { CATEGORY, SHAPE, NOTIFY_STATE, SYSTEM_ZONE_CATEGORY_NAME } from '../constant/Constants'
import { APP } from '../constant/config'


// TODO: 全体的にState管理を共通化する

let store
let i18n

export const setApp = (pStore, pi18n) => {
  store = pStore
  i18n = pi18n
}

export const getSensorIdName = (sensor) => {
  if(!sensor){
    return null
  }
  return Util.getValue(sensor, 'sensorName', '')
}

export const getSensorIdNames = (exbSensorList) => {
  if(!Util.hasValue(exbSensorList)){
    return [i18n.tnl('label.normal')]
  }
  const names = []
  exbSensorList.forEach((exbSensor) => {
    names.push(i18n.tnl(`label.${getSensorIdName(exbSensor.sensor)}`))
  })
  return names.map((name) => name)
}

export const getTxIdName = (tx) => {
  if(!tx){
    return null
  }
  const id = APP.TX_WITH_TXID && tx.txId? tx.txId:
    APP.TX_BTX_MINOR != 'minor' && tx.btxId? tx.btxId:
      APP.TX_BTX_MINOR == 'minor' && tx.minor? tx.minor: null
  return id? id + '(' + Util.getValue(tx, 'txName', '') + ')': null
}

export const getTxIdNames = (potTxList) => {
  if(!Util.hasValue(potTxList)){
    return null
  }
  const names = []
  potTxList.forEach((potTx) => {
    names.push(getTxIdName(potTx.tx))
  })
  return names.map((name) => name)
}

export const getTxIds = (potTxList) => {
  if(!Util.hasValue(potTxList)){
    return null
  }
  const ids = []
  potTxList.forEach((potTx) => {
    ids.push(potTx.potTxPK.txId)
  })
  return ids.map((name) => name)
}

export const getTxParams = (potTxList) => {
  if(!Util.hasValue(potTxList)){
    return null
  }
  const txParams = []
  potTxList.forEach((potTx) => {
    txParams.push({
      txName: Util.getValue(potTx, 'tx.txName', ''),
      btxId: Util.getValue(potTx, 'tx.btxId', ''),
      minor: Util.getValue(potTx, 'tx.minor', ''),
    })
  })
  return txParams
}

export const getCategoryTypeName = (category) => {
  const categoryTypeName = CATEGORY.getTypes().find((tval) => tval.value === category.categoryType)
  return categoryTypeName != null? categoryTypeName.text: null
}

// システム利用　カテゴリの名称　⇔　各言語用名称　コンバートする
export const getConvertCategoryName = (categoryname) => {
  switch(categoryname) {
  case SYSTEM_ZONE_CATEGORY_NAME.ABSENT:
    return i18n.tnl('system.absentCategoryName')
  case i18n.tnl('system.absentCategoryName'):
    return SYSTEM_ZONE_CATEGORY_NAME.ABSENT
  default:
    return categoryname
  }
}

export const getShapeName = (shape) => {
  const shapeName = SHAPE.getShapes().find((tval) => tval.value === shape)
  return shapeName != null? shapeName.text: null
}

export const getTemplateKeyName = (templateKey) => {
  const templateKeyName = NOTIFY_STATE.getOptions().find((tval) => tval.value === templateKey)
  return templateKeyName != null? templateKeyName.text: null
}

export const setForceFetch = (name, force) => {
  const storeName = `forceFetch${name.charAt(0).toUpperCase()}${name.slice(1)}`
  store.commit('app_service/replaceAS', {[storeName]:force})
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
    sort: 'regionName',
  },
  areas: {
    path: '/core/area',
    sort: 'areaName',
  },
  exbs: {
    path: '/core/exb/withLocation',
    sort: APP.EXB_WITH_EXBID? 'exbId': APP.EXB_WITH_DEVICE_NUM? 'deviceNum': APP.EXB_WITH_DEVICE_ID? 'deviceId': APP.EXB_WITH_DEVICE_IDX? 'deviceIdX': 'exbId',
    beforeCommit: (arr) => {
      return arr.map((exb) => {
        const location = exb.location
        const area = location? location.area: null
        return {
          ...exb,
          deviceNum: exb.deviceId - store.state.currentRegion.deviceOffset,
          deviceIdX: exb.deviceId.toString(16).toUpperCase(),
          locationName: location? location.locationName: null,
          posId: location? location.posId: null,
          areaId: area? area.areaId: null,
          areaName: area? area.areaName: null,
          x: location? Math.round(location.x * 10)/10: null,
          y: location? Math.round(location.y * 10)/10: null,
          sensor: i18n.tnl('label.' + Util.getValue(exb, 'exbSensorList.0.sensor.sensorName', 'normal')),
          sensorId: Util.getValue(exb, 'exbSensorList.0.sensor.sensorId', null),
          zoneId: location? Util.getValue(location, 'locationZoneList.0.zone.zoneId', null): null,
          zoneName: location? Util.getValue(location, 'locationZoneList.0.zone.zoneName', null): null,
          isAbsentZone: location? Util.getValue(location, 'locationZoneList.0.zone.zoneCategoryList.0.category.categoryName', false) === SYSTEM_ZONE_CATEGORY_NAME.ABSENT: false,
          sensorIdNames: getSensorIdNames(exb.exbSensorList),
        }
      })
    }
  },
  txs: {
    path: '/core/tx/withPot',
    sort: APP.TX_WITH_TXID? 'txId': APP.TX_BTX_MINOR != 'minor'? 'btxId': 'minor',
    beforeCommit: (arr) => {
      return arr.map((tx) => {
        return {
          ...tx,
          displayName: Util.getValue(tx, 'potTxList.0.pot.displayName', null),
          description: Util.getValue(tx, 'potTxList.0.pot.description', null),
          category: Util.getValue(tx, 'potTxList.0.pot.potCategoryList.0.category', null),
          categoryName: getConvertCategoryName(Util.getValue(tx, 'potTxList.0.pot.potCategoryList.0.category.categoryName', null)),
          group: Util.getValue(tx, 'potTxList.0.pot.potGroupList.0.group', null),
          groupName: Util.getValue(tx, 'potTxList.0.pot.potGroupList.0.group.groupName', null),
          sensorId: Util.getValue(tx, 'txSensorList.0.sensor.sensorId', null),
          sensor: i18n.tnl('label.' + Util.getValue(tx, 'txSensorList.0.sensor.sensorName', 'normal')),
          dispPos: tx.disp & 1,
          dispPir: tx.disp & 2,
          dispAlways: tx.disp & 4
        }
      })
    }
  },

  templates: {
    path: '/core/rcvexcloud/template/list',
    sort: 'notifyTemplateId',
    beforeCommit: (arr) => {
      return arr.map((template) => {
        return {
          ...template,
          notifyTemplateKey: template.notifyTemplateKey? getTemplateKeyName(template.notifyTemplateKey): null,
          notifyMedium: template.notifyMedium==0? i18n.tnl('label.email'):i18n.tnl('label.slack'),
        }
      })
    }
  },

  pots: {
    path: '/basic/pot/withThumbnail',
    sort: 'potName',
    beforeCommit: (arr) => {
      let potImages = arr.map((val) => ({ id: val.potId, txId: val.txId, thumbnail: val.thumbnail}))
      store.commit('app_service/replaceAS', {['potImages']:potImages})
      return arr.map((val) => ({
        ...val,
        txIds: getTxIds(val.potTxList),
        txIdNames: getTxIdNames(val.potTxList),
        txParams: getTxParams(val.potTxList),
        txName: val.txId? Util.getValue(val, 'tx.txName', '') : null,
        btxId: val.txId? Util.getValue(val, 'tx.btxId', '') : null,
        minor: val.txId? Util.getValue(val, 'tx.minor', '') : null,
        groupName: Util.getValue(val, 'potGroupList.0.group.groupName', ''),
        groupId: Util.getValue(val, 'potGroupList.0.group.groupId', ''),
        categoryName: getConvertCategoryName(Util.getValue(val, 'potCategoryList.0.category.categoryName', '')),
        categoryId: Util.getValue(val, 'potCategoryList.0.category.categoryId', ''),
        ruby: Util.getValue(val, 'extValue.ruby' ,null),
        extValue: val.extValue ? val.extValue : this.extValueDefault,
        user: Util.getValue(val, 'potUserList.0.user', {}),
        thumbnail: ''
      })) // omit images to avoid being filtering target
    }
  },
  categories: {
    path: '/basic/category',
    sort: 'categoryName',
    beforeCommit: (arr) => {
      return arr.map((val) => ({
        ...val,
        categoryName: getConvertCategoryName(val.categoryName),
        shape: val.display? val.display.shape: null,
        color: val.display? val.display.color: null,
        bgColor: val.display? val.display.bgColor: null,
        shapeName: val.display? getShapeName(val.display.shape): null,
        categoryTypeName: getCategoryTypeName(val),
      }))
    }
  },
  groups: {
    path: '/basic/group',
    sort: 'groupName',
    beforeCommit: (arr) => {
      return arr.map((val) => ({
        ...val,
        shape: val.display? val.display.shape: null,
        color: val.display? val.display.color: null,
        bgColor: val.display? val.display.bgColor: null,
        shapeName: val.display? getShapeName(val.display.shape): null,
      }))
    }
  },
  users: {
    path: '/meta/user',
    sort: APP.USER_WITH_NAME? 'name': 'loginId',
    beforeCommit: (arr) => {
      return arr.map((val) => ({...val, roleName: val.role.roleName}))
    }
  },
  roles: {
    path: '/meta/role',
    sort: 'roleName',
  },
  features: {
    path: '/meta/feature',
    sort: 'featureName',
  },
  locations: {
    path: '/core/location',
    sort: 'locationId',
  },
  zones: {
    path: '/core/zone',
    sort: 'zoneName',
    beforeCommit: (arr) => {
      return  arr.map((val) => ({
        zoneId: val.zoneId,
        zoneName: val.zoneName,
        zoneType: val.zoneType,
        areaId: Util.hasValue(val.area)? val.area.areaId: null,
        areaName: Util.hasValue(val.area)? val.area.areaName: null,
        locationId: Util.hasValue(val.locationZoneList)? val.locationZoneList[0].locationZonePK.locationId: null,
        locationName: Util.hasValue(val.locationZoneList)? val.locationZoneList[0].location.locationName: null,
        categoryId: Util.hasValue(val.zoneCategoryList)? val.zoneCategoryList[0].zoneCategoryPK.categoryId: null,
        categoryName: getConvertCategoryName(Util.hasValue(val.zoneCategoryList)? val.zoneCategoryList[0].category.categoryName: null),
      }))
    }
  },
  settings: {
    path: '/meta/setting',
    sort: 'settingId',
  },
  tenants: {
    path: '/meta/tenant',
    sort: 'tenantId',
    beforeCommit: (arr) => {
      return  arr.map((val) => ({
        ...val,
        createDt: Util.formatDate(val.createDt),
      }))
    }
  },
}

export const load = async (target, force) => {
  if (!target.endsWith('s')) {
    target = target.endsWith('y')? target.slice(0, -1) + 'ies' : target + 's'
  }
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

export const loadAreaImage = async (areaId, force) => {
  if (areaId == null) {
    console.log('empty areas', areaId)
    return
  }
  if (store.state.app_service.areaImages.find((areaImage) => areaImage.areaId == areaId) && !force) {
    console.log('FOUND ares', areaId)
    return
  }

  console.log('load ares', areaId)
  let base64 = await AppServiceHelper.fetchMapImage('/core/area/' + areaId + '/mapImage')
  // let mimetype="image/png"
  // base64 = "data:" + mimetype + ";base64," + base64
  // HtmlUtil.toDataURL("http://localhost:8080/core/area/" + area.areaId + "/mapImage", (dataUrl) => {
  let areaImages = _.cloneDeep(store.state.app_service.areaImages)
  let areaImage = areaImages.find((areaImage) => areaImage.areaId == areaId)
  if (areaImage) {
    areaImage.mapImage = base64
  }
  else {
    areaImages.push({areaId, mapImage: base64})
  }
  console.log(areaId, areaImages)
  store.commit('app_service/replaceAS', {areaImages})    

  // })
}

export const loadAreaImages = async () => {
  if (store.state.app_service.areas.length == 0) {
    await load('area')
  }
  store.state.app_service.areas.forEach(async (area) => {
    await loadAreaImage(area.areaId)
  })
}

/**
 * stateからプルダウン等のオプションを取得する。
 * @param key stateのkey。obj[key + 'Id']の形でid項目を取得するのにも使う
 * @param textField 省略可。偽の場合、obj[key + 'Name']をtext:の値に使用する。文字列の場合、obj[textField]の形でtext項目を取得する。<br />
 * 関数の場合、第一引数にobjを渡して、戻り値をtext項目に使用する。
 * @param notNull 省略可。偽の場合、戻り値に{value: null, text: ''}を追加する。同様の形式のオブジェクトの場合、それを追加する。<br />
 * その他の場合、何もしない。下のフィルタ適用の後に行う。
 * @param filterCallback 省略可。オプションに適用するフィルタ。_.filter(ary, filterCallback)の処理を行う。
 * aryはstateの内容。オプションではない。
 * 
 * @example
 * グループのオプション
 * StateHelper.getOptionsFromState('group')
 * 
 * txのセンサー名一覧のオプション
 * StateHelper.getOptionsFromState('sensor', 
 *    (val) => {this.$i18n.t('label.' + val.sensorName})}, // 表示は言語ファイルから取る。
 *    {value: null, text: this.$i18n.t('label.normal')}, // センサーのnullは「通常」
 *    (val) => APP.TX_SENSOR.includes(val.senserId)) // Txのセンサーに絞り込む
 */
export const getOptionsFromState = (key, textField, notNull, filterCallback) => {
  Util.debug('getOptionsFromState')
  let keys
  if (!key.endsWith('s')) {
    keys = key.endsWith('y')? key.slice(0, -1) + 'ies' : key + 's'
  }
  const masterList = store.state.app_service[keys]
  
  Util.debug('masterList:', masterList)
  Util.debug('typeof textField: ', typeof textField)
  const keyId = key + 'Id'
  const keyName = key + 'Name'

  let getText
  if (!textField) {
    getText = (obj) => obj[keyName]
  } else if (typeof textField === 'string') {
    getText = (obj) => obj[textField]
  } else if (typeof textField === 'function') {
    getText = (obj) => textField(obj)
  }

  let emptyOption = false
  if (!notNull) {
    emptyOption = {value: null, label: '', text: ''}
  } else if (notNull.text || notNull.value) {
    emptyOption = notNull
  }
  Util.debug('emptyOption: ', emptyOption)

  let options = _(masterList)
    .filter(obj => filterCallback ? filterCallback(obj) : true)
    .map(obj => ({text: getText(obj), label: getText(obj), value: obj[keyId]}))
    .value()
  Util.debug('filtered: ', options)
  
  if (emptyOption) {
    options.unshift(emptyOption)
  }
  Util.debug('empty add: ', options)

  return options
}