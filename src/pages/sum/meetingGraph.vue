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
import * as HttpHelper from '../../sub/helper/base/HttpHelper'

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
      const url = `/core/positionHistory/summary/${from}/${to}/${APP.POSITION_SUMMARY_INTERVAL}/${APP.POSITION_SUMMARY_RECEIVE_COUNT}`
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

      const sum = ArrayUtil.sumData(data, 'zoneId')
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
  }
}
</script>

<style scoped lang="scss">
</style>
