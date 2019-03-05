<template>
  <div>
    <position v-if="!modeRssi" :is-installation="true" @rssi="onModeRssi" />
    <rssimap v-else  @rssi="onModeRssi" />
  </div>
</template>

<script>
import position from '../main/position.vue'
import * as MenuHelper from '../../sub/helper/MenuHelper'
import rssimap from '../../components/parts/rssimap.vue'
import { APP } from '../../sub/constant/config'

export default {
  components: {
    position,
    rssimap,
  },
  data () {
    return {
      useGroup: MenuHelper.useMaster('group') && APP.TX_WITH_GROUP,
      useCategory: MenuHelper.useMaster('category') && APP.TX_WITH_CATEGORY,
      modeRssi: false,
    }
  },
  methods: {
    onModeRssi(mode) {
      this.modeRssi = mode
    }
  },
}
</script>