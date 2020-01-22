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
import { APP } from '../../sub/constant/config.js'
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
      return [...APP.EXB.SENSOR, ...APP.SENSOR.TX_SENSOR].filter(e => [SENSOR.PIR, SENSOR.THERMOPILE, SENSOR.PRESSURE, SENSOR.MAGNET].includes(e))
    },
  },
}
</script>

<style scoped lang="scss">
</style>
