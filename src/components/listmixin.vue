
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
      return entity.map((val) => ({entity: val, style: this.getStyleDisplay1(val)}))
    },
    getStyleDisplay1(val, reverceColor = false) {
      return {
        "color": Util.colorCd4display(reverceColor? val.bgColor: val.color),
        "background-color": Util.colorCd4display(reverceColor? val.color: val.bgColor, "#FFFFFF"),
        "text-align": "center",
        border: "solid 1px #ccc",
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
      }
    }
  }
}
</script>
