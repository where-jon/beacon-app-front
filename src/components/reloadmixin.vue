
<script>
import { EventBus } from '../sub/helper/EventHelper'
import commonmixinVue from './commonmixin.vue'

export default {
  mixins: [commonmixinVue],  
  created(){
    EventBus.$off('reload')
    EventBus.$on('reload', (payload)=>{
      this.fetchData(payload)
    })
  },
}
</script>
