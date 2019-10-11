<template>
  <div id="mapContainer" class="container-fluid">
    <ex-map
      :p-caption-list="captionList"
      :p-show-tx-sensor-ids="txSensors"
      :p-show-exb-sensor-ids="exbSensors"
      :p-merge-sensor-ids="mergeSensors"
      :p-changeable-heatmap="showHeatmap"
      :p-show-heatmap="showHeatmap"
      p-thermoh-warn
      p-only-fix-tx
      p-disabled-filter
    />
  </div>
</template>

<script>
import { APP, DISP } from '../../sub/constant/config'
import { SENSOR } from '../../sub/constant/Constants'
import * as SensorHelper from '../../sub/helper/domain/SensorHelper'
import exMap from '../../components/page/ex-map.vue'

export default {
  components: {
    exMap,
  },
  computed: {
    captionList(){
      return ['main', 'thermohumidity']
    },
    txSensors(){
      return [SENSOR.TEMPERATURE]
    },
    exbSensors(){
      return [SENSOR.TEMPERATURE]
    },
    mergeSensors(){
      return [SENSOR.TEMPERATURE]
    },
    showHeatmap(){
      return APP.SENSOR.USE_THERMOH_HEATMAP
    },
  },
  methods: {
    getLegendItems(vComponent){
      return SensorHelper.createThermoLegends()
    },
  },
}
</script>

<style scoped lang="scss">
</style>
