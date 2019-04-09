import _ from 'lodash'
import * as AppServiceHelper from './AppServiceHelper'
import * as Util from '../util/Util'
import { CATEGORY, SHAPE, NOTIFY_STATE, SYSTEM_ZONE_CATEGORY_NAME } from '../constant/Constants'
import { APP } from '../constant/config'


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

export const getDeviceIdName = (device, option = {ignorePrimaryKey: false, forceSensorName: false}) => {
  if(device.exbId){
    return APP.EXB_WITH_EXBID && !option.ignorePrimaryKey? 'exbId': APP.EXB_WITH_DEVICE_NUM? 'deviceNum': APP.EXB_WITH_DEVICE_ID? 'deviceId': APP.EXB_WITH_DEVICE_IDX? 'deviceIdX': 'exbId'
  }
  if(device.txId){
    return option.forceSensorName? 'txName': APP.TX_WITH_TXID && !option.ignorePrimaryKey? 'txId': APP.TX_BTX_MINOR != 'minor'? 'btxId': 'minor'
  }
  return null
}

export const getDeviceId = (device) => {
  const id = getDeviceIdName(device)
  if(id){
    return device[id]
  }
  return ''
}

export const getTxIdName = (tx, idOnly = false) => {
  if(!tx){
    return null
  }
  const id = APP.TX_WITH_TXID && tx.txId? tx.txId:
    APP.TX_BTX_MINOR != 'minor' && tx.btxId? tx.btxId:
      APP.TX_BTX_MINOR == 'minor' && tx.minor? tx.minor: null
  return idOnly? id: id? `${id}(${Util.getValue(tx, 'txName', '')})`: null
}

export const getTxIdNames = (txList, idOnly = false) => {
  if(!Util.hasValue(txList)){
    return null
  }
  const names = []
  txList.forEach((tx) => {
    names.push(getTxIdName(tx, idOnly))
  })
  return names.map((name) => name)
}

export const getTxIds = (txList) => {
  if(!Util.hasValue(txList)){
    return null
  }
  const ids = []
  txList.forEach((tx) => {
    ids.push(tx.txId)
  })
  return ids.map((name) => name)
}

export const getTxParams = (txList) => {
  if(!Util.hasValue(txList)){
    return null
  }
  const txParams = []
  txList.forEach((tx) => {
    txParams.push({
      txId: tx.txId,
      txName: tx.txName,
      btxId: tx.btxId,
      minor: tx.minor
    })
  })
  return txParams
}

export const getCategoryTypeName = (category) => {
  const categoryTypeName = CATEGORY.getTypes().find((tval) => tval.value === category.categoryType)
  return categoryTypeName != null? categoryTypeName.text: null
}

export const getShapeName = (shape) => {
  const shapeName = SHAPE.getShapes().find((tval) => tval.value === shape)
  return shapeName != null? shapeName.text: null
}

export const getTemplateKeyName = (templateKey) => {
  const templateKeyName = NOTIFY_STATE.getOptions().find((tval) => tval.value === templateKey)
  return templateKeyName != null? templateKeyName.text: null
}

