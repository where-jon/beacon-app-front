<template>
  <div>
    <breadcrumb :items="items" :extra-nav-spec="extraNavSpec"
                :reload="reload" :short-name="shortName" reload-emit-name="allFetch"
    />
    <b-row class="mt-2 ml-3">
      <b-form inline class="mt-2" @submit.prevent>
        <label v-t="'label.positionStackType'" class="mr-2" />
        <b-form-select v-model="positionType" :options="positionTypeOptions" />
      </b-form>
    </b-row>
    <position-class v-show="isShow('area')" ref="areaPosition" class-name="area" />
    <position-class v-show="isShow('zone')" ref="zonePosition" class-name="zone" />
  </div>
</template>

<script>
import breadcrumb from '../../components/layout/breadcrumb.vue'
import positionClass from '../../components/page/position-class.vue'
import * as ViewHelper from '../../sub/helper/ViewHelper'
import { EventBus } from '../../sub/helper/EventHelper'
import { EXTRA_NAV, POSITION_STACK_TYPES } from '../../sub/constant/Constants'

export default {
  components: {
    breadcrumb,
    positionClass,
  },
  data() {
    return {
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
