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
        ['male','female','share','multip'].forEach(type =>{
          const toiletInfo = data[type]
          // console.error({toiletInfo})
          const stage = this.getStage(type, this.createCanvasKey(index, type.toUpperCase()), ary)
          IconHelper.editToiletIcon(stage, toiletInfo.emptyCount, toiletInfo.allCount)
          stage.update()
        })
      })
    },
    // ここから集計用
    createToiletCountInfo(toiletList, type) { // リストから、toiletTypeが所定のタイプのものの合計と、その中でisDetectの数の合計を求める。単純にfilterにした方がシンプルだが。
      return {
        emptyCount: toiletList.reduce((prev, cur) => cur.toiletType == type && !cur.isDetect? prev + 1: prev, 0),
        allCount: toiletList.reduce((prev, cur) => cur.toiletType == type? prev + 1: prev, 0),
      }
    },
    mergeToiletData(pirDataList, magnetDataList) {
      const group = _.groupBy(pirDataList.concat(magnetDataList), value => { // pirとmagnetのリストをマージして、areaId-zoneIdでグルーピング
        return value.areaId + '-' + value.zoneId
      })
      // console.error({pirDataList, magnetDataList, group})
      return Object.keys(group).map(key => {
        // console.log({key})
        const val = group[key]
        const first = val[0]
        return {
          areaName: first.areaName, // エリア名、ゾーン名はグループ内すべて同じなので最初の値を用いる
          zoneName: first.zoneName,
          male: this.createToiletCountInfo(val, LOCATION.EXT_VALUE.TOILET.MALE),
          female: this.createToiletCountInfo(val, LOCATION.EXT_VALUE.TOILET.FEMALE),
          share: this.createToiletCountInfo(val, LOCATION.EXT_VALUE.TOILET.SHARE),
          multip: this.createToiletCountInfo(val, LOCATION.EXT_VALUE.TOILET.MULTIP),
        }
      })
    },
    async fetchSensorData(sensorId, deviceKind) {
      const config = deviceKind == 'exb'? { // センサーがexbかtxに紐付いたものかで値の処理の仕方を変える
        pKey: 'exbId', idMap: this.deviceIdMap, excloudIdKey: 'deviceId', valKey: 'count' 
      }: {
        pKey: 'txId', idMap: this.btxIdMap, excloudIdKey: 'btxId', valKey: 'magnet'
      }

      const exCloudSensors = await EXCloudHelper.fetchSensor(sensorId) // センサー情報を取得
      return exCloudSensors.map(sensor => {
        const device = config.idMap[sensor[config.excloudIdKey]] // txかexbを取得
        const toiletZone = device.location && device.location.getZone(SYSTEM_ZONE_CATEGORY_NAME.TOILET) // そのセンサーが置かれた場所に設定されたトイレのゾーンを取得（なければnull）
        const toiletType = Util.getValue(device, 'location.extValue.toilet') // トイレのタイプを取得（男/女/共用/多目的）
        // console.warn({sensor, device, toiletZone, toiletType})
        return toiletZone? {
          [config.pKey]: device[config.pKey], // exbId or txId
          isDetect: sensor[config.valKey] > 0, // 利用中か空きか(pirならcount、magnetならmagnet値を使用)
          areaId: Util.v(device, 'location.areaId'), areaName: Util.v(device, 'location.areaName'),
          zoneId: toiletZone.zoneId, zoneName: toiletZone.zoneName,
          toiletType,
        }: null
      }).filter(val => val && val.toiletType // トイレのゾーンに属するものとタイプが設定されているもののみ
      ).map(val => {
        this.showToiletTypeMap[val.toiletType] = true // トイレタイプごとに表示するかどうか設定（あれば表示する）
        return val
      })
    },
    async fetchData(payload){
      try {
        this.showProgress()
        const pirDataList = await this.fetchSensorData(SENSOR.PIR, 'exb') // PIRのセンサー情報を取得
        const magnetDataList = await this.fetchSensorData(SENSOR.MAGNET, 'tx') // magnetセンサー情報を取得
        this.dataList = this.mergeToiletData(pirDataList, magnetDataList) // マージしてゾーン、そしてトイレタイプごとにカウントする。　
        console.error(pirDataList, magnetDataList, this.dataList)
        this.dataFieldList = this.defaultDataFieldList.filter(dataField => dataField.show || this.showToiletTypeMap[dataField.key]) // 男女は常に表示し、ほかはデータが有れば表示

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