export const getDispCategoryName = (category) => {
  return category.systemCategoryName? i18n.tnl('label.' + category.systemCategoryName): category.categoryName
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
        return {
          ...exb,
          deviceNum: exb.deviceId - store.state.currentRegion.deviceOffset,
          deviceIdX: exb.deviceId.toString(16).toUpperCase(),
          x: location? Math.round(location.x * 10)/10: null,
          y: location? Math.round(location.y * 10)/10: null,
          sensor: i18n.tnl('label.' + Util.getValue(exb, 'sensorName', 'normal')),
          isAbsentZone: exb.zoneCategoryName === SYSTEM_ZONE_CATEGORY_NAME.ABSENT,
          // sensorIdNames: getSensorIdNames(exb.exbSensorList), // 一旦単数に戻す
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
          sensor: i18n.tnl('label.' + Util.getValue(tx, 'sensorName', 'normal')),
          dispPos: tx.disp & 1,
          dispPir: tx.disp & 2,
          dispAlways: tx.disp & 4,
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
      const idNames = APP.TX_WITH_TXID? 'txId': APP.TX_BTX_MINOR == 'minor'? 'minor': 'btxId'
      return arr.map((pot) => {
        return {
          ...pot,
          txIds: getTxIds(pot.txList),
          txIdNames: getTxIdNames(pot.txList),
          txSortIds: getTxIdNames(pot.txList, true),
          txParams: getTxParams(pot.txList),
          txName: pot.txName,
          btxId: pot.btxId,
          minor: pot.minor,
          ruby: pot.extValue? pot.extValue.ruby: null,
          extValue: pot.extValue ? pot.extValue : this.extValueDefault,
        }
      }).sort((a, b) => {
        if(!a.txParams && !b.txParams){
          return 0
        }
        if(!a.txParams){
          return 1
        }
        if(!b.txParams){
          return -1
        }
        const comp = Util.compareArray(a.txParams.map(val => val[idNames]), b.txParams.map(val => val[idNames]))
        if(comp != 0){
          return comp
        }
        return Util.compareArray(a.txParams.map(val => val.txName), b.txParams.map(val => val.txName))
      })// omit images to avoid being filtering target
    }
  },
  categories: {
    path: '/basic/category',
    sort: 'categoryName',
    beforeCommit: (arr) => {
      return arr.map((val) => ({
        ...val,
        categoryName: val.categoryName,
        shape: val.display? val.display.shape: null,
        color: val.display? val.display.color: null,
        bgColor: val.display? val.display.bgColor: null,
        shapeName: val.display? getShapeName(val.display.shape): null,
        categoryTypeName: getCategoryTypeName(val),
        systemCategoryName: val.systemUse != 0? val.categoryName.toLowerCase(): null,
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
  newsList: {
    path: '/news',
    sort: 'newsDate',
    beforeCommit: (arr) => {
      return arr.map((val) => ({
        ...val,
        newsDt: Util.formatDate(val.newsDate),
        dispState: i18n.tnl(`label.${val.dispFlg == 0? 'hide': 'display'}`),
      }))
    }
  },
  topNewsList: {
    path: '/news/disp',
    sort: 'newsDate',
    beforeCommit: (arr) => {
      return _.orderBy(arr, ['newsDate'], ['desc'])
    }
  },
  roles: {
    path: '/meta/role',
    sort: 'roleName',
  },
  features: {
    path: '/meta/feature',
    sort: 'featureName',
    beforeCommit: (arr) => {
      return  arr.map((val) => ({
        ...val,
        featureName: val.featureType == 0? Util.toLowerCaseTop(val.featureName): val.featureName,
      }))
    }
  },
  locations: {
    path: '/core/location',
    sort: 'locationId',
  },
  zones: {
    path: '/core/zone',
    sort: 'zoneName',
    beforeCommit: (arr) => {
      return  arr.map((val) => {
        const category = Util.getValue(val, 'zoneCategoryList.0.category', null)
        return {
          zoneId: val.zoneId,
          zoneName: val.zoneName,
          zoneType: val.zoneType,
          areaId: Util.hasValue(val.area)? val.area.areaId: null,
          areaName: Util.hasValue(val.area)? val.area.areaName: null,
          locationId: Util.hasValue(val.locationZoneList)? val.locationZoneList[0].locationZonePK.locationId: null,
          locationName: Util.hasValue(val.locationZoneList)? val.locationZoneList[0].location.locationName: null,
          categoryId: Util.hasValue(val.zoneCategoryList)? val.zoneCategoryList[0].zoneCategoryPK.categoryId: null,
          categoryName: category? category.categoryName: null,
          systemCategoryName: category? category.systemUse != 0? category.categoryName.toLowerCase(): null: null,
        }
      })
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
  prohibits: {
    path: '/core/zone/prohibit',
    beforeCommit: (arr) => {
      let result = arr.map((val) => (val? { // TODO: valがundefinedになる
        ...val,
        zoneId: val.zoneId,
        zoneName:val.zoneName,
        x: val.x,
        y: val.y,
        w: val.w,
        h: val.h,
        areaId: val.areaId,
      }: null))
      return result
    }
  },
}

export const load = async (target, force) => {
  if (!target.endsWith('s')) {
    target = target.endsWith('y')? target.slice(0, -1) + 'ies' : target + 's'
  }else if(['news', 'topNews'].includes(target)){
    target = `${target}List`
  }
  if (!appStateConf[target]) {
    return
  } 
  let {path, sort, beforeCommit} = appStateConf[target]
  let arr = store.state.app_service[target]
  const expiredKey = `${target}Expired`
  if (!arr || arr.length == 0 || force || Util.isExpired(store.state.app_service[expiredKey])) {
    arr = await AppServiceHelper.fetchList(path, sort)
    if (beforeCommit) {
      arr = beforeCommit(arr)
    }
    store.commit('app_service/replaceAS', {[target]:arr})
    const expiredTime = (new Date()).getTime() + APP.STATE_EXPIRE_TIME
    store.commit('app_service/replaceAS', {[expiredKey]: expiredTime})
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

export const getProhibitData = async (position,prohibits) => {

  if (!APP.PROHIBIT_ALERT || !APP.PROHIBIT_GROUPS) {
    return null
  }
  const groups = APP.PROHIBIT_GROUPS
  return position.filter((pos) =>
    prohibits.some((prohibitData) => {
      if (pos.exb.areaId == prohibitData.areaId
          && pos.exb.x >= prohibitData.x && pos.exb.x <= prohibitData.w
          && pos.exb.y >= prohibitData.y && pos.exb.y <= prohibitData.h) {
        const groupCheck = groups.some((group) => pos.tx.group.groupId == group)
        groupCheck ? pos.zoneName = prohibitData.zoneName : null
        return groupCheck
      }
    })).map((position) => {
    return {
      minor: position.minor,
      potName: position.tx.potTxList[0].pot.potName,
      areaName: position.exb.areaName,
      zoneName: position.zoneName
    }})
}

export const getProhibitMessage = async (message,prohibitData) => {

  if (!APP.PROHIBIT_ALERT || !APP.PROHIBIT_GROUPS) {
    return ''   // message空
  }

  const labelArea = i18n.tnl('label.Area')
  const labelpotName = i18n.tnl('label.potName')
  const labelZone =  i18n.tnl('label.zoneName')
  return prohibitData.map((data) => `< ${labelpotName} : ${data.potName} ${labelArea} : ${data.areaName} ${labelZone} : ${data.zoneName}>`).join(' ')
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

export const sortCompareArray = (aAry, bAry) => {
  if(!Util.hasValue(aAry) && !Util.hasValue(bAry)){
    return 0
  }
  if(!Util.hasValue(aAry)){
    return -1
  }
  if(!Util.hasValue(bAry)){
    return 1
  }

  const max = aAry.length < bAry.length? bAry.length: aAry.length
  for(let idx = 0; idx < max; idx++){
    if(aAry.length <= idx){
      return -1
    }
    if(bAry.length <= idx){
      return 1
    }
    if(aAry[idx] == bAry[idx]){
      continue
    }
    return aAry[idx] < bAry[idx]? -1: 1
  }
  return 0
}

export const bulkErrorCheck = (entity, headerName, val, isNumberColumn) => {
  if(!isNumberColumn){
    return true
  }
  if(!isNaN(Number(val))){
    return true
  }
  entity[`${headerName}Name`] = val
  return false
}
