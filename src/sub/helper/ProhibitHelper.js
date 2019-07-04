import { APP, DISP } from '../constant/config'
import { DETECT_STATE, ALERT_STATE, ZONE } from '../constant/Constants'
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

export const getLostUnDetectList = (position, lostZones) => {
  const isScreen = APP.POS.LOST_ALERT? APP.POS.LOST_ALERT.some(val => val == ALERT_STATE.SCREEN): false
  if (!isScreen || !APP.POS.LOST_GROUPS || lostZones[0] == null) {
    return null
  }
  const groups = APP.POS.LOST_GROUPS
  let lostUnDetectList = []
  const detectPosition  = position.filter(pos => pos.tx && pos.tx.group && pos.exb)
  lostZones.forEach((lostZone) => {
    detectPosition.forEach((pos) => {
      const isGroup = groups.some(group => pos.tx.group.groupId ? pos.tx.group.groupId == group : false)
      if(isGroup && pos.exb.areaId) {
        if( pos.detectState != DETECT_STATE.DETECTED || pos.exb.areaId != lostZone.areaId   // 検知エリアが違う
        || ( pos.exb.areaId == lostZone.areaId && lostZone.zoneType == ZONE.COORDINATE && pos.exb.x != null && pos.exb.y != null  // 検知エリア同一で座標設定の場合
        && lostZone.x != null && lostZone.y != null && lostZone.w != null && lostZone.h != null
        && !(pos.exb.x >= lostZone.x && pos.exb.x <= lostZone.x + lostZone.w
        && pos.exb.y >= lostZone.y && pos.exb.y <= lostZone.y + lostZone.h))){
          lostUnDetectList.push({
            isLost: true,
            minor: pos.minor,
            potName: pos.tx.potName,
            areaName: pos.exb.locationName,
            zoneName: lostZone.zoneName,
            lastDetectedTime: pos.timestamp
          })
        }
      }
    })
  })
  return lostUnDetectList.length > 0 ? lostUnDetectList : null
}

export const getProhibitMessage = prohibitDetectList => {
  const isProhibitScreen = APP.POS.PROHIBIT_ALERT? APP.POS.PROHIBIT_ALERT.some(val => val == ALERT_STATE.SCREEN): false
  const isLostScreen = APP.POS.LOST_ALERT? APP.POS.LOST_ALERT.some(val => val == ALERT_STATE.SCREEN): false
  if ((!isProhibitScreen && !isLostScreen) || (!APP.POS.PROHIBIT_GROUPS && !APP.POS.LOST_GROUPS) || !prohibitDetectList) {
    return ''   // message空
  }
  const prohibitTitle = i18n.tnl('label.detectedProhibitZone')
  const lostTitle = i18n.tnl('label.detectedLostZone')
  const labelArea = i18n.tnl('label.Area')
  const labelPotName = i18n.tnl('label.potName')
  const labelTime = i18n.tnl('label.finalReceiveTimestamp')
  const labelFinalLocation = i18n.tnl('label.finalReceiveLocation')
  const labelZone =  i18n.tnl('label.zoneName')

  return prohibitDetectList.map(data => data.isLost
    ? `<${lostTitle} : ${labelPotName} : ${data.potName} ${labelFinalLocation} : ${data.areaName} ${labelTime} : ${data.lastDetectedTime}>`
    :`<${prohibitTitle} : ${labelPotName} : ${data.potName} ${labelArea} : ${data.areaName} ${labelZone} : ${data.zoneName}>` ).join(' ')
}

export const getProhibitDetectList = (position, prohibitZones) => {
  const isScreen = APP.POS.PROHIBIT_ALERT? APP.POS.PROHIBIT_ALERT.some(val => val == ALERT_STATE.SCREEN): false
  if (!isScreen || !APP.POS.PROHIBIT_GROUPS || prohibitZones[0] == null) {
    return null
  }
  const groups = APP.POS.PROHIBIT_GROUPS
  let detectList = []
  const detectPosition  = position.filter(pos => pos.tx && pos.tx.group && pos.exb && pos.detectState == DETECT_STATE.DETECTED)
  prohibitZones.forEach(prohibitZone => {
    detectPosition.forEach(pos => {
      const isGroup = groups.some(group => pos.tx.group.groupId ? pos.tx.group.groupId == group : false)
      if(isGroup && pos.exb.areaId ? pos.exb.areaId == prohibitZone.areaId : false) {
        if((prohibitZone.zoneType == ZONE.COORDINATE && pos.exb.x != null && pos.exb.y != null
        && prohibitZone.x != null && prohibitZone.y != null && prohibitZone.w != null && prohibitZone.h != null
        && pos.exb.x >= prohibitZone.x && pos.exb.x <= prohibitZone.x + prohibitZone.w
        && pos.exb.y >= prohibitZone.y && pos.exb.y <= prohibitZone.y + prohibitZone.h)
        || prohibitZone.zoneType == ZONE.NON_COORDINATE){
          detectList.push({
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

export const setProhibitDetect = (viewName, vueComponent) => {
  const prohibitDetectList = getProhibitDetectList(PositionHelper.getPositions(),vueComponent.prohibits)
  vueComponent.prohibitDetectList = prohibitDetectList ? prohibitDetectList : null
  const lostUnDetectList = getLostUnDetectList(PositionHelper.getPositions(),vueComponent.lostZones)
  if(vueComponent.prohibitDetectList){
    vueComponent.prohibitDetectList = lostUnDetectList? prohibitDetectList.concat(lostUnDetectList) : vueComponent.prohibitDetectList
  }else{
    vueComponent.prohibitDetectList =lostUnDetectList ? lostUnDetectList : null
  }
  vueComponent.message = getProhibitMessage(vueComponent.prohibitDetectList)
  vueComponent.showDismissibleAlert = vueComponent.message ? true: false
  if(viewName == 'pos'){
    clearInterval(vueComponent.prohibitInterval)  // 点滅クリア
    // 禁止区域に検知されたら点滅させる
    vueComponent.showDismissibleAlert? vueComponent.prohibitInterval = setInterval(vueComponent.twinkle, DISP.PROHIBIT_TWINKLE_TIME): false
  }
}
