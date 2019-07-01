<template>
  <div>
    <b-form inline @submit.prevent>
      <b-form-row>
        <b-form-group>
          <b-form-row class="mb-3">
            <label v-t="'label.area'" class="mr-2 mb-2" />
            <span :title="vueSelectTitle(vueSelected.area)">
              <v-select v-model="vueSelected.area" :options="areaOptions" :clearable="false" class="inputSelect vue-options" :style="vueSelectStyle">
                <template slot="selected-option" slot-scope="option">
                  {{ vueSelectCutOn(option, true) }}
                </template>
              </v-select>
            </span>
          </b-form-row>
        </b-form-group>
        <b-form-group>
          <b-form-row v-if="enableCategory" class="mb-3 mr-2">
            <label v-t="'label.category'" class="mr-2" />
            <span :title="vueSelectTitle(vueSelected.category)">
              <v-select v-model="vueSelected.category" :options="categoryOptions" class="inputSelect vue-options" :style="vueSelectStyle">
                <template slot="selected-option" slot-scope="option">
                  {{ vueSelectCutOn(option) }}
                </template>
              </v-select>
            </span>
          </b-form-row>
        </b-form-group>
        <b-form-group>
          <b-form-row v-if="enableGroup" class="mb-3 mr-2">
            <label v-t="'label.group'" class="mr-2" />
            <span :title="vueSelectTitle(vueSelected.group)">
              <v-select v-model="vueSelected.group" :options="groupOptions" class="inputSelect vue-options" :style="vueSelectStyle">
                <template slot="selected-option" slot-scope="option">
                  {{ vueSelectCutOn(option) }}
                </template>
              </v-select>
            </span>
          </b-form-row>
        </b-form-group>
        <b-form-group>
          <b-form-row v-if="enableIndividual" class="mb-3 mr-2">
            <label v-t="'label.individual'" class="mr-2" />
            <span :title="vueSelectTitle(vueSelected.pot)">
              <v-select v-model="vueSelected.pot" :options="potOptions" class="inputSelect vue-options" :style="vueSelectStyle">
                <template slot="selected-option" slot-scope="option">
                  {{ vueSelectCutOn(option) }}
                </template>
              </v-select>
            </span>
          </b-form-row>
        </b-form-group>
      </b-form-row>
    </b-form>
    <b-form inline @submit.prevent>
      <b-form-group class="mr-5">
        <b-form-row>
          <b-form-row class="mb-3 mr-2">
            <label v-t="'label.historyDateFrom'" class="mr-2" />
            <date-picker v-model="form.datetimeFrom" :clearable="false" type="datetime" class="mr-2 inputdatefrom" required @change="changeDatetimeFrom" />
          </b-form-row>
          <b-form-row class="mb-3 mr-2">
            <label v-t="'label.historyDateTo'" class="mr-2" />
            <date-picker v-model="form.datetimeTo" :clearable="false" type="datetime" class="mr-2 inputdateto" required />
          </b-form-row>
        </b-form-row>
      </b-form-group>
      <b-form-group>
        <b-form-row class="mb-3 mr-2">
          <b-button v-t="'label.display'" :variant="theme" @click="display" />
        </b-form-row>
      </b-form-group>
    </b-form>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import { APP } from '../../sub/constant/config'
import { CATEGORY } from '../../sub/constant/Constants'
import * as ArrayUtil from '../../sub/util/ArrayUtil'
import * as DateUtil from '../../sub/util/DateUtil'
import * as Util from '../../sub/util/Util'
import * as HttpHelper from '../../sub/helper/HttpHelper'
import * as MenuHelper from '../../sub/helper/MenuHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as ValidateHelper from '../../sub/helper/ValidateHelper'
import * as ViewHelper from '../../sub/helper/ViewHelper'
import * as VueSelectHelper from '../../sub/helper/VueSelectHelper'
import commonmixin from '../mixin/commonmixin.vue'

