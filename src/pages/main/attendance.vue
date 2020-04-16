<template>
  <div>
    <breadcrumb :items="breadCrumbs" :reload="false" />
    <div class="container">
      <alert :message="message" />

      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row class="mr-3">

            <label v-t="'label.name'" />
            <span :title="vueSelectTitle(form.pot)">
              <v-select v-model="form.pot" :options="potOptions" class="ml-2 inputSelect vue-options">
                <template slot="selected-option" slot-scope="option">
                  {{ vueSelectCutOn(option) }}
                </template>
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </span>
            
            <label v-t="'label.group'" class="ml-2" />
            <span :title="vueSelectTitle(form.group)">
              <v-select v-model="form.group" :options="groupOptions" class="ml-2 inputSelect vue-options">
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
            <span v-t="'label.date'" class="d-flex align-items-center" />
            <date-picker v-model="form.date" :clearable="false" type="date" class="ml-2 inputdatefrom" required />

            <b-button v-t="'label.display'" type="submit" :variant="theme" @click="display" class="ml-2" />
            <b-button v-t="'label.download'" type="submit" :variant="theme" @click="download" class="ml-2" />
          </b-form-row>
        </b-form-group>
      </b-form>

      <b-row class="mt-2" v-if="allDayWorkPer">
        {{$i18n.tnl("label.allDayWorkPer")}} {{allDayWorkPer}} {{$i18n.tnl("label.halfDayWorkPer")}} {{halfDayWorkPer}}
      </b-row>

      <b-row class="mt-3">
        <b-table :items="viewList" :fields="getField()" :current-page="currentPage" :per-page="perPage" :sort-by.sync="sortBy" :sort-compare="defaultSortCompare" stacked="md" striped hover outlined />
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
import { APP, DEV, DISP } from '../../sub/constant/config'
import { CATEGORY } from '../../sub/constant/Constants'
import * as DateUtil from '../../sub/util/DateUtil'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
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
      breadCrumbs: ViewHelper.createBreadCrumbItems('sumTitle', 'attendanceKey'),
      form: {
        date: '',
        pot: null,
        group: null
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
    window.addEventListener('resize', () => {
      this.$forceUpdate()
    })
    if (this.categories.length < 1) {
      return
    }
  },
  methods: {
    getField(){
      return [
        {key: 'name', sortable: true, label: this.$i18n.tnl('label.potName')},
        {key: 'groupName', sortable: true, label: this.$i18n.tnl('label.groupName') },
        {key: 'entranceTime', sortable: false, label: this.$i18n.tnl('label.entranceTime') },
        {key: 'exitTime', sortable: false, label: this.$i18n.tnl('label.exitTime') },
        {key: 'lastDetected', sortable: false, label: this.$i18n.tnl('label.lastDetected') },
        {key: 'stayTime', sortable: false, label: this.$i18n.tnl('label.stayTime') },
        {key: 'status', sortable: false, label: this.$i18n.tnl('label.status') },
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
    async fetchData(form){
      const date = moment(form.date).format('YYYYMMDD')
      const potId = this.form.pot ? this.form.pot.value : 0
      const groupId = this.form.group ? this.form.group.value : 0
      const url = `/office/attendance/list/${date}/${potId}/${groupId}`
      return await HttpHelper.getAppService(url)
    },
    async download(){
      let csv = _.map(this.getField(), e => e.label).join(',') + '\n' // ヘッダー
      _.forEach(this.viewList, v => {
        csv += `${v.name},${v.groupName ? v.groupName : ''},${v.entranceTime},${v.exitTime},${v.lastDetected},${v.stayTime},${v.status}\n`
      })
      BrowserUtil.fileDL('attendance.csv', csv, CharSetHelper.getCharSet(this.$store.state.loginId))
    },
    createList(data){
      let allCount = 0
      let halfCount = 0
      this.viewList = data.map( e => {
        const pot = this.potIdMap[e.potId]
        const group = pot.group ? this.groupIdMap[pot.group.groupId] : null
        const location = this.locationIdMap[e.locationId]
        const zoneName = location ? location.zoneList.length>0 && location.zoneList[0].zoneName : null

        // 勤務時間判定
        let status = ''
        if((e.outDt - e.inDt)>=1000*60*60*DISP.ATTENDANCE.ALL_DAY_HOUR){
          status = this.$i18n.tnl("label.allDayWork")
          allCount++
        }else if((e.outDt - e.inDt)>=1000*60*60*DISP.ATTENDANCE.HALF_DAY_HOUR){
          status = this.$i18n.tnl("label.halfDayWork")
          halfCount++
        }else{
          status = this.$i18n.tnl("label.temporaryTimeWork")
        }
        const h = DateUtil.formatDateWithTimeZone(e.inDt, 'H')
        if(h >= DISP.ATTENDANCE.LATE_HOUR){
          status += " " + this.$i18n.tnl("label.lateTimeWork")
        }
        return {
          name: e.potName, 
          groupName: group ? group.groupName : null,
          entranceTime: DateUtil.formatDate(e.inDt),
          exitTime: DateUtil.formatDate(e.outDt),
          lastDetected: zoneName,
          stayTime: DateUtil.toHHmm( (e.outDt - e.inDt)/1000),
          status
        }
      })
      Util.debug("viewList", this.viewList)

      if(this.viewList.length > 0){
        this.allDayWorkPer = Math.floor(allCount / this.viewList.length * 100) + '%'
        this.halfDayWorkPer = Math.floor(halfCount / this.viewList.length * 100) + '%'
      }

      this.totalRows = this.viewList.length
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/input.scss";
</style>
