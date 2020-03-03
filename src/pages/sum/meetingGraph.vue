<template>
  <activity-base
    page="meetingGraph"
    type="zone"
    filter="category"
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
      const url = `/core/positionHistory/summaryBy/exb/${from}/${to}/${APP.POSITION_SUMMARY_INTERVAL}/${APP.POSITION_SUMMARY_RECEIVE_COUNT}`
      const sumData = await HttpHelper.getAppService(url)
      Util.debug('sumData', sumData)
      // 重複データを排除
      let pre = null
      const ret = sumData.filter(s => {
        const dupe = pre && s.date==pre.date && s.timestamp==pre.timestamp && s.txId==pre.txId
        pre = s       
        return !dupe
      })
      Util.debug('filter', ret)
      return ret
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
        return {...d, zoneId:zone.zoneId, zone}
      })
      Util.debug('data', data)

      const sum = ArrayUtil.sumData(data, DISP.MEETING.AXIS_TYPE + 'Id')
      Util.debug('sum', sum)

      const from = new Date(form.datetimeFrom).getTime()
      const to = new Date(form.datetimeTo).getTime()
      const total = (to - from)/1000
      
      return sum.map( posList => {
        const posGroup = ArrayUtil.sumData(posList, 'txId')
        Util.debug('posGroup', posGroup)
        Util.debug('total', total)

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
        Util.debug(countMap)


        // グラフ作成
        const graph = []
        let stayRatio = 0
        let i=6
        while(i-- > 0){
          const countList = Object.keys(countMap).map(key => { return {key, value:countMap[key]} })
          const times = countList.filter(c => c.value == i)
          Util.debug('times', times)
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
        }

        // リスト作成
        const zoneName = posList[0].zone.zoneName
        const categoryName = posList[0].zone.categoryName
        const categoryId = posList[0].zone.categoryId
        return {
          name: zoneName,
          groupName: categoryName,
          categoryId,
          graph,
          ratio: stayRatio + "%"
        }
      }).filter(view => view.name != null && (!form.categoryId || form.categoryId==view.categoryId))
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
        return {...d, zoneId:zone.zoneId, zone}
      })

      const sum = ArrayUtil.sumData(data, 'zoneId')
      Util.debug('sum', sum)

      let csv = "basetime,device_id,count\n"
      for(var time=from; time<to; time += interval){
        sum.forEach(list => {
          let count = 0
          list.forEach(pos => {
            const timestamp = pos.date + (Math.floor(pos.timestamp / 100) * 60 + pos.timestamp%60) * 60 * 1000
            if(time == timestamp){
              count++
            }
          })
          csv += this.formatTime(time) + "," + list[0].zone.zoneName + "," + count + "\n"
        })
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
