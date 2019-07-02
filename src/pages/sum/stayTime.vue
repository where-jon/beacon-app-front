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
          <b-form-row class="mb-3 mr-1">
            <b-form-row class="mr-1">
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
      <b-form inline @submit.prevent>
        <b-form-group class="mr-4">
          <b-form-row class="mb-3 mr-1">
            <b-form-row class="mr-1">
              <span v-t="'label.sumUnitAxis'" class="d-flex align-items-center" />
            </b-form-row>
            <b-form-row>
              <b-form-select v-model="form.axis" :options="axisOptions" class="ml-2 inputSelect" required @change="changeAxis" />
            </b-form-row>
          </b-form-row>
        </b-form-group>
        <b-form-group>
          <b-form-row class="mb-3">
            <b-form-row class="mr-1">
              <span v-t="'label.sumUnitStack'" class="d-flex align-items-center" />
            </b-form-row>
            <b-form-row>
              <b-form-select v-model="form.stack" :options="stackOptions" class="ml-2 inputSelect" required @change="changeStack" />
            </b-form-row>
          </b-form-row>
        </b-form-group>
      </b-form>
      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row class="mb-3">
            <b-button v-t="'label.display'" type="submit" :variant="theme" @click="display" />
            <b-button v-if="!iosOrAndroid" v-t="'label.download'" :variant="theme" :disabled="!chartData || chartData.length == 0" class="ml-2" @click="download" />
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
import { mapState } from 'vuex'
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import { APP, DISP } from '../../sub/constant/config'
import { SUM_UNIT_STACK, SUM_UNIT_AXIS, SUM_FILTER_KIND } from '../../sub/constant/Constants'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as DateUtil from '../../sub/util/DateUtil'
import * as Util from '../../sub/util/Util'
import { getCharSet } from '../../sub/helper/CharSetHelper'
import * as ChartHelper from '../../sub/helper/ChartHelper'
import * as HttpHelper from '../../sub/helper/HttpHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as ValidateHelper from '../../sub/helper/ValidateHelper'
import * as ViewHelper from '../../sub/helper/ViewHelper'
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
      items: ViewHelper.createBreadCrumbItems('sumTitle', 'stayTime'),
      form: {
        datetimeFrom: '2019-02-11',
        datetimeTo: '2019-02-22',
        filterKind: null,
        filterId: null,
        stack: 'area',
        axis: 'day',
      },
      vueSelectedKeys: ['pot', 'category', 'group', 'area', 'zone', 'zoneCategory'],
      vueSelected: {
        filter: null,
      },
      message: '',
      filterIdOptions: [],
      filterKindOptions: SUM_FILTER_KIND.getOptions(),
      stackOptions: SUM_UNIT_STACK.getOptions(),
      axisOptions: SUM_UNIT_AXIS.getOptions(),
      chartData: [],
      axises: [],
      stacks: [],
      showChart: true,
    }
  },
  computed: {
    ...mapState('app_service', [
      'pots',
      'areas',
      'zones',
      'categories',
      'groups',
    ]),
    ...mapState([
      'showAlert',
    ]),
    iosOrAndroid() {
      return BrowserUtil.isAndroidOrIOS()
    },
  },
  watch: {
    'vueSelected.filter': {
      handler: function(newVal, oldVal){
        this.form.filterId = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
  },
  async created() {
    await StateHelper.load('pot')
    await StateHelper.load('area')
    await StateHelper.load('zone')
    await StateHelper.load('category')
    await StateHelper.load('group')
    const date = new Date()
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
      switch (newVal) {
      case 'potType':
        this.filterIdOptions = this.potTypeOptions()
        break
      case 'pot':
        this.filterIdOptions = this.pots.map(e => ({value: e.potId, label: e.potName}))
        break
      case 'group':
        this.filterIdOptions = this.groups.map(e => ({value: e.groupId, label: e.groupName}))
        break
      case 'category':
        this.filterIdOptions = this.categories.filter(e => e.categoryType == 1 || e.categoryType == 2).map(e => ({value: e.categoryId, label: e.categoryName}))
        break
      case 'area':
        this.filterIdOptions = this.areas.map(e => ({value: e.areaId, label: e.areaName}))
        break
      case 'zone':
        this.filterIdOptions = this.zones.map(e => ({value: e.zoneId,label: e.zoneName}))
        break
      case 'zoneCategory':
        this.filterIdOptions = this.categories.filter(e => e.categoryType == 3).map(e => ({value: e.categoryId, label: e.categoryName}))
        break
      default:
        this.filterIdOptions = []
        break
      }
    },
    potTypeOptions() {
      return [
        {value:1, text: this.$i18n.t('label.person')},
        {value:2, text: this.$i18n.t('label.thing')}
      ]
    },
    changeAxis(newVal) {
      this.form.axis = newVal
      if (this.form.axis == this.form.stack) { // 軸と積上げは同じにしない
        this.form.stack = null
      }
    },
    changeStack(newVal) {
      this.form.stack = newVal
      if (this.form.axis == this.form.stack) { // 軸と積上げは同じにしない
        this.form.axis = null
      }
    },
    validate() {
      const errors = ValidateHelper.validateCheck([
        {type: 'require', names: ['historyDateFrom'], values: [this.form.datetimeFrom]},
        {type: 'require', names: ['historyDateFrom'], values: [this.form.datetimeTo]},
        {type: 'require', names: ['sumUnitAxis'], values: [this.form.axis]},
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
      param.fillGap = APP.STAY_SUM.AXIS_FILL_GAP
      const url = '/office/stayTime/sum?_=' + new Date().getTime() + '&' +  HttpHelper.toParam(param, true)
      const sumData = await HttpHelper.getAppService(url)
      Util.debug(sumData)
      if (_.isEmpty(sumData)) {
        this.message = this.$i18n.t('message.listEmpty')
        this.replace({showAlert: true})
        this.hideProgress()
        return
      }

      // show Chart
      let err = this.showStayTimeChart(sumData)
      if (err) {
        this.message = this.$i18n.t('message.' + err)
        this.replace({showAlert: true})
        this.hideProgress()
      }
    },
    showStayTimeChart(sumData) {
      // convert data for chart
      sumData.forEach((e) => {
        if (e.stackId == null) {
          e.stackId = -1
        }
        if (e.stack == null) {
          e.stack = this.$i18n.t('label.other')
        }
        if (e.axisId == null) {
          e.axisId = -1
        }
        if (e.axis == null) {
          e.axis = this.$i18n.t('label.other')
        }
      })

      const axisIds = _(sumData).map((e) => e.axisId).uniqWith(_.isEqual).value()
      if (axisIds.length > 200) { // 横軸が200件を超える場合エラーに
        return 'sumTooManyResults'
      }
      const maxPeriod = Math.max(...axisIds.map((axisId) => _.sumBy(sumData.filter((e) => e.axisId == axisId), (e) => e.period)))
      if (maxPeriod == 0) { // 最大の滞在時間が0の場合エラーに
        return 'listEmpty'
      }

      // 積上の凡例の数が指定色数より多い場合、全体の合計が上位指定色数-1まで表示し、ほかはすべてその他に加算して表示する
      let stackIds = _(sumData).map((e) => e.stackId).uniqWith(_.isEqual).value()
      if (stackIds.length > DISP.SUM_STACK_COLOR.length) {
        sumData = this.reduceToOther(stackIds, sumData, axisIds)
      }

      stackIds = _(sumData).sortBy((e) => e.stack).map((e) => e.stackId).uniqWith(_.isEqual).value() // 積上凡例を名前順にソート
      if (stackIds && stackIds[0] == -1) {
        stackIds.shift()
        stackIds.push(-1)
      }

      const stacks = stackIds.map((stackId) => sumData.find((e) => e.stackId == stackId).stack)
      const axises = axisIds.map((axisId) => sumData.find((e) => e.axisId == axisId).axis)

      // 棒グラフの最大値に合わせて目盛を秒・分・時で計算
      let yLabel = 'unitSecond'
      let div = 1
      if (maxPeriod > APP.STAY_SUM.UNIT_HOUR) {
        yLabel = 'unitHour'
        div = 60 * 60
      }
      else if (maxPeriod > APP.STAY_SUM.UNIT_MINUTE) {
        yLabel = 'unitMinute'
        div = 60
      }
      const yLabelString = this.$i18n.t('label.' + yLabel)

      // チャート用のデータを作成　縦軸ｘ横軸の２次元配列で作成
      const chartData = new Array(stackIds.length)
      for(let y = 0; y < chartData.length; y++) {
        chartData[y] = new Array(axisIds.length).fill(0)
      }
      this.chartData = _.cloneDeep(chartData) // for DL
      sumData.forEach((e) => {
        let axisIdx = _.findIndex(axisIds, (axisId) => axisId == e.axisId)
        let stackIdx = _.findIndex(stackIds, (stackId) => stackId == e.stackId)
        chartData[stackIdx][axisIdx] = Math.floor(e.period / div * 100) / 100
        this.chartData[stackIdx][axisIdx] = e.period // DL用は秒で保存
      })

      // show chart
      this.showChart = true
      const parent = document.getElementById('stayTimeChart').parentElement
      const canvas = this.$refs.stayTimeChart
      canvas.width = parent.clientWidth
      if (BrowserUtil.isAndroidOrIOS()) {
        canvas.height = 250
      }
      else {
        canvas.height = document.documentElement.clientHeight - parent.offsetTop - 80
      }
      this.$nextTick(() => {
        ChartHelper.showBarChart('stayTimeChart', axises, stacks, chartData, yLabelString)
        this.hideProgress()
      })

      // for csv dl
      this.axises = axises
      this.stacks = stacks
    },
    reduceToOther(stackIds, sumData, axisIds) {
      // 積上単位の全体の合計を出し、多い順に並べる
      const sortedStacks = _(stackIds.map((stackId) => ({stackId, sum:_.sumBy(sumData.filter((e) => e.stackId == stackId), (e) => e.period)}))).sortBy((e) => e.sum * -1).value()
      const upperStacks = sortedStacks.filter((e) => e.stackId != -1).slice(0, DISP.SUM_STACK_COLOR.length - 1) // その他を除く配列を抽出
      // sumData.filter((e) => e.stackId == upperStacks[0].stackId).forEach((e) => e.stackId = -1) // for test

      axisIds.forEach((axisId) => { // 軸単位に処理する
        let period = 0
        sumData.filter((sum) => sum.axisId == axisId).forEach((sum) => {
          if (!_.some(upperStacks, (e) => e.stackId == sum.stackId) && sum.stackId != -1) { // 上位の積上に含まれない場合、その他に加算
            period += sum.period
            sum.stackId = null
          }
        })
        let other = sumData.find((sum) => sum.axisId == axisId && sum.stackId == -1)
        if (other) {
          other.period += period
        }
        else { // その他がない場合はその他を作成
          sumData.push({axisId, axis:sumData.find((e) => e.axisId == axisId).axis, stackId: -1, stack: this.$i18n.t('label.other'), period})
        }
      })

      return sumData.filter((sum) => sum.stackId) // 集計データから先にstackId=nullをセットしたものを除去
    },
    async download(){
      if (this.chartData == null || this.chartData.length == 0) {
        this.message = this.$i18n.tnl('message.notFound')
        this.replace({showAlert: true})
        return
      }
      const rows = []
      rows.push('"","' + this.axises.join('","') + '"')
      this.chartData.forEach((e, idx)=>{
        rows.push('"' + this.stacks[idx] + '",' + e.join(','))
      })
      BrowserUtil.fileDL(
        'stayTime.csv',
        rows.join('\n'),
        getCharSet(this.$store.state.loginId)
      )
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/input.scss";
@import "../../sub/constant/vue.scss";
</style>
