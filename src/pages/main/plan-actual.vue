<template>
  <div id="mapContainer" class="container-fluid">
    <ex-map
      :p-caption-list="captionList"
      :p-show-tx-sensor-ids="txSensors"
      p-show-m-room-status
    />
  </div>
</template>

<script>
import { SENSOR } from '../../sub/constant/Constants'
import { APP } from '../../sub/constant/config.js'
import exMap from '../../components/page/ex-map.vue'
import { getTxOptions } from '../../sub/helper/dataproc/OptionHelper'
import { getStyleDisplay1 } from '../../sub/helper/ui/StyleHelper'
import { DISP } from '../../sub/constant/config'
import { SHAPE } from '../../sub/constant/Constants'
import commonmixin from '../../components/mixin/commonmixin.vue'

export default {
  components: {
    exMap,
  },
  mixins: [commonmixin],
  data() {
    return {
    }
  },
  computed: {
    captionList(){
      return ['main', 'planActual']
    },
    txSensors(){
      return this.sensorOptionsTx.map(val => val.value)
    },
  },
  methods: {
    getLegendItems(vComponent){
      const ret = [...Array(4).keys()].map(idx => {
        let name = ''
        let bgColor = ''
        switch (idx) {
        case 0:
          name = `${this.$t('label.planned')}・${this.$t('label.used')}`
          bgColor = DISP.PLAN.ACTUAL_IN_PLAN_BG_COLOR
          break
        case 1:
          name = `${this.$t('label.planned')}・${this.$t('label.noUse')}`
          bgColor = DISP.PLAN.NO_ACTUAL_IN_PLAN_BG_COLOR
          break
        case 2:
          name = `${this.$t('label.noPlan')}・${this.$t('label.used')}`
          bgColor = DISP.PLAN.ACTUAL_OUT_OF_PLAN_BG_COLOR
          break
        default:
          name = `${this.$t('label.noPlan')}・${this.$t('label.noUse')}`
          bgColor = DISP.PLAN.NO_ACTUAL_NO_PLAN_BG_COLOR
          break
        }
        const legendElement = {
          id: idx,
          name: name,
          color: '#ffffff',
          bgColor: bgColor,
          shape: SHAPE.SQUARE
        }
        return {
          id: idx,
          items: [
            { id: 1, text: 'A', style: getStyleDisplay1(legendElement) },
            { id: 2, text: legendElement.name, style: {} },
          ]
        }
      })
      return ret
    }
  },
}
</script>

<style scoped lang="scss">
</style>
