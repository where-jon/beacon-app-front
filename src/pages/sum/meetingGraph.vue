<template>
  <activity-base
    page="meetingGraph"
    type="zone"
    filter="area"
    download="true"
  />
</template>

<script>
import activityBase from '../../components/page/activityBase.vue'
import { APP, DISP, DEV } from '../../sub/constant/config'
import * as Util from '../../sub/util/Util'
import * as ArrayUtil from '../../sub/util/ArrayUtil'
import * as DateUtil from '../../sub/util/DateUtil'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import { getCharSet } from '../../sub/helper/base/CharSetHelper'
import moment from 'moment'
import commonmixin from '../../components/mixin/commonmixin.vue'

export default {
  components: {
    activityBase,
  },
  mixins: [commonmixin],
  computed: {
  },
  methods: {
    async getData(form){
      const param = {}
      const from = new Date(form.datetimeFrom).getTime()
      const to = new Date(form.datetimeTo).getTime()
      const url = `/core/positionHistory/summaryBy/${DISP.MEETING.GROUP_BY}_id/${from}/${to}/${APP.POSITION_SUMMARY_INTERVAL}/${APP.POSITION_SUMMARY_RECEIVE_COUNT}`
      const data = await HttpHelper.getAppService(url)
      Util.debug('data', data)

      let ret = null
      if(DISP.MEETING.AXIS_TYPE == "exb"){ // TODO:DISPではなくAPPへ
        const exbMap = this.getExbMap()
        ret = data.filter( d => { // TODO:filterはいらない
          const exb = exbMap[d.axisId]
          return exb && exb.location
        }).map( d => {
          const exb = exbMap[d.axisId]
          return {...d, name:exb.deviceId}
        })
      }else if(DISP.MEETING.AXIS_TYPE == "location" || DISP.MEETING.AXIS_TYPE == "zone"){
        const locationMap = this.getLocationMap()
        ret = data.filter( d => {
          const location = locationMap[d.axisId]
          return location != null
        }).map( d => {
          const location = locationMap[d.axisId]
          return {...d, location}
        })
      }/*else if(DISP.MEETING.AXIS_TYPE == "zone"){
        const zoneMap = this.getZoneMap()
        ret = data.filter( d => {
          const location = zoneMap[d.axisId]
          return location != null
        }).map( d => {
          const location = zoneMap[d.axisId]
          return {...d, location}
        })
      }*/
      Util.debug('data2', ret)
      return ret
    },
    createGraph(form, data) {
      const sum = ArrayUtil.sumData(data, 'axisId')
      Util.debug('sum', sum)

      const from = new Date(form.datetimeFrom).getTime()
      const to = new Date(form.datetimeTo).getTime()
      const total = (to - from)/1000
      Util.debug('total', total)
      
      return sum.map( posList => {
        // グラフ作成
        const graph = []
        let stayRatio = 0
        const max = DISP.MEETING.MAX_NUM
        //let i = max
        for(let i=1; i<=max; i++){
          const count = posList.filter(pos => pos.cnt==i || (i==max && pos.cnt>=max)).length
          const second = count * APP.POSITION_SUMMARY_INTERVAL * 60
          const percent = second / total * 100.0
          stayRatio += percent
          const color = this.getStackColor(i) // TODO
          graph.push({
            name: i,
            style: `width: ${percent}% !important; background: ${color};`,
            time: DateUtil.toHHmm(second),
            percent: Math.floor(percent)
          })
        }
        // TODO:0人追加

        // リスト作成
        const areaName = this.getArea(posList[0]).areaName // TODO
        const areaId = this.getArea(posList[0]).areaId // TODO
        return {
          name: this.getName(posList[0]), // TODO
          areaId,
          areaName,
          graph,
          ratio: stayRatio + "%"
        }
      }).filter(view => view.name != null && (!form.areaId || form.areaId==view.areaId))
    },
    // TODO:以下消す
    getName(pos){
      if(DISP.MEETING.AXIS_TYPE == "exb"){
        return pos.exb.deviceId
      }
      if(DISP.MEETING.AXIS_TYPE == "location"){
        return pos.location.locationName
      }
      if(DISP.MEETING.AXIS_TYPE == "zone"){
        return pos.location.zoneList && pos.location.zoneList.length >= 1 ? 
          pos.location.zoneList[0].zoneName : null
      }
      return null
    },
    getArea(pos){
      if(DISP.MEETING.AXIS_TYPE == "exb"){
        return { areaId: pos.exb.areaId, areaName: pos.exb.areaName }
      }
      if(DISP.MEETING.AXIS_TYPE == "location"){
        return pos.location.area
      }
      if(DISP.MEETING.AXIS_TYPE == "zone"){
        return pos.location.area
      }
      return null
    },
    // cdを返す
    getCd(pos){
      if(DISP.MEETING.AXIS_TYPE == "exb"){
        return pos.exb.deviceId
      }
      if(DISP.MEETING.AXIS_TYPE == "location"){
        return pos.location.locationCd
      }
      if(DISP.MEETING.AXIS_TYPE == "zone"){
        return pos.location.zoneList && pos.location.zoneList.length >= 1 ? 
          pos.location.zoneList[0].zoneCd : null
      }
      return null
    },
    // csvのカラムを返す
    getCol(){
      if(DISP.MEETING.AXIS_TYPE == "exb"){
        return "device_id,location_name" // TODO:日本語化
      }
      if(DISP.MEETING.AXIS_TYPE == "location"){
        return "location_cd,location_name"
      }
      if(DISP.MEETING.AXIS_TYPE == "zone"){
        return "zone_cd,zone_name"
      }
      return null
    },
    getStackColor(index) {
      // 設定が6色以上ある事が前提
      return DISP.SUM_STACK_COLOR[index % DISP.SUM_STACK_COLOR.length]
    },
    download(form, data) {
      const from = new Date(form.datetimeFrom).getTime()
      const to = new Date(form.datetimeTo).getTime()
      const interval = APP.POSITION_SUMMARY_INTERVAL * 60 * 1000

      const sum = ArrayUtil.sumData(data, 'timestamp') // TODO:keyBy
      Util.debug('sum', sum)

      let csv = "basetime," + this.getCol() + ",count\n"
      for(var time=from; time<to; time += interval){
        if(sum[time]){
          console.log(sum[time].length)
          sum[time].forEach(pos => {
            const cd = this.getCd(pos)
            // TODO:nameも追加
            csv += this.formatTime(time) + "," + cd + "," + pos.cnt + "\n"
          })
        }
      }

      const searchDate = moment(form.date).format('YYYY-MM-DD') // TODOファイル名をfrom-toにする

      // TODO:Areaに変更
      const group = form.groupId? this.groups.find((val) => val.groupId == form.groupId): null
      const groupName =  group? '_' + group.groupName: ''

      BrowserUtil.fileDL(
        searchDate + groupName + '_meeting.csv',
        csv,
        getCharSet(this.$store.state.loginId)
      )
    }, 
    formatTime(time){
      const date = new Date(time)
      const h = date.getHours()
      const m = date.getMinutes()
      return (h >= 10 ? h : "0" + h) + ":" + (m >= 10 ? m : "0" + m)
    },
    // TODO
    getExbMap() {
      const exbMap = {}
      this.exbs.forEach(exb => {
        exbMap[exb.exbId] = exb
      })
      Util.debug('exbMap', exbMap)
      return exbMap
    },
    getLocationMap() {
      const locationMap = {}
      this.locations.forEach(loc => {
        locationMap[loc.locationId] = loc
      })
      Util.debug('locationMap', locationMap)
      return locationMap
    },
    getZoneMap() {
      const zoneMap = {}
      this.zones.forEach(zone => {
        zoneMap[zone.zoneId] = zone
      })
      Util.debug('zoneMap', zoneMap)
      return zoneMap
    },
  }
}
</script>

<style scoped lang="scss">
</style>
