import { APP } from '../constant/config'
import { SENSOR } from '../constant/Constants'
import * as Util from '../util/Util'
import * as SensorHelper from './SensorHelper'
import * as StateHelper from './StateHelper'

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
  return StateHelper.getOptionsFromState('sensor',
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
  return StateHelper.getOptionsFromState('sensor',
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
export const getAllSensorOptions = (ignoreIds = [SENSOR.LED, SENSOR.BUTTON]) => {
  return StateHelper.getOptionsFromState('sensor', 
    sensor => i18n.tnl('label.' + sensor.sensorName),
    true,
    sensor => SensorHelper.availableSensorAll().includes(sensor.sensorId) && !ignoreIds.includes(sensor.sensorId)
  )
}

/**
 * グループの選択肢を取得する。
 * @method
 * @return {Object[]}
 */
export const getGroupOptions = () => {
  return StateHelper.getOptionsFromState('group', false, true)
}

/**
 * カテゴリの選択肢を取得する。
 * @method
 * @param {Number[]} includeTypes 
 * @return {Object[]}
 */
export const getCategoryOptions = (includeTypes = []) => {
  return StateHelper.getOptionsFromState('category',
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
  return StateHelper.getOptionsFromState('category',
    category => StateHelper.getDispCategoryName(category),
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

export const getSensorOptions = (entity, isBlank) => {
  let ids
  if (entity == 'exb') {
    ids = APP.EXB.SENSOR
  } else if (entity == 'tx') {
    ids = APP.SENSOR.TX_SENSOR
  }

  return StateHelper.getOptionsFromState('sensor',
    sensor => i18n.tnl('label.' + sensor.sensorName),
    {value: null, text: isBlank? i18n.tnl('label.null'): i18n.tnl('label.normal')},
    sensor => ids.includes(sensor.sensorId)
  )
}
