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
    async getData(form){
      const param = {
        datetimeFrom: new Date(form.datetimeFrom).getTime(),
        datetimeTo: new Date(form.datetimeTo).getTime(),
        stack: DISP.ACTIVITY.STACK_TYPE,
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

      const from = new Date(form.datetimeFrom).getTime()
      const to = new Date(form.datetimeTo).getTime()
      const total = (to - from)/1000
      
      return sum.map( posList => {
        let stayTime = 0
        const graph = posList.map( pos => {
          const zoneName = pos.stack
          const time = pos.period
          stayTime += time
          const ratio = Math.floor(time/total*100)
          console.log(ratio)
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
        const potMap = this.getPotMap()
        const pot = potMap[posList[0].axisId]
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
    getPotMap() {
      const potMap = {}
      this.pots.forEach(pot => {
        potMap[pot.txIds[0]] = pot
      })
      Util.debug('potMap', potMap)
      return potMap
    },
  }
}
</script>

<style scoped lang="scss">
</style>
