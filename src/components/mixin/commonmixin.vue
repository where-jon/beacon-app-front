
<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as Util from '../../sub/util/Util'
import { getButtonTheme } from '../../sub/helper/ThemeHelper'

export default {
  methods: {
    ...mapMutations('app_service', [
      'replaceAS', 
      'clear', 
    ]),
    ...mapMutations([
      'replace', 
    ]),
    ...mapMutations('main', [
      'replaceMain', 
    ]),
    ...mapMutations('monitor', [
      'replaceMonitor', 
    ]),
    ...mapMutations('setting', [
      'replaceSetting', 
    ]),
    getSensorId(exb) {
      return Util.getValue(exb, 'exbSensorList.0.sensor.sensorId').val
    },
    getButtonTheme() {
      const storeTheme = this.$store.state.setting.theme
      return 'outline-' + getButtonTheme(this.$store.state.loginId)
    },
  }
}
</script>
