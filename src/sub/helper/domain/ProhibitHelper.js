/**
 * 禁止区域アラートに関するヘルパーモジュール
 * @module helper/domain/ProhibitHelper
 */

import { APP, DISP } from '../../constant/config'
import { ALERT_STATE, DETECT_STATE } from '../../constant/Constants'
import * as ViewHelper from '../ui/ViewHelper'
import * as PositionHelper from './PositionHelper'

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
  const isScreen = APP.POS.LOST_ALERT? APP.POS.LOST_ALERT.some(val => val == ALERT_STATE.SCREEN): false
  if (!isScreen || !APP.POS.LOST_GROUP_ZONE || lostZones[0] == null) {
    return null
  }
  const groupZoneList = APP.POS.LOST_GROUP_ZONE
  let lostUnDetectList = []
  lostZones.forEach((lostZone) => {
    position.forEach((pos) => {
      const group = groupZoneList.find(e => e.groupCd && pos.tx.group && pos.tx.group.groupCd == e.groupCd)
      if (group && group.zoneCd.includes(lostZone.zoneCd)) {
        if( pos.detectState != DETECT_STATE.DETECTED || pos.exb.zoneCd != lostZone.zoneCd) {
          lostUnDetectList.push({
            isLost: true,
            btxId: pos.btx_id,
            minor: pos.minor,
            potName: pos.tx.potName,
            areaName: pos.exb.areaName,
            locationName: pos.exb.locationName,
            zoneName: lostZone.zoneName,
            lastDetectedTime: pos.timestamp
          })
        }
      }
    })
  })
  return lostUnDetectList.length > 0 ? lostUnDetectList : null
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
    return null
  }

  const groupZoneList = APP.POS.PROHIBIT_GROUP_ZONE
  let detectList = []
  const detectPosition  = position.filter(pos => pos.tx && pos.tx.group && pos.exb && pos.detectState == DETECT_STATE.DETECTED)
  prohibitZones.forEach(prohibitZone => {
    detectPosition.forEach(pos => {
      const group = groupZoneList.find(e => e.groupCd && pos.tx.group.groupCd == e.groupCd)
      if (group && group.zoneCd.includes(prohibitZone.zoneCd)) {
        if (pos.exb.zoneCd == prohibitZone.zoneCd) {
          detectList.push({
            btxId: pos.btx_id,
            minor: pos.minor,
            potName: pos.tx.potName,
            areaName: pos.exb.areaName,
            zoneName: prohibitZone.zoneName,
            lastDetectedTime: pos.timestamp
          })
        }
      }
    })
  })
  return detectList.length > 0 ? detectList : null
}

/**
 * 禁止区域の検知情報を作成し、コンポーネントに設定する。
 * @method
 * @param {String} viewName
 * @param {VueComponent} vueComponent
 */
export const setProhibitDetect = (viewName, vueComponent, positions = []) => {
  const prohibitDetectList = getProhibitDetectList(
    positions.length > 0 ? positions : PositionHelper.filterPositions(), vueComponent.prohibits
  )
  vueComponent.prohibitDetectList = prohibitDetectList ? prohibitDetectList : null
  const lostUnDetectList = getLostUnDetectList(PositionHelper.filterPositions(),vueComponent.lostZones)
  if(vueComponent.prohibitDetectList){
    vueComponent.prohibitDetectList = lostUnDetectList? prohibitDetectList.concat(lostUnDetectList): vueComponent.prohibitDetectList
  }else{
    vueComponent.prohibitDetectList = lostUnDetectList? lostUnDetectList: null
  }
  vueComponent.message = getProhibitMessage(vueComponent.prohibitDetectList)
  vueComponent.showDismissibleAlert = vueComponent.message? true: false
  if(viewName == 'pos'){
    clearInterval(vueComponent.prohibitInterval)  // 点滅クリア
    // 禁止区域に検知されたら点滅させる
    vueComponent.showDismissibleAlert? vueComponent.prohibitInterval = setInterval(() => ViewHelper.twinkleProhibit(vueComponent.stage, vueComponent.icons, vueComponent.prohibitDetectList), DISP.PROHIBIT_TWINKLE_TIME): false
  }
}
