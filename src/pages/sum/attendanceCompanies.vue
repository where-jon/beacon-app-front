<template>
  <div>
    <breadcrumb :items="breadCrumbs" :reload="false" />
    <div class="container">
      <alert :message="message" />

      <b-form inline @submit.prevent>
        <span v-t="'label.historyDateFrom'" class="d-flex align-items-center" />
        <date-picker v-model="form.fromDate" :clearable="false" type="date" class="ml-2 inputdatefrom" required />
        <label class="mr-sm-2" style="margin-left:10px;">～</label>
        <date-picker v-model="form.toDate" :clearable="false" type="date" class="ml-2 inputdatefrom" required />

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
      breadCrumbs: ViewHelper.createBreadCrumbItems('sumTitle', 'attendanceCompanies'),
      form: {
        fromDate: '',
        toDate: '',
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
          {
            key: 'index',
            label: this.$t('label.MANAGE_WORKERS.index'),
            sortable: true,
            tdClass: 'action-rowdata' 
          },
          {
            key: 'groupName',
            label: this.$t('label.MANAGE_WORKERS.company'),
            sortable: true,
            tdClass: null
          },
          {
            key: 'categoryName',
            label: this.$t('label.MANAGE_WORKERS.workName'),
            sortable: true,
            tdClass: null
          },
          {
            key: 'count',
            label: this.$t('label.MANAGE_WORKERS.count'),
            sortable: true,
            tdClass: null
          },
          {
            key: 'workTimeSum',
            label: this.$t('label.MANAGE_WORKERS.workTimeSum'),
            sortable: true,
            tdClass: null
          },
          {
            key: 'restTimeSum',
            label: this.$t('label.MANAGE_WORKERS.restTimeSum'),
            sortable: true,
            tdClass: null
          },
          {
            key: 'restTimeSelfSum',
            label: this.$t('label.MANAGE_WORKERS.restTimeSumSelf'),
            sortable: true,
            tdClass: null
          },
        ]
      },
      totalRows: 0,
    }
  },
  computed: {
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
    this.form.fromDate = DateUtil.getDatetime(date, {date: -1})
    this.form.toDate = DateUtil.getDatetime(date, {date: 0})
  },
  async mounted() {
    ViewHelper.importElementUI()
    try {
      this.showProgress()
      const groups = await HttpHelper.getAppService('/basic/group')
      this.companyOptions = groups.filter(g => g.groupType !== null && g.groupType === GROUP.TYPE.COMPANY)
      .map(g => {
        return {
          label: g.groupName,
          text: g.groupName,
          value: g.groupId
        }
      })
    } catch (e) {
      console.error(e)
    } finally {
      this.hideProgress()
    }
  },
  methods: {
    async display() {
      Util.debug('form', this.form)

      try {
        this.replace({showAlert: false})
        this.showProgress()
        if (!Util.hasValue(this.form.fromDate) || !Util.hasValue(this.form.toDate)) {
          this.message = this.$i18n.tnl('message.pleaseEnterPeriod')
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
      const fromDate = moment(this.form.fromDate).format('YYYYMMDD')
      const toDate = moment(this.form.toDate).format('YYYYMMDD')
      const url = `/office/manageworkers/company/${fromDate}/${toDate}${this.vueSelected.group ? '?company=' + this.vueSelected.group.value : ''}`
      const result = await HttpHelper.getAppService(url)
      return result
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
        return {
          index: (i+1),
          groupName: e.groupName,
          categoryName: e.categoryName,
          count: e.count,
          workTimeSum: e.workTimeSum,
          restTimeSum: e.restTimeSum,
          restTimeSelfSum: e.restTimeSelfSum,
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
