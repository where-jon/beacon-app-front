
<script>
import commonmixinVue from './commonmixin.vue'
import * as DetectStateHelper from '../../sub/helper/DetectStateHelper'
import * as TelemetryHelper from '../../sub/helper/TelemetryHelper'

export default {
  mixins: [commonmixinVue],  
  data () {
    return {
      badgeClassPrefix: 'badge badge-pill badge-',
    }
  },
  methods: {
    getStateClass(type, updatetime) {
      return this.badgeClassPrefix + DetectStateHelper.getClass(DetectStateHelper.getStateFromDetail(type, updatetime))
    },
    getStateLabel(type, updatetime) {
      return DetectStateHelper.getLabel(DetectStateHelper.getStateFromDetail(type, updatetime))
    },
    getPositionPowerLevelLabel(val) {
      const powerLevel = TelemetryHelper.getPositionPowerLevel(val)
      if (powerLevel) {
        return this.$i18n.tnl('label.power-' + powerLevel)
      }
      return '-'
    },
    getPositionPowerLevelClass(val) {
      const LEVEL_CLASS_MAP = {good:'success', warning:'warning', poor:'danger'}
      const powerLevel = TelemetryHelper.getPositionPowerLevel(val)
      if (powerLevel) {
        return this.badgeClassPrefix + LEVEL_CLASS_MAP[powerLevel]
      }
      return ''
    },
  }
}
</script>

<style scoped lang="scss">
</style>
