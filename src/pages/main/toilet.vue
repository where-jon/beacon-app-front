<template>
  <div class="container-fluid">
    <breadcrumb :items="items" reload :auto-reload="autoReload" />
    <b-table :items="dataList" :fields="dataFieldList" stacked="md" striped hover>
      <template slot="HEAD_male">
        <div style="float:left">
          <label v-t="'label.male'" /><img src="~/assets/icon/male.svg" class="iconHeader">
        </div>
      </template>
      <template slot="HEAD_female">
        <div style="float:left">
          <label v-t="'label.female'" /><img src="~/assets/icon/female.svg" class="iconHeader">
        </div>
      </template>
      <template slot="HEAD_multip">
        <div style="float:left">
          <label v-t="'label.multip'" /><img src="~/assets/icon/multip.svg" class="iconHeader">
        </div>
      </template>
      <template slot="male" slot-scope="row">
        <div><span v-t="row.item.male.iconLabel" class="availBox" :class="row.item.male.iconClass" /><span class="count" v-t="row.item.male.count"/></div>
      </template>
      <template slot="female" slot-scope="row">
        <div><span v-t="row.item.female.iconLabel" class="availBox" :class="row.item.female.iconClass" /><span class="count" v-t="row.item.female.count"/></div>
      </template>
      <template slot="multip" slot-scope="row">
        <div><span v-t="row.item.multip.iconLabel" class="availBox" :class="row.item.multip.iconClass" /><span class="count" v-t="row.item.multip.count"/></div>
      </template>
    </b-table>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'lodash'
import { APP } from '../../sub/constant/config'
import { SENSOR, LOCATION, SYSTEM_ZONE_CATEGORY_NAME } from '../../sub/constant/Constants'
import * as Util from '../../sub/util/Util'
import * as EXCloudHelper from '../../sub/helper/dataproc/EXCloudHelper'
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
    defaultDataFieldList() {
      return ViewHelper.addLabelByKey(this.$i18n, [
        { key: 'areaName', show: true, thStyle: 'vertical-align: middle' },
        { key: 'zoneName', show: true, thStyle: 'vertical-align: middle' },
        { key: 'male', show: true, thClass: 'text-center', tdClass: 'text-center' },
        { key: 'female', show: true, thClass: 'text-center', tdClass: 'text-center' },
        { key: 'multip', thClass: 'text-center', tdClass: 'text-center' },
      ])
    },
  },
  async mounted() {
    await this.fetchData()
  },
  methods: {
    createToiletCountInfo(toiletList, type) { // リストから、toiletTypeが所定のタイプのものの合計と、その中でisDetectの数の合計を求める。
      const emptyCount = toiletList.filter(e => e.toiletType == type && !e.isDetect).length
      const allCount = toiletList.filter(e => e.toiletType == type).length
      const count = allCount > 0? emptyCount + ' / ' + allCount: '-'
      const iconClass = allCount == 0? '': emptyCount == 0? 'occupy': 'empty'
      const iconLabel = allCount == 0? '': 'label.' + iconClass
      return {
        iconClass,
        iconLabel,
        count,
      }
    },
    mergeToiletData(pirDataList, magnetDataList) {
      const group = _.groupBy(pirDataList.concat(magnetDataList), value => { // pirとmagnetのリストをマージして、areaId-zoneIdでグルーピング
        return value.areaId + '-' + value.zoneId
      })
      // console.error({pirDataList, magnetDataList, group})
      const dataList = Object.keys(group).map(key => {
        // console.log({key})
        const val = group[key]
        const first = val[0]
        console.error(first)
        return {
          areaName: first.areaName, // エリア名、ゾーン名はグループ内すべて同じなので最初の値を用いる
          zoneName: first.zoneName,
          male: this.createToiletCountInfo(val, LOCATION.EXT_VALUE.TOILET.MALE),
          female: this.createToiletCountInfo(val, LOCATION.EXT_VALUE.TOILET.FEMALE),
          multip: this.createToiletCountInfo(val, LOCATION.EXT_VALUE.TOILET.MULTIP),
        }
      })
      return _(dataList).sortBy(e => e.areaCd + '-' + e.zoneCd).value()
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
          areaId: Util.v(device, 'location.areaId'), areaCd: Util.v(device, 'location.area.areaCd'), areaName: Util.v(device, 'location.area.areaName'),
          zoneId: toiletZone.zoneId, zoneCd: toiletZone.zoneCd, zoneName: toiletZone.zoneName,
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

.iconHeader {
  width: 40px;
  height: 40px;
  margin-left: 10px;
}

.availBox {
  float: left;
  grid-template-columns: 1fr 1fr 1fr;
  -ms-grid-columns: 1fr 1fr 1fr;
  color: #ffffff;
  border-radius: 7px;
  padding: 3px;
  width: 32px;
  height: 32px;
  font-weight: bold;
  &.empty {
    background-color: rgb(68,114,196);
  }
  &.occupy {
    background-color: rgb(192,0,0);
  }
}

.count {
  float: left;
  margin-left: 10px;
  padding-top: 3px;
}

</style>
