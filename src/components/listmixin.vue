
<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import reloadmixinVue from './reloadmixin.vue'
import { SHAPE } from '../sub/constant/Constants'
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
        "border-radius": val.shape == SHAPE.CIRCLE? "50%": val.shape == SHAPE.ROUND_SQUARE? "10px": null,
      }))
    }
  }
}
</script>
