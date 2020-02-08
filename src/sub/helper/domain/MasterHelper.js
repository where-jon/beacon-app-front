import Papa from 'papaparse'
import * as HttpHelper from '../base/HttpHelper'
import * as StringUtil from '../../util/StringUtil'
import * as ArrayUtil from '../../util/ArrayUtil'
import _ from 'lodash'
import { APP, DISP } from '../../constant/config'
import { EXB, CATEGORY, ZONE, SHAPE, FEATURE, NOTIFY_STATE, SYSTEM_ZONE_CATEGORY_NAME} from '../../constant/Constants'
import * as Util from '../../util/Util'
import * as ConfigHelper from './../dataproc/ConfigHelper'
import * as StateHelper from './../dataproc/StateHelper'
import * as ExtValueHelper from '../domain/ExtValueHelper'
import * as LocaleHelper from '../base/LocaleHelper'
import * as OptionHelper from './../dataproc/OptionHelper'
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
 * マスタエンティティをロードする
 */
export const loadMaster = async () => {
  console.log('fetch', new Date())
  const masterAll = await HttpHelper.getAppService('/core/region/masterall')
  console.log('parse', new Date())
  const res = Papa.parse(masterAll)
  if (res.errors.length > 0) {
    res.errors.forEach(e => {
      console.error(e)
    })
    return
  }

  console.log('build', new Date())
  const {masters, idmaps} = buildMasters(res.data)
  // Util.debug({masters})
  console.log('relation', new Date())
  buildRelation(masters, idmaps)
  console.log('add', new Date())
  addInfo(masters)
  console.log('commit', new Date())
  Util.debug({masters})
  storeCommit(masters, idmaps)
  console.log('end', new Date())
}

/**
 * 取得したデータから各マスタエンティティのリストを構築する。
 * 
 * @param {*} data 
 */
const buildMasters = (data) => {
  let masters = {}
  let idmaps = {}
  let currentMaster
  let currentColumn
  let isData
  data.forEach(row => {
    if (row.length == 0) return

    isData = false
    switch(row[0]) {
    case 'region_id':
      currentMaster = 'region'
      break
    case 'user_id':
      currentMaster = 'user'
      break
    case 'area_id':
      currentMaster = 'area'
      break
    case 'category_id':
      currentMaster = 'category'
      break
    case 'group_id':
      currentMaster = 'group'
      break
    case 'pot_id':
      if (row[1] == 'user_id') {
        currentMaster = 'potUser'
      }
      else if (row[1] == 'group_id') {
        currentMaster = 'potGroup'
      }
      else if (row[1] == 'category_id') {
        currentMaster = 'potCategory'
      }
      else if (row[1] == 'tx_id') {
        currentMaster = 'potTx'
      }
      else {
        currentMaster = 'pot'
      }
      break
    case 'location_id':
      if (row[1] == 'zone_id') {
        currentMaster = 'locationZone'
      }
      else {
        currentMaster = 'location'        
      }
      break
    case 'exb_id':
      if (row[1] == 'sensor_id') {
        currentMaster = 'exbSensor'
      }
      else {
        currentMaster = 'exb'        
      }
      break
    case 'tx_id':
      if (row[1] == 'sensor_id') {
        currentMaster = 'txSensor'
      }
      else {
        currentMaster = 'tx'
      }
      break
    case 'sensor_id':
      currentMaster = 'sensor'
      break
    case 'role_id':
      currentMaster = 'role'
      break
    case 'zone_id':
      if (row[1] == 'category_id') {
        currentMaster = 'zoneCategory'
      }
      else {
        currentMaster = 'zone'
      }
      break
    default:
      isData = true
    }

    if (!isData) {
      currentColumn = row.map(col => StringUtil.snake2camel(col))
      masters[currentMaster] = []
      idmaps[currentMaster] = []
    }
    else {
      const obj = convert(row, currentColumn)
      masters[currentMaster].push(obj)
      if (isRelationEntity(currentMaster)) { // 関連テーブルは配列のマップ
        if (!idmaps[currentMaster][row[0]]) {
          idmaps[currentMaster][row[0]] = []
        }
        idmaps[currentMaster][row[0]].push(row[1])

        if (!idmaps[currentMaster + '_Rev']) {
          idmaps[currentMaster + '_Rev'] = {}
        }
        if (!idmaps[currentMaster + '_Rev'][row[1]]) {
          idmaps[currentMaster + '_Rev'][row[1]] = []
        }
        idmaps[currentMaster + '_Rev'][row[1]].push(row[0])

        if (currentMaster == 'locationZone') {
          if (!idmaps[currentMaster + '_Val']) {
            idmaps[currentMaster + '_Val'] = {}
          }
          if (!idmaps[currentMaster + '_Val'][row[0]]) {
            idmaps[currentMaster + '_Val'][row[0]] = []
          }
          idmaps[currentMaster + '_Val'][row[0]].push(obj)
        }
      }
      else {
        idmaps[currentMaster][row[0]] = obj
      }
    }
  })
  
  return {masters, idmaps}
}

