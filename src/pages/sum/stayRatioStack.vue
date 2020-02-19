<template>
  <div>
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <alert :message="message" />

      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row class="mr-3">
            <span v-t="'label.historyDateFrom'" class="d-flex align-items-center" />
            <date-picker v-model="form.datetimeFrom" :clearable="false" type="datetime" class="ml-2 inputdatefrom" required />
            <span v-t="'label.historyDateTo'" class="d-flex align-items-center ml-2" />
            <date-picker v-model="form.datetimeTo" :clearable="false" type="datetime" class="ml-2 inputdateto" required />

            <label v-t="'label.group'" class="ml-2" />
            <span :title="vueSelectTitle(vueSelected.group)">
              <v-select v-model="vueSelected.group" :options="groupOptions" class="ml-2 inputSelect vue-options">
                <template slot="selected-option" slot-scope="option">
                  {{ vueSelectCutOn(option) }}
                </template>
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </span>
          </b-form-row>

          <b-form-row class="mt-3 mb-3">
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
            <div v-for="(bar, index) in row.item.graph" :key="index" :class="bar.name? 'stay-bar': 'lost-bar'" :style="bar.style">
              <span class="graph-arrow-box">
                {{ bar.name ? bar.name : $i18n.tnl('label.absence') }} <br>
                {{ bar.time }} <br>
                {{ bar.startTime }} ～ {{ bar.endTime }}
              </span>&nbsp;
            </div>
            <br>
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
        datetimeFrom: '',
        datetimeTo: ''
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
    const date = DateUtil.getDefaultDate()
    this.form.datetimeFrom = DateUtil.getDatetime(date, {date: -1})
    this.form.datetimeTo = DateUtil.getDatetime(date)

    let sortedArea = _.cloneDeep(this.areas)
    ArrayUtil.sortIgnoreCase(sortedArea, 'areaName')
    this.areaArray = sortedArea
  },
  async mounted() {
    ViewHelper.importElementUI()
    window.addEventListener('resize', () => {
      this.$forceUpdate()
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
        if ( !Util.hasValue(this.form.datetimeFrom) || !Util.hasValue(this.form.datetimeTo) ) {
          this.message = this.$i18n.tnl('message.pleaseEnterSearchCriteria')
          this.replace({showAlert: true})
          this.hideProgress()
          return
        }

        // データ取得
        const data = await this.getData(this.form)
        if (_.isEmpty(data)) {
          this.message = this.$i18n.t('message.listEmpty')
          this.replace({showAlert: true})
          this.hideProgress()
          return
        }

        // 人ごとにまとめる
        const sum = data.reduce( (sum, obj) => {
          if(!sum[obj.axisId]){
            sum[obj.axisId] = []
          }
          sum[obj.axisId].push(obj)
          return sum
        }, [])
        console.log('sum', sum)

        console.log('pots', this.pots)

      const from = new Date(this.form.datetimeFrom).getTime()
      const to = new Date(this.form.datetimeTo).getTime()
      const total = (to - from)/1000

        // リスト作成
        this.viewList = sum.map( stayTimes => {
          const stayTime = _.sumBy(stayTimes, s => s.period )
          console.log(stayTime)
          const graph = stayTimes.map(s => {
            const ratio = Math.floor(s.period / total * 100)
            const color = this.getStackColor(s.stackId)
            return {
              name: s.stack,
              style: `width: ${ratio}% !important; background: ${color};`
            }
          })
          // 不在追加
          if(total - stayTime > 0){
            const ratio = (total-stayTime)/total*100
            const color = ColorUtil.colorCd4display(this.otherColor)
            graph.push({
              style: `width: ${ratio}% !important;`
            })
          }
          return {
            name: stayTimes[0].axis,
            groupName: this.getGroupName(stayTimes[0].axisId),
            graph,
            stayTime: DateUtil.convertToTime(stayTime, true),
            lostTime: DateUtil.convertToTime(total - stayTime, true)
          }
        })

        this.totalRows = this.viewList.length
      }
      catch(e) {
        console.error(e)
      }
      finally {
        this.hideProgress()
      }
    },
    getGroupName(potId) {
      const pot = this.pots.find(p => p.potId == potId)
      return pot && pot.group ? pot.group.groupName : null
    },
    isScaleTime(scaleTime) {
      return _.some(APP.STAY_SUM.SCALE_TIMES, (time) => { return time === scaleTime })
    },
    getStackColor(index) {
      // 設定が6色以上ある事が前提
      return DISP.SUM_STACK_COLOR[index % DISP.SUM_STACK_COLOR.length]
    },
    async getData(form) {
      const param = {}
      param.axis = 'pot'
      param.stack = 'location'
      param.datetimeFrom = new Date(form.datetimeFrom).getTime()
      param.datetimeTo = new Date(form.datetimeTo).getTime()
      param.fillGap = APP.STAY_SUM.AXIS_FILL_GAP
      const url = '/office/stayTime/sum?_=' + new Date().getTime() + '&' +  HttpHelper.toParam(param, true)
      const sumData = await HttpHelper.getAppService(url)
      console.log(sumData)
      return sumData
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

      const dataList = await this.getData(this.form)
      if (_.isEmpty(dataList)) {
        this.message = this.$i18n.t('message.listEmpty')
        this.replace({showAlert: true})
        this.hideProgress()
        return
      }
      viewList = []

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
