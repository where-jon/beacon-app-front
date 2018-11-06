
<script>
import { EventBus } from '../sub/helper/EventHelper'
import commonmixinVue from './commonmixin.vue'
import * as Util from '../sub/util/Util'

export default {
  mixins: [commonmixinVue],  
  created(){
    EventBus.$off('reload')
    EventBus.$on('reload', (payload)=>{
      this.fetchData(payload)
    })
  },
  computed: {
    ios() {
      return Util.isIos()
    },
  }
}
</script>
