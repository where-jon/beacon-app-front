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
        <b-form-row class="my-1 ml-2 ml-sm-0">
          <label v-t="'label.positionStackType'" class="mr-2 mt-1" />
          <span>
            <b-form-select v-model="positionType" :options="positionTypeOptions" />
          </span>
        </b-form-row>
        <b-form-row v-if="isShow('zone')" class="my-1 ml-2 ml-sm-0">
          <label v-t="'label.zoneCategory'" class="ml-sm-4 ml-2 mr-1 mt-1" />
          <span :title="vueSelectTitle(vueSelected.zoneCategory)">
            <v-select v-model="vueSelected.zoneCategory" :options="zoneCategoryOptions" class="ml-1 mr-2 vue-options" :style="vueSelectStyle">
              <template slot="selected-option" slot-scope="option">
                {{ vueSelectCutOn(option) }}
              </template>
              <template slot="no-options">
                {{ vueSelectNoMatchingOptions }}
              </template>
            </v-select>
          </span>
        </b-form-row>
      </b-form>
    </b-row>
    <position-display v-show="isShow('area')" ref="areaPosition" master-name="area" :alert-data="alertData" />
    <position-display v-show="isShow('zone')" ref="zonePosition" master-name="zone" :alert-data="alertData" :form="form" />
  </div>
</template>

<script>
import { EXTRA_NAV, POSITION_STACK_TYPES, CATEGORY } from '../../sub/constant/Constants'
import * as Util from '../../sub/util/Util'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
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
      form: {
        zoneCategory: null,
      },
      vueSelected: {
        zoneCategory: null,
      },
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
    zoneCategoryOptions() {
      return StateHelper.getOptionsFromState('category',
        category => StateHelper.getDispCategoryName(category),
        true, 
        category => CATEGORY.ZONE_AVAILABLE.includes(category.categoryType)
      )
    },
  },
  watch: {
    'vueSelected.zoneCategory': {
      handler: function(newVal, oldVal){
        this.form.zoneCategory = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
  },
  async mounted() {
    await StateHelper.load('category')
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
@import "../../sub/constant/vue.scss";
</style>
