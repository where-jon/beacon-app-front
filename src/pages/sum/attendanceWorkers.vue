<template>
  <div>
    <breadcrumb :items="breadCrumbs" :reload="false" />
    <div class="container">
      <alert :message="message" />

      <b-form inline @submit.prevent>
        <span v-t="'label.date'" class="d-flex align-items-center" />
        <date-picker v-model="form.date" :clearable="false" type="date" class="ml-2 inputdatefrom" required />

        <label class="mr-sm-2" v-t="'label.group'" style="margin-left:10px;"/>
        <v-select v-model="vueSelected.group" :options="companyOptions">
          <template slot="no-options">
            {{ vueSelectNoMatchingOptions }}
          </template>
        </v-select>

        <b-button v-t="'label.display'" type="submit" :variant="theme" @click="display" />
        <b-button v-t="'label.download'" type="submit" :variant="theme" @click="download" style="margin-left:10px" />
      </b-form>
      <m-list :params="listParams" :total-rows="totalRows" :list="viewList" :alert-force-hide="true" />

      <!--
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
      -->
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
import * as VueSelectHelper from '../../sub/helper/ui/VueSelectHelper'
import * as MasterHelper from '../../sub/helper/domain/MasterHelper'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import * as CharSetHelper from '../../sub/helper/base/CharSetHelper'
import * as OptionHelper from '../../sub/helper/dataproc/OptionHelper'
import { GROUP } from '../../sub/constant/Constants'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../../components/mixin/commonmixin.vue'
import alert from '../../components/parts/alert.vue'
import mList from '../../components/page/list.vue'
import moment from 'moment'

export default {
  components: {
    DatePicker,
    breadcrumb,
    alert,
    mList,
  },
  mixins: [commonmixin],
  data () {
    return {
      breadCrumbs: ViewHelper.createBreadCrumbItems('sumTitle', 'attendanceWorkers'),
      form: {
        date: '',
        groupId: null,
      },
      vueSelected: {
        group: null,
      },
      message: '',
      viewList: [],
      currentPage: 1,
      perPage: 20,
      sortBy: 'name',
      totalRows: 0,
      allDayWorkPer: null,
      halfDayWorkPer: null,
      companyOptions: [],
      listParams: {
        hideNormalSearchBox: true,
        disableTableButtons: true,
        fields: [
          {key: 'index', sortable: false, label: this.$i18n.tnl('label.MANAGE_WORKERS.index') },
          {key: 'potName', sortable: false, label: this.$i18n.tnl('label.MANAGE_WORKERS.name') },
          {key: 'workName', sortable: false, label: this.$i18n.tnl('label.MANAGE_WORKERS.workName') },
          {key: 'startTime', sortable: false, label: this.$i18n.tnl('label.MANAGE_WORKERS.startTime') },
          {key: 'restTime', sortable: false, label: this.$i18n.tnl('label.MANAGE_WORKERS.restTime') },
          {key: 'restTimeSelfReport', sortable: false, label: this.$i18n.tnl('label.MANAGE_WORKERS.restTimeSelfReport') },
          {key: 'leaveTime', sortable: false, label: this.$i18n.tnl('label.MANAGE_WORKERS.leaveTime') },
        ]
      },
    }
  },
  computed: {
    ...mapState('app_service', ['groups']),
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
    const date = DateUtil.getDefaultDate()
    this.form.date = DateUtil.getDatetime(date, {date: -1})
  },
  async mounted() {
    ViewHelper.importElementUI()
    this.companyOptions = this.groups
    .filter(g => g.groupType === GROUP.TYPE.COMPANY).map(g => {
      return {
        label: g.groupName,
        text: g.groupName,
        value: g.groupId
      }
    })
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
      let csv = this.getField().filter(e => e.label && e.label != '').map(e => e.label).join(',') + '\n' // ヘッダー
      _.forEach(this.viewList, v => {
        csv += `${v.index},${v.potName},${v.workName},${v.startTime},${v.restTime},${v.restTimeSelfReport},${v.leaveTime}\n`
      })
      BrowserUtil.fileDL('workerAttendance.csv', csv, CharSetHelper.getCharSet(this.$store.state.loginId))
    },
    async fetchData(){
      this.viewList = []
      const date = moment(this.form.date).format('YYYYMMDD')
      const url = `/office/manageworkers/resttime/${date}/${this.vueSelected.group ? this.vueSelected.group.value : -1}`
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
      this.totalRows = this.viewList.length
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/input.scss";
</style>
