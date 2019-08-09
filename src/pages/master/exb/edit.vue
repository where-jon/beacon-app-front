<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />
      <auto-alert :custom="showAreaWarn" :p-custom-message="areaWarnMessage" />

      <b-row>
        <b-col md="8" offset-md="2">
          <b-form v-if="show" @submit.prevent="save">
            <b-form-group v-show="includesDeviceType('deviceId')">
              <label v-t="'label.deviceId'" />
              <input v-model.lazy="deviceId" :max="maxDeviceId" :readonly="!isEditable" type="number" class="form-control" min="0" :required="includesDeviceType('deviceId')">
            </b-form-group>
            <b-form-group v-show="includesDeviceType('deviceIdX')">
              <label v-t="'label.deviceIdX'" />
              <input v-model.lazy="deviceIdX" :readonly="!isEditable" type="text" class="form-control" :required="includesDeviceType('deviceIdX')">
            </b-form-group>
            <b-form-group>
              <label v-t="'label.locationName'" />
              <input v-model="form.locationName" :readonly="!isEditable" type="text" maxlength="20" class="form-control" required>
            </b-form-group>
            <b-form-group>
              <label v-t="'label.area'" />
              <v-select v-model="vueSelected.area" :options="areaOptions" :disabled="!isEditable" :readonly="!isEditable" class="mb-3 vue-options-lg">
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </b-form-group>
            <b-form-group v-show="isShown('EXB.WITH', 'posId')">
              <label v-t="'label.posId'" />
              <input v-model="form.posId" :readonly="!isEditable" type="number" min="0" max="65535" class="form-control" :required="isShown('EXB.WITH', 'posId')">
            </b-form-group>
            <b-form-group>
              <label v-t="'label.locationX'" />
              <input v-model="form.x" :readonly="!isEditable" type="number" min="0" max="99999" class="form-control">
            </b-form-group>
            <b-form-group>
              <label v-t="'label.locationY'" />
              <input v-model="form.y" :readonly="!isEditable" type="number" min="0" max="99999" class="form-control">
            </b-form-group>
            <!-- ver0.9 リリースのため、表示フラグ欄とTX表示形式欄を非表示とする -->
            <!--
            <b-form-group>
              <b-form-checkbox v-model="form.visible" value="true" unchecked-value="false" :disabled="!isEditable" :readonly="!isEditable">
                {{ $t('label.visible') }}
              </b-form-checkbox>
            </b-form-group>
            -->
            <settingtxview
              :is-editable="isEditable"
              :disp-format="form.txViewType ? form.txViewType.displayFormat : txIconsDispFormat"
              :horizon="form.txViewType ? form.txViewType.horizon : txIconsHorizon"
              :vertical="form.txViewType ? form.txViewType.vertical : txIconsVertical"
              @change="onChangeTxSetting"
            />
            <!-- <span v-for="(exbSensor, index) in form.exbSensorList" :key="index"> 一旦単数に戻す
              <b-form-group v-show="showSensor(index)">
                <label>
                  {{ $i18n.tnl('label.type') + getSensorIndex(index) }}
                </label>
                <b-form-select v-model="exbSensor.sensorId" :options="getSensorOptionsExb(index)" :disabled="!isEditable" :readonly="!isEditable" class="mb-3 ml-3 col-4" @change="changeSensors($event, index)" />
              </b-form-group>
            </span> -->
            <b-form-group>
              <label v-t="'label.type'" />
              <b-form-select v-model="form.sensorId" :options="sensorOptionsExb" :disabled="!isEditable" :readonly="!isEditable" class="mb-3 ml-3 col-4" />
            </b-form-group>
            <b-form-group v-show="useZone">
              <b-form-row>
                <label v-t="'label.zoneClass'" class="d-flex align-items-center" />
                <v-select v-model="vueSelected.zone" :options="getZoneClassOptions()" :disabled="!isEditable" :readonly="!isEditable" class="mb-3 ml-2 vue-options-lg">
                  <template slot="no-options">
                    {{ vueSelectNoMatchingOptions }}
                  </template>
                </v-select>
              </b-form-row>
              <b-form-row>
                <label v-t="'label.zoneBlock'" class="d-flex align-items-center" />
                <v-select :value="getZoneBlockItems()" :options="zoneBlockOptions" disabled multiple class="vue-options-multi" />
              </b-form-row>
            </b-form-group>

            <b-button v-t="'label.back'" type="button" variant="outline-danger" class="mr-2 my-1" @click="backToList" />
            <b-button v-if="isEditable" :variant="theme" type="submit" class="mr-2 my-1" @click="doBeforeSubmit(false)">
              {{ $i18n.tnl(`label.${isUpdate? 'update': 'register'}`) }}
            </b-button>
            <b-button v-if="isRegistable && !isUpdate" v-t="'label.registerAgain'" :variant="theme" type="submit" class="my-1" @click="doBeforeSubmit(true)" />
          </b-form>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import { ZONE } from '../../../sub/constant/Constants'
