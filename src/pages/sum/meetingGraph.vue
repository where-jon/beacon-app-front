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
import moment from 'moment'
import { getCharSet } from '../../sub/helper/base/CharSetHelper'

export default {
  components: {
    activityBase,
  },
  computed: {
  },
  methods: {
    async getData(form){
      const param = {}
      const from = new Date(form.datetimeFrom).getTime()
      const to = new Date(form.datetimeTo).getTime()
      const axis = "exb"
      const url = `/core/positionHistory/summaryBy/${axis}/${from}/${to}/${APP.POSITION_SUMMARY_INTERVAL}/${APP.POSITION_SUMMARY_RECEIVE_COUNT}`
      const sumData = await HttpHelper.getAppService(url)
      Util.debug('sumData', sumData)
      return sumData
    },
    createGraph(form, baseData) {
      // zone情報を付与
      const data = baseData.filter( d => {
        const exb = form.exbMap[d.exbId]
        if(!exb){
          return false
        }
        return exb.location && exb.location.zoneList && exb.location.zoneList.length>=1
      }).map( d => {
        const exb = form.exbMap[d.exbId]
        const zone = exb.location.zoneList[0]
        return {...d, exb, zoneId:zone.zoneId, zone}
      })
      Util.debug('data', data)

      const sum = ArrayUtil.sumData(data, DISP.MEETING.AXIS_TYPE + 'Id')
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
        let i=max
        while(i > 0){
          const times = posList.filter(pos => pos.cnt==i || (i==max && pos.cnt>=max))
          const time = times.length * APP.POSITION_SUMMARY_INTERVAL * 60
          const ratio = Math.floor(times.length * APP.POSITION_SUMMARY_INTERVAL * 60 / total * 100)
          stayRatio += ratio
          const color = this.getStackColor(i)
          graph.push({
            name: i,
            style: `width: ${ratio}% !important; background: ${color};`,
            time: DateUtil.toHHmm(time),
            ratio
          })
          i--
        }

        // リスト作成
        const zoneName = posList[0].zone.zoneName
        //const categoryName = posList[0].zone.categoryName
        //const categoryId = posList[0].zone.categoryId
        const areaName = posList[0].exb.areaName
        const areaId = posList[0].exb.areaId
        return {
          name: zoneName,
          areaId,
          areaName,
          graph,
          ratio: stayRatio + "%"
        }
      }).filter(view => view.name != null && (!form.areaId || form.areaId==view.areaId))
    },
    getStackColor(index) {
      // 設定が6色以上ある事が前提
      return DISP.SUM_STACK_COLOR[index % DISP.SUM_STACK_COLOR.length]
    },
    download(form, baseData) {
      const from = new Date(form.datetimeFrom).getTime()
      const to = new Date(form.datetimeTo).getTime()
      const interval = APP.POSITION_SUMMARY_INTERVAL * 60 * 1000

      // zone情報を付与
      const data = baseData.filter( d => {
        const exb = form.exbMap[d.exbId]
        if(!exb){
          return false
        }
        return exb.location && exb.location.zoneList && exb.location.zoneList.length>=1
      }).map( d => {
        const exb = form.exbMap[d.exbId]
        const zone = exb.location.zoneList[0]
        return {...d, exb, zoneId:zone.zoneId, zone}
      })
      Util.debug('data', data)

      const sum = ArrayUtil.sumData(data, 'timestamp') // なぜかできない
      Util.debug('sum', sum)

      let csv = "basetime,device_id,count\n"
      for(var time=from; time<to; time += interval){
        if(sum[time]){
          console.log(sum[time].length)
          sum[time].forEach(pos => {
            csv += this.formatTime(time) + "," + pos.exb.deviceId + "," + pos.cnt + "\n"
          })
        }
      }

      const searchDate = moment(form.date).format('YYYY-MM-DD')
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
  }
}
</script>

<style scoped lang="scss">
</style>
