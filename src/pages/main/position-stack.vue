<template>
  <div class="container-fluid">
    <breadcrumb :items="items" :extra-nav-spec="extraNavSpec"
                :reload="reload" :short-name="shortName" reload-emit-name="allFetch"
    />
    <b-alert v-model="alertData.isAlert" variant="danger" dismissible>
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
import breadcrumb from '../../components/layout/breadcrumb.vue'
import positionDisplay from '../../components/page/position-display.vue'
import * as ViewHelper from '../../sub/helper/ViewHelper'
import { EventBus } from '../../sub/helper/EventHelper'
import { EXTRA_NAV, POSITION_STACK_TYPES } from '../../sub/constant/Constants'
import listmixin from '../../components/mixin/listmixin.vue'

export default {
  components: {
    breadcrumb,
    positionDisplay,
  },
  mixins: [listmixin],
  data() {
    return {
      alertData: { message: null, isAlert:false},
      reload: true,
      styles: [],
      items: ViewHelper.createBreadCrumbItems('main', 'positionStack'),
      shortName: this.$i18n.t('label.positionStackShort'),
      extraNavSpec: EXTRA_NAV,
      positionType: POSITION_STACK_TYPES.AREA,
    }
  },
  computed: {
    positionTypeOptions(){
      return POSITION_STACK_TYPES.getTypes()
    },
  },
  created(){
    EventBus.$off('allFetch')
    EventBus.$on('allFetch', (payload)=>{
      this.$refs.areaPosition.fetchData(payload)
      this.$refs.zonePosition.fetchData(payload)
    })
  },
  methods: {
    isShow(type){
      return this.positionType == POSITION_STACK_TYPES[type.toUpperCase()]
    },
  },
}
</script>

<style scoped lang="scss">
</style>
