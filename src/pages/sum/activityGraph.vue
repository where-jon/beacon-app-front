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
    createGraph(form, data, func) {
      const sum = ArrayUtil.sumData(data, 'axisId')
      Util.debug('sum', sum)

      const start = new Date(form.datetimeFrom)
      const end = new Date(form.datetimeTo)
      const total = func.getTotal(start, end)

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
          const color = 'gray'
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
  }
}
</script>

<style scoped lang="scss">
</style>
