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
            <b-form-row class="ml-1">
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
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import { getTheme } from '../../sub/helper/ThemeHelper'
import * as HttpHelper from '../../sub/helper/HttpHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as ViewHelper from '../../sub/helper/ViewHelper'
import { SUM_UNIT_STACK, SUM_UNIT_AXIS, SUM_FILTER_KIND } from '../../sub/constant/Constants'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import alert from '../../components/parts/alert.vue'
import { APP } from '../../sub/constant/config'
import { getCharSet } from '../../sub/helper/CharSetHelper'
import * as ChartHelper from '../../sub/helper/ChartHelper'
// import * as mock from '../../assets/mock/mock'
import validatemixin from '../../components/mixin/validatemixin.vue'
import commonmixinVue from '../../components/mixin/commonmixin.vue'

export default {
  components: {
    breadcrumb,
    alert,
    DatePicker,
  },
  mixins: [validatemixin, commonmixinVue],
  data () {
    return {
      form: {
        datetimeFrom: '2019-02-11',
        datetimeTo: '2019-02-22',
        filterKind: null,
        filterId: null,
        stack: 'area',
        axis: 'day',
      },
      items: ViewHelper.createBreadCrumbItems('sumTitle', 'stayTime'),
      filterIdOptions: [],
      filterKindOptions: SUM_FILTER_KIND.getOptions(),
      stackOptions: SUM_UNIT_STACK.getOptions(),
      axisOptions: SUM_UNIT_AXIS.getOptions(),
      chartData: [],
      axises: [],
      stacks: [],
      message: '',
      showChart: true,
    }
  },
  computed: {
    theme () {
      return 'outline-' + getTheme()
    },
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
      return Util.isAndroidOrIOS()
    },
  },
  async created() {
    await StateHelper.load('pot')
    await StateHelper.load('area')
    await StateHelper.load('zone')
    await StateHelper.load('category')
    await StateHelper.load('group')
    const date = new Date()
    this.form.datetimeFrom = Util.getDatetime(date, {date: -3})
    this.form.datetimeTo = Util.getDatetime(date)
  },
  async mounted() {
    HtmlUtil.importElementUI()
  },
  methods: {
    changefilterKind(newVal = this.form.filterKind){
      this.form.filterKind = newVal
      switch (newVal) {
      case 'potType':
        this.filterIdOptions = this.potTypeOptions()
        break
      case 'pot':
        this.filterIdOptions = this.pots.map((e) => ({value: e.potId, text: e.potName}))
        break
      case 'group':
        this.filterIdOptions = this.groups.map((e) => ({value: e.groupId, text: e.groupName}))
        break
      case 'category':
        this.filterIdOptions = this.categories.filter((e) => e.categoryType == 1 || e.categoryType == 2).map((e) => ({value: e.categoryId, text: e.categoryName}))
        break
      case 'area':
        this.filterIdOptions = this.areas.map((e) => ({value: e.areaId, text: e.areaName}))
        break
      case 'zone':
        this.filterIdOptions = this.zones.map((e) => ({value: e.zoneId, text: e.zoneName}))
        break
      case 'zoneCategory':
        this.filterIdOptions = this.categories.filter((e) => e.categoryType == 3).map((e) => ({value: e.categoryId, text: e.categoryName}))
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
      const errors = this.validateCheck([
        {type: 'require', names: ['historyDateFrom'], values: [this.form.datetimeFrom]},
        {type: 'require', names: ['historyDateFrom'], values: [this.form.datetimeTo]},
        {type: 'require', names: ['sumUnitAxis'], values: [this.form.axis]},
        {type: 'require', names: ['sumUnitStack'], values: [this.form.stack]},
        this.form.datetimeFrom && this.form.datetimeTo? {type: 'asc', names: ['historyDateFrom'], values: [new Date(this.form.datetimeFrom).getTime(), new Date(this.form.datetimeTo).getTime()], equal: false}: null,
      ].filter((val) => val && val.names.length >= 1))
      return this.formatValidateMessage(errors)
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
      param.fillGap = APP.SUM_AXIS_FILL_GAP
      const url = '/office/stayTime/sum?_=' + new Date().getTime() + '&' +  HttpHelper.toParam(param, true)
      const sumData = await HttpHelper.getAppService(url)
      console.log(sumData)
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
      const axises = axisIds.map((axisId) => sumData.find((e) => e.axisId == axisId).axis)
      let stackIds = _(sumData).sortBy((e) => e.stack).map((e) => e.stackId).uniqWith(_.isEqual).value()
      if (stackIds && stackIds[0] == -1) {
        stackIds.shift()
        stackIds.push(-1)
      }
      const stacks = stackIds.map((stackId) => sumData.find((e) => e.stackId == stackId).stack)

      // 棒グラフの最大値に合わせて目盛を秒・分・時で計算
      const maxPeriod = Math.max(...axisIds.map((axisId) => _.sumBy(sumData.filter((e) => e.axisId == axisId), (e) => e.period)))
      if (maxPeriod == 0) {
        return 'listEmpty'
      }
      let yLabel = 'unitSecond'
      let div = 1
      if (maxPeriod > APP.SUM_UNIT_HOUR) {
        yLabel = 'unitHour'
        div = 60 * 60
      }
      else if (maxPeriod > APP.SUM_UNIT_MINUTE) {
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

      console.log({axisIds, axises, stackIds, stacks, chartData})

      // show chart
      this.showChart = true
      const parent = document.getElementById('stayTimeChart').parentElement
      const canvas = this.$refs.stayTimeChart
      canvas.width = parent.clientWidth
      if (Util.isAndroidOrIOS()) {
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
      HtmlUtil.fileDL(
        'stayTime.csv',
        rows.join('\n'),
        getCharSet(this.$store.state.loginId)
      )
    }
  }
}
</script>

<style scoped lang="scss">
.inputSelect {
  min-width: 160px;
}
.inputdatefrom {
  width: 210px;
}
.inputdateto {
  width: 210px;
}
</style>
