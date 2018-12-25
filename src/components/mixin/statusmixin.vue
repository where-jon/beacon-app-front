
<script>
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
  }
}
</script>

<style scoped lang="scss">
</style>
