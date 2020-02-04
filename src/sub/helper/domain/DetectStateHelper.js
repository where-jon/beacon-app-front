/**
 * 検知情報に関するヘルパーモジュール
 * @module helper/domain/DetectStateHelper
 */

import * as mock from '../../../assets/mock/mock'
import { DEV, APP } from '../../constant/config'
import { DETECT_STATE } from '../../constant/Constants'
import * as ArrayUtil from '../../util/ArrayUtil'

/**
 * 検知状態リストを取得する。
 * @method
 * @return {{value: Number, text: String}}
 */
export const getTypes = () => {
  return DETECT_STATE.getTypes()
}

/**
 * 検知状態を示す文字列を取得する。
 * @method
 * @param {Number} state 
 * @return {String}
 */
export const getLabel = state => {
  return DETECT_STATE.getTypes().find((type) => type.value === state).text
}

/**
 * 検知状態を示すclassを取得する。
 * @method
 * @param {Number} state 
 * @return {String}
 */
export const getClass = state => {
  return state === DETECT_STATE.DETECTED? 'success' : state === DETECT_STATE.LOST ? 'warning' : 'danger'
}

/**
 * 未検知状態か確認する。
 * @method
 * @param {Number} state 
 * @return {Boolean}
 */
export const isUndetect = state => {
  return !ArrayUtil.equalsAny(state, [DETECT_STATE.DETECTED, DETECT_STATE.LOST])
}

/**
 * 指定した種類の検知状態を取得する。
 * @method
 * @param {String} type 'tx' or 'exb' or 'gw'
 * @param {Number|Date} updatetime 
 * @return {Number}
 */
export const getState = (type, updatetime) => {
  if (!updatetime) return DETECT_STATE.NONE

  let UNDETECT_TIME
  let LOST_TIME
  switch(type) {
  case 'tx':
    LOST_TIME = APP.POS.LOST_TIME
    UNDETECT_TIME = APP.POS.UNDETECT_TIME
    break
  case 'exb':
    LOST_TIME = APP.TELEMETRY.LOST_TIME
    UNDETECT_TIME = APP.TELEMETRY.UNDETECT_TIME
    break
  case 'gw':
    LOST_TIME = APP.GATEWAY.LOST_TIME
    UNDETECT_TIME = APP.GATEWAY.UNDETECT_TIME
    break
  }

  const now = !DEV.USE_MOCK_EXC? new Date().getTime(): mock.positions_conf.start
  const time = now - updatetime
  let state = time > UNDETECT_TIME? DETECT_STATE.UNDETECT:
    time > LOST_TIME? DETECT_STATE.LOST:
      DETECT_STATE.DETECTED

  return state
}

/**
 * 指定した種類の検知状態を取得する。
 * @method
 * @param {String} type 
 * @param {Number|Date} updatetime 
 * @return {Number}
 */
export const getStateFromDetail = (type, updatetime) => {
  return getState(type, updatetime) // 第一階層のupdatetimeを使用
}

/**
 * 指定した種類の検知状態を取得する。
 * @method
 * @param {String} type 
 * @param {Number|Date} updatetime 
 * @return {Boolean}
 */
export const isUndetectFromDetail = (type, updatetime) => {
  return isUndetect(getStateFromDetail(type, updatetime))
}
