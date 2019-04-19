
<script>
import reloadmixinVue from './reloadmixin.vue'
import { SHAPE } from '../../sub/constant/Constants'
import { DISP } from '../../sub/constant/config.js'
import * as Util from '../../sub/util/Util'

export default {
  mixins: [reloadmixinVue],
  methods: {
    getStyleDisplay(entity){
      return entity.map((val) => ({entity: val, style: this.getStyleDisplay1(val)}))
    },
    getStyleDisplay1(val, option = {reverceColor: false, fixSize: true}) {
      const style = {
        'color': Util.colorCd4display(option.reverceColor? val.bgColor: val.color),
        'background-color': Util.colorCd4display(option.reverceColor? val.color: val.bgColor, '#FFFFFF'),
        'text-align': 'center',
        border: 'solid 1px #ccc',
        'border-radius': val.shape == SHAPE.CIRCLE? '50%': val.shape == SHAPE.ROUND_SQUARE? DISP.ROUNDRECT_RADIUS + 'px': null,
        'justify-content': 'center',
        'display': ['-ms-flexbox', '-webkit-flex', 'flex'],
        '-ms-flex-align': 'center',
        '-webkit-box-align': 'center',
        'align-items': 'center',
        'white-space': 'nowrap',
      }
      const label = Util.getValue(val, 'label', null)
      if(option.fixSize != false){
        const fontSize = label? Util.getInRectFontSize(label, DISP.TX_FIX_R * 2, DISP.TX_FIX_R * 2): DISP.TX_FIX_R
        style.font = Util.getAdjustFontSize(() => fontSize * DISP.FONT_ICON_ADJUST_SCALE)
        style.width = (DISP.TX_FIX_R * 2) + 'px'
        style.height = (DISP.TX_FIX_R * 2) + 'px'
      }
      else{
        const fontSize = label? Util.getInRectFontSize(label, DISP.TX_R * 2, DISP.TX_R * 2): DISP.TX_R
        style.font = Util.getAdjustFontSize(() => fontSize * DISP.FONT_ICON_ADJUST_SCALE)
        style.width = (DISP.TX_R * 2) + 'px'
        style.height = (DISP.TX_R * 2) + 'px'
      }
      return style
    }
  }
}
</script>
