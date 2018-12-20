
<script>
import { EventBus } from '../../sub/helper/EventHelper'
import commonmixinVue from './commonmixin.vue'
import * as Util from '../../sub/util/Util'

export default {
  mixins: [commonmixinVue],
  computed: {
    iosOrAndroid() {
      return Util.isAndroidOrIOS()
    },
  },  
  created(){
    EventBus.$off('reload')
    EventBus.$on('reload', (payload)=>{
      this.fetchData(payload)
    })
  }
}
</script>
