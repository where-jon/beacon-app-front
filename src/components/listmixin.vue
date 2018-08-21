
<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as AppServiceHelper from '../sub/helper/AppServiceHelper'
import { addLabelByKey } from '../sub/helper/ViewHelper'
import { EventBus } from '../sub/helper/EventHelper'
import * as MenuHelper from '../sub/helper/MenuHelper'

export default {
  created(){
    EventBus.$on('reload', (payload)=>{
       this.fetchData(payload)
    })
  },
  methods: {
    ...mapMutations([
      'replace', 
    ]),
    ...mapMutations('app_service', [
      'replaceAS', 
    ]),
  }
}
</script>
