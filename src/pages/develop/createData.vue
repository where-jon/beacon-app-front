<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" />
    <b-form @submit.prevent="createData">
      <b-form-group>
        <span>
          <label v-t="'label.keyCategory'" />
        </span>
        <span>
          <b-form-select v-model="kind" :options="kindOptions" class="col-2" />
        </span>
        <span>
          <label v-t="'label.stdDate'" class="ml-2" />
        </span>
        <span>
          <date-picker v-model="stdDate" type="datetime" class="inputdatefrom" />
        </span>
        <span>
          <b-button type="button" @click="now">
            {{ $t('label.now') }}
          </b-button>
        </span>
        <span>
          <input v-model.number="shiftSec" type="number" class="col-1 inputNumber">
        </span>
        <span>
          <b-button type="button" @click="plus">
            {{ "＋" }}
          </b-button>
        </span>
        <span>
          <b-button type="button" @click="minus">
            {{ "ー" }}
          </b-button>
        </span>
        <span>
          <b-button v-t="'label.Execute'" type="submit" />
        </span>
        <span class="ml-3">
          <b-button type="button" @click="copyAllFromFisrtLine">
            {{ "Copy" }}
          </b-button>
        </span>
      </b-form-group>
      <b-form-group>
        <b-table :items="deviceList" :fields="fields">
          <template slot="HEAD_checked">
            <div>
              <b-form-checkbox v-model="checkAll" @click.native.stop />
            </div>
          </template>
          <template slot="checked" slot-scope="data">
            <b-form-checkbox v-model="data.item.checked" />
          </template>
          <template slot="areaId" slot-scope="data">
            <b-form-select v-model="data.item.areaId" :options="areaOptions" class="col-12" :disabled="data.item.locFixed" @change="doCheck(data.item)" />
          </template>
          <template slot="zoneId" slot-scope="data">
            <b-form-select v-model="data.item.zoneId" :options="tZoneOptions(data.item.areaId)" class="col-10" :disabled="data.item.locFixed" @change="doCheck(data.item)" />
          </template>
          <template slot="locationId" slot-scope="data">
            <b-form-select v-model="data.item.locationId" :options="tLocationOptions(data.item.areaId, data.item.zoneId)" class="col-10" :disabled="data.item.locFixed" @change="doCheck(data.item)" />
          </template>
          <template slot="dtDiff" slot-scope="data">
            <b-form-input v-model.number="data.item.dtDiff" class="no-shadow col-8" type="number" @change="doCheck(data.item)" />
          </template>
          <template slot="downLatest" slot-scope="data">
            <b-form-input v-model="data.item.downLatest" class="col-12" type="text" @change="doCheck(data.item)" />
          </template>
          <template v-for="sensorField in sensorFields" :slot="sensorField" slot-scope="data">
            <input :key="sensorField" v-model.number="data.item[sensorField]" class="col-12 inputNumber" type="number" step="0.1" @change="doCheck(data.item)">
          </template>
        </b-table>        
      </b-form-group>
      <b-button v-t="'label.Execute'" type="submit" />
      <b-button v-t="nomalMode? 'label.toDbOnlyMode': 'label.toNomalMode'" type="button" @click="swithSetting" />
    </b-form>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import * as SensorHelper from '../../sub/helper/domain/SensorHelper'
import * as AppServiceHelper from '../../sub/helper/dataproc/AppServiceHelper'
import * as ConfigHelper from '../../sub/helper/dataproc/ConfigHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import * as Util from '../../sub/util/Util'
import * as DateUtil from '../../sub/util/DateUtil'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../../components/mixin/commonmixin'
import { SENSOR } from '../../sub/constant/Constants'
import { DEV } from '../../sub/constant/config'

