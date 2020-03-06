<template>
  <activity-base
    page="activityGraph"
    type="pot"
    filter="group"
  />
</template>

<script>
import activityBase from '../../components/page/activityBase.vue'
import { APP, DEV } from '../../sub/constant/config'
import * as Util from '../../sub/util/Util'
import * as ArrayUtil from '../../sub/util/ArrayUtil'
import * as DateUtil from '../../sub/util/DateUtil'
import * as ColorUtil from '../../sub/util/ColorUtil'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import commonmixin from '../../components/mixin/commonmixin.vue'

export default {
  components: {
    activityBase,
  },
  mixins: [commonmixin],
  computed: {
  },
  methods: {
    async fetchData(form){
      const param = {
        datetimeFrom: new Date(form.datetimeFrom).getTime(),
        datetimeTo: new Date(form.datetimeTo).getTime(),
        stack: APP.ACTIVITY.STACK_TYPE,
        axis: "pot"
      }
      const url = '/office/stayTime/sum?_=' + new Date().getTime() + '&' +  HttpHelper.toParam(param, true)
      const stayTime = await HttpHelper.getAppService(url)
      Util.debug('stayTime', stayTime)
      return stayTime
    },
    createGraph(form, data) {
      const sum = ArrayUtil.sumData(data, 'axisId')
      Util.debug('sum', sum)

      const start = new Date(form.datetimeFrom)
      const end = new Date(form.datetimeTo)
      const total = this.getTotal(start, end)

      const from = start.getTime()
      const to = end.getTime()
      
      return sum.map( posList => {
        let stayTime = 0
        const graph = posList.map( pos => {
          const zoneName = pos.stack
          const time = pos.period
          stayTime += time
          const ratio = Math.floor(time/total*100)
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
          const color = ColorUtil.getStackColor(i)
          g.style = `width: ${g.ratio}% !important; background: ${color};`
        })
        // 不在追加
        if(total - stayTime > 0){
          const ratio = Math.floor((total-stayTime)/total*100)
          const color = ColorUtil.colorCd4display(APP.STAY_SUM.OTHER_COLOR)
          graph.push({
            style: `width: ${ratio}% !important;`,
            time: DateUtil.toHHmm(total-stayTime),
            ratio
          })
        }
        const pot = this.potIdMap[posList[0].axisId]
        return {
          name: Util.v(pot, 'potName'),
          groupName: Util.v(pot, 'group.groupName'),
          groupId: Util.v(pot, 'group.groupId'),
          graph,
          stayTime: DateUtil.toHHmm(stayTime),
          lostTime: DateUtil.toHHmm(total - stayTime)
        }
      }).filter(e => !form.groupId || e.groupId == form.groupId)
    },
    getTotal(fromDt, toDt){
      let fromDate = fromDt.getYear()*10000 + fromDt.getMonth()*100 + fromDt.getDate()
      let toDate = toDt.getYear()*10000 + toDt.getMonth()*100 + toDt.getDate()
      const start = (Math.floor(APP.SVC.STAY_SUM.START / 100)*60 + APP.SVC.STAY_SUM.START % 100) * 60
      const end = (Math.floor(APP.SVC.STAY_SUM.END / 100)*60 + APP.SVC.STAY_SUM.END % 100) * 60

      // 開始と終了時間を丸める
      let fromTime = fromDt.getHours() * 3600 + fromDt.getMinutes() * 60 + fromDt.getSeconds()
      let toTime = toDt.getHours() * 3600 + toDt.getMinutes() * 60 + toDt.getSeconds()
      fromTime = Math.max(fromTime, start)
      if(fromTime > end){
        fromTime = start
        fromDate++        
      }
      if(toTime < start){
        toTime = end
        toDate--
      }
      toTime = Math.min(toTime, end)

      // 1日の場合
      if(fromDate == toDate){
        console.log('oneDay')
        return toTime - fromTime
      }
      // 2日以上の場合
      let total = 0
      total += end - fromTime
      total += toTime - end
      total += (toDate - fromDate - 1) * (end - start)
      console.log('total', total)
      return total
    },
  }
}
</script>

<style scoped lang="scss">
</style>
