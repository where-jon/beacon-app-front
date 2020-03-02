<template>
  <div>
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <alert :message="message" />

      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row>
            <b-form-row class="mr-2 mb-3">
              <span v-t="'label.historyDateFrom'" class="d-flex align-items-center" />
              <date-picker v-model="form.datetimeFrom" :clearable="false" type="datetime" class="ml-2 inputdatefrom" required />
            </b-form-row>
            <b-form-row class="mb-3">
              <span v-t="'label.historyDateTo'" class="d-flex align-items-center" />
              <date-picker v-model="form.datetimeTo" :clearable="false" type="datetime" class="ml-2 inputdateto" required />
            </b-form-row>
          </b-form-row>
        </b-form-group>
      </b-form>
      <b-form inline @submit.prevent>
        <b-form-group class="mr-4">
          <b-form-row class="mb-3 mr-3">
            <b-form-row class="mr-3">
              <span v-t="'label.filter'" class="d-flex align-items-center" />
            </b-form-row>
            <b-form-row>
              <b-form-select v-model="form.filterKind" :options="filterKindOptions" class="ml-2 inputSelect" @change="changefilterKind" />
            </b-form-row>
            <b-form-row v-if="useVueSelect(form.filterKind)" class="ml-1">
              <span :title="vueSelectTitle(vueSelected.filter)">
                <v-select v-model="vueSelected.filter" :options="filterIdOptions" class="ml-2 inputSelect vue-options" :style="vueSelectStyle">
                  <template slot="selected-option" slot-scope="option">
                    {{ vueSelectCutOn(option) }}
                  </template>
                  <template slot="no-options">
                    {{ vueSelectNoMatchingOptions }}
                  </template>
                </v-select>
              </span>
            </b-form-row>
            <b-form-row v-else class="ml-1">
              <b-form-select v-model="form.filterId" :options="filterIdOptions" class="ml-2 inputSelect" />
            </b-form-row>
          </b-form-row>
        </b-form-group>
      </b-form>
      <b-row>
        <b-form inline @submit.prevent>
          <b-form-group>
            <b-form-row class="mb-3">
              <b-form-row class="ml-2">
                <span v-t="'label.grouping'" class="d-flex align-items-center" />
              </b-form-row>
              <b-form-row class="ml-2">
                <b-form-select v-model="form.stack" :options="stackOptions" class="ml-2 inputSelect" required @change="changeStack" />
              </b-form-row>
              <b-form-row class="ml-3">
                <span v-t="'label.target'" class="d-flex align-items-center" />
              </b-form-row>
              <b-form-row class="ml-2">
                <b-form-select v-model="form.target" :options="targetOptions" class="ml-2 inputSelect" required @change="changeTarget" />
              </b-form-row>
            </b-form-row>
          </b-form-group>
        </b-form>
      </b-row>
      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row class="mb-3">
            <b-button v-t="'label.display'" type="submit" :variant="theme" @click="display" />
            <b-button v-if="!iosOrAndroid && bulkReferenceable" v-t="'label.download'" :variant="theme" :disabled="!chartData || chartData.length == 0" class="ml-2" @click="download" />
          </b-form-row>
        </b-form-group>
      </b-form>
      <div>
        <canvas v-show="!showAlert && showChart" id="stayTimeChart" ref="stayTimeChart" />
      </div>
    </div>
  </div>
</template>

<script>
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import { PROXIMITY_STACK, PROXIMITY_FILTER_KIND, PROXIMITY_TARGET } from '../../sub/constant/Constants'
import * as DateUtil from '../../sub/util/DateUtil'
import * as Util from '../../sub/util/Util'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as MasterHelper from '../../sub/helper/domain/MasterHelper'
import * as ValidateHelper from '../../sub/helper/dataproc/ValidateHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import * as StayTimeHelper from '../../sub/helper/domain/StayTimeHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../../components/mixin/commonmixin.vue'
import alert from '../../components/parts/alert.vue'

