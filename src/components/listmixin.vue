
<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import reloadmixinVue from './reloadmixin.vue'
import { SHAPE } from '../sub/constant/Constants'
import { DISP } from '../sub/constant/config.js'
import * as Util from '../sub/util/Util'

export default {
  mixins: [reloadmixinVue],
  methods: {
    getStyleDisplay(entity){
      return entity.map((val) => ({
        "color": Util.colorCd4display(val.color),
        "background-color": Util.colorCd4display(val.bgColor),
        "text-align": "center",
        border: `solid 3px ${Util.colorCd4display(val.bgColor)}`,
        "border-radius": val.shape == SHAPE.CIRCLE? "50%": val.shape == SHAPE.ROUND_SQUARE? DISP.ROUNDRECT_RADIUS + "px": null,
        "font-size": DISP.TX_FONT.split(" ")[0],
        "width": (DISP.TX_R * 2) + "px",
        "height": (DISP.TX_R * 2) + "px",
        "justify-content": "center",
        "display": "-ms-flexbox",
        "display": "-webkit-flex",
        "display": "flex",
        "-ms-flex-align": "center",
        "-webkit-box-align": "center",
        "align-items": "center",
        "justify-content": "center",
      }))
    }
  }
}
</script>