const isRelationEntity = (e) => /[A-Z]/.test(e)

/**
 * 値を型変換し、マスタエンティティのプロパティ名でセットする。
 * 
 * @param {*} row 
 * @param {*} colNames 
 */
const convert = (row, colNames) => {
  const ret = {}
  row.forEach((val, idx) => {
    const col = colNames[idx]
    if (col == 'loginId') {
      ret[col] = val
    }
    else if (col.endsWith('Id')) {
      ret[col] = Number(val)
    }
    else if (col == 'extValue' || col == 'txViewType' || col == 'display') {
      ret[col] = val? JSON.parse(val.split('|').join('"')): {}
    }
    // else if (col.endsWith('Dt')) {
    //   ret[col] = new Date(val)      
    // }
    else if (col.endsWith('Type') || col.endsWith('Ratio') || col.endsWith('Width') || col.endsWith('Height')
      || col.startsWith('threshold') || col.startsWith('adjust')
      || ArrayUtil.equalsAny(col, ['major','minor','x','y','z','w','h','disp','systemUse'])) {
      ret[col] = Number(val)      
    }
    else {
      ret[col] = val
    }
  })
  return ret
}

/**
 * マスタエンティティ間の関連を設定する。
 * 
 * @param {*} masters 
 */
const buildRelation = (masters, idmaps) => {
  Object.keys(masters).forEach(key => {
    // Util.debug(key)
    const list = masters[key]
    switch(key) {
    case 'pot':
      list.forEach(e => {
        e.txList = relate(e, 'potId', idmaps.potTx, 'txId', idmaps.tx)
        e.group = relate(e, 'potId', idmaps.potGroup, 'groupId', idmaps.group)[0]
        e.category = relate(e, 'potId', idmaps.potCategory, 'categoryId', idmaps.category)[0]
        e.user = relate(e, 'potId', idmaps.potUser, 'userId', idmaps.user)[0]
        // Util.debug(e)
      })
      break
    case 'tx':
      list.forEach(e => {
        e.sensorList = relate(e, 'txId', idmaps.txSensor, 'sensorId', idmaps.sensor)
        e.pot = relate(e, 'txId', idmaps.potTx, 'potId', idmaps.pot)[0]
        e.location = relate(e, 'locationId', idmaps.location)
        // Util.debug(e)
      })  
      break
    case 'exb':
      list.forEach(e => {
        e.sensorList = relate(e, 'exbId', idmaps.exbSensor, 'sensorId', idmaps.sensor)
        e.location = relate(e, 'locationId', idmaps.location)
        //Util.debug(e)
      })  
      break
    case 'location':
      list.forEach(e => {
        e.zoneList = relate(e, 'locationId', idmaps.locationZone, 'zoneId', idmaps.zone)
        e.locationZoneList = relate(e, 'locationId', idmaps['locationZone_Val'])
        e.area = relate(e, 'areaId', idmaps.area)
        //Util.debug(e)
      })  
      break
    case 'zone':
      list.forEach(e => {
        e.area = relate(e, 'areaId', idmaps.area)
        e.categoryList = relate(e, 'zoneId', idmaps.zoneCategory, 'categoryId', idmaps.category)
        //Util.debug(e)
      })  
      break
    case 'category':
      list.forEach(e => {
        e.zoneList = relate(e, 'categoryId', idmaps.zoneCategory, 'zoneId', idmaps.zone)
        //Util.debug(e)
      })  
      break
    case 'group':
      list.forEach(e => {
        //Util.debug(e)
      })  
      break
    case 'region':
      list.forEach(e => {
        //Util.debug(e)
      })  
      break
    case 'user':
      list.forEach(e => {
        e.pot = relate(e, 'userId', idmaps.potUser, 'potId', idmaps.pot)[0]
        e.role = relate(e, 'roleId', idmaps.role)
        //Util.debug(e)
      })  
      break
    }
  })
}