export default {
  components: {
    DatePicker,
  },
  mixins: [commonmixin],
  props: {
    fromHeatmap: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      form: {
        areaId: null,
        categoryId: null,
        groupId: null,
        potId: null,
        datetimeFrom: null,
        datetimeTo: null,
      },
      vueSelected: {
        area: null,
        category: null,
        group: null,
        pot: null,
      },
      appServicePath: '/core/positionHistory',
      areaOptions: [],
      potOptions: [],
      interval: 24 * 60 * 60 * 1000,
      intervalHours: 24,
    }
  },
  computed: {
    ...mapState('app_service', [
      'areas',
      'categories',
      'groups',
      'pots',
    ]),
    enableCategory () {
      return MenuHelper.isEnabledMenu('category') && ArrayUtil.includesIgnoreCase(APP.POT.WITH, 'category')
    },
    enableGroup () {
      return MenuHelper.isEnabledMenu('group') && ArrayUtil.includesIgnoreCase(APP.POT.WITH, 'group')
    },
    enableIndividual () {
      return !this.fromHeatmap || (this.fromHeatmap && APP.HEATMAP.USE_INDIVIDUAL)
    },
    requirePerson(){
      return !this.fromHeatmap
    }
  },
  watch: {
    'vueSelected.area': {
      handler: function(newVal, oldVal){
        this.form.areaId = Util.getValue(newVal, 'value', null)
        this.changeArea(this.form.areaId)
      },
      deep: true,
    },
    'vueSelected.category': {
      handler: function(newVal, oldVal){
        this.form.categoryId = Util.getValue(newVal, 'value', null)
        this.changeCategory()
      },
      deep: true,
    },
    'vueSelected.group': {
      handler: function(newVal, oldVal){
        this.form.groupId = Util.getValue(newVal, 'value', null)
        this.changeGroup()
      },
      deep: true,
    },
    'vueSelected.pot': {
      handler: function(newVal, oldVal){
        this.form.potId = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
  },
  async created() {
    await StateHelper.load('area')
    await StateHelper.load('category')
    await StateHelper.load('group')
    await StateHelper.load('pot')
    this.areaOptions = StateHelper.getOptionsFromState('area', false, true)
    this.changeCategory()
    this.changeGroup()
    this.vueSelected.area = VueSelectHelper.getVueSelectData(this.areaOptions, null, true)
    const date = new Date()
    this.form.datetimeFrom = DateUtil.getDatetime(date, {hours: -1})
    this.form.datetimeTo = DateUtil.getDatetime(date)
  },
  mounted() {
    ViewHelper.importElementUI()
  },
  methods: {
    updatePotOption(categoryId, groupId) {
      this.potOptions = StateHelper.getOptionsFromState('pot', false, true, 
        pot => pot.potType == CATEGORY.PERSON && (!categoryId || pot.categoryId == categoryId) && (!groupId || pot.groupId == groupId)
      )
    },
    changeCategory(newVal = this.form.categoryId) {
      this.updatePotOption(newVal, this.form.groupId)
      const targetPot = this.potOptions.find(val => val.value == this.form.potId)
      this.vueSelected.pot = VueSelectHelper.getVueSelectData(this.potOptions, targetPot? targetPot.value: null, false)
    },
    changeGroup(newVal = this.form.groupId) {
      this.updatePotOption(this.form.categoryId, newVal)
      const targetPot = this.potOptions.find(val => val.value == this.form.potId)
      this.vueSelected.pot = VueSelectHelper.getVueSelectData(this.potOptions, targetPot? targetPot.value: null, false)
    },
    changeArea(areaId) {
      this.$emit('changeArea', areaId)
    },
    changeDatetimeFrom(newVal = this.form.datetimeFrom) {
      if(newVal){
        this.form.datetimeTo = DateUtil.getDatetime(newVal, {minutes: APP.ANALYSIS.DATETIME_INTERVAL})
      }
      else{
        this.form.datetimeTo = null
      }
    },
    validate() {
      const errors = ValidateHelper.validateCheck([
        {type: 'require', names: ['area'], values: [this.form.areaId]},
        {type: 'require', 
          names: [this.enableCategory? 'category': null, this.enableGroup? 'group': null, this.requirePerson? 'individual': null].filter(val => val),
          values: [this.enableCategory? this.form.categoryId: null, this.enableGroup? this.form.groupId: null, this.requirePerson? this.form.potId: null].filter(val => val)},
        {type: 'require', names: ['historyDateFrom'], values: [this.form.datetimeFrom]},
        {type: 'require', names: ['historyDateFrom'], values: [this.form.datetimeTo]},
        this.form.datetimeFrom && this.form.datetimeTo? {type: 'asc', names: ['historyDateFrom'], values: [this.form.datetimeFrom.getTime(), this.form.datetimeTo.getTime()], equal: false}: null,
        this.form.datetimeFrom && this.form.datetimeTo? {type: 'less', names: ['historyDateFrom'], values: [this.form.datetimeFrom.getTime() * -1, this.form.datetimeTo.getTime()], base: this.interval, displayBase: this.intervalHours, equal: true}: null,
      ].filter(val => val && val.names.length >= 1))
      return ValidateHelper.formatValidateMessage(errors)
    },
    async display() {
      this.replace({showAlert: false})
      let errorMessage = this.validate()
      if (Util.hasValue(errorMessage)) {
        this.replace({showAlert: true})
        this.$emit('display', {form: this.form, results: [], errorMessage})
      } else {
        try {
          const form = this.form
          let reqParam = [
            this.appServicePath,
            form.areaId,
            form.categoryId ? form.categoryId : '0',
            form.groupId ? form.groupId : '0',
            form.potId ? form.potId : '0',
            form.datetimeFrom.getTime(),
            form.datetimeTo.getTime(),
          ].join('/')
          Util.debug(reqParam)
          const results = await HttpHelper.getAppService(reqParam)
          Util.debug(results)
          if(!results.length){
            this.replace({showAlert: true})
            errorMessage = this.$i18n.tnl('message.notFoundData', {target: this.fromHeatmap? this.$i18n.tnl('label.heatmapPosition'): this.$i18n.tnl('label.flowlineAnalysis')})
          }
          this.$emit('display', {form: this.form, results, errorMessage})
        } catch (e) {
          console.error(e)
        }
      }
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/vue.scss";
.inputSelect {
  min-width: 160px;
}
.inputdatefrom {
  width: 200px;
}
.inputdateto {
  width: 200px;
}
</style>
