<template>
  <div id="mapContainer" class="container-fluid">
    <ex-map
      :p-caption-list="captionList"
      :p-show-exb-sensor-ids="exbSensors"
      :p-merge-sensor-ids="exbSensors"
      p-show-pir
    />
  </div>
</template>

<script>
import { SENSOR } from '../../sub/constant/Constants'
import { APP } from '../../sub/constant/config.js'
import exMap from '../../components/page/ex-map.vue'

export default {
  components: {
    exMap,
  },
  data() {
    return {
    }
  },
  computed: {
    captionList(){
      return ['main', 'pirMenu']
    },
    exbSensors(){
      return SENSOR.EXB_SENSORS
    },
  },
  methods: {
  },
}
</script>

<style scoped lang="scss">
</style>
