<template>
  <div>
    <position v-if="!modeRssi" :is-installation="true" @rssi="onModeRssi" />
    <rssimap v-else @rssi="onModeRssi" />
  </div>
</template>

<script>
import { APP } from '../../sub/constant/config'
import * as ArrayUtil from '../../sub/util/ArrayUtil'
import * as MenuHelper from '../../sub/helper/dataproc/MenuHelper'
import rssimap from '../../components/parts/rssimap.vue'
import position from '../main/position.vue'

export default {
  components: {
    position,
    rssimap,
  },
  data () {
    return {
      // useGroup: MenuHelper.useMaster('group') && ArrayUtil.includesIgnoreCase(APP.TX.WITH, 'group'),
      // useCategory: MenuHelper.useMaster('category') && ArrayUtil.includesIgnoreCase(APP.TX.WITH, 'category'),
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