
<script>
import { APP } from '../../sub/constant/config'
import commonmixinVue from './commonmixin.vue'
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
      return this.badgeClassPrefix + DetectStateHelper.getClass(this.getState(type, updatetime))
    },
    getStateLabel(type, updatetime) {
      return DetectStateHelper.getLabel(this.getState(type, updatetime))
    },
    getState(type, updatetime) {
      return DetectStateHelper.getState(type, updatetime) // 第一階層のupdatetimeを使用
    },
    getPositionPowerLevel(val) {
      if (val > APP.POWER_LEVEL_GOOD) {
        return 'good'
      }
      if (val > APP.POWER_LEVEL_WARN) {
        return 'warning'
      }
      if (val != null) {
        return 'poor'
      }
      return null
    },
    getPositionPowerLevelLabel(val) {
      const powerLevel = this.getPositionPowerLevel(val)
      if (powerLevel) {
        return this.$i18n.tnl('label.power-' + powerLevel)
      }
      return '-'
    },
    getPositionPowerLevelClass(val) {
      const LEVEL_CLASS_MAP = {good:'success', warning:'warning', poor:'danger'}
      const powerLevel = this.getPositionPowerLevel(val)
      if (powerLevel) {
        return this.badgeClassPrefix + LEVEL_CLASS_MAP[powerLevel]
      }
      return ''
    },
    getTelemetryPowerLevelClass(val, isPowerState = false) {
      const num = parseInt(val , 10)
      if (79 < num) {
        // return 'battery-full power-safe'
        return !isPowerState ? 'battery-full' : 'power-safe'
      }
      if (59 < num) {
        // return 'battery-three-quarters power-safe'
        return !isPowerState ? 'battery-three-quarters' : 'power-safe'
      }
      if (39 < num) {
        // return 'battery-half power-warning'
        return  !isPowerState ? 'battery-half' : 'power-warning'
      }
      if (19 < num) {
        // return 'battery-quarter power-empty'
        return  !isPowerState ? 'battery-quarter' : 'power-empty'
      }
      // return 'battery-empty power-empty'
      return  !isPowerState ? 'battery-empty' : 'power-empty'
    },
  }
}
</script>

<style scoped lang="scss">
</style>
