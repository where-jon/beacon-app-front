<template>
  <div>
    <breadcrumb :items="breadCrumbs" :reload="false" />
    <div class="container">
      <alert :message="message" />

      <b-form @submit.prevent>
        <b-form-row v-if="page=='activityGraph'">
          <span v-t="'label.historyDateFrom'" class="d-flex align-items-center" />
          <date-picker v-model="form.datetimeFrom" :clearable="false" type="datetime" class="ml-2 inputdatefrom" required />
          <span v-t="'label.historyDateTo'" class="d-flex align-items-center ml-2" />
          <date-picker v-model="form.datetimeTo" :clearable="false" type="datetime" class="ml-2 inputdateto" required />
        </b-form-row>
        <b-form-row v-if="page=='meetingGraph'">
          <table>
            <tr>
              <td><span v-t="'label.historyDateFrom'" class="d-flex align-items-center" /></td>
              <td><date-picker v-model="form.datetimeFrom" :clearable="false" type="date" style="width:150px;" class="inputdatefrom" required /></td>
              <td width="10px"></td>
              <td><b-form-select v-model="form.hourFrom" :options="hoursOptions" /></td>
              <td>{{ $i18n.tnl('label.hour') }}</td>
              <td><b-form-select v-model="form.minuteFrom" :options="minutesOptions" /></td>
              <td>{{ $i18n.tnl('label.minute') }}</td>
              <td><span v-t="'label.historyDateTo'" class="d-flex align-items-center" /></td>
              <td><date-picker v-model="form.datetimeTo" :clearable="false" type="date" style="width:150px;" class="inputdateto" required /></td>
              <td width="10px"></td>
              <td><b-form-select v-model="form.hourTo" :options="hoursOptions" /></td>
              <td>{{ $i18n.tnl('label.hour') }}</td>
              <td><b-form-select v-model="form.minuteTo" :options="minutesOptions"/></td>
              <td>{{ $i18n.tnl('label.minute') }}</td>
            </tr>
          </table>
        </b-form-row>

        <b-form-row class="mt-3">
          <span v-if="filter=='group'" v-t="'label.group'" class="d-flex align-items-center" />
          <span v-if="filter=='group'" :title="vueSelectTitle(vueSelected.group)">
            <v-select v-model="vueSelected.group" :options="groupOptions" class="ml-2 inputSelect vue-options">
              <template slot="selected-option" slot-scope="option">
                {{ vueSelectCutOn(option) }}
              </template>
              <template slot="no-options">
                {{ vueSelectNoMatchingOptions }}
              </template>
            </v-select>
          </span>

          <span v-if="filter=='area'" v-t="'label.area'" class="d-flex align-items-center" />
          <span v-if="filter=='area'" :title="vueSelectTitle(vueSelected.area)">
            <v-select v-model="vueSelected.area" :options="areaOptions" class="ml-2 inputSelect vue-options">
              <template slot="selected-option" slot-scope="option">
                {{ vueSelectCutOn(option) }}
              </template>
              <template slot="no-options">
                {{ vueSelectNoMatchingOptions }}
              </template>
            </v-select>
          </span>

          <span v-if="page=='meetingGraph'" v-t="'label.mode'" class="d-flex align-items-center" />
          <span v-if="page=='meetingGraph'" :title="vueSelectTitle(vueSelected.area)">
            <b-form-select v-model="form.graph" :options="graphOptions" class="ml-2" />
          </span>
        </b-form-row>

        <b-form-row class="mt-3 mb-3">
          <b-button v-t="'label.display'" type="submit" :variant="theme" @click="display(false)" />
          <b-button v-if="download" v-t="'label.download'" type="submit" :variant="theme" @click="display(true)" class="ml-2" />
        </b-form-row>
      </b-form>

      <slot />
      <b-row class="mt-3" />
      <b-table :items="viewList" :fields="getField()" :current-page="currentPage" :per-page="perPage" :sort-by.sync="sortBy" :sort-compare="defaultSortCompare" stacked="md" striped hover outlined>
        <template slot="graph" slot-scope="row">
          <div style="position: relative;">
            <div v-for="(bar, index) in row.item.graph" :key="index" :class="bar.name? 'stay-bar': 'lost-bar'" :style="bar.style">
              <span class="graph-arrow-box">
                {{ bar.name ? bar.name : $i18n.tnl('label.absence') }} <br>
                {{ bar.time }} <br>
                {{ bar.ratio }}%
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
import { APP, DEV } from '../../sub/constant/config'
import { CATEGORY } from '../../sub/constant/Constants'
import * as DateUtil from '../../sub/util/DateUtil'
import * as Util from '../../sub/util/Util'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import * as MasterHelper from '../../sub/helper/domain/MasterHelper'
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
  props: ['page', 'type', 'filter', 'download'],
  data () {
    return {
      breadCrumbs: ViewHelper.createBreadCrumbItems('sumTitle', this.page),
      form: {
        datetimeFrom: '',
        datetimeTo: '',
        hourFrom: 0,
        hourTo: 0,
        minuteFrom: 0,
        minuteTo: 0,
        graph: 'location'
      },
      vueSelected: {
        group: null,
        area: null
      },
      message: '',
      viewList: [],
      name: '',
      currentPage: 1,
      perPage: 20,
      sortBy: 'name',
      totalRows: 0,
      potMap: null,
      exbMap: null
    }
  },
  computed: {
    graphOptions(){
      return [
        { value: 'location', text: this.$i18n.tnl('label.initLocation')},
        { value: 'zone', text: this.$i18n.tnl('label.zone')}
      ]
    },
    hoursOptions(){
      let ret = []
      for(let i = 0; i < 24; i++){
        ret.push({ value:i, text:i })
      }
      return ret
    },
    minutesOptions(){
      let ret = []
      for(let i = 0; i < 60; i += APP.POSITION_SUMMARY_INTERVAL){
        ret.push({ value:i, text:i })
      }
      return ret
    } 
  },
  watch: {
    'vueSelected.group': {
      handler: function(newVal, oldVal){
        this.form.groupId = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
    'vueSelected.area': {
      handler: function(newVal, oldVal){
        this.form.areaId = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
  },
  async created() {
    const date = DateUtil.getDefaultDate()
    this.form.datetimeFrom = DateUtil.getDatetime(date, {date: -1})
    this.form.datetimeTo = DateUtil.getDatetime(date)
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
      return this.$parent.getField()
    },
    async display(isDownload) {
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
        const data = await this.$parent.fetchData(this.form)
        if (_.isEmpty(data)) {
          this.message = this.$i18n.t('message.listEmpty')
          this.replace({showAlert: true})
          this.hideProgress()
          return
        }

        // グラフ作成
        if(isDownload){
          this.$parent.download(this.form, data)
        }else{
          const func = {getTotal: this.getTotal}
          this.viewList = this.$parent.createGraph(this.form, data, func)
        }

        Util.debug("viewList", this.viewList)

        this.totalRows = this.viewList.length
      }
      catch(e) {
        console.error(e)
      }
      finally {
        this.hideProgress()
      }
    },
    getTotal(fromDt, toDt){
      let fromDate = fromDt.getYear()*10000 + fromDt.getMonth()*100 + fromDt.getDate()
      let toDate = toDt.getYear()*10000 + toDt.getMonth()*100 + toDt.getDate()
      const start = (Math.floor(APP.SVC.STAY_SUM.START / 100)*60 + APP.SVC.STAY_SUM.START % 100) * 60
      const end = (Math.floor(APP.SVC.STAY_SUM.END / 100)*60 + APP.SVC.STAY_SUM.END % 100) * 60

      // 開始と終了時間を丸める
      let fromTime = fromDt.getHours() * 3600 + fromDt.getMinutes() * 60 + fromDt.getSeconds()
      let toTime = toDt.getHours() * 3600 + toDt.getMinutes() * 60 + toDt.getSeconds()
      if(fromTime > end){
        fromTime = start
        fromDate++        
      }
      fromTime = Math.max(fromTime, start)
      if(toTime < start){
        toTime = end
        toDate--
      }
      const isEnd = toTime > end // endで丸めたか？
      toTime = Math.min(toTime, end)

      // 1日の場合
      let total = 0
      if(fromDate == toDate){
        total = toTime - fromTime
      }else{
        // 2日以上の場合
        total += end - fromTime
        total += toTime - start
        total += (toDate - fromDate - 1) * (end - start)
      }
      Util.debug('total', total)
      return total
    },
    round(sec){
      // コマ時間に揃える
      const interval = APP.POSITION_SUMMARY_INTERVAL * 60
      return Math.floor(sec / interval) * interval
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/input.scss";
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
</style>
