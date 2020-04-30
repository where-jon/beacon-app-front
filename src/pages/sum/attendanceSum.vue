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
          groupName: e.groupId == 0 ? this.$i18n.tnl('label.companyWide') : e.groupName,
          attendancePer: NumberUtil.getPercent(e.total),
          allDayWorkPer: NumberUtil.getPercent(e.all),
          halfDayWorkPer: NumberUtil.getPercent(e.half),
          lateTimeWorkPer: NumberUtil.getPercent(e.late),
          temporaryTimeWorkPer: NumberUtil.getPercent(e.temp),
          isDetail: true
        }
      })
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/input.scss";
</style>
