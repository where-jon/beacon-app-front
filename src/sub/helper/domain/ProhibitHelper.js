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
 * 禁止区域のアラートメッセージを作成する。
 * @method
 * @param {Object[]} prohibitDetectList
 * @return {String}
 */
export const getProhibitMessage = prohibitDetectList => {
  const isProhibitScreen = APP.POS.PROHIBIT_ALERT? APP.POS.PROHIBIT_ALERT.some(val => val == ALERT_STATE.SCREEN): false
  const isLostScreen = APP.POS.LOST_ALERT? APP.POS.LOST_ALERT.some(val => val == ALERT_STATE.SCREEN): false
  if ((!isProhibitScreen && !isLostScreen) || (!APP.POS.PROHIBIT_GROUP_ZONE && !APP.POS.LOST_GROUP_ZONE) || !prohibitDetectList) {
    return null   // message空
  }

  return prohibitDetectList.map(data => {
    const messageTemplate = i18n.tnl('message.' + (data.isLost? 'lostDetected': 'prohibitDetected'))
    let message = messageTemplate.split('{time}').join(data.lastDetectedTime)
    const keys = ['groupName','potCd','potName','locationName','zoneName','areaName']
    keys.forEach(key => {
      message = message.split('{' + key + '}').join(data[key])
    })
    return message
  })
}

/**
 * 重要物品指定区域の検知情報を取得する。
 * @method
 * @param {Object[]} position
 * @param {Object[]} lostZones
 * @return {Object[]}
 */
export const getLostUnDetectList = (position, lostZones) => {
  return getDetectList(position, lostZones, APP.POS.LOST_ALERT, APP.POS.LOST_GROUP_ZONE, true)
}

/**
 * 禁止区域の検知情報を取得する。
 * @method
 * @param {Object[]} position
 * @param {Object[]} prohibitZones
 * @return {Object[]}
 */
export const getProhibitDetectList = (position, prohibitZones) => {
  return getDetectList(position, prohibitZones, APP.POS.PROHIBIT_ALERT, APP.POS.PROHIBIT_GROUP_ZONE, false)
}

export const getDetectList = (position, zones, alert, zoneGroupSetting, isLost) => {
  const isScreen = alert && alert.some(val => val == ALERT_STATE.SCREEN)
  if (!isScreen || !zoneGroupSetting || zones[0] == null) {
    return []
  }

  const groupZoneList = zoneGroupSetting
  let detectList = []
  zones.forEach(zone => {
    position.forEach(pos => {
      const group = groupZoneList.find(e => e.groupCd && e.groupCd == Util.v(pos, 'tx.pot.group.groupCd'))
      if (group && group.zoneCd.includes(zone.zoneCd)) {
        const isInTheZone = pos.detectState == DETECT_STATE.DETECTED && Util.v(pos, 'exb.location.zoneList', []).some(curZone => curZone.zoneCd == zone.zoneCd)
        if (isLost && !isInTheZone || !isLost && isInTheZone) {
          detectList.push({
            isLost,
            btxId: pos.btxId,
            minor: pos.minor,
            potCd: Util.v(pos, 'tx.pot.potCd'),
            potName: Util.v(pos, 'tx.pot.potName'),
            groupName: Util.v(pos, 'tx.pot.group.groupName'),
            categoryName: Util.v(pos, 'tx.pot.category.categoryName'),
            areaName: Util.v(pos, 'exb.areaName'),
            locationName: Util.v(pos, 'exb.locationName'),
            zoneName: zone.zoneName,
            lastDetectedTime: pos.timestamp.substring(11, 16),
            lastDetectedDateTime: pos.timestamp
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
  positions = PositionHelper.filterPositions()
  const lostUnDetectList = getLostUnDetectList(positions, lostZones)

  const ret = {}
  ret.prohibitDetectList = prohibitDetectList.concat(lostUnDetectList)
  ret.message = getProhibitMessage(ret.prohibitDetectList)
  ret.showDismissibleAlert = Util.hasValue(ret.message)

  if (viewName == 'pos') {
    clearInterval(ret.prohibitInterval)  // 点滅クリア
    // 禁止区域に検知されたら点滅させる
    if (ret.showDismissibleAlert) {
      ret.prohibitInterval = setInterval(() => ViewHelper.twinkleProhibit(stage, icons, ret.prohibitDetectList), DISP.PROHIBIT_TWINKLE_TIME)
    }
  }
  return ret
}
