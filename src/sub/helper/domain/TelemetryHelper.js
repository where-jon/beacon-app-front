
/**
 * テレメトリに関するヘルパーモジュール
 * @module helper/domain/TelemetryHelper
 */

import { APP } from '../../constant/config'

/**
 * 電池レベルを示すclassを取得する。
 * @method
 * @param {Number} val 電池レベル
 * @return {String}
 */
export const getPositionPowerLevel = val => {
  if (val > APP.TX_MON.POWER_LEVEL_GOOD) {
    return 'good'
  }
  if (val > APP.TX_MON.POWER_LEVEL_WARN) {
    return 'warning'
  }
  if (val != null) {
    return 'poor'
  }
  return null
}

/**
 * 電池レベルを示すclassを取得する。
 * @method
 * @param {Num} val 
 * @param {Boolean} [isPowerState = false]
 * @return {String}
 */
export const getTelemetryPowerLevelClass = (val, isPowerState = false) => {
  const num = parseInt(val , 10)
  if (79 < num) {
    return !isPowerState ? 'battery-full' : 'power-safe'
  }
  if (59 < num) {
    return !isPowerState ? 'battery-three-quarters' : 'power-safe'
  }
  if (39 < num) {
    return  !isPowerState ? 'battery-half' : 'power-warning'
  }
  if (19 < num) {
    return  !isPowerState ? 'battery-quarter' : 'power-empty'
  }
  return  !isPowerState ? 'battery-empty' : 'power-empty'
}
