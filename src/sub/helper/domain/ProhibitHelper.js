/**
 * 禁止区域アラートに関するヘルパーモジュール
 * @module helper/domain/ProhibitHelper
 */

import { APP, DISP } from '../../constant/config'
import { ALERT_STATE, DETECT_STATE, SYSTEM_ZONE_CATEGORY_NAME } from '../../constant/Constants'
import * as ViewHelper from '../ui/ViewHelper'
import * as PositionHelper from './PositionHelper'
import * as HttpHelper from './../base/HttpHelper'
import * as Util from '../../util/Util'
import * as ArrayUtil from '../../util/ArrayUtil'

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
const getProhibitMessage = prohibitDetectList => {
  if (!Util.hasValue(prohibitDetectList)) {
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
 * 持出禁止ゾーンから所定時間を超えているか否か。
 * 閾値が設定されていない（＝最終測位日時配列が空）の場合true
 * 最終測位日時配列に対象TXがない=一度も検知されていない、orかなり前(5h)に検知の場合true
 * 
 * @param {*} lastDetectedOnLostZone 
 * @param {*} txId 
 */
const isLostOverAlertTime = (lastDetectedOnLostZone, txId) => {
  if (!lastDetectedOnLostZone) {
    return true
  }
  const lastDt = lastDetectedOnLostZone.find(e => e.txId == txId)
  if (!lastDt) {
    return true
  }

  return new Date().getTime() - lastDt.positionDt > APP.POS.LOST_ALERT_TIME
}

/**
 * 検知（進入禁止）・未検知（持出禁止）となるリストを返す
 * 
 * @param {*} position 測位情報
 * @param {*} zones 進入禁止あるいは持出禁止ゾーン
 * @param {*} groupZoneList グループごとの対象ゾーン（設定から）
 * @param {*} isLost true:持出禁止、false:進入禁止
 */
const getDetectList = async (position, zones, groupZoneList, isLost) => {
  let lastDetectedOnLostZone
  if (isLost && APP.POS.LOST_ALERT_TIME > 0) {
    // 持出禁止ゾーンでの最終測位日時{txId, potId, 最終測位日時}の配列を返す。
    lastDetectedOnLostZone = await HttpHelper.getAppService('/core/zone/lastDtInLostZone?_=' + new Date().getTime())
    console.error({lastDetectedOnLostZone})
  }
  let detectList = []
  zones.forEach(zone => {
    position.forEach(pos => {
      const group = groupZoneList.find(e => e.groupCd && e.groupCd == Util.v(pos, 'tx.pot.group.groupCd'))
      if (group && group.zoneCd.includes(zone.zoneCd)) {
        const isInTheZone = (pos.detectState == DETECT_STATE.DETECTED) && Util.v(pos, 'exb.location.zoneList', []).some(curZone => curZone.zoneCd == zone.zoneCd)
        if (isLost && !isInTheZone && isLostOverAlertTime(lastDetectedOnLostZone, pos.txId)
          || !isLost && isInTheZone) {
          addDetectList(detectList, isLost, pos, zone)
        }
      }
    })
  })
  return detectList
}

const addDetectList = (detectList, isLost, pos, zone) => {
  if (detectList.some(e => e.btxId == pos.btxId)) {
    return 
  }
  const detect = {
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
  }
  detectList.push(detect)
}

/**
 * 禁止区域の検知情報を作成し、コンポーネントに設定する。
 * @method
 * @param {String} viewName
 * @param {zones} zones
 * @param {positions} positions
 */
export const loadProhibitDetect = async (viewName, stage, icons, zones, positions = []) => {
  const showProhibitAlert = ArrayUtil.equalsAny(APP.POS.PROHIBIT_ALERT, [ALERT_STATE.SCREEN, viewName]) && Util.hasValue(APP.POS.PROHIBIT_GROUP_ZONE)
  const showLostAlert = ArrayUtil.equalsAny(APP.POS.LOST_ALERT, [ALERT_STATE.SCREEN, viewName]) && Util.hasValue(APP.POS.LOST_GROUP_ZONE)

  if (!showProhibitAlert && !showLostAlert) {
    return {}
  }

  let prohibitDetectList = []
  if (showProhibitAlert) {
    if (positions.length == 0) {
      positions = PositionHelper.filterPositions()
    }
    const prohibitZones = zones.filter(zone => zone.categoryList.some(category => category.categoryCd == SYSTEM_ZONE_CATEGORY_NAME.PROHIBIT))
    if (Util.hasValue(prohibitZones)) {
      // 禁止区域の検知情報を取得する。
      prohibitDetectList = await getDetectList(positions, prohibitZones, APP.POS.PROHIBIT_GROUP_ZONE, false)  
    }
  }

  let lostUnDetectList = []
  if (showLostAlert) {
    positions = PositionHelper.filterPositions()
    const lostZones = zones.filter(zone => zone.categoryList.some(category => category.categoryCd == SYSTEM_ZONE_CATEGORY_NAME.LOST))
    if (Util.hasValue(lostZones)) {
      // 重要物品指定区域の検知情報を取得する。
      lostUnDetectList = await getDetectList(positions, lostZones, APP.POS.LOST_GROUP_ZONE, true)
    }
  }

  prohibitDetectList = prohibitDetectList.concat(lostUnDetectList)
  const message = getProhibitMessage(prohibitDetectList)
  const ret = {
    prohibitDetectList,
    message,
    showDismissibleAlert: Util.hasValue(message)  
  }

  if (viewName == ALERT_STATE.MAP) {
    clearInterval(ret.prohibitInterval)  // 点滅クリア
    // 禁止区域に検知されたら点滅させる
    if (ret.showDismissibleAlert) {
      ret.prohibitInterval = setInterval(() => ViewHelper.twinkleProhibit(stage, icons, ret.prohibitDetectList), DISP.PROHIBIT_TWINKLE_TIME)
    }
  }
  return ret
}
