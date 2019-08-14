<template>
  <div class="container-fluid">
    <breadcrumb :items="items" :extra-nav-spec="extraNavSpec"
                :reload="reload" :short-name="shortName" reload-emit-name="allFetch"
    />
    <b-alert v-model="alertData.isAlert" variant="danger" :style="alertStyle()" dismissible>
      {{ alertData.message }}
    </b-alert>
    <b-row class="mt-2 ml-3">
      <b-form inline class="mt-2" @submit.prevent>
        <label v-t="'label.positionStackType'" class="mr-2" />
        <b-form-select v-model="positionType" :options="positionTypeOptions" />
      </b-form>
    </b-row>
    <position-display v-show="isShow('area')" ref="areaPosition" master-name="area" :alert-data="alertData" />
    <position-display v-show="isShow('zone')" ref="zonePosition" master-name="zone" :alert-data="alertData" />
  </div>
</template>

<script>
import { EXTRA_NAV, POSITION_STACK_TYPES } from '../../sub/constant/Constants'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import reloadmixin from '../../components/mixin/reloadmixin.vue'
import positionDisplay from '../../components/page/position-display.vue'
import { DISP } from '../../sub/constant/config'

export default {
  components: {
    breadcrumb,
    positionDisplay,
  },
  mixins: [reloadmixin],
  data() {
    return {
      fix: DISP.THERMOH.ALERT_FIX_HEIGHT,
      items: ViewHelper.createBreadCrumbItems('main', 'positionStack'),
      extraNavSpec: EXTRA_NAV,
      shortName: this.$i18n.t('label.positionStackShort'),
      reload: true,
      alertData: { message: null, isAlert:false},
      styles: [],
      positionType: POSITION_STACK_TYPES.AREA,
    }
  },
  computed: {
    positionTypeOptions(){
      return POSITION_STACK_TYPES.getTypes()
    },
    fixAlert(){
      return this.fix > 0
    },
  },
  methods: {
    isShow(type){
      return this.positionType == POSITION_STACK_TYPES[type.toUpperCase()]
    },
    alertStyle(){
      return  this.fixAlert ? {height: `${25 * (this.fix + 1)}px`, 'overflow-y': 'auto','font-weight': DISP.THERMOH.ALERT_WEIGHT}:{}
    },
    fetchData(payload){
      this.$refs.areaPosition.fetchData(payload)
      this.$refs.zonePosition.fetchData(payload)
    },
  },
}
</script>

<style scoped lang="scss">
</style>
