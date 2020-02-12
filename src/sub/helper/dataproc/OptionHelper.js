/**
 * 選択肢に関するヘルパーモジュール
 * @module helper/dataproc/OptionHelper
 */

import { APP } from '../../constant/config'
import { SENSOR, LOCATION } from '../../constant/Constants'
import * as Util from '../../util/Util'
import * as ConfigHelper from './ConfigHelper'
import * as SensorHelper from '../domain/SensorHelper'
import * as StateHelper from './StateHelper'
import * as MasterHelper from '../domain/MasterHelper'

let i18n

/**
 * vue.jsで使用するオブジェクトを設定する。
 * @method
 * @param {Object} pi18n
 */
export const setApp = pi18n => {
  i18n = pi18n
}

/**
 * EXBの選択肢を取得する。
 * @method
 * @param {Boolean} isBlank true:未選択状態の文言を空欄にする/false:「通常」表記にする
 * @return {Object[]}
 */
export const getExbOptions = (isBlank = false) => {
  return MasterHelper.getOptionsFromState('sensor',
    sensor => i18n.tnl('label.' + sensor.sensorName),
    {value: null, text: isBlank? i18n.tnl('label.null'): i18n.tnl('label.normal')},
    sensor => APP.EXB.SENSOR.includes(sensor.sensorId)
  )
}

/**
 * Txの選択肢を取得する。
 * @method
 * @param {Boolean} isBlank true:未選択状態の文言を空欄にする/false:「通常」表記にする
 * @return {Object[]}
 */
export const getTxOptions = (isBlank = false) => {
  return MasterHelper.getOptionsFromState('sensor',
    sensor => i18n.tnl('label.' + sensor.sensorName),
    {value: null, text: isBlank? i18n.tnl('label.null'): i18n.tnl('label.normal')},
    sensor => APP.SENSOR.TX_SENSOR.includes(sensor.sensorId)
  )
}

/**
 * センサの選択肢を取得する。
 * @method
 * @param {Number[]} ignoreIds
 * @return {Object[]}
 */
export const getAllSensorOptions = (ignoreIds = [SENSOR.LED_TYPE2, SENSOR.LED_TYPE5, SENSOR.BUTTON]) => {
  return MasterHelper.getOptionsFromState('sensor', 
    sensor => i18n.tnl('label.' + sensor.sensorName),
    true,
    sensor => SensorHelper.availableSensorAll().includes(sensor.sensorId) && !ignoreIds.includes(sensor.sensorId)
  )
}

/**
 * センサの選択肢を取得する。
 * @method
 * @param {Number[]} ignoreIds
 * @return {Object[]}
 */
export const getGraphSensorOptions = (ignoreIds = [SENSOR.LED, SENSOR.BUTTON]) => {
  return MasterHelper.getOptionsFromState('sensor', 
    sensor => i18n.tnl('label.' + sensor.sensorName),
    true,
    sensor => SensorHelper.availableSensorGraph().includes(sensor.sensorId) && !ignoreIds.includes(sensor.sensorId)
  )
}

/**
 * グループの選択肢を取得する。
 * @method
 * @return {Object[]}
 */
export const getGroupOptions = () => {
  return MasterHelper.getOptionsFromState('group', false, true)
}

/**
 * カテゴリの選択肢を取得する。
 * @method
 * @param {Number[]} includeTypes 
 * @return {Object[]}
 */
export const getCategoryOptions = (includeTypes = []) => {
  return MasterHelper.getOptionsFromState('category',
    false,
    true,
    category => !Util.hasValue(includeTypes) || includeTypes.includes(category.categoryType)
  )
}

/**
 * ゾーンカテゴリの選択肢を取得する。
 * @method
 * @param {Object[]} zoneCategoryList 
 * @return {Object[]}
 */
export const getZoneCategoryOptions = zoneCategoryList => {
  const zoneCategoryIds = zoneCategoryList.filter(zoneCategory => zoneCategory.categoryId >= 0).map(zoneCategory => zoneCategory.categoryId)
  return MasterHelper.getOptionsFromState('category',
    category => MasterHelper.getDispCategoryName(category),
    true,
    category => zoneCategoryIds.includes(`${category.categoryId}`)
  )
}

