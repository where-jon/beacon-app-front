<template>
  <div>
    <position v-if="!modeRssi" :is-installation="true" @rssi="onModeRssi" />
    <rssimap v-else @rssi="onModeRssi" />
  </div>
</template>

<script>
import rssimap from '../../components/parts/rssimap.vue'
import position from '../main/position.vue'

export default {
  components: {
    position,
    rssimap,
  },
  data () {
    return {
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