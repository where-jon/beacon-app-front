/**
 * 滞在時間に関するヘルパーモジュール
 * @module helper/domain/StayTimeHelper
 */

import { APP } from '../../constant/config'

/**
 * 比率を計算する。
 * @method
 * @param {Number} secTime 秒
 * @param {Number} [digit = 設定値「APP.STAY_SUM.PARSENT_DIGIT」と同値] 出力する桁数
 * @param {Number} [baseSecTime = getStayBaseSec()の算出値] 基盤となる秒
 * @return {String}
 */
export const getRatio = (secTime, digit = APP.STAY_SUM.PARSENT_DIGIT, baseSecTime = getStayBaseSec()) => {
  return (Math.round((secTime / baseSecTime) * 100 * digit) / digit).toFixed(String(digit).length-1)
}

/**
 * 滞在時間の基準秒を算出する。
 * @method
 * @return {Number}
 */
export const getStayBaseSec = () => {
  let from = ((Math.floor(APP.STAY_SUM.FROM / 100) * 60) + Math.floor(APP.STAY_SUM.FROM % 100)) * 60
  let to = ((Math.floor(APP.STAY_SUM.TO / 100) * 60) + Math.floor(APP.STAY_SUM.TO % 100)) * 60
  return to - from
}