/**
 * 関連を構築する汎用メソッド
 * 
 * @param {*} e 自身のオブジェクト
 * @param {*} relateId 最初に関連するエンティティ（関連テーブル、もしくは直接関連するエンティティ）との結合キー
 * @param {*} relationList 最初に関連するエンティティのリスト
 * @param {*} targetId 更に関連するエンティティ（関連テーブル経由で結合するエンティティ）の結合キー
 * @param {*} targetList 更に関連するエンティティのリスト
 */
const relate = (e, relateId, relationMap, targetId, targetMap) => {
  if (!relationMap) return null
  const relations = relationMap[e[relateId]]

  if (!targetId) { // 関連テーブルを挟まない場合はここで返す
    if (!relations) return null
    return relations
  }

  if (!relations) return []

  const target = relations.map(rId => targetMap[rId]).filter(e => e)
  // targetList.filter(t => relations.find(r => r[targetId] == t[targetId]))
  return target? target: []
}

/**
 * エンティティに付加情報を追加し、ソートを実行
 * TODO: これは極力排除。使う箇所でエンティティをたどるようにする。未使用の項目を削除する。
 * 
 * @param {*} masters 
 */
const addInfo = (masters) => {
  Object.keys(masters).forEach(key => {
    const list = masters[key]
    switch(key) {
    case 'area':
      list.sort((a, b) => StringUtil.sortByString(a.areaCd, b.areaCd, LocaleHelper.getSystemLocale()))
      break
    case 'sensor':
      ArrayUtil.sortIgnoreCase(list, 'sensorId')  
      break
    case 'region':
      ArrayUtil.sortIgnoreCase(list, 'regionName')  
      break
    case 'pot':
      list.forEach(pot => {
        if (pot.extValue) { // extValue.rubyといった.を含む値をキーにするとb-tableでソートができないのでオブジェクト直下にextValuerubyなどのキーを追加する。
          var extValues = _.reduce(pot.extValue, (obj, val, key) => {
            obj['extValue' + key] = val
            return obj
          }, {})
        }
        Util.merge(pot, {
          txIds: getTxIds(pot.txList),
          txIdNames: getTxIdNames(pot.txList),
          txParams: getTxParams(pot.txList),
          btxId: pot.btxId,
          minor: pot.minor,
          ruby: pot.extValue? pot.extValue.ruby: null,
          authCategoryNames: Util.v(pot, 'authCategoryList', []).map(v => v.categoryName),
        })
        Util.merge(pot, extValues)
      })
      list.sort((a, b) => StringUtil.sortByString(a.potCd, b.potCd, LocaleHelper.getSystemLocale()))
      break
    case 'tx':
      list.forEach(tx => {
        Util.merge(tx, {
          sensorId: Util.v(tx, 'sensorList.0.sensorId'),
          sensor: i18n.tnl('label.' + Util.v(tx, 'sensorList.0.sensorName', 'normal')),
          // potName: Util.getValue(tx, 'potTxList.0.potName', ''),
          dispPos: tx.disp & 1,
          dispPir: tx.disp & 2,
          dispAlways: tx.disp & 4,
        })
      })
      ArrayUtil.sortIgnoreCase(list, APP.TX.BTX_MINOR != 'minor'? 'btxId': 'minor')  
      break
    case 'exb':
      list.forEach(exb => {
        const location = exb.location
        const locationZoneList = Util.v(exb, 'location.zoneList', [])
        const categoryList = locationZoneList.map(val => Util.v(val, 'categoryList', []))
        const zoneCategoryIdList = categoryList.map(c => c.categoryId).flatMap(e => e).filter(e => e)
        const sensors = SensorHelper.getSensors(exb.sensorList)
        Util.merge(exb, {
          deviceIdX: exb.deviceId.toString(16).toUpperCase(),
          x: location? Math.round(location.x * 10)/10: null,
          y: location? Math.round(location.y * 10)/10: null,
          areaId: location? location.areaId: null,
          locationName: location? location.locationName: null,
          sensor: i18n.tnl('label.' + Util.v(exb, 'sensorName', 'normal')),
          isAbsentZone: locationZoneList.some(e => e.categoryName == SYSTEM_ZONE_CATEGORY_NAME.ABSENT),
          isFixedPosZone: locationZoneList.some(e => e.categoryName == SYSTEM_ZONE_CATEGORY_NAME.FIXED_POS),
          sensorIds: sensors.map(val => val.sensorId),
          sensorIdNames: sensors.map(val => val.sensorName),
          zoneIdList: locationZoneList.map(val => Util.v(val, 'zoneId')).filter(val => val),
          zoneCategoryIdList,
          zoneClass: Util.v(location, 'zoneList', []).filter(val => val.zoneType == ZONE.NON_COORDINATE).map(val => val.zoneName),
          zoneBlock: Util.v(location, 'zoneList', []).filter(val => val.zoneType == ZONE.COORDINATE).map(val => val.zoneName),
          exbTypeName: Util.v(EXB.getTypes().find(val => val.value == exb.exbType), 'text', ''),
        })
      })
      ArrayUtil.sortIgnoreCase(list, getExbSortBy())  
      break
    case 'location':
      list.forEach(location => {
        const zoneList = Util.v(location, 'zoneList', [])
        const zoneTypeMap = {}
        zoneList.forEach(zone => {
          const zoneType = ZONE.getOptions().find(option => option.value == zone.zoneType)? ZONE.NON_COORDINATE: ZONE.COORDINATE
          const key = '' + zoneType
          if(!zoneTypeMap[key]){
            zoneTypeMap[key] = []
          }
          if (!zoneTypeMap[key].includes(zone.zoneName)) {
            zoneTypeMap[key].push(zone.zoneName)
          }
        })
        const categoryList = zoneList.map(val => Util.v(val, 'categoryList', []))
        if (categoryList) {
          var zoneCategoryIdList = categoryList.map(c => c.categoryId).flatMap(e => e).filter(e => e)
        }
        ExtValueHelper.copyToParent(location)
        const locationTypeOptions = OptionHelper.getLocationTypeOptions()
        Util.merge(location, {
          locationTypeName: Util.v(locationTypeOptions.find(val => val.value == location.locationType), 'text', ''),
          zoneClass: zoneTypeMap['' + ZONE.NON_COORDINATE],
          zoneBlock: zoneTypeMap['' + ZONE.COORDINATE],
          isAbsentZone: location.categoryName === SYSTEM_ZONE_CATEGORY_NAME.ABSENT,
          isFixedPosZone: location.categoryName === SYSTEM_ZONE_CATEGORY_NAME.FIXED_POS,
          zoneIdList: zoneList.map(zone => zone.zoneId),
          zoneCategoryIdList,
        })
      })
      break
    case 'zone':
      list.forEach(zone => {
        const category = Util.v(zone, 'categoryList.0', {})
        const zoneType = ZONE.getOptions().find(option => option.value == zone.zoneType)
        Util.merge(zone, {
          zoneTypeName: zoneType? zoneType.text: '',
          areaId: Util.v(zone, 'area.areaId'),
          areaName: Util.v(zone, 'area.areaName'),
          categoryId: category.categoryId,
          categoryName: category.categoryName,
          zoneCategoryIdList: zone.categoryList.map(val => Util.v(val, 'categoryId')).filter(val => val),
        })
        Util.merge(zone, zone.extValue)
      })
      ArrayUtil.sortIgnoreCase(list, 'regionName')  
      break
    case 'category':
      list.forEach(category => {
        Util.merge(category, {
          categoryName: category.categoryName,
          shape: Util.v(category, 'display.shape'),
          color: Util.v(category, 'display.color'),
          bgColor: category.systemUse == 1? getSystemUseBgColor(category): getCategoryDisplayBgColor(category),
          shapeName: category.display? getShapeName(category.display.shape): null,
          categoryTypeName: getCategoryTypeName(category),
          systemCategoryName: category.systemUse != 0? category.categoryName.toLowerCase(): null,
          // guardNames: category.zoneList.filter(zc => zc.zoneType == ZONE.GUARD).map(zoneCategory => Util.v(zoneCategory, 'zoneName', '')).sort((a, b) => a < b? -1: 1),
          // doorNames: category.zoneList.filter(zc => zc.zoneType == ZONE.DOOR).map(zoneCategory => Util.v(zoneCategory, 'zoneName', '')).sort((a, b) => a < b? -1: 1),
        })
        Util.merge(category, category.extValue)
      })
      list.sort((a, b) => StringUtil.sortByString(a.categoryCd, b.categoryCd, LocaleHelper.getSystemLocale()))
      break
    case 'group':
      list.forEach(group => {
        Util.merge(group, {
          shape: Util.v(group, 'display.shape'),
          color: Util.v(group, 'display.color'),
          bgColor: group.systemUse == 1? getSystemUseBgColor(group): getCategoryDisplayBgColor(group),
          shapeName: group.display? getShapeName(group.display.shape): null
        })
        Util.merge(group, group.extValue)
      })
      list.sort((a, b) => StringUtil.sortByString(a.groupCd, b.groupCd, LocaleHelper.getSystemLocale()))
      break
    case 'user':
      list.forEach(user => {
        user.roleName = user.role.roleName
        user.regionNames = Util.v(user, 'userRegionList', []).map(e => Util.v(e, 'regionName', '')).sort((a, b) => a < b? -1: 1)
      })
      ArrayUtil.sortIgnoreCase(list, ArrayUtil.includesIgnoreCase(APP.USER.WITH, 'name')? 'name': 'loginId')  
      break
    }
  })
}

