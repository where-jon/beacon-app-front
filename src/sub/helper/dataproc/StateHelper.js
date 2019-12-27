/**
 * vueステートに関するヘルパーモジュール
 * @module helper/dataproc/StateHelper
 */

import _ from 'lodash'
import { APP, DISP } from '../../constant/config'
import { EXB, CATEGORY, ZONE, SHAPE, FEATURE, NOTIFY_STATE, SYSTEM_ZONE_CATEGORY_NAME} from '../../constant/Constants'
import * as ArrayUtil from '../../util/ArrayUtil'
import * as DateUtil from '../../util/DateUtil'
import * as StringUtil from '../../util/StringUtil'
import * as Util from '../../util/Util'
import * as AppServiceHelper from './AppServiceHelper'
import * as ConfigHelper from './ConfigHelper'
import * as ExtValueHelper from '../domain/ExtValueHelper'
import * as LocaleHelper from '../base/LocaleHelper'
import * as OptionHelper from './OptionHelper'
import * as SensorHelper from '../domain/SensorHelper'


let store
let i18n

/**
 * vue.jsで使用するオブジェクトを設定する。
 * @method
 * @param {Object} pStore
 * @param {Object} pi18n
 */
export const setApp = (pStore, pi18n) => {
  store = pStore
  i18n = pi18n
}

/**
 * マスタデータをmapに変換する。
 * @method
 * @param {String} keyName キー名
 * @param {Object[]} masterList マスタ種類に属するデータリスト
 * @return {Object}
 */
export const convertMasterMap = (keyName, masterList) => {
  const ret = {}
  masterList.forEach(val => {
    const masterId = val[keyName]
    ret[masterId] = val
  })
  return ret
}

/**
 * マスタコードを作成する。
 * @method
 * @param {String} masterType マスタ種類
 * @param {Object[]} masterList マスタ種類に属するデータリスト
 * @param {Object} [masterData = null] データを更新する場合に使用。更新対象のマスタデータ
 * @return {String}
 */
export const createMasterCd = (masterType, masterList, masterData = null) => {
  if(!Util.hasValue(masterList)){
    return '1'
  }
  const masterIdName = masterType + 'Id'
  const masterCdName = masterType + 'Cd'
  if(masterData && masterData[masterIdName]){
    return masterData[masterCdName]? masterData[masterCdName]: masterData[masterIdName]
  }
  const reg = /([^0-9]*)([0-9]*)/
  const maxCd = masterList.map(master => master[masterCdName]).filter(master => master).reduce((prev, cur) => {
    const prevAry = prev.split(reg).filter(val => val)
    const prevLength = prevAry.length
    const curAry = cur.split(reg).filter(val => val)
    const curLength = curAry.length
    for(let cnt = 0; cnt < prevLength; cnt++){
      if(curLength <= cnt){
        return prev
      }
      const comp = StringUtil.sortByString(prevAry[cnt], curAry[cnt], LocaleHelper.getSystemLocale())
      if(comp < 0){
        return cur
      }
      if(comp > 0){
        return prev
      }
    }
    return prevLength < curLength? cur: prev
  }, '')
  if(!Util.hasValue(maxCd)){
    return '1'
  }
  return maxCd.split(reg).filter(val => val).reduce((prev, cur, index, array) => {
    const ret = '' + prev
    if(index + 1 < array.length){
      return ret + cur
    }
    return ret + (/^[0-9]+$/.test(cur)? StringUtil.addWithPadding(cur, 1): cur.concat(1))
  }, '')
}

/**
 * 重複のないデータを作成する。
 * @method
 * @param {Object[]} masterList
 * @param {Object} obj
 * @param {String} column
 * @param {String} type
 * @param {Number} sign
 * @return {Object}
 */
export const createNoConflictValue = (masterList, obj, column, type, sign = 1) => {
  if(!masterList.some(master => master[column] == obj[column])){
    return obj[column]
  }
  for(let cnt = 1; cnt < 65536; cnt++) {
    const value = type == 'number'? obj[column] + (cnt * sign): obj[column] + '-' + cnt
    if(!masterList.some(master => master[column] == value)){
      return value
    }
  }
  return obj[column]
}

 /**
 * Tx配置設定の新規データを作成する。
 * @method
 * @param {Object} tx
 * @return {Object}
 */
