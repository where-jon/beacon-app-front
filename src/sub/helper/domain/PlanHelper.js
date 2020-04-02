/**
 * 予定に関するヘルパーモジュール
 * @module helper/domain/PlanHelper
 */

import { DISP } from '../../constant/config'
import moment from 'moment'
import * as HttpHelper from '../base/HttpHelper'
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
  const url = `/office/plans/m-rooms?startDt=${startDt}&endDt=${endDt}&filterType=area&filterId=${selectedAreaId}`
  const data = await HttpHelper.getAppService(url)
  store.commit('main/replaceMain', {mRoomPlans: data})
}

export const createAllMRoomIcons = (scale) => {
  const positions = store.state.main.positions
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
    const bgColor = getBgColorByMRoomStatus(mp, posList)
    const planUserNum = mp.plans.reduce((accum, plan) => {
      accum += plan.attendeeNum
      return accum 
    }, 0)
    if (mp.x & mp.y){
      arr.push({zoneName: mp.zoneName, planUserNum: planUserNum, userNum: posList.length, x: mp.x, y: mp.y, bgColor: bgColor})
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

export const getBgColorByMRoomStatus = (mRoomPlan, positions) => {
  const plans = mRoomPlan.plans
  if (plans.length == 0) {
    if (positions.length == 0) {
      return DISP.PLAN.NO_ACTUAL_NO_PLAN_BG_COLOR
    }
    return DISP.PLAN.ACTUAL_OUT_OF_PLAN_BG_COLOR
  } else {
    if (positions.length == 0) {
      return DISP.PLAN.NO_ACTUAL_IN_PLAN_BG_COLOR
    } else {
      let hasPlan = false
      for (let idx in positions) {
        const pos = positions[idx]
        const updTime = moment(pos.updatetime).valueOf()
        for (let pIdx in plans) {
          const plan = plans[pIdx]
          if (plan.startDt <= updTime && updTime <= plan.endDt) {
            hasPlan = true
            break
          }
        }
        if (hasPlan) {
          break
        }
      }
      if (hasPlan) {
        return DISP.PLAN.ACTUAL_IN_PLAN_BG_COLOR
      } else {
        return DISP.PLAN.ACTUAL_OUT_OF_PLAN_BG_COLOR
      }
    }
  }
}