
<script>
import { mapMutations, mapActions } from 'vuex'
import * as Util from '../../sub/util/Util'
import * as StateHelper from '../../sub/helper/StateHelper'
import { getButtonTheme } from '../../sub/helper/ThemeHelper'

export default {
  computed: {
    groupOptions() {
      return StateHelper.getOptionsFromState('group')
    },
  },
  methods: {
    ...mapMutations('app_service', [
      'replaceAS', 
      'clear', 
    ]),
    ...mapMutations([
      'replace', 
    ]),
    ...mapActions([
      'showErrorModal'
    ]),
    ...mapMutations('main', [
      'replaceMain', 
    ]),
    ...mapMutations('setting', [
      'replaceSetting', 
    ]),
    ...mapActions([
      'showProgress',
      'hideProgress',
    ]),
    getSensorId(exb) {
      return Util.getValue(exb, 'exbSensorList.0.sensor.sensorId').val
    },
    getButtonTheme() {
      return 'outline-' + getButtonTheme()
    },
    isEnabledMenu (key) {
      for(let group of this.$store.state.menu){
        for(let page of group.pages){
          if(page.key == key){
            return true
          }
        }
      }
      return false
    }
  }
}
</script>