import * as ArrayUtil from '../../../sub/util/ArrayUtil'
import * as NumberUtil from '../../../sub/util/NumberUtil'
import * as Util from '../../../sub/util/Util'
import * as AppServiceHelper from '../../../sub/helper/dataproc/AppServiceHelper'
import * as ConfigHelper from '../../../sub/helper/dataproc/ConfigHelper'
import * as MenuHelper from '../../../sub/helper/dataproc/MenuHelper'
import * as OptionHelper from '../../../sub/helper/dataproc/OptionHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as ValidateHelper from '../../../sub/helper/dataproc/ValidateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import * as VueSelectHelper from '../../../sub/helper/ui/VueSelectHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import editmixin from '../../../components/mixin/editmixin.vue'
import alert from '../../../components/parts/alert.vue'
import autoAlert from '../../../components/parts/autoAlert.vue'
import settingtxview from '../../../components/parts/settingtxview.vue'

export default {
  components: {
    breadcrumb,
    alert,
    autoAlert,
    settingtxview,
  },
  mixins: [commonmixin, editmixin],
  data() {
    return {
      name: 'exb',
      id: 'exbId',
      backPath: '/master/exb',
      appServicePath: '/core/exb',
      items: ViewHelper.createBreadCrumbItems('master', {text: 'exb', href: '/master/exb'}, ViewHelper.getDetailCaptionKey(this.$store.state.app_service.exb.exbId)),
      useZone: ArrayUtil.includesIgnoreCase(APP.EXB.WITH, 'zone') && MenuHelper.isMenuEntry('/master/zoneClass'),
      form: Util.extract(this.$store.state.app_service.exb, [
        'exbId', 'deviceId',
        'location.locationName', 'location.areaId', 'location.locationId', 'location.posId',
        'location.x', 'location.y', 'location.visible', 'location.txViewType',
        'exbSensorList.0.exbSensorPK.sensorId',
        'location.locationZoneList'
      ]),
      vueSelected: {
        area: null,
        zone: null,
      },
      mutex: false,
      deviceId: null,
      deviceIdX: null,
      txIconsDispFormat: 1,
      txIconsHorizon: 5,
      txIconsVertical: 5,
      TXICONS_DISPFORMAT_TILE: 5,
      maxDeviceId: 65535,
      checkWarn: false,
      showAreaWarn: false,
    }
  },
  computed: {
    areaOptions() {
      return StateHelper.getOptionsFromState('area', false, true)
    },
    zoneBlockOptions(){
      return StateHelper.getOptionsFromState('zone', false, true, zone => zone.zoneType == ZONE.COORDINATE)
    },
    ...mapState('app_service', [
      'exb',
      'areas',
      'sensors',
      'zones',
    ]),
    areaWarnMessage(){
      return this.$i18n.tnl('message.resetFromTo', {
        from: this.$i18n.tnl('label.area'),
        to: this.$i18n.tnl('label.zone'),
      })
    },
  },
  watch: {
    'vueSelected.area': {
      handler: function(newVal, oldVal){
        this.form.areaId = Util.getValue(newVal, 'value', null)
        this.vueSelected.zone = null
        if(this.checkWarn && Util.hasValue(this.form.zoneId) && Util.getValue(oldVal, 'value', null) != null){
          this.showAreaWarn = true
        }
      },
      deep: true,
    },
    'vueSelected.zone': {
      handler: function(newVal, oldVal){
        this.form.zoneId = Util.getValue(newVal, 'value', null)
        if(this.showAreaWarn && Util.hasValue(this.form.zoneId)){
          this.showAreaWarn = false
        }
      },
      deep: true,
    },
    deviceId: function(newVal, oldVal) {
      if (!this.mutex) {
        this.mutex = true
        this.deviceId = newVal 
        this.deviceIdX = newVal? Number(newVal).toString(16).toUpperCase(): null
        this.mutex = false
      }
    },
    deviceIdX: function(newVal, oldVal) {
      if (!this.mutex) {
        this.mutex = true
        if (newVal) {
          if (!newVal.match(/^[a-fA-F\d]{0,4}$/)) {
            this.$nextTick(() => {
              this.deviceIdX = oldVal        
            })
            this.mutex = false
            return
          }
          this.deviceIdX = newVal
          this.deviceId = parseInt(newVal, 16) 
        }
        this.mutex = false
      }
    },
  },
  async created() {
    this.initExbSensorList()
    this.changeSensors()
    await StateHelper.load('sensor')
    this.$nextTick(() => {
      ValidateHelper.setCustomValidationMessage()
      VueSelectHelper.disabledAllSubmit()
    })
  },
  async mounted() {
    this.checkWarnOn()
    await Promise.all(['area', 'zone'].map(StateHelper.load))
    this.vueSelected.area = VueSelectHelper.getVueSelectData(this.areaOptions, this.form.areaId)
    this.deviceId = this.form.deviceId

    this.$nextTick(() => {
      const locationZoneList = this.form.locationZoneList
      if(Util.hasValue(locationZoneList)){
        const zoneMap = {}
        this.zones.forEach(zone => {
          if(zone.zoneType == ZONE.NON_COORDINATE){
            zoneMap[zone.zoneId] = zone
          }
        })
        const target = locationZoneList.find(locationZone => zoneMap[Util.getValue(locationZone, 'locationZonePK.zoneId', -1)])
        this.vueSelected.zone = VueSelectHelper.getVueSelectData(this.getZoneClassOptions(), Util.getValue(target, 'locationZonePK.zoneId', null))
      }
    })

    Util.applyDef(this.form, this.defValue)
    if (!this.form.txViewType) {
      return
    }
    this.txIconsDispFormat = this.form.txViewType.displayFormat
    this.txIconsHorizon = this.form.txViewType.horizon
    this.txIconsVertical = this.form.txViewType.vertical
  },
  methods: {
    isNormalSensor(index){
      return Util.getValue(this.form, `exbSensorList.${index && 0 <= index? index: 0}.sensorId`, null)? false: true
    },
    includesDeviceType(name){
      return ConfigHelper.includesDeviceType(name)
    },
    checkWarnOn(){
      this.checkWarn = false
      this.$nextTick(() => {
        this.checkWarn = true
        this.showAreaWarn = false
      })
    },
    getZoneClassOptions(){
      return StateHelper.getOptionsFromState('zone', false, true, 
        zone => zone.zoneType == ZONE.NON_COORDINATE && zone.areaId === this.form.areaId)
    },
    getZoneBlockItems(){
      return StateHelper.getOptionsFromState('zone', false, true, 
        zone => zone.zoneType == ZONE.COORDINATE && zone.areaId === this.form.areaId && NumberUtil.inRange(zone, this.form))
    },
    showSensor(index){
      if(index == 0){
        return true
      }
      if(!APP.EXB.MULTI_SENSOR){
        return false
      }
      for(let idx = index - 1; 0 <= idx; idx--){
        if(this.isNormalSensor(idx)){
          return false
        }
      }
      return true
    },
    getSensorIndex(index){
      return APP.EXB.MULTI_SENSOR && !this.isNormalSensor() && 1 < APP.EXB.SENSOR_MAX? `${index + 1}`: ''
    },
    getSensorOptionsExb(index) {
      const options = OptionHelper.getSensorOptions('exb', index != 0)
      return Util.hasValue(this.form.exbSensorList)? options.filter((val) => {
        for(let cnt = 0; cnt < this.form.exbSensorList.length; cnt++){
          if(index != cnt && val.value != null && val.value == this.form.exbSensorList[cnt].sensorId){
            return false
          }
        }
        return true
      }): options
    },
    changeSensors(newVal, index) {
      if(newVal == null){
        this.form.exbSensorList.forEach((exbSensor, idx) => {
          if(index == 0 || index < idx){
            exbSensor.sensorId = null
          }
        })
      }
      this.$nextTick(() => this.$forceUpdate())
    },
    initExbSensorList(){
      this.form.exbSensorList = this.exb.exbSensorList? this.exb.exbSensorList.map((val, idx) => {
        return APP.EXB.MULTI_SENSOR && idx < APP.EXB.SENSOR_MAX || !APP.EXB.MULTI_SENSOR && idx == 0? {
          exbId: null,
          sensorId: val.exbSensorPK.sensorId,
        }: null
      }).filter((val) => val): []
      const maxSensor = APP.EXB.MULTI_SENSOR? APP.EXB.SENSOR_MAX: 1
      for(let cnt = this.form.exbSensorList.length; cnt < maxSensor; cnt++){
        this.form.exbSensorList.push({
          exbId: null,
          sensorId: null
        })
      }
    },
    onChangeTxSetting(param) {
      this.txIconsDispFormat = param.format
      this.txIconsHorizon = param.horizon
      this.txIconsVertical = param.vertical
    },
    onBeforeReload(){
      this.initExbSensorList()
      this.changeSensors()
      this.form.sensorId = null
      this.vueSelected.area = VueSelectHelper.getVueSelectData(this.areaOptions, null)
      this.vueSelected.zone = VueSelectHelper.getVueSelectData(this.getZoneClassOptions(), null)
      this.checkWarnOn()
    },
    async onSaving() {
      let dummyKey = -1
      const entity = {
        exbId: this.form.exbId != null? this.form.exbId: dummyKey--,
        deviceId: this.deviceId,
        locationId: this.form.locationId,
        location: {
          locationId: this.form.locationId? this.form.locationId: dummyKey--,
          areaId: this.form.areaId,
          locationName: this.form.locationName,
          visible: this.form.visible,
          txViewType: {
            displayFormat: this.txIconsDispFormat,
            horizon: this.txIconsHorizon,
            vertical: this.txIconsVertical
          },
          posId: this.form.posId,
          x: this.form.x,
          y: this.form.y,
        },
        exbSensorList: this.form.sensorId? [
          {exbSensorPK: {sensorId: this.form.sensorId}}
        ]: null
      }
      // const exbSensorList = []
      // this.form.exbSensorList.forEach((exbSensor) => {
      //   if(exbSensor.sensorId){
      //     exbSensorList.push({
      //       exbSensorPK: {
      //         exbId: this.form.exbId || dummyKey--,
      //         sensorId: exbSensor.sensorId
      //       }
      //     })
      //   }
      // })

      const zoneIds = [this.form.zoneId].filter(val => val)
      entity.location.locationZoneList = zoneIds.map(zoneId => ({
        locationZonePK: {
          locationId: this.form.locationId? this.form.locationId: dummyKey--,
          zoneId: zoneId
        }
      }))

      const ret = await AppServiceHelper.bulkSave(this.appServicePath, [entity])
      this.deviceId = null
      this.deviceIdX = null
      return ret
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../../sub/constant/vue.scss";

label.txicons-num {
  margin-left: 20px;
}
</style>