export default {
  components: {
    DatePicker,
    breadcrumb,
    alert,
  },
  mixins: [commonmixin],
  data () {
    return {
      items: ViewHelper.createBreadCrumbItems('sumTitle', 'proximityGraph'),
      form: {
        datetimeFrom: '2019-02-11',
        datetimeTo: '2019-02-22',
        filterKind: null,
        filterId: null,
        stack: 'zone',
        axis: 'day',
        target: 'time',
      },
      vueSelectedKeys: ['pot', 'category', 'group', 'area', 'zone', 'zoneCategory'],
      vueSelected: {
        filter: null,
      },
      message: '',
      filterIdOptions: [],
      filterKindOptions: PROXIMITY_FILTER_KIND.getOptions(),
      stackOptions: PROXIMITY_STACK.getOptions(),
      targetOptions: PROXIMITY_TARGET.getOptions(),
      chartData: [],
      axises: [],
      stacks: [],
      showChart: true,
    }
  },
  watch: {
    'vueSelected.filter': {
      handler: function(newVal, oldVal){
        this.form.filterId = Util.getValue(newVal, 'value')
      },
      deep: true,
    },
  },
  async created() {
    const date = DateUtil.getDefaultDate()
    this.form.datetimeFrom = DateUtil.getDatetime(date, {date: -3})
    this.form.datetimeTo = DateUtil.getDatetime(date)
  },
  async mounted() {
    ViewHelper.importElementUI()
  },
  methods: {
    useVueSelect(key){
      return this.vueSelectedKeys.includes(key)
    },
    changefilterKind(newVal = this.form.filterKind){
      this.form.filterKind = newVal
      this.vueSelected.filter = null
      switch (newVal) { // TODO: common.mixinのOptionを使う
      case 'pot':
        this.filterIdOptions = this.pots.map(e => ({value: e.potId, label: e.potName}))
        break
      case 'area':
        this.filterIdOptions = this.areas.map(e => ({value: e.areaId, label: e.areaName}))
        break
      case 'group':
        this.filterIdOptions = this.groups.map(e => ({value: e.groupId, label: e.groupName}))
        break
      case 'category':
        this.filterIdOptions = this.categories.filter(e => e.categoryType == 1 || e.categoryType == 2).map(e => ({value: e.categoryId, label: e.categoryName}))
        break
      case 'zone':
        this.filterIdOptions = this.zones.map(e => ({value: e.zoneId,label: e.zoneName}))
        break
      case 'zoneCategory':
        this.filterIdOptions = this.categories.filter(e => e.categoryType == 3).map(e => ({value: e.categoryId, label: MasterHelper.getDispCategoryName(e)}))
        break
      default:
        this.filterIdOptions = []
        break
      }
    },
    changeStack(newVal) {
      this.form.stack = newVal
      if (this.form.axis == this.form.stack) { // 軸と積上げは同じにしない
        this.form.axis = null
      }
    },
    changeTarget(newVal) {
      this.form.target = newVal
    },
    validate() {
      const errors = ValidateHelper.validateCheck([
        {type: 'require', names: ['historyDateFrom'], values: [this.form.datetimeFrom]},
        {type: 'require', names: ['historyDateFrom'], values: [this.form.datetimeTo]},
        {type: 'require', names: ['sumUnitStack'], values: [this.form.stack]},
        this.form.datetimeFrom && this.form.datetimeTo? {type: 'asc', names: ['historyDateFrom'], values: [new Date(this.form.datetimeFrom).getTime(), new Date(this.form.datetimeTo).getTime()], equal: false}: null,
      ].filter((val) => val && val.names.length >= 1))
      return ValidateHelper.formatValidateMessage(errors)
    },
    async display() {
      this.replace({showAlert: false})
      this.showChart = false
      this.dataList = []

      // validation
      const errorMessage = this.validate()
      if (Util.hasValue(errorMessage)) {
        this.message = errorMessage
        this.replace({showAlert: true})
        return
      }

      // get from appService
      this.showProgress()
      const param = _.cloneDeep(this.form)
      param.datetimeFrom = new Date(param.datetimeFrom).getTime()
      param.datetimeTo = new Date(param.datetimeTo).getTime()
      const url = '/office/proximity/sum?_=' + new Date().getTime() + '&' +  HttpHelper.toParam(param, true)
      const sumData = await HttpHelper.getAppService(url)
      Util.debug(sumData)
      if (_.isEmpty(sumData)) {
        this.message = this.$i18n.t('message.listEmpty')
        this.replace({showAlert: true})
        this.hideProgress()
        return
      }

      const categoryMap = {}
      this.categories.forEach(c => categoryMap[c.categoryName] = MasterHelper.getDispCategoryName(c))
      sumData.forEach(data => {
        ['axis', 'stack'].forEach(column => {
          const catName = data[column]
          if(Util.hasValue(catName) && Util.hasValue(categoryMap[catName])) {
            data[column] = categoryMap[catName]
          }
        })
      })
      // show Chart
      const err = StayTimeHelper.showChart(this, sumData)
      if (err) {
        this.message = this.$i18n.t('message.' + err)
        this.replace({showAlert: true})
        this.hideProgress()
      }
    },
    async download(){
      StayTimeHelper.download(this, 'proximity.csv')
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/input.scss";
@import "../../sub/constant/vue.scss";
</style>
