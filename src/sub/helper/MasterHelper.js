import { APP } from '../constant/config'
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
 * マスタ値の仮データを作成する。
 * @method
 * @param {String|Number} prefix 
 * @return {String} 後ろに「現在エポック秒 % 10000」の数値をスネークケースで付与
 */
export const createDefaultName = prefix => prefix + '_' + (new Date().getTime() % 10000)

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