/**
 * ゾーンの選択肢を取得する。
 * @method
 * @param {Object[]} zoneCategories 
 * @param {Object} selectCategory 
 * @return {Object[]}
 */
export const getZoneOptions = (zoneCategories, selectCategory) => {
  const zoneUniqs = {}
  zoneCategories.forEach(zoneCategory => {
    if (selectCategory == null || zoneCategory.categoryId == selectCategory.value) {
      zoneUniqs[zoneCategory.zoneId] = zoneCategory.zoneName
    }
  })
  const zoneOptionList = []
  for (let zId in zoneUniqs) {
    zoneOptionList.push({ label: zoneUniqs[zId], value: zId })
  }
  return zoneOptionList
}

/**
 * センサ選択肢を取得する。
 * @method
 * @param {Object} entity 
 * @param {Boolean} isBlank falseの場合、未選択を「通常」選択肢として扱う。
 * @return {Object[]}
 */
export const getSensorOptions = (entity, isBlank) => {
  let ids
  if (entity == 'exb') {
    ids = APP.EXB.SENSOR
  } else if (entity == 'tx') {
    ids = APP.SENSOR.TX_SENSOR
  }

  return MasterHelper.getOptionsFromState('sensor',
    sensor => i18n.tnl('label.' + sensor.sensorName),
    {value: null, text: isBlank? i18n.tnl('label.null'): i18n.tnl('label.normal')},
    sensor => ids.includes(sensor.sensorId)
  )
}

/**
 * 場所種類選択の選択肢を取得する。
 * @method
 * @return {Object[]}
 */
export const getLocationDispOptions = () => {
  return [
    { text: i18n.tnl('label.locationName'), value: 'locationName' },
    { text: i18n.tnl('label.locationCdComp'), value: 'locationCd' },
    ConfigHelper.includesDeviceType('deviceId')? { text: i18n.tnl('label.EXBeacon'), value: 'deviceId' }: null,
    ConfigHelper.includesDeviceType('deviceIdX')? { text: i18n.tnl('label.EXBeaconX'), value: 'deviceIdX' }: null,
    { text: i18n.tnl('label.tx'), value: 'txName' },
  ].filter(val => val)
}

/**
 * 場所選択（場所）の選択肢を取得する。
 * @method
 * @param {Object[]} workLocationList 
 * @param {String} column 
 * @return {Object[]}
 */
export const getLocationOptions = (workLocationList, column) => {
  return MasterHelper.getOptionsFromState('location',
    column,
    {value: '', text: i18n.tnl('label.emptyLocation'), label: i18n.tnl('label.emptyLocation')},
    location => {
      const target = workLocationList.find(val => val.locationId == location.locationId)
      return target? !Util.hasValue(target.areaId) || !Util.hasValue(target.x) || !Util.hasValue(target.y): false
    }
  )
}

/**
 * 場所選択（デバイス）の選択肢を取得する。
 * @method
 * @param {Object[]} workDeviceList 
 * @param {String} deviceType 
 * @param {String} column 
 * @return {Object[]}
 */
export const getLocationDeviceOptions = (workDeviceList, deviceType, column) => {
  return MasterHelper.getOptionsFromState(deviceType,
    column,
    true,
    device => {
      const pKey = deviceType + 'Id'
      const target = workDeviceList.find(val => val[pKey] == device[pKey])
      return target? !Util.hasValue(target.locationId): false
    }
  )
}

/**
 * 場所タイプの選択肢を取得する。
 * @method
 * @return {Object[]}
 */
export const getLocationTypeOptions = () => {
  const ret = [{ value: 0, text: '', param: ''}]
  const addOptions = APP.LOCATION.TYPE.WITH.map(val => {
    const values = val.trim().split(':')
    const value = Util.getValue(values, '0', 0)
    return { value: isNaN(value)? 0: value, text: i18n.tnl('label.' + Util.getValue(values, '1', '')) }
  })
  return ret.concat(addOptions)
}
