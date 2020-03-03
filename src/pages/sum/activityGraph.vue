<template>
  <activity-base
    page="activityGraph"
    type="pot"
    filter="group"
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
    createGraph(form, data) {
      const sum = ArrayUtil.sumData(data, 'txId')
      Util.debug('sum', sum)

      const from = new Date(form.datetimeFrom).getTime()
      const to = new Date(form.datetimeTo).getTime()
      const total = (to - from)/1000
      
      return sum.map( posList => {
        Util.debug('len', posList.length)
        const stayTime = posList.length * APP.POSITION_SUMMARY_INTERVAL * 60
        const posGroup = ArrayUtil.sumData(posList, 'exbId')
        Util.debug('posGroup', posGroup)
        const graph = posGroup.map( group => {
          const exb = form.exbMap[group[0].exbId]
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
        const pot = form.potMap[posList[0].txId]
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
      }).filter(view => view.name != null && !form.groupId || (view.groupId == form.groupId))
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
