<template>
  <div>
    <breadcrumb :items="breadCrumbs" :reload="false" />
    <div class="container">
      <alert :message="message" />

      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row class="mt-3 mb-3">
            <span v-t="'label.date'" class="d-flex align-items-center" />
            <date-picker v-model="form.date" :clearable="false" type="date" class="ml-2 inputdatefrom" required />

            <b-button v-t="'label.display'" type="submit" :variant="theme" @click="display" class="ml-2" />
            <b-button v-t="'label.download'" type="submit" :variant="theme" @click="download" class="ml-2" />
          </b-form-row>
        </b-form-group>
      </b-form>

      <b-row class="mt-3">
        <b-table :items="viewList" :fields="getField()" :current-page="currentPage" :per-page="perPage" :sort-by.sync="sortBy" :sort-compare="defaultSortCompare" stacked="md" striped hover outlined>
          <template slot="detail" slot-scope="row">
            <b-button v-if="row.item.isDetail" v-t="'label.detail'" :variant="theme" size="sm" class="mx-1" @click.stop="showDetail(row.item)" />
          </template>
        </b-table>
      </b-row>
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
import { APP, DEV } from '../../sub/constant/config'
import { CATEGORY, POT_TYPE } from '../../sub/constant/Constants'
import * as DateUtil from '../../sub/util/DateUtil'
import * as ArrayUtil from '../../sub/util/ArrayUtil'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as NumberUtil from '../../sub/util/NumberUtil'
import * as Util from '../../sub/util/Util'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import * as MasterHelper from '../../sub/helper/domain/MasterHelper'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import * as CharSetHelper from '../../sub/helper/base/CharSetHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../../components/mixin/commonmixin.vue'
import alert from '../../components/parts/alert.vue'
import moment from 'moment'

