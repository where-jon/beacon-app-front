
<script>
import reloadmixinVue from './reloadmixin.vue'
import { SHAPE,DETECT_STATE,ALERT_STATE,ZONE } from '../../sub/constant/Constants'
import { DISP } from '../../sub/constant/config.js'
import * as Util from '../../sub/util/Util'
import { APP } from '../../sub/constant/config'

export default {
  mixins: [reloadmixinVue],
  methods: {
    getStyleDisplay(entity){
      return entity.map((val) => ({entity: val, style: this.getStyleDisplay1(val)}))
    },
    getLostUnDetectList(position, lostZones){
      const isScreen = APP.POS.LOST_ALERT? APP.POS.LOST_ALERT.some((val) => val == ALERT_STATE.SCREEN):false
      if (!isScreen || !APP.POS.LOST_GROUPS || lostZones[0] == null) {
        return null
      }
      const groups = APP.POS.LOST_GROUPS
      let lostUnDetectList = []
      const detectPosition  = position.filter((pos) => pos.tx && pos.tx.group && pos.exb)
      lostZones.forEach((lostZone) => {
        detectPosition.forEach((pos) => {
          const isGroup = groups.some((group) => pos.tx.group.groupId ? pos.tx.group.groupId == group : false)
          if(isGroup && pos.exb.areaId) {
            if( pos.pos_id == -1 || pos.exb.areaId != lostZone.areaId   // 検知エリアが違う
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
    },
    getProhibitDetectList(position, prohibitZones){
      const isScreen = APP.POS.PROHIBIT_ALERT? APP.POS.PROHIBIT_ALERT.some((val) => val == ALERT_STATE.SCREEN):false
      if (!isScreen || !APP.POS.PROHIBIT_GROUPS || prohibitZones[0] == null) {
        return null
      }
      const groups = APP.POS.PROHIBIT_GROUPS
      let detectList = []
      const detectPosition  = position.filter((pos) => pos.tx && pos.tx.group && pos.exb && pos.detectState == DETECT_STATE.DETECTED)
      prohibitZones.forEach((prohibitZone) => {
        detectPosition.forEach((pos) => {
          const isGroup = groups.some((group) => pos.tx.group.groupId ? pos.tx.group.groupId == group : false)
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
    },
    getProhibitMessage(prohibitDetectList){
      const isProhibitScreen = APP.POS.PROHIBIT_ALERT? APP.POS.PROHIBIT_ALERT.some((val) => val == ALERT_STATE.SCREEN):false
      const isLostScreen = APP.POS.LOST_ALERT? APP.POS.LOST_ALERT.some((val) => val == ALERT_STATE.SCREEN):false
      if ((!isProhibitScreen && !isLostScreen) || (!APP.POS.PROHIBIT_GROUPS && !APP.POS.LOST_GROUPS) || !prohibitDetectList) {
        return ''   // message空
      }
      const prohibitTitle = this.$i18n.tnl('label.detectedProhibitZone')
      const lostTitle = this.$i18n.tnl('label.detectedLostZone')
      const labelArea = this.$i18n.tnl('label.Area')
      const labelPotName = this.$i18n.tnl('label.potName')
      const labelTime = this.$i18n.tnl('label.finalReceiveTimestamp')
      const labelFinalLocation = this.$i18n.tnl('label.finalReceiveLocation')
      const labelZone =  this.$i18n.tnl('label.zoneName')

      return prohibitDetectList.map((data) => data.isLost
        ? `<${lostTitle} : ${labelPotName} : ${data.potName} ${labelFinalLocation} : ${data.areaName} ${labelTime} : ${data.lastDetectedTime}>`
        :`<${prohibitTitle} : ${labelPotName} : ${data.potName} ${labelArea} : ${data.areaName} ${labelZone} : ${data.zoneName}>` ).join(' ')
    },
    setProhibitDetect(viewName){
      const prohibitDetectList = this.getProhibitDetectList(this.getPositions(),this.prohibits)
      this.prohibitDetectList = prohibitDetectList ? prohibitDetectList : null
      const lostUnDetectList = this.getLostUnDetectList(this.getPositions(),this.lostZones)
      if(this.prohibitDetectList){
        this.prohibitDetectList = lostUnDetectList? prohibitDetectList.concat(lostUnDetectList) : null
      }else{
        this.prohibitDetectList =lostUnDetectList ? lostUnDetectList : null
      }
      this.message = this.getProhibitMessage(this.prohibitDetectList)
      this.showDismissibleAlert = this.message ? true: false
      if(viewName == 'pos'){
        clearInterval(this.prohibitInterval)  // 点滅クリア
        // 禁止区域に検知されたら点滅させる
        this.showDismissibleAlert? this.prohibitInterval = setInterval(this.twinkle,DISP.PROHIBIT_TWINKLE_TIME):false
      }
    },
    getStyleDisplay1(val, option = {reverceColor: false, fixSize: true}) {
      const style = {
        'color': Util.colorCd4display(option.reverceColor? val.bgColor: val.color),
        'background-color': Util.colorCd4display(option.reverceColor? val.color: val.bgColor, '#FFFFFF'),
        'text-align': 'center',
        border: 'solid 1px #ccc',
        'border-radius': val.shape == SHAPE.CIRCLE? '50%': val.shape == SHAPE.ROUND_SQUARE? DISP.TX.ROUNDRECT_RADIUS + 'px': null,
        'justify-content': 'center',
        'display': ['-ms-flexbox', '-webkit-flex', 'flex'],
        '-ms-flex-align': 'center',
        '-webkit-box-align': 'center',
        'align-items': 'center',
        'white-space': 'nowrap',
      }
      const label = Util.getValue(val, 'label', null)
      if(option.fixSize != false){
        const fontSize = label? Util.getInRectFontSize(label, DISP.TX.FIX_R * 2, DISP.TX.FIX_R * 2): DISP.TX.FIX_R
        style.font = Util.getAdjustFontSize(() => fontSize * DISP.FONT_ICON_ADJUST_SCALE)
        style.width = (DISP.TX.FIX_R * 2) + 'px'
        style.height = (DISP.TX.FIX_R * 2) + 'px'
      }
      else{
        const fontSize = label? Util.getInRectFontSize(label, DISP.TX.R * 2, DISP.TX.R * 2): DISP.TX.R
        style.font = Util.getAdjustFontSize(() => fontSize * DISP.FONT_ICON_ADJUST_SCALE)
        style.width = (DISP.TX.R * 2) + 'px'
        style.height = (DISP.TX.R * 2) + 'px'
      }
      return style
    }
  }
}
</script>
