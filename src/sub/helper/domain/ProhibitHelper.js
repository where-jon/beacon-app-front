/**
 * 禁止区域アラートに関するヘルパーモジュール
 * @module helper/domain/ProhibitHelper
 */

import { APP, DISP } from '../../constant/config'
import { ALERT_STATE, DETECT_STATE, SYSTEM_ZONE_CATEGORY_NAME } from '../../constant/Constants'
import * as ViewHelper from '../ui/ViewHelper'
import * as PositionHelper from './PositionHelper'
import * as Util from '../../util/Util'

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
 * 重要物品指定区域の検知情報を取得する。
 * @method
 * @param {Object[]} position
 * @param {Object[]} lostZones
 * @return {Object[]}
 */
export const getLostUnDetectList = (position, lostZones) => {
  const isScreen = APP.POS.LOST_ALERT && APP.POS.LOST_ALERT.some(val => val == ALERT_STATE.SCREEN)
  if (!isScreen || !APP.POS.LOST_GROUP_ZONE || lostZones[0] == null) {
    return []
  }
  const groupZoneList = APP.POS.LOST_GROUP_ZONE
  let lostUnDetectList = []
  lostZones.forEach((lostZone) => {
    position.forEach((pos) => {
      const group = groupZoneList.find(e => e.groupCd && e.groupCd == Util.v(pos, 'tx.pot.group.groupCd'))
      if (group && group.zoneCd.includes(lostZone.zoneCd)) {
        if( pos.detectState != DETECT_STATE.DETECTED || pos.exb.zoneCd != lostZone.zoneCd) {
          lostUnDetectList.push({
            isLost: true,
            btxId: pos.btxId,
            minor: pos.minor,
            potName: pos.tx.pot.potName,
            areaName: pos.exb.areaName,
            locationName: pos.exb.locationName,
            zoneName: lostZone.zoneName,
            lastDetectedTime: pos.timestamp
          })
        }
      }
    })
  })
  return lostUnDetectList
}

/**
 * 禁止区域のアラートメッセージを作成する。
 * @method
 * @param {Object[]} prohibitDetectList
 * @return {String}
 */
export const getProhibitMessage = prohibitDetectList => {
  const isProhibitScreen = APP.POS.PROHIBIT_ALERT? APP.POS.PROHIBIT_ALERT.some(val => val == ALERT_STATE.SCREEN): false
  const isLostScreen = APP.POS.LOST_ALERT? APP.POS.LOST_ALERT.some(val => val == ALERT_STATE.SCREEN): false
  if ((!isProhibitScreen && !isLostScreen) || (!APP.POS.PROHIBIT_GROUP_ZONE && !APP.POS.LOST_GROUP_ZONE) || !prohibitDetectList) {
    return ''   // message空
  }
  const prohibitTitle = i18n.tnl('label.detectedProhibitZone')
  const lostTitle = i18n.tnl('label.detectedLostZone')
  const labelArea = i18n.tnl('label.Area')
  const labelPotName = i18n.tnl('label.potName')
  const labelTime = i18n.tnl('label.finalReceiveTimestamp')
  const labelFinalLocation = i18n.tnl('label.finalReceiveLocation')
  const labelZone =  i18n.tnl('label.zoneName')
  const labelToBeZone =  i18n.tnl('label.toBeZone')

  return prohibitDetectList.map(data => data.isLost
    ? `<${lostTitle} [${labelPotName}] ${data.potName} [${labelToBeZone}] ${data.zoneName} [${labelFinalLocation}] ${data.locationName} [${labelTime}] ${data.lastDetectedTime}>`
    :`<${prohibitTitle} [${labelPotName}] ${data.potName} [${labelArea}] ${data.areaName} [${labelZone}] ${data.zoneName}>` ).join(' ')
}

/**
 * 禁止区域の検知情報を取得する。
 * @method
 * @param {Object[]} position
 * @param {Object[]} prohibitZones
 * @return {Object[]}
 */
export const getProhibitDetectList = (position, prohibitZones) => {
  const isScreen = APP.POS.PROHIBIT_ALERT? APP.POS.PROHIBIT_ALERT.some(val => val == ALERT_STATE.SCREEN): false
  if (!isScreen || !APP.POS.PROHIBIT_GROUP_ZONE || prohibitZones[0] == null) {
    return []
  }

  const groupZoneList = APP.POS.PROHIBIT_GROUP_ZONE
  let detectList = []
  const detectPosition  = position.filter(pos => pos.exb && pos.detectState == DETECT_STATE.DETECTED)
  prohibitZones.forEach(prohibitZone => {
    detectPosition.forEach(pos => {
      const group = groupZoneList.find(e => e.groupCd && e.groupCd == Util.v(pos, 'tx.pot.group.groupCd'))
      if (group && group.zoneCd.includes(prohibitZone.zoneCd)) {
        if (Util.v(pos, 'exb.location.zoneList', []).some(zone => zone.zoneCd == prohibitZone.zoneCd)) {
          detectList.push({
            btxId: pos.btxId,
            minor: pos.minor,
            potName: Util.v(pos, 'tx.pot.potName'),
            areaName: Util.v(pos, 'exb.areaName'),
            zoneName: prohibitZone.zoneName,
            lastDetectedTime: pos.timestamp
          })
        }
      }
    })
  })
  return detectList
}

/**
 * 禁止区域の検知情報を作成し、コンポーネントに設定する。
 * @method
 * @param {String} viewName
 * @param {zones} zones
 * @param {positions} positions
 */
export const setProhibitDetect = (viewName, stage, icons, zones, positions = []) => {
  if (positions.length == 0) {
    positions = PositionHelper.filterPositions()
  }
  const prohibitZones = zones.filter(zone => zone.categoryList.some(category => category.categoryCd == SYSTEM_ZONE_CATEGORY_NAME.PROHIBIT))
  const lostZones = zones.filter(zone => zone.categoryList.some(category => category.categoryCd == SYSTEM_ZONE_CATEGORY_NAME.LOST))
  const prohibitDetectList = getProhibitDetectList(positions, prohibitZones)
  const lostUnDetectList = getLostUnDetectList(PositionHelper.filterPositions(), lostZones)

  const ret = {}
  ret.prohibitDetectList = prohibitDetectList.concat(lostUnDetectList)
  ret.message = getProhibitMessage(ret.prohibitDetectList)
  ret.showDismissibleAlert = !!ret.message

  if (viewName == 'pos') {
    clearInterval(ret.prohibitInterval)  // 点滅クリア
    // 禁止区域に検知されたら点滅させる
    if (ret.showDismissibleAlert) {
      ret.prohibitInterval = setInterval(() => ViewHelper.twinkleProhibit(stage, icons, ret.prohibitDetectList), DISP.PROHIBIT_TWINKLE_TIME)
    }
  }
  return ret
}
