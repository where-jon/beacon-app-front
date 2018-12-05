
<script>
import { EventBus } from '../../sub/helper/EventHelper'
import commonmixinVue from './commonmixin.vue'
import * as Util from '../../sub/util/Util'
import * as DetectStateHelper from '../../sub/helper/DetectStateHelper'

export default {
  mixins: [commonmixinVue],  
  data () {
    return {
      badgeClassPrefix: 'badge badge-pill badge-',
    }
  },
  methods: {
    isUndetect(type, updatetime) {
      return DetectStateHelper.isUndetect(this.getState(type, updatetime))
    },
    getStateClass(type, updatetime) {
      console.log(this.getState(type, updatetime), DetectStateHelper.getClass(this.getState(type, updatetime)))
      return this.badgeClassPrefix + DetectStateHelper.getClass(this.getState(type, updatetime))
    },
    getStateLabel(type, updatetime) {
      console.log(updatetime, this.getState(type, updatetime), DetectStateHelper.getLabel(this.getState(type, updatetime)))
      return DetectStateHelper.getLabel(this.getState(type, updatetime))
    },
    getState(type, updatetime) {
      return DetectStateHelper.getState(type, updatetime) // 第一階層のupdatetimeを使用
    },
  }
}
</script>

<style scoped lang="scss">
span.badge.badge-pill {
  color: white;
  font-size: 0.9rem;
}
</style>