export const createLocationFromTx = tx => {
  const txs = store.state.app_service.txs
  if(!txs){
    return tx
  }
  return {
    locationId: tx.btxId * -1,
    locationCd: createNoConflictValue(txs, { locationCd: tx.btxId * -1 }, 'locationCd', 'string', -1),
    locationName: createNoConflictValue(txs, { locationName: Util.getValue(tx, 'location.locationName', SensorHelper.createTxLocationDummyName(tx)) }, 'locationName', 'string'),
  }
}

/**
 * センサ名を取得する。
 * @method
 * @param {Object} sensor 
 * @return {String}
 */
export const getSensorIdName = sensor => {
  if(!sensor){
    return null
  }
  return Util.getValue(sensor, 'sensorName', '')
}

/**
 * TxまたはEXBの名称を示すプロパティ名を取得する。
 * @method
 * @param {Object} device TxまたはEXB
 * @param {{forceSensorName: Boolean}} [option = {forceSensorName: false}] 強制的にpotNameを参照させる
 * @return {String}
 */
export const getDeviceIdName = (device, option = {forceSensorName: false}) => {
  if(device.exbId){
    return ConfigHelper.includesDeviceType('deviceId')? 'deviceId': ConfigHelper.includesDeviceType('deviceIdX')? 'deviceIdX': 'locationName'
  }
  if(device.txId){
    return option.forceSensorName? 'potName': APP.TX.BTX_MINOR != 'minor'? 'btxId': 'minor'
  }
  return null
}

/**
 * TxまたはEXBの名称を取得する。
 * @method
 * @param {Object} device TxまたはEXB
 * @return {Any}
 */
export const getDeviceId = device => {
  const id = getDeviceIdName(device)
  if(id){
    return device[id]
  }
  return ''
}

/**
 * 配置画面上のTx選択肢ラベルを作成する。
 * @method
 * @param {Object} tx 
 * @return {String}
 */
export const getLocationTxName = (tx, addPotName = true) => {
  if(!tx){
    return ''
  }
  return '' + (tx.minor? tx.minor: tx.btxId) + (addPotName && tx.potName? '(' + tx.potName + ')': '')
}

/**
 * 設定により、TxのbtxIdまたはminor値を取得する。
 * @method
 * @param {Object} tx 
 * @return {String}
 */
export const getTxIdName = tx => {
  if(!tx){
    return null
  }
  return APP.TX.BTX_MINOR != 'minor'? tx.btxId? tx.btxId.toString(): '': tx.minor? tx.minor.toString(): ''
}

/**
 * 設定により、複数TxのbtxIdまたはminor値を取得する。
 * @method
 * @param {Object[]} txList 
 * @return {String[]}
 */
export const getTxIdNames = txList => {
  if(!Util.hasValue(txList)){
    return null
  }
  const names = []
  txList.forEach(tx => {
    names.push(getTxIdName(tx))
  })
  return names.map(name => name)
}

/**
 * 複数TxのIdを取得する。
 * @method
 * @param {Object[]} txList 
 * @return {Number[]}
 */
export const getTxIds = txList => {
  if(!Util.hasValue(txList)){
    return null
  }
  const ids = []
  txList.forEach(tx => {
    ids.push(tx.txId)
  })
  return ids.map(name => name)
}

/**
 * 複数Txの主要プロパティを取得する。
 * @method
 * @param {Object[]} txList 
 * @return {Object[]} txId、btxIs、minorを含む
 */
export const getTxParams = txList => {
  if(!Util.hasValue(txList)){
    return null
  }
  const txParams = []
  txList.forEach(tx => {
    txParams.push({
      txId: tx.txId,
      btxId: tx.btxId,
      minor: tx.minor
    })
  })
  return txParams
}

/**
 * 指定したカテゴリの種類を取得する。
 * @method
 * @param {Object} category 
 * @return {String}
 */
export const getCategoryTypeName = category => {
  const categoryTypeName = CATEGORY.getTypes(true).find(tval => tval.value === category.categoryType)
  return categoryTypeName != null? categoryTypeName.text: null
}

/**
 * 指定した形IDの名称を取得する。
 * @method
 * @param {Number} shape 
 * @return {String}
 */
