
<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as Util from '../sub/util/Util'

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
  }
}
</script>
