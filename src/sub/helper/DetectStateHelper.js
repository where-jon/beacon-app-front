import moment from 'moment'
import { APP, DEV } from '../constant/config.js'
import { DETECT_STATE } from '../constant/Constants'
import * as mock from '../../assets/mock/mock'
import * as Util from '../util/Util'

export const getLabel = (state) => {
  return DETECT_STATE.getTypes().find((type) => type.id === state).text
}

export const getClass = (state) => {
  return state === DETECT_STATE.DETECTED? 'success' : state === DETECT_STATE.LOST ? 'warning' : 'danger'
}

export const isUndetect = (state) => {
  return state === DETECT_STATE.NONE || state === DETECT_STATE.UNDETECT
}

export const getTxState = (updatetime) => {
  const today = new Date()
  let msecInToday = (today.getHours() * 60 * 60 + today.getMinutes() * 60 + today.getSeconds()) * 1000
  return getState(updatetime, [
    APP.HIDE_TIME,
    msecInToday,
    APP.UNDETECT_TIME
  ])
}

export const getExbState = (updatetime) => {
  return getState(updatetime, [
    APP.TELEMETRY.HIDE_TIME,
    APP.TELEMETRY.UNDETECT_TIME,
    APP.TELEMETRY.UNDETECT_TIME
  ])
}

export const getGwState = (updatetime) => {
  return getState(updatetime, [
    APP.GATEWAY.HIDE_TIME,
    APP.GATEWAY.UNDETECT_TIME,
    APP.GATEWAY.UNDETECT_TIME
  ])
}

export const getState = (updatetime, stateArr) => {
  if (!updatetime) return DETECT_STATE.NONE
  const now = !DEV.USE_MOCK_EXC? new Date().getTime(): mock.positions_conf.start
  const time = now - moment(updatetime).local().toDate().getTime()
  return time <  stateArr[0]? DETECT_STATE.DETECTED:
    time < stateArr[1] ?　DETECT_STATE.LOST:
    time < stateArr[2] ?　DETECT_STATE.TODAY_UNDETECT: DETECT_STATE.UNDETECT
}
