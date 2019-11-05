<template>
  <div id="mapContainer" class="container-fluid">
    <ex-map
      :p-caption-list="captionList"
      :p-show-exb-sensor-ids="exbSensors"
      :p-merge-sensor-ids="mergeSensors"
    />
  </div>
</template>

<script>
import { SENSOR } from '../../sub/constant/Constants'
import exMap from '../../components/page/ex-map.vue'

export default {
  components: {
    exMap,
  },
  computed: {
    captionList(){
      return ['main', 'pirMenu']
    },
    exbSensors(){
      return [SENSOR.PIR, SENSOR.THERMOPILE, SENSOR.PRESSURE, SENSOR.MAGNET]
    },
    mergeSensors(){
      return [SENSOR.PIR, SENSOR.THERMOPILE, SENSOR.PRESSURE, SENSOR.MAGNET]
    },
  },
}
</script>

<style scoped lang="scss">
</style>