/**
 * Storeに保存
 */
const storeCommit = (masters, idmaps) => {
  Object.keys(masters).forEach(key => {
    if (!isRelationEntity(key)) { // 関連エンティティは保存しない
      StateHelper.storeCommit(StringUtil.single2multi(key), masters[key])
    }
  })

  Object.keys(idmaps).forEach(key => { // idMapはIdMapの名前を後に付加
    if (!isRelationEntity(key)) { // 関連エンティティは保存しない
      StateHelper.storeCommit(key + 'IdMap', idmaps[key])
    }
  })

}


const getExbSortBy = () => ConfigHelper.includesDeviceType('deviceId')? 'deviceId': ConfigHelper.includesDeviceType('deviceIdX')? 'deviceIdX': 'locationName'

/**
 * マスタデータをmapに変換する。 TODO: lodash.keyByを使う, Stateに標準的にID-VALのマップを作成する。
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
 * MasterHelper.getOptionsFromState('group')
 * 
 * txのセンサー名一覧のオプション
 * MasterHelper.getOptionsFromState('sensor', 
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
 * 重複のないデータを作成する。
 * @method
 * @param {Object[]} masterList
 * @param {Object} obj
 * @param {String} column
 * @param {String} type
 * @param {Number} sign
 * @return {Object}
 * TODO: 未使用？
 */
