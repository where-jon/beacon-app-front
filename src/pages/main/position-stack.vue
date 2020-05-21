<template>
  <div class="container-fluid" @click="resetDetail">
    <breadcrumb ref="breadcrumb" :items="breadCrumbs" :extra-nav-spec="extraNavSpec"
                :reload="reload" :short-name="shortName" reload-emit-name="allFetch"
    />
    <alert v-model="alertData.isAlert" :message="alertData.message" :fix="fixHeight" :prohibit="alertData.isAlert" :prohibit-view="isProhibitView" :alert-style="alertStyle" />
    <b-row class="mt-2 ml-3">
      <b-form inline class="mt-2" @submit.prevent>
        <!--
        -->
        <b-form-row class="my-1 ml-2 ml-sm-0">
          <label class="mr-2 mt-1">
            {{ $t('label.positionStackType') }}
          </label>
          <span :title="vueSelectTitle(positionType)">
            <v-select v-model="positionType" :options="positionTypeOptions" :clearable="false" class="ml-1 mr-2 vue-options" :style="vueSelectStyle">
            </v-select>
          </span>
        </b-form-row>
        <!--
        -->
        <b-form-row v-if="positionType.value == 2" class="my-1 ml-2 ml-sm-0">
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
    <position-display ref="positionDisp" :master-name="masterName" :alert-data="alertData" :form="form"/>
  </div>
</template>

<script>
import { EXTRA_NAV, POSITION_STACK_TYPES } from '../../sub/constant/Constants'
import * as Util from '../../sub/util/Util'
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
      breadCrumbs: ViewHelper.createBreadCrumbItems('main', 'positionStack'),
      extraNavSpec: EXTRA_NAV,
      shortName: this.$i18n.t('label.positionStackShort'),
      reload: true,
      alertData: { message: null, isAlert:false},
      form: null,
      vueSelected: {
        zoneCategory: null,
      },
      styles: [],
      positionTypeOptions: POSITION_STACK_TYPES.getTypes(),
      positionType: null,
      masterName: 'area',
    }
  },
  computed: {
    alertStyle(){
      return {
        'font-weight': DISP.THERMOH.ALERT_WEIGHT,
      }
    },
    fixAlert(){
      return this.fix > 0
    },
  },
  watch: {
    'vueSelected.zoneCategory': {
      handler: function(newVal, oldVal){
        this.form.zoneCategory = Util.getValue(newVal, 'value')
      },
      deep: true,
    },
    positionType: {
      handler: function(newVal, oldVal){
        if (oldVal == null || newVal.value == oldVal.value) {
          return
        }
        if (newVal.value == POSITION_STACK_TYPES.ZONE) {
          this.masterName = 'zone'
          this.form = {
            zoneCategory: null,
          }
        } else {
          this.masterName = 'area'
          this.form = null
        }
        this.$refs.breadcrumb.clickReload()
      },
      deep: false,
    }
  },
  created() {
    this.positionType = this.positionTypeOptions.find(e => e.value == DISP.POS_STACK.TYPE)
  },
  methods: {
    resetDetail() {
      this.$refs.positionDisp.resetDetail()
    },
  },
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/vue.scss";
</style>