export const getShapeName = shape => {
  const shapeName = SHAPE.getShapes().find(tval => tval.value === shape)
  return shapeName != null? shapeName.text: null
}

/**
 * 指定したキーを持つ通知状態名称を取得する。
 * @method
 * @param {String} templateKey 
 * @return {String}
 */
export const getTemplateKeyName = templateKey => {
  const templateKeyName = NOTIFY_STATE.getOptions().find(tval => tval.value === templateKey)
  return templateKeyName != null? templateKeyName.text: null
}

/**
 * 指定したカテゴリの名称を取得する。ただし、システムカテゴリに属する場合は既定の名称となる。
 * @method
 * @param {Object} category 
 * @return {String}
 */
export const getDispCategoryName = category => {
  return category.systemCategoryName? i18n.tnl('label.' + category.systemCategoryName): category.categoryName
}

/**
 * マスタデータの強制更新フラグを取得する。
 * @method
 * @param {String} name マスタ名称
 * @return {Boolean}
 */
export const getForceFetch = name => {
  const storeName = `forceFetch${name.charAt(0).toUpperCase()}${name.slice(1)}`
  return store.state.app_service[storeName]
}

/**
 * マスタデータの強制更新フラグを設定する。
 * @method
 * @param {String} name 
 * @param {Boolean} force 
 */
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
    sort: 'areaCd',
    beforeCommit: arr => arr.sort((a, b) => StringUtil.sortByString(a.areaCd, b.areaCd, LocaleHelper.getSystemLocale()))
  },
  exbs: {
    path: '/core/exb/withLocation',
    sort: ConfigHelper.includesDeviceType('deviceId')? 'deviceId': ConfigHelper.includesDeviceType('deviceIdX')? 'deviceIdX': 'locationName',
    beforeCommit: arr => {
      return arr.map(exb => {
        const location = exb.location
        const locationZoneList = Util.getValue(exb, 'location.locationZoneList', [])
        const sensors = SensorHelper.getSensors(exb.exbSensorList)
        return {
          ...exb,
          deviceIdX: exb.deviceId.toString(16).toUpperCase(),
          x: location? Math.round(location.x * 10)/10: null,
          y: location? Math.round(location.y * 10)/10: null,
          sensor: i18n.tnl('label.' + Util.getValue(exb, 'sensorName', 'normal')),
          isAbsentZone: exb.zoneCategoryName === SYSTEM_ZONE_CATEGORY_NAME.ABSENT,
          sensorIds: sensors.map(val => val.sensorId),
          sensorIdNames: sensors.map(val => val.sensorName),
          zoneIdList: locationZoneList.map(val => Util.getValue(val, 'locationZonePK.zoneId', null)).filter(val => val),
          zoneCategoryIdList: locationZoneList.map(val => Util.getValue(val, 'categoryId', null)).filter(val => val),
          zoneClass: Util.getValue(location, 'locationZoneList', []).filter(val => val.zoneType == ZONE.NON_COORDINATE).map(val => val.zoneName),
          zoneBlock: Util.getValue(location, 'locationZoneList', []).filter(val => val.zoneType == ZONE.COORDINATE).map(val => val.zoneName),
          exbTypeName: Util.getValue(EXB.getTypes().find(val => val.value == exb.exbType), 'text', ''),
        }
      })
    }
  },
  txs: {
    path: '/core/tx/withPot',
    sort: APP.TX.BTX_MINOR != 'minor'? 'btxId': 'minor',
    beforeCommit: arr => {
      return arr.map(tx => {
        return {
          ...tx,
          sensor: i18n.tnl('label.' + Util.getValue(tx, 'sensorName', 'normal')),
          // potName: Util.getValue(tx, 'potTxList.0.potName', ''),
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
    beforeCommit: arr => {
      return arr.map(template => {
        return {
          ...template,
          notifyTemplateKey: template.notifyTemplateKey? getTemplateKeyName(template.notifyTemplateKey): null,
          notifyMedium: template.notifyMedium == 0? i18n.tnl('label.email'): i18n.tnl('label.slack'),
        }
      })
    }
  },

  pots: {
    path: '/basic/pot',
    sort: 'potCd',
    beforeCommit: arr => {
      return arr.map(pot => {
        if (pot.extValue) { // extValue.rubyといった.を含む値をキーにするとb-tableでソートができないのでオブジェクト直下にextValuerubyなどのキーを追加する。
          var extValues = _.reduce(pot.extValue, (obj, val, key) => {
            obj['extValue' + key] = val
            return obj
          }, {})
        }
        return {
          ...pot,
          txIds: getTxIds(pot.txList),
          txIdNames: getTxIdNames(pot.txList),
          txParams: getTxParams(pot.txList),
          btxId: pot.btxId,
          minor: pot.minor,
          ruby: pot.extValue? pot.extValue.ruby: null,
          authCategoryNames: Util.getValue(pot, 'authCategoryList', []).map(v => v.categoryName),
          // 以下、nuxt2.8.1にアップグレードした場合、thisがundefinedとなり、エラーが発生するためコメントアウト
          // extValue: pot.extValue? pot.extValue: this.extValueDefault,
          extValue: pot.extValue? pot.extValue: '',
          ...extValues
        }
      }).sort((a, b) => StringUtil.sortByString(a.potCd, b.potCd, LocaleHelper.getSystemLocale()))
      // omit images to avoid being filtering target
    }
  },
  categories: {
    path: '/basic/category',
    sort: 'categoryCd',
    beforeCommit: arr => {
      return arr.map(val => {
        const zoneCategoryList = Util.getValue(val, 'zoneCategoryList', [])
        return Util.merge({
          ...val,
          categoryName: val.categoryName,
          shape: val.display? val.display.shape: null,
          color: val.display? val.display.color: null,
          bgColor: val.systemUse == 1? getSystemUseBgColor(val): getCategoryDisplayBgColor(val),
          shapeName: val.display? getShapeName(val.display.shape): null,
          categoryTypeName: getCategoryTypeName(val),
          systemCategoryName: val.systemUse != 0? val.categoryName.toLowerCase(): null,
          guardNames: zoneCategoryList.filter(zc => zc.zoneType == ZONE.GUARD).map(zoneCategory => Util.getValue(zoneCategory, 'zoneName', '')).sort((a, b) => a < b? -1: 1),
          doorNames: zoneCategoryList.filter(zc => zc.zoneType == ZONE.DOOR).map(zoneCategory => Util.getValue(zoneCategory, 'zoneName', '')).sort((a, b) => a < b? -1: 1),
        }, val.extValue)
      }).sort((a, b) => StringUtil.sortByString(a.categoryCd, b.categoryCd, LocaleHelper.getSystemLocale()))
    }
  },
  groups: {
    path: '/basic/group',
    sort: 'groupCd',
    beforeCommit: arr => {
      return arr.map(val => (
        Util.merge({
          ...val,
          shape: val.display? val.display.shape: null,
          color: val.display? val.display.color: null,
          bgColor: val.systemUse == 1? getSystemUseBgColor(val): getCategoryDisplayBgColor(val),
          shapeName: val.display? getShapeName(val.display.shape): null,
        }, val.extValue)
      )).sort((a, b) => StringUtil.sortByString(a.groupCd, b.groupCd, LocaleHelper.getSystemLocale()))
    }
  },
  users: {
    path: '/meta/user',
    sort: ArrayUtil.includesIgnoreCase(APP.USER.WITH, 'name')? 'name': 'loginId',
    beforeCommit: arr => {
      return arr.map(val => ({
        ...val,
        roleName: val.role.roleName,
        regionNames: Util.getValue(val, 'userRegionList', []).map(userRegion => Util.getValue(userRegion, 'regionName', '')).sort((a, b) => a < b? -1: 1),
      }))
    }
  },
  newsList: {
    path: '/news',
    sort: 'newsDate',
    beforeCommit: arr => {
      return arr.map(val => ({
        ...val,
        newsDt: DateUtil.formatDate(val.newsDate),
        dispState: i18n.tnl(`label.${val.dispFlg == 0? 'hide': 'display'}`),
        newsContent: StringUtil.cutOnLong(val.content, 16),
      }))
    }
  },
  topNewsList: {
    path: '/news/disp',
    sort: 'newsDate',
    beforeCommit: arr => {
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
    beforeCommit: arr => {
      return arr.filter(val => !FEATURE.HIDE_LIST.includes(val.featureName)).map(val => ({
        ...val,
        featureName: val.featureType == 0? StringUtil.toLowerCaseTop(val.featureName): val.featureName,
      }))
    }
  },
  locations: {
    path: '/core/location',
    sort: 'locationId',
    beforeCommit: arr => {
      return arr.map(location => {
        const locationZoneList = Util.getValue(location, 'locationZoneList', [])
        const zoneTypeMap = {}
        locationZoneList.forEach(locationZone => {
          const zoneType = ZONE.getOptions().find(option => option.value == locationZone.zoneType)? ZONE.NON_COORDINATE: ZONE.COORDINATE
          const key = '' + zoneType
          if(!zoneTypeMap[key]){
            zoneTypeMap[key] = []
          }
          if (!zoneTypeMap[key].includes(locationZone.zoneName)) {
            zoneTypeMap[key].push(locationZone.zoneName)
          }
        })
        ExtValueHelper.copyToParent(location)
        const locationTypeOptions = OptionHelper.getLocationTypeOptions()
        return {
          ...location,
          locationTypeName: Util.getValue(locationTypeOptions.find(val => val.value == location.locationType), 'text', ''),
          zoneClass: zoneTypeMap['' + ZONE.NON_COORDINATE],
          zoneBlock: zoneTypeMap['' + ZONE.COORDINATE],
          isAbsentZone: location.categoryName === SYSTEM_ZONE_CATEGORY_NAME.ABSENT,
          zoneIdList: locationZoneList.map(val => Util.getValue(val, 'locationZonePK.zoneId', null)).filter(val => val),
          zoneCategoryIdList: locationZoneList.map(val => Util.getValue(val, 'categoryId', null)).filter(val => val),
        }
      })
    }
  },
  zones: {
    path: '/core/zone',
    sort: 'zoneName',
    beforeCommit: arr => {
      return  arr.map(val => {
        const zoneCategory = Util.getValue(val, 'zoneCategoryList', []).find(zoneCategory => Util.getValue(zoneCategory, 'category.categoryType', null) == CATEGORY.ZONE)
        const category = zoneCategory? zoneCategory.category: null
        const zoneType = ZONE.getOptions().find(option => option.value == val.zoneType)
        return Util.merge({
          ...val,
          zoneTypeName: zoneType? zoneType.text: '',
          areaId: Util.hasValue(val.area)? val.area.areaId: null,
          areaName: Util.hasValue(val.area)? val.area.areaName: null,
          locationId: Util.hasValue(val.locationZoneList)? val.locationZoneList[0].locationZonePK.locationId: null,
          locationName: Util.hasValue(val.locationZoneList)? val.locationZoneList[0].location.locationName: null,
          categoryId: Util.hasValue(val.zoneCategoryList)? val.zoneCategoryList[0].zoneCategoryPK.categoryId: null,
          categoryName: Util.getValue(val, 'zoneCategoryList.0.category.categoryName', null),
          zoneCategoryIdList: Util.getValue(val, 'zoneCategoryList', []).map(val => Util.getValue(val, 'zoneCategoryPK.categoryId', null)).filter(val => val),
          systemCategoryName: category? category.systemUse != 0? category.categoryName.toLowerCase(): null: null,
        }, val.extValue)
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
    beforeCommit: arr => {
      return  arr.map(val => ({
        ...val,
        createDt: DateUtil.formatDate(val.createDt),
      }))
    }
  },
  absentDisplayZones: {
    path: '/core/zone/absentDisplayZones'
  },
  lostZones: {
    path: '/core/zone/lostZones',
    beforeCommit: arr => {
      let result = arr.map(val => (val? {
        ...val,
      }: null))
      return result
    }
  },
  prohibits: {
    path: '/core/zone/prohibit',
    beforeCommit: arr => {
      let result = arr.map(val => (val? { // TODO: valがundefinedになる
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

/**
 * マスタデータをサーバから取得する。
 * @method
 * @async
 * @param {String} target マスタ種類
 * @param {Boolean} force 強制取得する
 * @param {Object} option 追加設定
 */
export const load = async (target, force, option) => {
  const forceFetchTarget = target
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
  if (!arr || arr.length == 0 || force || getForceFetch(forceFetchTarget) || DateUtil.isExpired(store.state.app_service[expiredKey])) {
    arr = await AppServiceHelper.fetchList(path, sort, option)
    if (beforeCommit) {
      arr = beforeCommit(arr)
    }
    store.commit('app_service/replaceAS', {[target]:arr})
    const expiredTime = (new Date()).getTime() + APP.SYS.STATE_EXPIRE_TIME
    store.commit('app_service/replaceAS', {[expiredKey]: expiredTime})
    setForceFetch(forceFetchTarget, false)
  }
}

/**
 * エリア画像をサーバから取得する。
 * @method
 * @async
 * @param {Number} areaId 
 * @param {Boolean} force 強制取得する
 */
export const loadAreaImage = async (areaId, force) => {
  if (areaId == null) {
    console.log('empty areas', areaId)
    return
  }
  if (store.state.app_service.areaImages.find(areaImage => areaImage.areaId == areaId) && !force) {
    console.log('FOUND areas', areaId)
    return
  }
  console.log('load areas', areaId)
  let base64 = await AppServiceHelper.fetchMapImage('/core/area/' + areaId + '/mapImage')
  const areaImages = [{areaId, mapImage: base64}]
  store.commit('app_service/replaceAS', {areaImages})
}

/**
 * すべてのエリア画像をサーバから取得する。
 * @method
 * @async
 */
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
 * @method
 * @param {*} key stateのkey。obj[key + 'Id']の形でid項目を取得するのにも使う
 * @param {*} textField 省略可。偽の場合、obj[key + 'Name']をtext:の値に使用する。文字列の場合、obj[textField]の形でtext項目を取得する。<br />
 * 関数の場合、第一引数にobjを渡して、戻り値をtext項目に使用する。
 * @param {*} notNull 省略可。偽の場合、戻り値に{value: null, text: ''}を追加する。同様の形式のオブジェクトの場合、それを追加する。<br />
 * その他の場合、何もしない。下のフィルタ適用の後に行う。
 * @param {*} filterCallback 省略可。オプションに適用するフィルタ。_.filter(ary, filterCallback)の処理を行う。
 * aryはstateの内容。オプションではない。
 * @return {Object[]}
 * 
 * @example
 * グループのオプション
 * StateHelper.getOptionsFromState('group')
 * 
 * txのセンサー名一覧のオプション
 * StateHelper.getOptionsFromState('sensor', 
 *    val => {this.$i18n.t('label.' + val.sensorName})}, // 表示は言語ファイルから取る。
 *    {value: null, text: this.$i18n.t('label.normal')}, // センサーのnullは「通常」
 *    val => APP.SENSOR.TX_SENSOR.includes(val.senserId)) // Txのセンサーに絞り込む
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

/**
 * 一括登録時のエラーチェック
 * @method
 * @param {Object} entity 
 * @param {String} headerName 
 * @param {Any} val 
 * @param {Boolean} isNumberColumn 
 * @return {Boolean}
 */
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

/**
 * 指定したシステムカテゴリの背景色を取得する。
 * @method
 * @param {Object} category 
 * @return {String}
 */
export const getSystemUseBgColor = (category) => {
  switch(category.categoryName) {
  case SYSTEM_ZONE_CATEGORY_NAME.ABSENT:
    return DISP.SYSTEM_USE.BG_COLOR.ABSENT || getCategoryDisplayBgColor(category)
  case SYSTEM_ZONE_CATEGORY_NAME.PROHIBIT:
    return DISP.SYSTEM_USE.BG_COLOR.PROHIBIT || getCategoryDisplayBgColor(category)
  default:
    return getCategoryDisplayBgColor(category)
  }
}

/**
 * 指定したカテゴリの背景色を取得する。
 * @method
 * @param {Object} category 
 * @return {String}
 */
export const getCategoryDisplayBgColor = (category) => {
  return Util.hasValue(category.display)? category.display.bgColor: null
}

/**
 * メッセージ表示フラグをすべて初期化する。
 * @method
 */
export const initShowMessage = () => {
  store.commit('replace', {showInfo: false, showWarn: false, showAlert: false})
}

/**
 * エリアのマップイメージを返す。
 * @method
 * @param {Number} areaId 
 * @return {String}
 */
export const getMapImage = areaId => {
  const areaImage = _.find(store.state.app_service.areaImages, (areaImage) => {
    return areaImage.areaId == areaId
  })
  return areaImage && areaImage.mapImage

}