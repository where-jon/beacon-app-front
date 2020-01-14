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
      <template slot="toilet_m" slot-scope="row">
        <canvas :id="createCanvasKey(row.index, row.field.key)" :width="canvasInfo.w" :height="canvasInfo.h" />
      </template>
      <template slot="toilet_f" slot-scope="row">
        <canvas :id="createCanvasKey(row.index, row.field.key)" :width="canvasInfo.w" :height="canvasInfo.h" />
      </template>
      <template slot="toilet_p" slot-scope="row">
        <canvas :id="createCanvasKey(row.index, row.field.key)" :width="canvasInfo.w" :height="canvasInfo.h" />
      </template>
      <template slot="toilet_c" slot-scope="row">
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
import { CATEGORY, SENSOR, SYSTEM_ZONE_CATEGORY_NAME, PATTERN } from '../../sub/constant/Constants'
import * as Util from '../../sub/util/Util'
import * as EXCloudHelper from '../../sub/helper/dataproc/EXCloudHelper'
import * as IconHelper from '../../sub/helper/ui/IconHelper'
import * as PositionHelper from '../../sub/helper/domain/PositionHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
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
      'areas',
      'zones',
      'locations',
      'txs',
      'exbs',
      'positions',
    ]),
    autoReload() {
      return APP.TOILET.AUTO_RELOAD
    },
    items() {
      return ViewHelper.createBreadCrumbItems('main', 'toiletStatus')
    },
    loadStates() {
      return ['area', 'zone', 'location', 'tx', 'exb']
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
        { key: 'toilet_m', show: true, thClass: 'text-center', tdClass: 'text-center' },
        { key: 'toilet_f', show: true, thClass: 'text-center', tdClass: 'text-center' },
        { key: 'toilet_p', thClass: 'text-center', tdClass: 'text-center' },
        { key: 'toilet_c', thClass: 'text-center', tdClass: 'text-center' },
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
      if(this.stageMap[key]) {
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
        Object.keys(data).filter(key => 
          PATTERN.REGEXP.TOILET_CATEGORY.test(key)
        ).forEach(key => {
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
        emptyCount: toiletList.reduce((prev, cur) => cur.categoryName == type && cur.isDetect? prev + 1: prev, 0),
        allCount: toiletList.reduce((prev, cur) => cur.categoryName == type? prev + 1: prev, 0),
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
          toilet_m: this.createToiletCountInfo(val, SYSTEM_ZONE_CATEGORY_NAME.TOILET_M),
          toilet_f: this.createToiletCountInfo(val, SYSTEM_ZONE_CATEGORY_NAME.TOILET_F),
          toilet_c: this.createToiletCountInfo(val, SYSTEM_ZONE_CATEGORY_NAME.TOILET_C),
          toilet_p: this.createToiletCountInfo(val, SYSTEM_ZONE_CATEGORY_NAME.TOILET_P),
        }
      })
    },
    async fetchSensorData(sensorId, deviceType) {
      const key = deviceType == 'exb'? {
        pKey: 'exbId', list: this.exbs, front: 'deviceId', server: 'deviceid', detect: 'count' 
      }: {
        pKey: 'txId', list: this.txs, front: 'btxId', server: 'btx_id', detect: 'magnet'
      }
      this.showToiletTypeMap = {}

      const exCloudSensors = await EXCloudHelper.fetchSensor(sensorId)
      const deviceMap = StateHelper.convertMasterMap(key.front, key.list)
      return exCloudSensors.map(sensor => {
        const device = deviceMap[sensor[key.server]]
        const toiletZone = Util.getValue(device, 'toiletZone', {})
        const toiletCategory = Util.getValue(toiletZone, 'toiletCategory', {})
        return toiletZone? {
          [key.pKey]: device[key.pKey],
          isDetect: sensor[key.detect] > 0,
          areaId: device.areaId, areaName: device.areaName,
          zoneId: toiletZone.zoneId, zoneName: toiletZone.zoneName,
          categoryId: toiletCategory.categoryId, categoryName: toiletCategory.categoryName,
        }: null
      }).filter(val => (
        val && PATTERN.REGEXP.TOILET_CATEGORY.test(val.categoryName)
      )).map(val => {
        this.showToiletTypeMap[val.categoryName.toLowerCase()] = true
        return val
      })
    },
    async fetchData(payload){
      try {
        this.showProgress()
        await Promise.all(this.loadStates.map(state => StateHelper.load(state)))
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
      konohageee()
    },
  },
}
</script>

<style scoped lang="scss">
  table {
    white-space: nowrap !important;
  }
</style>
