<template>
  <div>
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <alert :message="message" />

      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row class="mr-3">
            <label v-t="'label.date'" class="mr-2 mb-2 d-flex align-items-center" />
            <date-picker v-model="form.date" type="date" value-format="yyyyMMdd" class="mr-2 mb-2 inputdatefrom" @change="pickerChanged" />
          </b-form-row>
        </b-form-group>
        <b-form-group>
          <b-form-row class="mb-3 mr-5">
            <label v-t="'label.group'" class="mr-2" />
            <span :title="vueSelectTitle(vueSelected.group)">
              <v-select v-model="vueSelected.group" :options="groupOptions" class="mr-2 inputSelect vue-options" :style="vueSelectStyle">
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
            <b-button v-if="!iosOrAndroid && bulkReferenceable" v-t="'label.download'" :variant="theme" class="ml-2" @click="download" />
            <b-button v-if="!iosOrAndroid && bulkReferenceable" v-t="'label.downloadMonth'" :variant="theme" class="ml-2" @click="downloadMonth" />
          </b-form-row>
        </b-form-group>
      </b-form>
      <slot />
      <b-row class="mt-3" />
      <b-table :items="viewList" :fields="fields" :current-page="currentPage" :per-page="perPage" :sort-by.sync="sortBy" :sort-compare="defaultSortCompare" stacked="md" striped hover outlined />
      <b-row>
        <b-col md="6" class="mt-1 mb-3">
          <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" class="my-0" />
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import moment from 'moment'
import { APP, DEV } from '../../sub/constant/config'
import { SYSTEM_ZONE_CATEGORY_NAME } from '../../sub/constant/Constants'
import * as ArrayUtil from '../../sub/util/ArrayUtil'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as CsvUtil from '../../sub/util/CsvUtil'
import * as DateUtil from '../../sub/util/DateUtil'
import * as Util from '../../sub/util/Util'
import { getCharSet } from '../../sub/helper/base/CharSetHelper'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as StayTimeHelper from '../../sub/helper/domain/StayTimeHelper'
import * as ValidateHelper from '../../sub/helper/dataproc/ValidateHelper'
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
      items: ViewHelper.createBreadCrumbItems('sumTitle', 'stayRatioGp'),
      fields: ViewHelper.addLabelByKey(this.$i18n, [
        {key: 'date', sortable: false, label: 'date'},
        {key: 'name', sortable: true, label: 'potName'},
        {key: 'groupName', sortable: true, label: 'groupName'},
        {key: 'stayTime', sortable: true, label: 'stayTime'},
        {key: 'absent1Time', sortable: true, label: 'absent1Time'},
        {key: 'absent2Time', sortable: true, label: 'absent2Time'},
        {key: 'lostTime', sortable: true, label: 'lostTime'},
        {key: 'stayRatio', sortable: true, label: 'stayRatio'},
        {key: 'absent1Ratio', sortable: true, label: 'absent1Ratio'},
        {key: 'absent2Ratio', sortable: true, label: 'absent2Ratio'},
        {key: 'lostRatio', sortable: true, label: 'lostRatio'},
      ]).map(val => ({ ...val, originLabel: val.label})),
      form: {
        date: '',
      },
      vueSelected: {
        group: null,
      },
      message: '',
      viewList: [],
      showChart: true,
      currentPage: 1,
      perPage: 20,
      sortBy: 'name',
      totalRows: 0,
    }
  },
  computed: {
    // ...mapState('app_service', [
    //   'groups',
    //   'pots',
    //   'categories',
    // ]),
    iosOrAndroid() {
      return BrowserUtil.isAndroidOrIOS()
    },
  },
  watch: {
    'vueSelected.group': {
      handler: function(newVal, oldVal){
        this.form.groupId = Util.getValue(newVal, 'value')
      },
      deep: true,
    },
  },
  async created() {
    this.form.date = DEV.DEFAULT_DATE != '' ? new Date(DEV.DEFAULT_DATE) : moment().add(-1, 'days').format('YYYYMMDD')
  },
  async mounted() {
    ViewHelper.importElementUI()
    window.addEventListener('resize', () => {
      this.updateColumnName()
      this.$forceUpdate()
    })
    this.updateColumnName()
  },
  methods: {
    validate() {
      const errors = ValidateHelper.validateCheck([
        {type: 'require', names: ['date'], values: [this.form.date]},
      ].filter((val) => val && val.names.length >= 1))
      return ValidateHelper.formatValidateMessage(errors)
    },
    async display() {
      this.container ? this.container.removeAllChildren() : null
      await this.displayImpl()
      this.stage ? this.stage.update() : null
    },
    async displayImpl(){
      this.replace({showAlert: false})
      this.showProgress()
      
      if (!this.form.date || this.form.date == '') {
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

      this.viewList = this.getStayDataList(moment(this.form.date).format('YYYY-MM-DD'), sumData, APP.STAY_SUM.BSENT_LIMIT, APP.STAY_SUM.LOST_LIMIT)
      this.totalRows = this.viewList.length
      this.hideProgress()
    },
    isAbsentZoneData(categoryId) {
      let category = !this.isLostData(categoryId)? this.categories.find((e) => e.categoryId == categoryId): null
      return category? category.categoryName == SYSTEM_ZONE_CATEGORY_NAME.ABSENT: false
    },
    isLostData(byId) {
      return byId == -1
    },
    getStayDataList(date, stayData, absentLimit = 0, lostLimit = APP.POS.LOST_TIME) {
      return stayData.map((data) => {
        const potId = data.potId
        const pot = this.pots.find((val) => val.potId == potId)
        const groupName = pot? pot.groupName: ''
        const potName = data.potName
        let stayTime = 0, under30minAbsentTime = 0, over30to90minAbsentTime = 0,
          lostTime = 0, presentRatio = 0, absentRatio = 0, absentRatioSub = 0, lostRatio = 0

        // 各時間の集計
        data.stayList.forEach((stay) => {
          if (this.isLostData(stay.byId) || this.isAbsentZoneData(stay.byId)) {
            if (absentLimit == 0 || stay.period > lostLimit) {
              lostTime += stay.period
            } else if ((stay.period > absentLimit) && (stay.period <= lostLimit)) {
              over30to90minAbsentTime += stay.period
            } else {
              under30minAbsentTime += stay.period <= absentLimit? stay.period: 0
            }
          } else {
            stayTime += stay.period
          }
        })
        presentRatio = StayTimeHelper.getRatio(stayTime)
        absentRatio = StayTimeHelper.getRatio(under30minAbsentTime)
        absentRatioSub = StayTimeHelper.getRatio(over30to90minAbsentTime)
        lostRatio = StayTimeHelper.getRatio(lostTime)

        return {
          date: date,
          name: potName, 
          groupName: groupName,
          stayTime: DateUtil.convertToTime(stayTime), 
          absent1Time: DateUtil.convertToTime(under30minAbsentTime), 
          absent2Time: DateUtil.convertToTime(over30to90minAbsentTime),
          lostTime: DateUtil.convertToTime(lostTime),
          stayRatio: presentRatio + ' %',
          absent1Ratio: absentRatio + ' %',
          absent2Ratio: absentRatioSub + ' %',
          lostRatio: lostRatio + ' %',
        }
      })
    },
    async download(){
      this.replace({showAlert: false})
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
      let viewList = this.getStayDataList(moment(this.form.date).format('YYYY-MM-DD'), dataList, APP.SUM_ABSENT_LIMIT, APP.SUM_LOST_LIMIT)
      ArrayUtil.sortIgnoreCase(viewList, 'name')

      const searchDate = moment(this.form.date).format('YYYY-MM-DD')
      const group = this.form.groupId? this.groupIdMap[this.form.groupId]: null
      const groupName =  group? '_' + group.groupName: ''

      BrowserUtil.fileDL(
        searchDate + groupName + '_stayRatio.csv',
        CsvUtil.converToCsv(viewList, null, this.getCsvHeaderNames()),
        getCharSet(this.$store.state.loginId)
      )
    },
    getApiUrl(param) {
      const targetDate = moment(param.date).format('YYYYMMDD')
      const groupBy = param.groupId? '&groupId=' + param.groupId: ''
      const url = '/office/stayTime/sumByDay/' + targetDate + '/zoneCategory?from=' + APP.STAY_SUM.FROM + '&to=' + APP.STAY_SUM.TO + groupBy
      return url
    },
    updateColumnName(){
      if(Util.hasValue(this.fields)){
        this.fields.forEach(field => {
          field.label = BrowserUtil.isResponsiveMode(true)? field.originLabel.replace(/<br>/g, ''): field.originLabel
        })
      }
    },
    async downloadMonth(){
      this.replace({showAlert: false})
      this.showProgress()

      if (!this.form.date || this.form.date == '') {
        this.message = this.$i18n.tnl('message.pleaseEnterSearchCriteria')
        this.replace({showAlert: true})
        this.hideProgress()
        return
      }

      const diff = moment().startOf('months').diff(moment(this.form.date).startOf('months'), 'months')
      let startDate, endDate

      // 取得する日付開始、終了日を設定する
      if (diff == 0) {
        startDate = moment(this.form.date).startOf('months')
        endDate = moment().subtract(1, 'd')
      } else if (diff >= 0) {
        startDate = moment(this.form.date).startOf('months')
        endDate = moment(this.form.date).endOf('months')
      } else {
        // 未来月の場合はエラーとする
        this.message = this.$i18n.terror('message.invalid', {target: this.$i18n.tnl('label.date')})
        this.replace({showAlert: true})
        this.hideProgress()
        return
      }

      let csvList = new Array()
      const csvDays = endDate.diff(startDate, 'days')
      const groupBy = this.form.groupId? '&groupId=' + this.form.groupId: ''

      let day = 0
      while (day <= csvDays) {
        const searchDate = moment(this.form.date).startOf('months').add(day++, 'day').format('YYYYMMDD')
        const url = '/office/stayTime/sumByDay/' + searchDate + '/zoneCategory?from=' + APP.STAY_SUM.FROM + '&to=' + APP.STAY_SUM.TO + groupBy
        const sumData = await HttpHelper.getAppService(url)
        if (_.isEmpty(sumData)) {
          Util.debug('searchDate: ' + searchDate)
          this.message = this.$i18n.t('message.listEmpty')
          this.replace({showAlert: true})
          this.hideProgress()
          return
        }

        let list = this.getStayDataList(moment(searchDate).format('YYYY-MM-DD'), sumData, APP.STAY_SUM.ABSENT_LIMIT, APP.STAY_SUM.LOST_LIMIT)
        ArrayUtil.sortIgnoreCase(list, 'name')
        csvList = csvList.isEmpty? list: csvList.concat(list)
      }

      const group = this.form.groupId? this.groupIdMap[this.form.groupId]: null
      const groupName =  group? '_' + group.groupName: ''
      BrowserUtil.fileDL(
        moment(this.form.date).format('YYYYMM') + groupName + '_stayRatio.csv',
        CsvUtil.converToCsv(csvList, null, this.getCsvHeaderNames()),
        getCharSet(this.$store.state.loginId)
      )

      this.hideProgress()
    },
    getCsvHeaderNames() {
      return [
        this.$i18n.tnl('label.date'),
        this.$i18n.tnl('label.name'),
        this.$i18n.tnl('label.groupName'),
        this.$i18n.tnl('label.stayTime'), 
        this.$i18n.tnl('label.absent1Time'), 
        this.$i18n.tnl('label.absent2Time'),
        this.$i18n.tnl('label.lostTime'),
        this.$i18n.tnl('label.stayRatio'),
        this.$i18n.tnl('label.absent1Ratio'),
        this.$i18n.tnl('label.absent2Ratio'),
        this.$i18n.tnl('label.lostRatio') + '\n'
      ]
    },
    pickerChanged() {
      if (!Util.hasValue(this.form.date) || DateUtil.isAfterNextMonth(this.form.date)) {
        this.message = this.$i18n.terror('message.invalid', {target: this.$i18n.tnl('label.date')})
        this.replace({showAlert: true})
        return
      } else {
        this.replace({showAlert: false})
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/input.scss";
@import "../../sub/constant/vue.scss";
</style>
