/**
 * 文言に関するヘルパーモジュール
 * @module helper/domain/MessageHelper
 */

import { APP } from '../../constant/config'
import * as Util from '../../util/Util'
import * as SensorHelper from './SensorHelper'
import * as StateHelper from '../dataproc/StateHelper'

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
 * 警告対象のデバイスを警告分類ごとに振り分ける。
 * @method
 * @param {Object[]} txIcons
 * @param {Object[]} exbIcons
 * @param {Object} humidityPatternConfig
 * @return {Object}
 */
export const setWarnDevices = (txIcons, exbIcons, humidityPatternConfig) => {
  humidityPatternConfig.less.forEach(conf => {
    conf.exbs = []
    conf.txs = []
  })
  humidityPatternConfig.more.forEach(conf => {
    conf.exbs = []
    conf.txs = []
  })
  exbIcons.forEach(exbIcon => {
    const alertInfo = SensorHelper.getHumidityInfo(humidityPatternConfig, exbIcon.device.humidity)
    if(alertInfo){
      alertInfo.exbs.push(exbIcon.device)
    }
  })
  txIcons.forEach(txIcon => {
    const alertInfo = SensorHelper.getHumidityInfo(humidityPatternConfig, txIcon.device.humidity)
    if(alertInfo){
      alertInfo.txs.push(txIcon.device)
    }
  })
  return humidityPatternConfig
}

/**
 * 湿度アラートのメッセージを作成する。
 * @method
 * @param {Object[]} txIcons
 * @param {bject[]} exbIcons
 * @return {String}
 */
export const createHumidityWarnMessage = (txIcons, exbIcons) => {
  if(!APP.SENSOR.USE_HUMIDITY_ALERT){
    return null
  }
  const humidityPatternConfig = SensorHelper.getHumidityPatternConfig()
  setWarnDevices(txIcons, exbIcons, humidityPatternConfig)

  const pattern = humidityPatternConfig.more.sort((a, b) => {
    return a.base > b.base? -1: a.base < b.base? 1: 0
  }).concat(humidityPatternConfig.less.sort((a, b) => {
    return a.base < b.base? -1: a.base > b.base? 1: 0
  }))

  const ret = []
  const exbIdName = StateHelper.getDeviceIdName({exbId: true})
  const txIdPotName = StateHelper.getDeviceIdName({txId: true}, {forceSensorName: true})
  const txIdName = StateHelper.getDeviceIdName({txId: true})
  pattern.forEach(conf => {
    if(conf.exbs.length == 0 && conf.txs.length == 0){
      return
    }
    const exbAlert = conf.exbs.length == 0? '': `${conf.exbs.map(exb => exb[exbIdName]).filter(val => val).join(i18n.tnl('message.readingPoint'))}`
    const txAlert = conf.txs.length == 0? '': `${conf.txs.map(tx => Util.hasValue(tx[txIdPotName])? tx[txIdPotName]: tx[txIdName]).filter(val => val).join(i18n.tnl('message.readingPoint'))}`
    ret.push(i18n.tnl(`message.${conf.label}AlertHumidity`, {
      sensors: `${exbAlert}${exbAlert && txAlert? `${i18n.tnl('message.readingPoint')}`: ''}${txAlert}`,
      humidity: conf.base,
    }))
  })
  const mes = ret.join('')
  return Util.hasValue(mes)? mes: null
}