export default {
  components: {
    DatePicker,
    breadcrumb,
    alert,
  },
  mixins: [commonmixin],
  data () {
    return {
      breadCrumbs: ViewHelper.createBreadCrumbItems('sumTitle', 'attendanceSum'),
      form: {
        date: ''
      },
      message: '',
      viewList: [],
      currentPage: 1,
      perPage: 20,
      sortBy: 'name',
      totalRows: 0,
      allDayWorkPer: null,
      halfDayWorkPer: null
    }
  },
  computed: {
  },
  async created() {
    const date = DateUtil.getDefaultDate()
    this.form.date = DateUtil.getDatetime(date, {date: -1})
  },
  async mounted() {
    ViewHelper.importElementUI()
  },
  methods: {
    getField(){
      return [
        {key: 'groupName', sortable: true, label: ''},
        {key: 'attendancePer', sortable: false, label: this.$i18n.tnl('label.attendancePer') },
        {key: 'allDayWorkPer', sortable: false, label: this.$i18n.tnl('label.allDayWorkPer') },
        {key: 'halfDayWorkPer', sortable: false, label: this.$i18n.tnl('label.halfDayWorkPer') },
        {key: 'temporaryTimeWorkPer', sortable: false, label: this.$i18n.tnl('label.temporaryTimeWorkPer') },
        {key: 'lateTimeWorkPer', sortable: false, label: this.$i18n.tnl('label.lateTimeWorkPer') },
        {key: 'detail', label: ''}
      ]
    },
    async display() {
      Util.debug('form', this.form)

      try {
        this.replace({showAlert: false})
        this.showProgress()
        if ( !Util.hasValue(this.form.date) ) {
          this.message = this.$i18n.tnl('message.pleaseEnterSearchCriteria')
          this.replace({showAlert: true})
          this.hideProgress()
          return
        }

        // データ取得
        const res = await this.fetchData(this.form)
        Util.debug('res', res)
        if (_.isEmpty(res)) {
          this.message = this.$i18n.t('message.listEmpty')
          this.replace({showAlert: true})
          this.hideProgress()
          return
        }

        // リスト作成
        this.createList(res)
      }
      catch(e) {
        console.error(e)
      }
      finally {
        this.hideProgress()
      }
    },
    async download(){
      let csv = ',' + this.getField().filter(e => e.label && e.label != '').map(e => e.label).join(',') + '\n' // ヘッダー
      _.forEach(this.viewList, v => {
        csv += `${v.groupName},${v.attendancePer},${v.allDayWorkPer},${v.halfDayWorkPer},${v.temporaryTimeWorkPer},${v.lateTimeWorkPer}\n`
      })
      BrowserUtil.fileDL('attendanceSum.csv', csv, CharSetHelper.getCharSet(this.$store.state.loginId))
    },
    async fetchData(form){
      const date = moment(form.date).format('YYYYMMDD')
      const url = `/office/attendance/sum/${date}`
      return await HttpHelper.getAppService(url)
    },
    async showDetail(item){
      this.replaceMain({selectedDate: this.form.date})
      this.replaceMain({attendanceGroupId: item.groupId})
      this.$router.push('/sum/attendanceDetail')
    },
    createList(data){
      this.viewList = data.map( e => {

        return {
          groupId: e.groupId ? e.groupId : 0,
          groupName: e.groupName ? e.groupName : '',
          attendancePer: e.total,
          allDayWorkPer: e.all,
          halfDayWorkPer: e.half,
          lateTimeWorkPer: e.late,
          temporaryTimeWorkPer: e.temp,
          isDetail: true
        }
      })
    },
    createListOld(data){
      this.viewList = []
      this.totalRows = 0

      const pots = this.pots.filter(e => e.potType == POT_TYPE.PERSON && e.group).map(e => {
        const groupId = e.group ? e.group.groupId : 10000
        return {...e, groupId}
      })

      // グループごとにまとめる
      const groups = ArrayUtil.sumData(pots, 'groupId')
      Util.debug('groups', groups)

      let attendance = {}
      data.forEach(e => attendance[e.potId] = e)

      // 表示作成
      let attendanceSum = 0
      let allSum = 0
      let halfSum = 0
      let tempSum = 0
      let lateSum = 0
      groups.forEach( list => {
        let attendanceCount = 0
        let allCount = 0
        let halfCount = 0
        let tempCount = 0
        let lateCount = 0
        list.forEach(pot => {
          const e = attendance[pot.potId]
          if(e && (e.outDt - e.inDt) >= 1000*60*60*APP.ATTENDANCE.TEMP_MIN_HOUR){
            attendanceCount++
            if((e.outDt - e.inDt) >= 1000*60*60*APP.ATTENDANCE.ALL_DAY_HOUR){
              allCount++
            }else if((e.outDt - e.inDt) >= 1000*60*60*APP.ATTENDANCE.HALF_DAY_HOUR){
              halfCount++
            }else{
              tempCount++
            }
            if(DateUtil.formatDateWithTimeZone(e.inDt, 'H') >= APP.ATTENDANCE.LATE_HOUR){
              lateCount++
            }
          }
        })
        attendanceSum += attendanceCount
        allSum += allCount
        halfSum += halfCount
        tempSum += tempCount
        lateSum += lateCount
        this.viewList.push({
          groupId: list[0].group ? list[0].group.groupId : 0,
          groupName: list[0].group ? list[0].group.groupName : '',
          attendancePer: NumberUtil.getPercent(attendanceCount, list.length),
          allDayWorkPer: NumberUtil.getPercent(allCount, list.length),
          halfDayWorkPer: NumberUtil.getPercent(halfCount, list.length),
          lateTimeWorkPer: NumberUtil.getPercent(lateCount, attendanceCount),
          temporaryTimeWorkPer: NumberUtil.getPercent(tempCount, list.length),
          isDetail: true
        })
      })
      // 全社追加
      this.viewList.unshift({
          groupId: 0,
          groupName: this.$i18n.tnl('label.companyWide'),
          attendancePer: NumberUtil.getPercent(attendanceSum, pots.length),
          allDayWorkPer: NumberUtil.getPercent(allSum, pots.length),
          halfDayWorkPer: NumberUtil.getPercent(halfSum, pots.length),
          lateTimeWorkPer: NumberUtil.getPercent(lateSum, attendanceSum),
          temporaryTimeWorkPer: NumberUtil.getPercent(tempSum, pots.length)
      })
      Util.debug('viewList', this.viewList)
      this.totalRows = this.viewList.length
      return
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/input.scss";
</style>