// export const createNoConflictValue = (masterList, obj, column, type, sign = 1) => {
//   if(!masterList.some(master => master[column] == obj[column])){
//     return obj[column]
//   }
//   for(let cnt = 1; cnt < 65536; cnt++) {
//     const value = type == 'number'? obj[column] + (cnt * sign): obj[column] + '-' + cnt
//     if(!masterList.some(master => master[column] == value)){
//       return value
//     }
//   }
//   return obj[column]
// }


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
const getTxIdNames = txList => {
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
const getTxIds = txList => {
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
const getTxParams = txList => {
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
const getCategoryTypeName = category => {
  const categoryTypeName = CATEGORY.getTypes(true).find(tval => tval.value === category.categoryType)
  return categoryTypeName != null? categoryTypeName.text: null
}

/**
 * 指定した形IDの名称を取得する。
 * @method
 * @param {Number} shape 
 * @return {String}
 */
const getShapeName = shape => {
  const shapeName = SHAPE.getShapes().find(tval => tval.value === shape)
  return shapeName != null? shapeName.text: null
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
 * 指定したシステムカテゴリの背景色を取得する。
 * @method
 * @param {Object} category 
 * @return {String}
 */
const getSystemUseBgColor = (category) => {
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
const getCategoryDisplayBgColor = (category) => {
  return Util.hasValue(category.display)? category.display.bgColor: null
}

