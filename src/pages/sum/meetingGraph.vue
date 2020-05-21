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
import * as ColorUtil from '../../sub/util/ColorUtil'
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
   getField(){
      return [
        {key: 'name', sortable: true, label: this.$i18n.tnl('label.name')},
        {key: 'areaName', sortable: true, label: this.$i18n.tnl('label.area') },
        {key: 'graph', sortable: false, label: this.$i18n.tnl('label.numUsersGraph'), thStyle: {height: '50px !important', width:'400px !important'} },
        {key: 'ratio', sortable: false, label: this.$i18n.tnl('label.utilizationRatio') },
        {key: 'useRatio', sortable: false, label: this.$i18n.tnl('label.useRatio') },
      ]
    },
    async fetchData(form){
      const param = {}
      const from = new Date(form.datetimeFrom).getTime() + (form.hourFrom * 60 + form.minuteFrom ) * 60 * 1000
      const to = new Date(form.datetimeTo).getTime() + (form.hourTo * 60 + form.minuteTo ) * 60 * 1000
      const url = `/core/positionHistory/summaryBy/${form.graph}_id/${from}/${to}/${APP.POSITION_SUMMARY_INTERVAL}/${APP.POSITION_SUMMARY_RECEIVE_COUNT}`
      const data = await HttpHelper.getAppService(url)
      Util.debug('data', data)

      let ret = null
      // if(APP.MEETING.AXIS_TYPE == "exb"){
      //   ret = data.map( d => {
      //     const exb = this.exbIdMap[d.axisId]
      //     const capacity = Util.v(exb, 'location.capacity')
      //     return {...d, name: exb.deviceId, areaId: exb.areaId, areaName: exb.areaName, capacity }
      //   })
      if(form.graph == "location"){
        ret = data.map( d => {
          const location = this.locationIdMap[d.axisId]
          const capacity = Util.v(location, 'capacity')
          return {...d, name: location.locationName, areaId: location.area.areaId, areaName: location.area.areaName, capacity}
        })
      }else if(form.graph == "zone"){
        ret = data.map( d => {
          const zone = this.zoneIdMap[d.axisId]
          const capacity = Util.v(zone, 'capacity')
          return {...d, name: zone.zoneName, areaId: Util.v(zone, 'area.areaId'), areaName: Util.v(zone, 'area.areaName'), capacity}
        })
      }
      Util.debug('data2', ret)
      return ret
    },
    createGraph(form, data, func) {
      const sum = ArrayUtil.sumData(data, 'axisId')
      Util.debug('sum', sum)

      const start = new Date(form.datetimeFrom)
      const end = new Date(new Date(form.datetimeTo).getTime() - 1000) // 1秒引いておく
      const total = func.getTotal(start, end)

      const from = start.getTime()
      const to = end.getTime()
      
      return sum.map( posList => {
        // グラフ作成
        const graph = []
        let stayRatio = 0
        const max = APP.MEETING.MAX_NUM
        for(let i=1; i<=max; i++){
          const count = posList.filter(pos => pos.cnt==i || (i==max && pos.cnt>=max)).length
          const second = count * APP.POSITION_SUMMARY_INTERVAL * 60
          const per = second / total * 100.0
          stayRatio += per
          const color = ColorUtil.getStackColor(i)
          if(per > 0){
            graph.push({
              name: this.$i18n.tnl('message.count', {count: i}),
              style: `width: ${per}% !important; background: ${color};`,
              time: DateUtil.toHHmm(second),
              ratio: Math.floor(per)
            })
          }
        }
        if(stayRatio < 100){
          const color = 'gray'
          const per = 100 - stayRatio
          const second = Math.floor(total * per / 100)
          graph.push({
            name: 0,
            style: `width: ${per}% !important; background: ${color};`,
            time: DateUtil.toHHmm(second),
            ratio: Math.floor(per)
          })
        }

        // リスト作成
        const pos = posList[0]
        return {
          name: pos.name,
          areaId: pos.areaId,
          areaName: pos.areaName,
          graph,
          ratio: Math.floor(stayRatio) + "%",
          useRatio: Math.floor(this.getUseRatio(posList, total) * 100) + "%"
        }
      }).filter(view => view.name != null && (!form.areaId || form.areaId==view.areaId))
    },
    download(form, data) {
      const interval = APP.POSITION_SUMMARY_INTERVAL * 60 * 1000
      const from = Math.floor(new Date(form.datetimeFrom).getTime() / interval) * interval
      const to = Math.floor(new Date(form.datetimeTo).getTime() / interval) * interval
      const areaData = data.filter(e => !form.areaId || e.areaId == form.areaId)

      const sum = ArrayUtil.sumData(areaData, 'timestamp')
      Util.debug('sum', sum)

      let csv = this.$i18n.tnl("label.positionDt") + "," + this.getCol(form) + "," + this.$i18n.tnl("label.count") + "\n"
      for(var time=from; time<to; time += interval){
        if(sum[time]){
          sum[time].forEach(pos => {
            const cdName = this.getCdName(form, pos)
            const name = cdName.name ? (cdName.name + ",") : ""
            csv += DateUtil.formatDateWithTimeZone(time, 'YYYY/MM/DD HH:mm') + "," + cdName.cd + "," + name + pos.cnt + "\n"
          })
        }
      }

      const fromStr = moment(form.datetimeFrom).format('YYYYMMDD-HHmmss')
      const toStr = moment(form.datetimeTo).format('YYYYMMDD-HHmmss')

      const areaName = form.areaId ? this.areaIdMap[form.areaId].areaName + "_" : ""

      BrowserUtil.fileDL(
        fromStr + "_" + toStr + "_" + areaName + 'meeting.csv',
        csv,
        getCharSet(this.$store.state.loginId)
      )
    }, 
    // csvのカラムを返す
    getCol(form){
      if(form.graph == "location"){
        return this.$i18n.tnl("label.locationCd") + "," + this.$i18n.tnl("label.locationName")
      }
      if(form.graph == "zone"){
        return this.$i18n.tnl("label.zoneCd") + "," + this.$i18n.tnl("label.zoneName")
      }
      return null
    },
    // cdとnameを返す
    getCdName(form, pos){
      if(form.graph == "location"){
        const location = this.locationIdMap[pos.axisId]
        return {cd: location.locationCd, name: location.locationName}
      }
      if(form.graph == "zone"){
        const location = this.locationIdMap[pos.axisId]
        if(location.zoneList && location.zoneList.length >= 1){
          return {cd: location.zoneList[0].zoneCd, name: location.zoneList[0].zoneName}
        }
        return null
      }
      return null
    },
    getUseRatio(posList, total){
      let sum = 0.0
      posList.forEach(pos => {        
        sum += pos.cnt / (pos.capacity ? pos.capacity : pos.cnt) * APP.POSITION_SUMMARY_INTERVAL * 60

      })
      return sum / total
    }
  }
}
</script>

<style scoped lang="scss">
</style>
