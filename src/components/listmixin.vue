
<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as AppServiceHelper from '../sub/helper/AppServiceHelper'
import { addLabelByKey } from '../sub/helper/ViewHelper'
import { EventBus } from '../sub/helper/EventHelper'
import * as MenuHelper from '../sub/helper/MenuHelper'
import reloadmixinVue from './reloadmixin.vue'

export default {
  mixins: [reloadmixinVue],
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
