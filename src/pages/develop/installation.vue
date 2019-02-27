<template>
  <div>
    <position v-if="!modeRssi" :is-installation="true" @rssi="onModeRssi" />
    <rssimap v-else  @rssi="onModeRssi" />
  </div>
</template>

<script>
// import breadcrumb from '../../components/layout/breadcrumb.vue'
import position from '../main/position.vue'
import * as MenuHelper from '../../sub/helper/MenuHelper'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import rssimap from '../../components/parts/rssimap.vue'
import { APP } from '../../sub/constant/config'

export default {
  components: {
    position,
    rssimap,
    // breadcrumb,
  },
  mixins: [showmapmixin],
  data () {
    return {
      items: [
        {
          text: this.$i18n.tnl('label.develop'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.installation'),
          active: true
        },
      ],
      useGroup: MenuHelper.useMaster('group') && APP.TX_WITH_GROUP,
      useCategory: MenuHelper.useMaster('category') && APP.TX_WITH_CATEGORY,
      modeRssi: false,
    }
  },
  computed: {
  },
  methods: {
    onModeRssi(mode) {
      this.modeRssi = mode
    }
  },
}
</script>