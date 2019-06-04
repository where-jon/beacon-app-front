
<script>
import reloadmixinVue from './reloadmixin.vue'
import { SHAPE,DETECT_STATE,PROHIBIT_STATE,ZONE } from '../../sub/constant/Constants'
import { DISP } from '../../sub/constant/config.js'
import * as Util from '../../sub/util/Util'
import { APP } from '../../sub/constant/config'

export default {
  mixins: [reloadmixinVue],
  methods: {
    getStyleDisplay(entity){
      return entity.map((val) => ({entity: val, style: this.getStyleDisplay1(val)}))
    },
    getProhibitData(position,prohibits){
      const isScreen = APP.POS.PROHIBIT_ALERT? APP.POS.PROHIBIT_ALERT.some((val) => val == PROHIBIT_STATE.SCREEN):false
      if (!isScreen || !APP.POS.PROHIBIT_GROUPS || prohibits[0] == null) {
        return null
      }
      const groups = APP.POS.PROHIBIT_GROUPS
      let detectList = []
      const detectPosition  = position.filter((pos) => pos.tx && pos.tx.group && pos.exb && pos.detectState == DETECT_STATE.DETECTED)
      prohibits.forEach((prohibitData) => {
        detectPosition.forEach((pos) => {
          const isGroup = groups.some((group) => pos.tx.group.groupId ? pos.tx.group.groupId == group : false)
          if(isGroup && pos.exb.areaId ? pos.exb.areaId == prohibitData.areaId : false) {
            if((prohibitData.zoneType == ZONE.COORDINATE && pos.exb.x != null && pos.exb.y != null
            && prohibitData.x != null && prohibitData.y != null && prohibitData.w != null && prohibitData.h != null
            && pos.exb.x >= prohibitData.x && pos.exb.x <= prohibitData.x + prohibitData.w
            && pos.exb.y >= prohibitData.y && pos.exb.y <= prohibitData.y + prohibitData.h
            || prohibitData.zoneType == ZONE.NON_COORDINATE)){
              detectList.push({
                minor: pos.minor,
                potName: pos.tx.potName,
                areaName: pos.exb.areaName,
                zoneName: prohibitData.zoneName
              })
            }
          }
        })
      })
      return detectList.length > 0 ? detectList : null
    },
    getProhibitMessage(position,prohibits){
      const isScreen = APP.POS.PROHIBIT_ALERT? APP.POS.PROHIBIT_ALERT.some((val) => val == PROHIBIT_STATE.SCREEN):false
      if (!isScreen || !APP.POS.PROHIBIT_GROUPS || !prohibits) {
        return ''   // message空
      }
      const labelArea = this.$i18n.tnl('label.Area')
      const labelPotName = this.$i18n.tnl('label.potName')
      const labelZone =  this.$i18n.tnl('label.zoneName')
      return prohibits.map((data) => `< ${labelPotName} : ${data.potName} ${labelArea} : ${data.areaName} ${labelZone} : ${data.zoneName}>`).join(' ')
    },
    setProhibit(isPos){
      this.prohibitData = this.getProhibitData(this.getPositions(),this.prohibits)
      this.message = this.getProhibitMessage(this.message,this.prohibitData)
      this.showDismissibleAlert = this.message ? true: false
      if(isPos == 'pos'){
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
