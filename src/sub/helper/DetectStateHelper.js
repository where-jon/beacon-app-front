import moment from 'moment'
import { APP, DEV } from '../constant/config.js'
import { DETECT_STATE } from '../constant/Constants'
import * as mock from '../../assets/mock/mock'
import * as Util from '../util/Util'

export const getLabel = (state) => {
  return DETECT_STATE.getTypes().find((type) => type.value === state).text
}

export const getClass = (state) => {
  return state === DETECT_STATE.DETECTED? 'success' : state === DETECT_STATE.LOST ? 'warning' : 'danger'
}

export const isUndetect = (state) => {
  return !Util.equalsAny(state, [DETECT_STATE.DETECTED, DETECT_STATE.LOST])
}

export const getState = (type, updatetime) => {
  if (!updatetime) return DETECT_STATE.NONE

  const today = new Date()
  let UNDETECT_TIME
  let TODAY_UNDETECT_TIME = (today.getHours() * 1 * 60 + today.getMinutes() * 60 + today.getSeconds()) * 1000
  let LOST_TIME
  switch(type) {
    case 'tx':
      LOST_TIME = APP.LOST_TIME
      UNDETECT_TIME = APP.UNDETECT_TIME
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
  const time = now - moment(updatetime).local().toDate().getTime()
  let state = time > UNDETECT_TIME? DETECT_STATE.UNDETECT:
    time > TODAY_UNDETECT_TIME? DETECT_STATE.TODAY_UNDETECT:
    time > LOST_TIME? DETECT_STATE.LOST:
    DETECT_STATE.DETECTED

  // console.debug(updatetime, time, state)
  return state
}