export default {
  components: {
    breadcrumb,
    DatePicker,
  },
  mixins: [commonmixin],
  data () {
    return {
      breadCrumbs: ViewHelper.createBreadCrumbItems('develop', 'createData'),
      kind: 'POSITION',
      stdDate: new Date(new Date().getTime() - 3600 * 1000),
      shiftSec: 60,
      deviceList: [],
      checkAll: false,
      sensorFields: ['temperature', 'humidity', 'count', 'magnet', 'press_vol', 'step', 'beat', 'stress', 'low', 'high', 'pressure', 'down'],
      fields: [],
      nomalMode: false,
    }
  },
  computed: {
    ...mapState('app_service', [
      'settings',
    ]),
    kindOptions() {
      // const arr = ['POSITION','SENSOR_1','SENSOR_2','SENSOR_3','SENSOR_5','SENSOR_6','SENSOR_8','SENSOR_9','SENSOR_10','SENSOR_11']
      const arr = ['POSITION','SENSOR_1','SENSOR_2','SENSOR_3','SENSOR_5','SENSOR_6','SENSOR_8','SENSOR_9']
      return arr.map(e => ({value: e, text: this.$i18n.tnl('label.' + e), label: this.$i18n.tnl('label.' + e)}))
    },
    isPosition() {
      return this.kind == 'POSITION'
    },
    isSensor() {
      return !this.isPosition
    },
    sensorId() {
      return this.kind.startsWith('SENSOR_')? Number(this.kind.split('SENSOR_')[1]): null
    },
  },
  watch: {
    checkAll: function(newVal) {
      this.deviceList.forEach(device => {
        device.checked = newVal
      })
    },
    kind: function(newVal) {
      this.initFields()
      this.initDeviceList()
    },
  },
  mounted() {
    this.initFields()
    this.initDeviceList()
    this.nomalMode = !DEV.ONLY_FROM_DB
  },
  methods: {
    initFields() { // 表示フィールド定義
      const fields = [
        {key:'checked', label: ''},
        {key:'name', label: this.$i18n.tnl('label.name')},
        {key:'areaId', label: this.$i18n.tnl('label.area')},
      ]

      if (this.isPosition) { // 測位の場合
        fields.push(
          {key:'zoneId', label: this.$i18n.tnl('label.zone')},
          {key:'locationId', label: this.$i18n.tnl('label.location')},
        )
      }
      else { // センサの場合
        fields.push(
          {key:'zoneNames', label: this.$i18n.tnl('label.zone')},
          {key:'locationId', label: this.$i18n.tnl('label.location')},
        )
        let addFields = []
        switch(this.sensorId) {
        case SENSOR.TEMPERATURE:
          addFields.push('temperature')
          addFields.push('humidity')
          break
        case SENSOR.PIR:
        case SENSOR.THERMOPILE:
          addFields.push('count')
          break
        case SENSOR.MEDITAG:
          addFields = addFields.concat(['step', 'beat', 'stress', 'low', 'high', 'pressure', 'downLatest', 'down'])
          break
        case SENSOR.MAGNET:
          addFields.push('magnet')
          break
        case SENSOR.PRESSURE:
          addFields.push('press_vol')
          break
        case SENSOR.OMR_ENV:
          addFields.push('temperature')
          addFields.push('humidity')
          addFields.push('ambientLight')
          addFields.push('soundNoise')
          break
        case SENSOR.OMR_TP_ENV: // TODO:
          break
        case SENSOR.OMR_TP_HUMAN: // TODO:
          break
        }
        addFields.forEach(field => {
          fields.push(
            {key:field, label: this.$i18n.tnl('label.' + field)},
          )
        })
      }
      fields.push(
        {key:'dtDiff', label: this.$i18n.tnl('label.dtDiff')},
      )

      this.fields = fields
    },
    initDeviceList() { // TX（EXB）のデバイスリスト、初期値設定
      if (this.isPosition) { // 測位
        this.deviceList = this.txs.filter(tx =>{
          // 固定位置のセンサーは除外
          return !tx.locationId || !SensorHelper.isFixedSensorTx(tx)
        }).map(tx => {
          const potName = Util.v(tx, 'pot.potName')
          const groupName = Util.v(tx, 'pot.group.groupName')
          return {
            checked: false,
            txId: tx.txId,
            minor: tx.minor,
            potId: Util.v(tx, 'pot.potId'),
            potName,
            name: tx.minor + (potName? '(' + potName + (groupName? ':' + groupName: '') + ')': ''),
            areaId: null,
            zoneId: null,
            locationId: null,
            dtDiff: 0,
          }
        })
      }
      else { // センサ
        const sensorId = this.sensorId
        const txList = this.txs.filter(tx =>{
          const hasSensor = Util.v(tx, 'sensorList', []).some(sensor => sensor.sensorId == sensorId)
          return hasSensor && (tx.locationId || [SENSOR.MEDITAG, SENSOR.MAGNET, SENSOR.BUTTON].includes(sensorId))
        }).map(tx => {
          return {
            txId: tx.txId,
            minor: tx.minor,
            name: tx.minor,
            areaId: Util.v(tx, 'location.areaId'),
            zoneNames: Util.v(tx, 'location.zoneNames'),
            locationId: tx.locationId,
          }
        })

        const exbList = this.exbs.filter(exb =>{
          return Util.v(exb, 'sensorList', []).some(sensor => sensor.sensorId == sensorId)
        }).map(exb => {
          return {
            checked: false,
            exbId: exb.exbId,
            deviceId: exb.deviceId,
            name: exb.deviceId,
            areaId: exb.location.areaId,
            zoneNames: Util.v(exb, 'location.zoneNames'),
            locationId: exb.locationId,
          }
        })
        const deviceList = txList.concat(exbList)
        deviceList.forEach(device => {
          Object.assign(device, {
            checked: false,
            locFixed: true,
            power_level: 80,
            dtDiff: 0,
          })
        })

        deviceList.forEach(device => {
          let dataAdd = {}
          switch(sensorId) {
          case SENSOR.TEMPERATURE:
            dataAdd = {temperature:25, humidity:50}
            break
          case SENSOR.PIR:
            dataAdd = {count:0}
            break
          case SENSOR.THERMOPILE:
            dataAdd = {count:0}
            break
          case SENSOR.MEDITAG:
            dataAdd = {step:10, beat:100, stress:10, low:60, high:100, pressure:50, downLatest: DateUtil.formatDate(new Date().getTime() - 50000), down:1}
            break
          case SENSOR.MAGNET:
            dataAdd = {magnet:0}
            break
          case SENSOR.PRESSURE:
            dataAdd = {press_vol: 1200}
            break
          case SENSOR.OMR_ENV:
            dataAdd = {temperature:25, humidity:50, ambientLight:80, soundNoise:70}
            break
          case SENSOR.OMR_TP_ENV: // TODO:
            break
          case SENSOR.OMR_TP_HUMAN: // TODO:
            break
          }
          Object.assign(device, dataAdd)
        })
        this.deviceList = deviceList
      }
    },
    now() {
      this.stdDate = new Date()
    },
    plus() {
      this.stdDate = new Date(this.stdDate.getTime() + this.shiftSec * 1000)
    },
    minus() {
      this.stdDate = new Date(this.stdDate.getTime() - this.shiftSec * 1000)
    },
    tZoneOptions(areaId) {
      if (areaId) {
        return [{value:null,text:'',label:''}]
          .concat(this.zones.filter(zone => zone.areaId == areaId).map(zone => ({value: zone.zoneId, text: zone.zoneName, label: zone.zoneName})))
      }
      else {
        return this.zoneOptions
      }
    },
    tLocationOptions(areaId, zoneId) {
      if (areaId || zoneId) {
        return this.locations.filter(location => (!areaId || location.areaId == areaId) && (!zoneId || location.zoneList.some(zone => zone.zoneId == zoneId)))
          .map(location => ({value: location.locationId, text: location.locationName, label: location.locationName}))
      }
      else {
        return this.locationOptions
      }
    },
    doCheck(item) { // 変更したらチェックを入れる
      item.checked = true
    },
    copyAllFromFisrtLine() {
      let first
      this.deviceList.forEach((tx, index) => {
        if (index == 0) {
          first = tx
        }
        else {
          let exclude = ['name', 'txId', 'minor', 'potId', 'exbId', 'deviceId']
          if (this.kind != 'POSITION') {
            exclude = exclude.concat(['areaId', 'zoneId', 'zoneNames', 'locationId'])
          }
          Util.merge(tx, first, exclude)
        }
      })
    },
    async createData() {
      this.showProgress()
      try {
        const apiName = this.isPosition? '/core/positionHistory/bulk': '/basic/sensorHistory/bulk'
        let id = 0
        const param = this.deviceList.map(device => {
          if (!device.checked) return
          if (this.isPosition) {
            if (!device.locationId || device.dtDiff == null) return
            return {
              positionHistoryId: --id,
              txId: device.txId,
              minor: device.minor,
              potId: device.potId,
              locationId: device.locationId,
              exbId: Util.v(this.locationIdMap[device.locationId], 'exbList.0', {}).exbId,
              positionDtEpoch: this.stdDate.getTime() + device.dtDiff * 1000,
            }
          }
          else {
            const value = Util.merge({}, device, ['name', 'exbId', 'txId', 'minor', 'areaId', 'dtDiff', 'checked', 'deviceId', 'locFixed', 'zoneNames', 'locationId', 'power_level'])
            return {
              sensorHistoryId: --id,
              sensorId: this.sensorId,
              exbId: device.exbId,
              txId: device.txId,
              minor: device.minor,
              value,
              sensorDtEpoch: this.stdDate.getTime() + device.dtDiff * 1000,
            }            
          }
        }).filter(e => e)
        await HttpHelper.postAppService(apiName, param)
      }
      catch(e) {
        console.error(e)
      }
      finally {
        this.hideProgress()
      }
    },
    createSettingObj(key, valType, value, id) {
      const settingId = Util.v(this.settings.find(setting => setting.key == key), 'settingId', id)
      return {settingId, key, valType, value}
    },
    async swithSetting() { // 測位・センサ情報をDBのみの取得に切り替える
      this.showProgress()
      try {
        await StateHelper.load('setting')
        let id = 0
        const entities = []
        entities.push(this.createSettingObj('DEV.ONLY_FROM_DB', 'boolean', String(this.nomalMode), --id))
        entities.push(this.createSettingObj('APP.SVC.POS.CACHE_TIME', 'number', this.nomalMode?'0':'10000', --id)) // キャッシュを無効に
        await AppServiceHelper.bulkSave('/meta/setting', entities)
        this.nomalMode = !this.nomalMode
        await ConfigHelper.reloadConfig()
      }
      catch(e) {
        console.error(e)
      }
      finally {
        this.hideProgress()
      }
    }
  }
}
</script>

<style scoped lang="scss">

.inputNumber {
  width: 100%;
  height: calc(1.5em + 0.75rem + 2px);
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #495057;
  background-color: #ffffff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
}

</style>