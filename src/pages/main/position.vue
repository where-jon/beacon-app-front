<template>
  <div id="mapContainer" class="container-fluid">
    <ex-map
      :p-caption-list="captionList"
      :p-show-tx-sensor-ids="txSensors"
      :p-merge-sensor-ids="mergeSensors"
      p-show-detail
      :p-show-meditag-list="showMeditagList"
      :p-show-detected="showDetected"
      :p-extra-nav-list="extraNav"
      :p-show-prohibit="showProhibit"
      :p-show-lost="showLost"
      p-show-absent
      :p-filter-list="filterList"
      :p-extra-filter-list="extraFilterList"
      :p-short-name="shortName"
      p-split-auto-reload
      :p-use-plugin-filter="useDetailFilter"
      :p-installation="isInstallation"
      :p-quantity="!isInstallation"
      @rssi="rssiFunc"
    />
  </div>
</template>

<script>
import { APP } from '../../sub/constant/config'
import { SENSOR, EXTRA_NAV } from '../../sub/constant/Constants'
import * as Util from '../../sub/util/Util'
import * as SensorHelper from '../../sub/helper/domain/SensorHelper'
import commonmixin from '../../components/mixin/commonmixin.vue'
import exMap from '../../components/page/ex-map.vue'

export default {
  components: {
    exMap,
  },
  mixins: [commonmixin],
  props: {
    isInstallation: {
      default: false,
      type: Boolean
    },
  },
  computed: {
    captionList(){
      return this.isInstallation ? ['monitor', 'installation']: ['main', 'showPosition']
    },
    txSensors(){
      return this.sensorOptionsTx.map(val => val.value)
    },
    mergeSensors(){// FIXME: あとでマージすればいいのでは
      return [SENSOR.MEDITAG, SENSOR.MAGNET]
    },
    showMeditagList(){
      return APP.SENSOR.USE_MEDITAG
    },
    filterList(){
      return [APP.POS.WITH.GROUP? 'group': null, APP.POS.WITH.CATEGORY? 'category': null].filter(val => val)
    },
    extraFilterList() {
      return ['freeWord']
    },
    shortName(){
      return 'showPositionShort'
    },
    extraNav(){
      return EXTRA_NAV
    },
    showDetected(){
      return APP.POS.SHOW_DETECTED_COUNT
    },
    showProhibit(){
      return Util.hasValue(APP.POS.PROHIBIT_ALERT)
    },
    showLost(){
      return Util.hasValue(APP.POS.LOST_ALERT)
    },
    rssiFunc(){
      return Util.getValue(this.$listeners, 'rssi', () => {})
    },
    useDetailFilter(){
      return APP.POS.PLUGIN.FILTER
    },
  },
  methods: {
    getLegendItems(vComponent){
      return SensorHelper.createTxLegends(vComponent.txs, vComponent.categories, vComponent.groups)
    },
  },
}
</script>

<style scoped lang="scss">
</style>
