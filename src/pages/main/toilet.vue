<template>
  <div class="container-fluid">
    <breadcrumb :items="items" reload :autoReload="autoReload" />
    <b-table :items="dataList" :fields="dataFieldList" stacked="md">
      <template slot="HEAD_areaName">
        <div />
      </template>
      <template slot="HEAD_zoneName">
        <div />
      </template>
      <template slot="male" slot-scope="row">
        <canvas :id="createCanvasKey(row.index, row.field.key)" :width="canvasInfo.w" :height="canvasInfo.h" />
      </template>
      <template slot="female" slot-scope="row">
        <canvas :id="createCanvasKey(row.index, row.field.key)" :width="canvasInfo.w" :height="canvasInfo.h" />
      </template>
      <template slot="multip" slot-scope="row">
        <canvas :id="createCanvasKey(row.index, row.field.key)" :width="canvasInfo.w" :height="canvasInfo.h" />
      </template>
      <template slot="share" slot-scope="row">
        <canvas :id="createCanvasKey(row.index, row.field.key)" :width="canvasInfo.w" :height="canvasInfo.h" />
      </template>
    </b-table>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'lodash'
import { Stage } from 'createjs-module'
import { APP, DISP } from '../../sub/constant/config'
import { SENSOR, LOCATION, SYSTEM_ZONE_CATEGORY_NAME } from '../../sub/constant/Constants'
import * as Util from '../../sub/util/Util'
import * as EXCloudHelper from '../../sub/helper/dataproc/EXCloudHelper'
import * as IconHelper from '../../sub/helper/ui/IconHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import reloadmixin from '../../components/mixin/reloadmixin.vue'

export default {
  components: {
    breadcrumb,
  },
  mixins: [reloadmixin],
  data() {
    return {
      dataFieldList: [],
      dataList: [],
      reload: false,
      stageMap: {},
      showToiletTypeMap: {},
    }
  },
  computed: {
    ...mapState('app_service', [
      'positions',
    ]),
    autoReload() {
      return APP.TOILET.AUTO_RELOAD
    },
    items() {
      return ViewHelper.createBreadCrumbItems('main', 'toiletStatus')
    },
    imgInfo() {
      return { w: 32, h: 96 }
    },
    canvasInfo() {
      const baseSize = DISP.TOILET.BASE_FONT_SIZE * 2
      return { w: this.imgInfo.w + DISP.TOILET.BASE_FONT_SIZE * 6, h: this.imgInfo.h < baseSize? baseSize: this.imgInfo.h }
    },
    defaultDataFieldList() {
      return ViewHelper.addLabelByKey(this.$i18n, [
        { key: 'areaName', show: true },
        { key: 'zoneName', show: true },
        { key: 'male', show: true, thClass: 'text-center', tdClass: 'text-center' },
        { key: 'female', show: true, thClass: 'text-center', tdClass: 'text-center' },
        { key: 'multip', thClass: 'text-center', tdClass: 'text-center' },
        { key: 'share', thClass: 'text-center', tdClass: 'text-center' },
      ])
    },
  },
  async mounted() {
    await this.fetchData()
  },
  methods: {
    createCanvasKey(index, key) {
      return key.toLowerCase() + '-' + index
    },
    // ここから描画用
    getStage(type, key, dataList) {
      if (this.stageMap[key]) {
        return this.stageMap[key]
      }
      const stage = new Stage(key)
      stage.set({ width: this.canvasInfo.w, height: this.canvasInfo.h })
      stage.addChild(IconHelper.createToiletIcon(type, DISP.TOILET.DISPLAY_MODE, dataList.length))
      this.stageMap[key] = stage
      return stage
    },
    drawCanvas() {
      this.dataList.forEach((data, index, ary) => {
        Object.keys(data).forEach(key => {
          const toiletInfo = data[key]
          const stage = this.getStage(key, this.createCanvasKey(index, key.toUpperCase()), ary)
          IconHelper.editToiletIcon(stage, toiletInfo.emptyCount, toiletInfo.allCount)
          stage.update()
        })
      })
    },
    // ここから集計用
    createToiletCountInfo(toiletList, type) {
      return {
        emptyCount: toiletList.reduce((prev, cur) => cur.toiletType == type && !cur.isDetect? prev + 1: prev, 0),
        allCount: toiletList.reduce((prev, cur) => cur.toiletType == type? prev + 1: prev, 0),
      }
    },
    mergeToiletData(pirDataList, magnetDataList) {
      const group = _.groupBy(pirDataList.concat(magnetDataList), value => {
        return value.areaId + '-' + value.zoneId
      })
      return Object.keys(group).map(key => {
        const val = group[key]
        const first = val[0]
        return {
          areaName: first.areaName,
          zoneName: first.zoneName,
          male: this.createToiletCountInfo(val, LOCATION.EXT_VALUE.TOILET.MALE),
          female: this.createToiletCountInfo(val, LOCATION.EXT_VALUE.TOILET.FEMALE),
          share: this.createToiletCountInfo(val, LOCATION.EXT_VALUE.TOILET.SHARE),
          multip: this.createToiletCountInfo(val, LOCATION.EXT_VALUE.TOILET.MULTIP),
        }
      })
    },
    async fetchSensorData(sensorId, deviceType) {
      const key = deviceType == 'exb'? {
        pKey: 'exbId', list: this.deviceIdMap, server: 'deviceId', detect: 'count' 
      }: {
        pKey: 'txId', list: this.btxIdMap, server: 'btxId', detect: 'magnet'
      }

      const exCloudSensors = await EXCloudHelper.fetchSensor(sensorId)
      return exCloudSensors.map(sensor => {
        const device = key.list[sensor[key.server]]
        const toiletZone = device.location && device.location.getZone(SYSTEM_ZONE_CATEGORY_NAME.TOILET)
        const toiletType = Util.getValue(device, deviceType == 'exb'? 'extValue.toilet': 'locExtValue.toilet')
        return toiletZone? {
          [key.pKey]: device[key.pKey],
          isDetect: sensor[key.detect] > 0,
          areaId: device.areaId, areaName: device.areaName,
          zoneId: toiletZone.zoneId, zoneName: toiletZone.zoneName,
          toiletType,
        }: null
      }).filter(val => val && val.toiletType
      ).map(val => {
        this.showToiletTypeMap[val.toiletType] = true
        return val
      })
    },
    async fetchData(payload){
      try {
        this.showProgress()
        const pirDataList = await this.fetchSensorData(SENSOR.PIR, 'exb')
        const magnetDataList = await this.fetchSensorData(SENSOR.MAGNET, 'tx')
        this.dataList = this.mergeToiletData(pirDataList, magnetDataList)
        this.dataFieldList = this.defaultDataFieldList.filter(dataField => dataField.show || this.showToiletTypeMap[dataField.key])

        this.$nextTick(() => this.drawCanvas())
        if (payload && payload.done) {
          payload.done()
        }
      } catch(e) {
        console.error(e)
      }
      this.hideProgress()
    },
  },
}
</script>

<style scoped lang="scss">
  table {
    white-space: nowrap !important;
  }
</style>
