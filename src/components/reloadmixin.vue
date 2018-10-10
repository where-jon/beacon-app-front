
<script>
import { EventBus } from '../sub/helper/EventHelper'

export default {
  created(){
    EventBus.$off('reload')
    EventBus.$on('reload', (payload)=>{
      this.fetchData(payload)
    })
  },
}
</script>
