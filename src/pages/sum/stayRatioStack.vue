<template>
  <div>
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <alert :message="message" />

      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row class="mr-3">
            <label v-t="'label.date'" class="mr-2 mb-2 d-flex align-items-center" />
            <date-picker v-model="form.dateFrom" type="date" value-format="datetime" class="mr-2 mb-2 inputdatefrom" />
            <date-picker v-model="form.dateTo" type="date" value-format="datetime" class="mr-2 mb-2 inputdatefrom" />
          </b-form-row>
        </b-form-group>
        <b-form-group>
          <b-form-row class="mb-3 mr-5">
            <label v-t="'label.group'" class="mr-2" />
            <span :title="vueSelectTitle(vueSelected.group)">
              <v-select v-model="vueSelected.group" :options="groupOptions" class="mr-2 inputSelect vue-options">
                <template slot="selected-option" slot-scope="option">
                  {{ vueSelectCutOn(option) }}
                </template>
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </span>
          </b-form-row>
        </b-form-group>
      </b-form>

      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row class="mb-3">
            <b-button v-t="'label.display'" type="submit" :variant="theme" @click="display" />
            <b-button v-t="'label.download'" type="submit" :variant="theme" @click="display" class="ml-2" />
          </b-form-row>
        </b-form-group>
      </b-form>

      <slot />
      <b-row class="mt-3" />
      <b-table :items="viewList" :fields="fields" :current-page="currentPage" :per-page="perPage" :sort-by.sync="sortBy" :sort-compare="defaultSortCompare" stacked="md" striped hover outlined>
        <template slot="graph" slot-scope="row">
          <div style="position: relative;">
            <div v-for="(bar, index) in row.item.graph" :key="index" :class="bar.isStay || bar.isAbsentZone? 'stay-bar': 'lost-bar'" :style="`${bar.isStay || bar.isAbsentZone? `background: `+ (historyType == 'category'? bar.categoryBgColor: bar.areaBgColor)+`;`: `` } width:${bar.percent}% !important;`">
              <span class="graph-arrow-box">
                {{ bar.isStay || bar.isAbsentZone? (historyType == 'category'? bar.categoryName: bar.areaName): $i18n.tnl('label.absence') }} <br>
                {{ bar.time }} <br>
                {{ bar.startTime }} ～ {{ bar.endTime }}
              </span>&nbsp;
            </div>
            <br>
            <div class="timeDisplay" style="width: 100%">
              <div v-for="(timeData, index) in row.item.graphTimeRatio" :key="`graph-${index}`" class="time-area" :style="`width: ${timeData.ratio}% !important;`">
                <span v-if="index == 0" style="float: left;">
                  {{ row.item.baseTimeFrom }}
                </span>
                <span v-if="index == row.item.graphTimeRatio.length - 1" style="float: right;">
                  {{ row.item.baseTimeTo }}
                </span>
                <span v-if="isScaleTime(timeData.time)" style="float: left;">
                  <span style="position: relative; left: -50%;">
                    {{ timeData.time + ':00' }}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </template>
      </b-table>
      <b-row>
        <b-col md="6" class="mt-1 mb-3">
          <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" class="my-0" />
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import moment from 'moment'
import { APP, DISP, DEV } from '../../sub/constant/config'
import { CATEGORY, SYSTEM_ZONE_CATEGORY_NAME } from '../../sub/constant/Constants'
import * as ArrayUtil from '../../sub/util/ArrayUtil'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as ColorUtil from '../../sub/util/ColorUtil'
import * as CsvUtil from '../../sub/util/CsvUtil'
import * as DateUtil from '../../sub/util/DateUtil'
import * as Util from '../../sub/util/Util'
import { getCharSet } from '../../sub/helper/base/CharSetHelper'
import * as MenuHelper from '../../sub/helper/dataproc/MenuHelper'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as StayTimeHelper from '../../sub/helper/domain/StayTimeHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
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
      items: ViewHelper.createBreadCrumbItems('sumTitle', 'stayRatioStack'),
      fields: [
        {key: 'name', sortable: true, label: this.$i18n.tnl('label.potName')},
        {key: 'groupName', sortable: true, label: this.$i18n.tnl('label.groupName') },
        {key: 'graph', sortable: false, label: this.$i18n.tnl('label.graph'), thStyle: {height: '50px !important', width:'400px !important'} },
        {key: 'stayTime', sortable: false, label: this.$i18n.tnl('label.stayTime') },
        {key: 'lostTime', sortable: false, label: this.$i18n.tnl('label.lostTime') },
      ],
      form: {
        dateFrom: '',
        dateTo: ''
      },
      vueSelected: {
        group: null,
        category: null,
      },
      displayCheckList: {
        stay: ['stay', 'lost'],
        category: [],
        area: [],
        filter: ['groupName'],
      },
      message: '',
      modalMessage: '',
      viewList: [],
      areaArray: [],
      name: '',
      currentPage: 1,
      perPage: 20,
      sortBy: 'name',
      totalRows: 0,
      historyType: 'area',
      isCategorySelected: false,
      checkboxLimit: 6,
      showModal: false,
    }
  },
  computed: {
    ...mapState('app_service', [
      'groups',
      'pots',
      'categories',
      'zones',
      'areas',
    ]),
    modalErrorMessage() {
      return this.modalMessage
    },
    otherColor() {
      return APP.STAY_SUM.OTHER_COLOR
    },
  },
  watch: {
    'vueSelected.group': {
      handler: function(newVal, oldVal){
        this.form.groupId = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
    'vueSelected.category': {
      handler: function(newVal, oldVal){
        this.form.categoryId = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
  },
  async created() {
    this.form.date = DEV.DEFAULT_DATE != '' ? new Date(DEV.DEFAULT_DATE) : moment().add(-1, 'days').format('YYYYMMDD')
    let sortedArea = _.cloneDeep(this.areas)
    ArrayUtil.sortIgnoreCase(sortedArea, 'areaName')
    this.areaArray = sortedArea
  },
  async mounted() {
    ViewHelper.importElementUI()
    window.addEventListener('resize', () => {
      this.$forceUpdate()
      this.setGraphTimeDisplay()
    })
    if (this.categories.length < 1) {
      return
    }
  },
  methods: {
    // 以下表示処理
    async display() {
      this.container ? this.container.removeAllChildren() : null
      this.replace({showAlert: false})
      this.showProgress()
      try {
        if (!this.form.date || this.form.date.length == 0) {
          this.message = this.$i18n.tnl('message.pleaseEnterSearchCriteria')
          this.replace({showAlert: true})
          this.hideProgress()
          return
        }

        const sumData = await HttpHelper.getAppService(this.getApiUrl(this.form))
        if (_.isEmpty(sumData)) {
          this.message = this.$i18n.t('message.listEmpty')
          this.replace({showAlert: true})
          this.hideProgress()
          return
        }

        this.viewList = this.getStayDataList(moment(this.form.date).format('YYYY-MM-DD'), sumData, APP.SUM_ABSENT_LIMIT, APP.SUM_LOST_LIMIT)

        this.totalRows = this.viewList.length
      }
      catch(e) {
        console.error(e)
      }
      finally {
        this.hideProgress()
      }
    },
    isScaleTime(scaleTime) {
      return _.some(APP.STAY_SUM.SCALE_TIMES, (time) => { return time === scaleTime })
    },
    getStackColor(index) {
      // 設定が6色以上ある事が前提
      return DISP.SUM_STACK_COLOR[index % DISP.SUM_STACK_COLOR.length]
    },
    isAbsentZoneData(categoryId) {
      let category = !this.isLostData(categoryId)? this.categories.find((e) => e.categoryId == categoryId): null
      return category? category.categoryName == SYSTEM_ZONE_CATEGORY_NAME.ABSENT: false
    },
    isLostData(byId) {
      return byId == -1
    },
    getStayDataList(date, stayData, absentLimit = 0, lostLimit = APP.LOST_TIME) {
      const fromSecond = (Math.floor(APP.STAY_SUM.FROM / 100) * 60 + APP.STAY_SUM.FROM % 100) * 60
      const toSecond = (Math.floor(APP.STAY_SUM.TO / 100) * 60 + APP.STAY_SUM.TO % 100) * 60
      const graphTimeRatio = this.getTimeRatioData()
      const fromToSettingDiff = toSecond - fromSecond

      return stayData.map((data) => {
        let stayTime = 0, lostTime = 0
        let categoryData = []
        let areaData = []
        let stayPercentSum = 0
        let graphListId = 0

        // カテゴリ用データ保持変数を初期化
        categoryData[0] = {name: 'categoryOther', value: 0}
        this.categories.forEach((category) => {
          let categoryName = (category.systemUse? this.$i18n.tnl('label.' + category.systemCategoryName): category.categoryName)
          if (category.categoryType == CATEGORY.ZONE) categoryData[category.categoryId] = {name: categoryName, value: 0}
        })

        // エリア用データ保持変数を初期化
        areaData[0] = {name: 'areaOther', value: 0}
        this.areaArray.forEach((area) => {
          areaData[area.areaId] = {name: area.areaName, value: 0}
        })

        // 各時間の集計
        let graphList = data.stayList.map((stay, index) => {
          let isExistStayData = false
          let time = ''
          let findCategory
          let findArea
          let areaIndex = 0
          const isAbsentZone = this.isAbsentZoneData(stay.byId)
          if (this.isLostData(stay.byId) || isAbsentZone) {
            lostTime += stay.period
            time = DateUtil.convertToTime(stay.period)
          } else {
            stayTime += stay.period
            time = DateUtil.convertToTime(stay.period)
            isExistStayData = true
          }
          // カテゴリ毎の滞在時間を加算
          findCategory = _.find(this.categories, (category) => {
            return category.categoryType == CATEGORY.ZONE && category.categoryId == stay.byId
          })
          if (findCategory) {
            categoryData[findCategory.categoryId].value += stay.period
          } else if (stay.byId == 0) {
            categoryData[0].value += stay.period
          }

          // エリア毎の滞在時間を加算
          let zone = findCategory? _.find(this.zones, (zone) => { return zone.categoryId == findCategory.categoryId}): null
          findArea = _.find(this.areaArray, (area, index) => {
            if (zone) {
              if (area.areaId == zone.areaId) {
                areaIndex = index
                return true
              }
            } else {
              if (area.areaId == stay.areaId) {
                areaIndex = index
                return true
              }
            }
            return false
          })
          if (findArea) {
            areaData[findArea.areaId].value += stay.period
          } else {
            if (isExistStayData) areaData[0].value += stay.period
          }
          //グラフ表示欠け対応のため、小数点1桁まで固定
          const parcentDigit = 10
          let percent = Math.round((stay.period / fromToSettingDiff) * 100 * parcentDigit) / parcentDigit
          if (APP.STAY_SUM.GRAPH_LIMIT > percent) {
            percent = 0
          }
          stayPercentSum += percent

          return {
            index: graphListId++,
            isStay: isExistStayData,
            isAbsentZone: isAbsentZone,
            period: stay.period,
            start: stay.start,
            startTime: percent == 100? DateUtil.convertToTime(fromSecond): moment(stay.start).format('HH:mm:ss'),
            end: stay.end,
            endTime: percent == 100? DateUtil.convertToTime(toSecond): moment(stay.end).format('HH:mm:ss'),
            time: time,
            percent: percent,
            categoryName: findCategory? findCategory.categoryName: this.$i18n.tnl('label.other'),
            categoryBgColor: findCategory? ColorUtil.colorCd4display(findCategory.bgColor): ColorUtil.colorCd4display(this.otherColor),
            areaBgColor: findArea? this.getStackColor(areaIndex): this.otherColor,
            areaName: findArea? findArea.areaName: this.$i18n.tnl('label.other'),
            zoneCategory: stay.byName,
          }

        }).filter(data => { return data.percent != 0})

        const pot = this.pots.find((val) => val.potId == data.potId)
        const result = {
          date: date,
          name: data.potName, 
          groupName: pot? pot.groupName: '',
          categoryName: pot? pot.categoryName: '',
          graph: graphList,
          stayTime: DateUtil.convertToTime(stayTime) + ' (' + StayTimeHelper.getRatio(stayTime) + '%)', 
          lostTime: DateUtil.convertToTime(lostTime) + ' (' + StayTimeHelper.getRatio(lostTime) + '%)', 
          baseTimeFrom: this.getDateStrFromSetting(APP.STAY_SUM.FROM),
          baseTimeTo: this.getDateStrFromSetting(APP.STAY_SUM.TO),
          graphTimeRatio: graphTimeRatio,
        }

        categoryData.forEach((cData) => {
          result[cData.name] = DateUtil.convertToTime(cData.value) + ' (' + StayTimeHelper.getRatio(cData.value) + '%)'
        })
        areaData.forEach((aData) => {
          result[aData.name] = DateUtil.convertToTime(aData.value) + ' (' + StayTimeHelper.getRatio(aData.value) + '%)'
        })

        // グラフのズレ対応。100%と実際のpercentとの差分を全体に分配する
        const perDiff = 100 - stayPercentSum
        var graphTemp = result.graph.slice();
        graphTemp.sort((a, b) => {
          if (a.percent < b.percent) {
            return 1;
          } else {
            return -1;
          }
        })
        const baseCount = 10 //配分するグラフデータ数制限
        if (result.graph.length > baseCount) {
          const diffs = perDiff / baseCount
          graphTemp.slice(0, baseCount).forEach((val, num) => {
            const addGraph = _.find(result.graph, (graphVal) => {
              return val.index == graphVal.index
            })
            if (addGraph) {
              addGraph.percent = addGraph.percent + diffs
            }
          })
        } else {
          const diffs = perDiff / result.graph.length
          result.graph.forEach((val) => {
            val.percent = val.percent + diffs
          })
        }
        return result
      })
    },
    getDateStrFromSetting(timeNum) {
      return DateUtil.convertToTime((Math.floor(timeNum / 100) * 60 + timeNum % 100) * 60).slice(0, -3)
    },
    getTimeRatioData() {
      // 開始から終了までの配列を作る
      const fromHour = Math.floor(APP.STAY_SUM.FROM / 100) // 分は切る
      const toHour = Math.floor(APP.STAY_SUM.TO / 100)
      const toHourMinute = toHour * 60 + APP.STAY_SUM.TO % 100
      const total = toHourMinute - fromHour * 60
      let times = []
      let timesMinute = []
      for (let i = fromHour; i <= toHour; i++) {
        times.push(i)
        timesMinute.push(i * 60)
      }
      toHourMinute > 0? timesMinute.push(toHourMinute): null

      // トータル時間から導き出す
      let result = []
      for (let i = 0; i < timesMinute.length - 1; i++){
        var ratio = (timesMinute[i+1] - timesMinute[i])/total
        result.push({time: times[i], ratio: Math.floor(ratio * 10000)/100})
      }
      return result
    },
    // 以下ダウンロード処理
    async download(key){
      this.replace({showAlert: false})
      this.updateColumn()
      let viewList
      if (!this.form.date || this.form.date.length == 0) {
        this.message = this.$i18n.tnl('message.pleaseEnterSearchCriteria')
        this.replace({showAlert: true})
        this.hideProgress()
        return
      }

      const dataList = await HttpHelper.getAppService(this.getApiUrl(this.form))
      if (_.isEmpty(dataList)) {
        this.message = this.$i18n.t('message.listEmpty')
        this.replace({showAlert: true})
        this.hideProgress()
        return
      }
      viewList = this.getStayDataList(moment(this.form.date).format('YYYY-MM-DD'), dataList, APP.SUM_ABSENT_LIMIT, APP.SUM_LOST_LIMIT)

      ArrayUtil.sortIgnoreCase(viewList, 'name')
      const csvList = this.getCsvList(key, viewList)

      const searchDate = moment(this.form.date).format('YYYY-MM-DD')
      const group = this.form.groupId? this.groups.find((val) => val.groupId == this.form.groupId): null
      const groupName =  group? '_' + group.groupName: ''
      const category = this.form.categoryId? this.categories.find((val) => val.categoryId == this.form.categoryId): null
      const categoryName =  !category? '': category.systemUse == 1? category.systemCategoryName: '_' + category.categoryName

      const convertedCsvData = this.convertCsvData(key, csvList)
      BrowserUtil.fileDL(
        searchDate + groupName + categoryName + '_stayRatio.csv',
        convertedCsvData,
        getCharSet(this.$store.state.loginId)
      )
    },
    getApiUrl(param) {
      const targetDate = moment(param.date).format('YYYYMMDD')
      const groupBy = param.groupId? '&groupId=' + param.groupId: ''
      const categoryBy = param.categoryId? '&categoryId=' + param.categoryId: ''
      return '/office/stayTime/sumByDay/' + targetDate + '/zoneCategory?from=' + APP.STAY_SUM.FROM + '&to=' + APP.STAY_SUM.TO + groupBy + categoryBy
    },
    getCsvSumList(viewList) {
      const keys = []

      // フィールド設定に合わせ、出力するデータのキーリストを生成する
      _.filter(this.fields, (field) => {
        return _.some(Object.keys(viewList[0]), (key) => { 
          return key!= 'graph' && key === field.key
        })
      }).forEach((field) => { keys.push(field) })

      // キーの一致するデータのみのリストを作成。その際、％データがある場合は分ける
      return viewList.map((viewData) => {
        let objectData = {}
        const ratio = this.$i18n.tnl('label.bracketStayRate')
        keys.forEach((data) => {
          const hasRatio = viewData[data.key] && viewData[data.key].search('%') > 0
          if (hasRatio) {
            let splitData = viewData[data.key].split(' ')
            objectData[data.label] = splitData[0]
            objectData[data.label + ratio] = splitData[1].slice(1,-1)
          } else {
            objectData[data.label] = viewData[data.key]
          }
        })
        return objectData
      })
    },
    getCsvDetailList(detailList) {
      // キーの一致するデータのみのリストを作成。その際、％データがある場合は分ける
      const result = detailList.map((viewData) => {
        return viewData.graph.map((graph) => {
          return {
            date: viewData.date,
            name: viewData.name,
            groupName: viewData.groupName,
            categoryName: viewData.categoryName,
            start: graph.startTime,
            end: graph.endTime,
            stayTime: graph.period,
            state: graph.isStay? this.$i18n.tnl('label.detected'): this.$i18n.tnl('label.undetect'),
            areaName: graph.areaName,
            zoneCategory: graph.zoneCategory,
          }
        })
      })
      return result.flatMap((data) => data)
    },
    getCsvDetailHeaderList() {
      return [
        this.$i18n.tnl('label.date'),
        this.$i18n.tnl('label.name'),
        this.$i18n.tnl('label.groupName'),
        this.$i18n.tnl('label.categoryName'),
        this.$i18n.tnl('label.start'),
        this.$i18n.tnl('label.end'),
        this.$i18n.tnl('label.stayTime'),
        this.$i18n.tnl('label.state'),
        this.$i18n.tnl('label.areaName'),
        this.$i18n.tnl('label.zoneCategory') + '\n'
      ]
    },
    getCsvList(key, list) {
      switch(key) {
      case 'sum':
        return this.getCsvSumList(list)
      case 'detail':
        return this.getCsvDetailList(list)
      default:
        // 何もしない
      }
    },
    convertCsvData(key, list) {
      switch(key) {
      case 'sum':
        return CsvUtil.converToCsv(list)
      case 'detail':
        return CsvUtil.converToCsv(list, null, this.getCsvDetailHeaderList())
      default:
        // 何もしない
      }
    },
    setGraphTimeDisplay() {
      const timeDisplay = document.getElementsByClassName('timeDisplay')
      _.forEach(timeDisplay, (td) => {
        if (td.offsetWidth <= 100) {
          td.style.visibility = 'hidden'
        } else {
          td.style.visibility = ''
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/input.scss";
.tableHeader {
  word-break:break-all;
}

.bgSquare {
  display: inline-block;
  _display: inline;
  width: 15px;
  height: 15px;
}
.stay-bar {
  position: relative;
  display: inline-block;
  cursor: default;
  box-sizing:border-box;
}
.lost-bar {
  position: relative;
  display: inline-block;
  background: #ccc;
  cursor: default;
  box-sizing:border-box;
}
.graph-arrow-box {
  display: none;
  position: absolute;
  top: 100%;
  padding: 8px;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;  
  border-radius: 5px;
  background: #333;
  color: #fff;
  white-space: nowrap;
  z-index: 5;
}
.stay-bar:hover .graph-arrow-box, .lost-bar:hover .graph-arrow-box {
  display: block;
}
.time-area {
  overflow: visible;
  white-space: nowrap;
  position: relative;
  display: inline-block;
  box-sizing:border-box;
}
.itemTitle {
  font-weight: bold;
  font-size: 14px;
}
</style>
