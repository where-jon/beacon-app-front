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
            <b-button v-t="'label.display'" type="submit" :variant="theme" @click="display(false)" />
            <b-button v-t="'label.download'" type="submit" :variant="theme" @click="display(true)" class="ml-2" />
          </b-form-row>
        </b-form-group>
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
  props: ['page', 'type'],
  data () {
    return {
      items: ViewHelper.createBreadCrumbItems('sumTitle', this.page),
      form: {
        datetimeFrom: '2020-02-20 00:00:00',
        datetimeTo: '2020-02-21 00:00:00'
      },
      vueSelected: {
        group: null,
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
    ...mapState('app_service', [
      'groups',
      'pots',
      'categories',
      'zones',
    ]),
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
  },
  async created() {
    const date = DateUtil.getDefaultDate()
    // this.form.datetimeFrom = DateUtil.getDatetime(date, {date: -1})
    // this.form.datetimeTo = DateUtil.getDatetime(date)
    
    this.potMap = this.getPotMap()
    this.exbMap = this.getExbMap()
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
      if(this.type=="pot"){
        return [
          {key: 'name', sortable: true, label: this.$i18n.tnl('label.potName')},
          {key: 'groupName', sortable: true, label: this.$i18n.tnl('label.groupName') },
          {key: 'graph', sortable: false, label: this.$i18n.tnl('label.graph'), thStyle: {height: '50px !important', width:'400px !important'} },
          {key: 'stayTime', sortable: false, label: this.$i18n.tnl('label.stayTime') },
          {key: 'lostTime', sortable: false, label: this.$i18n.tnl('label.lostTime') },
        ]
      }
      if(this.type=="zone"){
        return [
          {key: 'name', sortable: true, label: this.$i18n.tnl('label.potName')},
          {key: 'groupName', sortable: true, label: this.$i18n.tnl('label.groupName') },
          {key: 'graph', sortable: false, label: this.$i18n.tnl('label.numUsersGraph'), thStyle: {height: '50px !important', width:'400px !important'} },
          {key: 'ratio', sortable: false, label: this.$i18n.tnl('label.utilizationRatio') },
        ]
      }
      return []
    },
    async display(isDownload) {
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
        if(this.type=='pot'){
          this.viewList = this.createPotGraph(data)
        }
        if(this.type=='zone'){
          this.viewList = this.createZoneGraph(data)
        }

        console.log("viewList", this.viewList)

        if(isDownload){
          this.download(data)
        }

        this.totalRows = this.viewList.length
      }
      catch(e) {
        console.error(e)
      }
      finally {
        this.hideProgress()
      }
    },
    formatTime(time){
      const date = new Date(time)
      const h = date.getHours()
      const m = date.getMinutes()
      return (h >= 10 ? h : "0" + h) + ":" + (m >= 10 ? m : "0" + m)
    },
    async download(data) {
      let csv = ""
      if(this.type=='pot'){
        const sum = this.sumData(data, 'txId')

        const from = new Date(this.form.datetimeFrom).getTime()
        const to = new Date(this.form.datetimeTo).getTime()
        const interval = APP.POSITION_SUMMARY_INTERVAL * 60 * 1000

        csv += ","
        for(var time=from; time<to; time += interval){
          csv += "," + this.formatTime(time)
        }
        csv += "\n"

        sum.forEach(posList => {
          const pot = this.potMap[posList[0].txId]          
          const groupName = pot && pot.group ? pot.group.groupName : null
          const txCd = pot && pot.txIdNames[0]
          if(groupName && txCd){
          csv += groupName + "," + txCd
            for(var time=from; time<to; time += interval){
              const pos = posList.find(pos => {
                // 線形探索をしているので重いかもしれない
                const timestamp = pos.date + (Math.floor(pos.timestamp / 100) * 60 + pos.timestamp%60) * 60 * 1000
                return time == timestamp
              })
              csv += ","
              if(pos){
                const exb = this.exbMap[pos.exbId]
                csv += exb.deviceId
              }
            }
          }
          csv += "\n"
        })        
      }

      const searchDate = moment(this.form.date).format('YYYY-MM-DD')
      const group = this.form.groupId? this.groups.find((val) => val.groupId == this.form.groupId): null
      const groupName =  group? '_' + group.groupName: ''

      BrowserUtil.fileDL(
        searchDate + groupName + '_activity.csv',
        csv,
        getCharSet(this.$store.state.loginId)
      )

    },
    sumData(data, type){
      return data.reduce( (sum, obj) => {
        const key = obj[type]
        if(!sum[key]){
          sum[key] = []
        }
        sum[key].push(obj)
        return sum
      }, []).filter(d => d[type] == null)
    },
    createPotGraph(data) {
      const sum = this.sumData(data, 'txId')
      console.log('sum', sum)

      const from = new Date(this.form.datetimeFrom).getTime()
      const to = new Date(this.form.datetimeTo).getTime()
      const total = (to - from)/1000
      
      return sum.map( posList => {
        console.log('len', posList.length)
        const stayTime = posList.length * APP.POSITION_SUMMARY_INTERVAL * 60
        const posGroup = this.sumData(posList, 'exbId')
        console.log('posGroup', posGroup)
        const graph = posGroup.map( group => {
          const exb = this.exbMap[group[0].exbId]
          const zoneName = exb && exb.location && exb.location.zoneList && exb.location.zoneList.length >= 1 ? exb.location.zoneList[0].zoneName : null
          const time = group.length * APP.POSITION_SUMMARY_INTERVAL * 60
          const ratio = Math.floor(group.length * APP.POSITION_SUMMARY_INTERVAL * 60 / total * 100)
          return {
            name: zoneName,
            time: DateUtil.toHHmm(time),
            ratio
          }
        })
        graph.sort( (a,b) => {
          return b.ratio - a.ratio
        })
        graph.forEach( (g, i) => {
          const color = this.getStackColor(i)
          g.style = `width: ${g.ratio}% !important; background: ${color};`
        })
        // 不在追加
        if(total - stayTime > 0){
          const ratio = Math.floor((total-stayTime)/total*100)
          const color = ColorUtil.colorCd4display(this.otherColor)
          graph.push({
            style: `width: ${ratio}% !important;`,
            time: DateUtil.toHHmm(total-stayTime),
            ratio
          })
        }
        const pot = this.potMap[posList[0].txId]
        const potName = pot ? pot.potName : null
        const groupName = pot && pot.group ? pot.group.groupName : null
        const groupId = pot && pot.group ? pot.group.groupId : null
        return {
          name: potName,
          groupName,
          groupId,
          graph,
          stayTime: DateUtil.toHHmm(stayTime),
          lostTime: DateUtil.toHHmm(total - stayTime)
        }
      }).filter(view => view.name != null && (view.groupId == this.form.groupId || !this.form.groupId))
    },
    createZoneGraph(baseData) {

      // zone情報を付与
      const data = baseData.filter( d => {
        const exb = this.exbMap[d.exbId]
        if(!exb){
          return false
        }
        return exb.location && exb.location.zoneList && exb.location.zoneList.length>=1
      }).map( d => {
        const exb = this.exbMap[d.exbId]
        const zone = exb.location.zoneList[0]
        return {...d, zoneId:zone.zoneId, zone}
      })
      console.log('data', data)

      const sum = this.sumData(data, 'zoneId')
      console.log('sum', sum)

      const from = new Date(this.form.datetimeFrom).getTime()
      const to = new Date(this.form.datetimeTo).getTime()
      const total = (to - from)/1000
      
      return sum.map( posList => {
        const stayTime = posList.length * APP.POSITION_SUMMARY_INTERVAL * 60
        const posGroup = this.sumData(posList, 'txId')
        console.log('posGroup', posGroup)
        console.log('stayTime', stayTime)
        console.log('total', total)

        // 同一時刻の集計
        const countMap = {}
        posList.forEach(pos => {
          const timestamp = pos.date + Math.floor(pos.timestamp / 100) * 60 * 60 * 1000 + pos.timestamp % 100 * 60 * 1000
          if(!countMap[timestamp]){
            countMap[timestamp] = 0
          }
          countMap[timestamp]++
          countMap[timestamp] = Math.min(countMap[timestamp], 6)
        })
        console.log(countMap)


        const graph = []
        let i=6
        while(i-- > 0){
          const countList = Object.keys(countMap).map(key => { return {key, value:countMap[key]} })
          const times = countList.filter(c => c.value == i)
          console.log('times', times)
          const time = times.length * APP.POSITION_SUMMARY_INTERVAL * 60
          const ratio = Math.floor(times.length * APP.POSITION_SUMMARY_INTERVAL * 60 / total * 100)
          const color = this.getStackColor(i)
          graph.push({
            name: i,
            style: `width: ${ratio}% !important; background: ${color};`,
            time: DateUtil.toHHmm(time),
            ratio
          })
        }
        const zoneName = posList[0].zone.zoneName
        const categoryName = posList[0].zone.categoryName
        return {
          name: zoneName,
          groupName: categoryName,
          graph,
          ratio: Math.floor(stayTime / total * 100) + "%"
        }
      }).filter(view => view.name != null)
    },
    getPotMap() {
      const potMap = {}
      this.pots.forEach(pot => {
        potMap[pot.txIds[0]] = pot
      })
      console.log('potMap', potMap)
      return potMap
    },
    getExbMap() {
      const exbMap = {}
      this.exbs.forEach(exb => {
        exbMap[exb.exbId] = exb
      })
      console.log('exbMap', exbMap)
      return exbMap
    },
    getGroupName(potId) {
      const pot = this.pots.find(p => p.potId == potId)
      return pot && pot.group ? pot.group.groupName : null
    },
    getStackColor(index) {
      // 設定が6色以上ある事が前提
      return DISP.SUM_STACK_COLOR[index % DISP.SUM_STACK_COLOR.length]
    },
    async getData(form){
      const param = {}
      const from = new Date(form.datetimeFrom).getTime()
      const to = new Date(form.datetimeTo).getTime()
      const url = `/core/positionHistory/summary/${from}/${to}/${APP.POSITION_SUMMARY_INTERVAL}/${APP.POSITION_SUMMARY_RECEIVE_COUNT}`
      const sumData = await HttpHelper.getAppService(url)
      console.log('sumData', sumData)
      // 重複データを排除
      let pre = null
      const ret = sumData.filter(s => {
        const dupe = pre && s.date==pre.date && s.timestamp==pre.timestamp && s.txId==pre.txId
        pre = s       
        return !dupe
      })
      console.log('filter', ret)
      return ret
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
