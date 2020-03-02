<template>
  <div class="container-fluid">
    <breadcrumb :items="items" :extra-nav-spec="extraNavSpec"
                :reload="reload" :short-name="shortName" reload-emit-name="allFetch"
    />
    <alert v-model="alertData.isAlert" :message="alertData.message" :fix="fixHeight" :prohibit="alertData.isAlert" :prohibit-view="isProhibitView" :alert-style="alertStyle" />
    <b-row class="mt-2 ml-3">
      <b-form inline class="mt-2" @submit.prevent>
        <!--
        -->
        <b-form-row class="my-1 ml-2 ml-sm-0">
          <label v-t="'label.positionStackType'" class="mr-2 mt-1" />
          <span>
            <b-form-select v-model="positionType" :options="positionTypeOptions" />
          </span>
        </b-form-row>
        <!--
        -->
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
import * as MasterHelper from '../../sub/helper/domain/MasterHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import reloadmixin from '../../components/mixin/reloadmixin.vue'
import positionDisplay from '../../components/page/position-display.vue'
import { DISP } from '../../sub/constant/config'
import alert from '../../components/parts/alert.vue'

export default {
  components: {
    breadcrumb,
    positionDisplay,
    alert,
  },
  mixins: [reloadmixin],
  data() {
    return {
      fixHeight: DISP.THERMOH.ALERT_FIX_HEIGHT,
      isProhibitView:true,
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
      positionType: DISP.POS_STACK.TYPE,
    }
  },
  computed: {
    alertStyle(){
      return {
        'font-weight': DISP.THERMOH.ALERT_WEIGHT,
      }
    },
    positionTypeOptions(){
      return POSITION_STACK_TYPES.getTypes()
    },
    fixAlert(){
      return this.fix > 0
    },
    zoneCategoryOptions() {
      return MasterHelper.getOptionsFromState('category',
        category => MasterHelper.getDispCategoryName(category),
        true, 
        category => CATEGORY.ZONE_AVAILABLE.includes(category.categoryType)
      )
    },
  },
  watch: {
    'vueSelected.zoneCategory': {
      handler: function(newVal, oldVal){
        this.form.zoneCategory = Util.getValue(newVal, 'value')
      },
      deep: true,
    },
  },
  async mounted() {
  },
  methods: {
    isShow(type){
      return this.positionType == POSITION_STACK_TYPES[type.toUpperCase()]
    },
    fetchData(payload){
      // this.$refs.areaPosition.fetchData(payload)
      // this.$refs.zonePosition.fetchData(payload)
    },
  },
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/vue.scss";
</style>
