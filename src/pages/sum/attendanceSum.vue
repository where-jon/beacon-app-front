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
        {key: 'index', sortable: false, label: this.$i18n.tnl('label.MANAGE_WORKERS.index') },
        {key: 'potName', sortable: false, label: this.$i18n.tnl('label.MANAGE_WORKERS.name') },
        {key: 'workName', sortable: false, label: this.$i18n.tnl('label.MANAGE_WORKERS.workName') },
        {key: 'startTime', sortable: false, label: this.$i18n.tnl('label.MANAGE_WORKERS.startTime') },
        {key: 'restTime', sortable: false, label: this.$i18n.tnl('label.MANAGE_WORKERS.restTime') },
        {key: 'restTimeSelfReport', sortable: false, label: this.$i18n.tnl('label.MANAGE_WORKERS.restTimeSelfReport') },
        {key: 'leaveTime', sortable: false, label: this.$i18n.tnl('label.MANAGE_WORKERS.leaveTime') },
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
      const url = `/core/manageworkers/resttime/${date}/63`
      return await HttpHelper.getAppService(url)
    },
    async showDetail(item){
      this.replaceMain({selectedDate: this.form.date})
      this.replaceMain({attendanceGroupId: item.groupId})
      this.$router.push('/sum/attendanceDetail')
    },
    createList(data){
      const getTime = (s) => {
        const d = new Date(s)
        return `${d.getHours()}:${('00' + d.getMinutes()).slice(-2)}`
      }
      this.viewList = data.map( (e, i, a) => {
        console.log(e)
        let startTime = getTime(e.startTime)
        let leaveTime = getTime(e.leaveTime)
        return {
          index: (i+1),
          potName: e.potName,
          workName: e.workName,
          startTime: startTime,
          restTime: e.restTime,
          restTimeSelfReport: e.restTimeSelfReport,
          leaveTime: leaveTime,
        }
      })
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/input.scss";
</style>
