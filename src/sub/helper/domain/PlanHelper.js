/**
 * 予定に関するヘルパーモジュール
 * @module helper/domain/PlanHelper
 */

import { DISP } from '../../constant/config'
import moment from 'moment'
import * as HttpHelper from '../base/HttpHelper'
import * as StateHelper from '../dataproc/StateHelper'
import * as IconHelper from '../ui/IconHelper'

let store
let i18n

/**
 * vue.jsで使用するオブジェクトを設定する。
 * @method
 * @param {Object} pStore
 * @param {Object} pI18n
 */
export const setApp = (pStore, pI18n) => {
  store = pStore
  i18n = pI18n
}

export const fetchMRoomPlan = async (selectedAreaId) => {
  const now = moment()
  const startDt = now.format('YYYY-MM-DDT00:00:00.000')
  const endDt = now.format('YYYY-MM-DDT23:59:59.999')
  const url = `/office/plans/m-rooms?startDt=${startDt}&endDt=${endDt}&filterType=areas&filterId=${selectedAreaId}`
  const data = await HttpHelper.getAppService(url)
  store.commit('main/replaceMain', {mRoomPlans: data})
}

export const createAllMRoomIcons = (scale) => {
  const positions = StateHelper.getPositions()
  const locationPositionMap = positions.reduce((accum, pos) => {
    if (!accum[pos.location.locationId]) {
      accum[pos.location.locationId] = []
    }
    accum[pos.location.locationId].push(pos)
    return accum
  }, {})
  const mRoomPlans = store.state.main.mRoomPlans
  return mRoomPlans.reduce((arr, mp) => {
    let posList = []
    mp.locationIds.forEach(locationId => {
      if (locationPositionMap[locationId]) {
        const list = locationPositionMap[locationId]
        posList = posList.concat(list)
      }
    })
    const obj = getIconPropsByMRoomStatus(mp, posList)
    if (obj) {
      arr.push(obj)
    }
    return arr
  }, []).map(e => {
    return showMRoom(scale, e.zoneName, e.planUserNum, e.userNum, e.x, e.y, e.bgColor)
  })
}

export const showMRoom = (scale, zoneName, planUserNum, userNum, x, y, bgColor) => {
  const icon = IconHelper.createMRoomStateIcon('', x, y, scale, bgColor)
  if(!icon){
    return
  }
  icon.zoneName = zoneName
  icon.planUserNum = planUserNum
  icon.userNum = userNum
  return icon
}

export const getIconPropsByMRoomStatus = (mRoomPlan, positions) => {
  if (mRoomPlan.x <= 0 || mRoomPlan.y <= 0) {
    return null
  }

  let bgColor = DISP.PLAN.NO_ACTUAL_NO_PLAN_BG_COLOR
  let planUserNum = 0
  const plans = mRoomPlan.plans

  if (plans.length == 0) {
    if (positions.length == 0) {
      bgColor = DISP.PLAN.NO_ACTUAL_NO_PLAN_BG_COLOR
    } else {
      bgColor = DISP.PLAN.ACTUAL_OUT_OF_PLAN_BG_COLOR
    }
  } else {
    let hasPos = positions.length > 0 ? true : false
    const now = moment().valueOf()
    const validPlans = plans.filter(plan => plan.startDt <= now && now <= plan.endDt)
    const hasPlan = validPlans.length > 0 ? true : false
    validPlans.forEach(plan => planUserNum += plan.attendeeNum)

    if (hasPlan) {
      bgColor = hasPos ? DISP.PLAN.ACTUAL_IN_PLAN_BG_COLOR : DISP.PLAN.NO_ACTUAL_IN_PLAN_BG_COLOR
    } else {
      bgColor = hasPos ? DISP.PLAN.ACTUAL_OUT_OF_PLAN_BG_COLOR : DISP.PLAN.NO_ACTUAL_NO_PLAN_BG_COLOR
    }
  }
  return {zoneName: mRoomPlan.zoneName, planUserNum: planUserNum, userNum: positions.length, x: mRoomPlan.x, y: mRoomPlan.y, bgColor: bgColor}
}