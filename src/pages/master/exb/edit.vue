<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-row>
        <b-col md="8" offset-md="2">
          <b-form v-if="show" @submit.prevent="onSubmit">
            <b-form-group v-show="isShown('EXB.WITH', 'deviceId')">
              <label v-t="'label.deviceId'" />
              <input v-model.lazy="deviceId" :max="maxDeviceId" :readonly="!isEditable" type="number" class="form-control" min="0" :required="isShown('EXB.WITH', 'deviceId')">
            </b-form-group>
            <b-form-group v-show="isShown('EXB.WITH', 'deviceIdX')">
              <label v-t="'label.deviceIdX'" />
              <input v-model.lazy="deviceIdX" :readonly="!isEditable" type="text" class="form-control" :required="isShown('EXB.WITH', 'deviceIdX')">
            </b-form-group>
            <b-form-group>
              <label v-t="'label.locationName'" />
              <input v-model="form.locationName" :readonly="!isEditable" type="text" maxlength="20" class="form-control" required>
            </b-form-group>
            <b-form-group>
              <label v-t="'label.area'" />
              <v-select v-model="vueSelected.area" :options="areaOptions" :disabled="!isEditable" :readonly="!isEditable" class="mb-3 vue-options-lg" />
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
            <b-form-group>
              <b-form-checkbox v-model="form.enabled" :disabled="!isEditable" :readonly="!isEditable" value="true" unchecked-value="false">
                {{ $t('label.enabled') }}
              </b-form-checkbox>
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
                <label v-t="'label.zone'" class="d-flex align-items-center" />
                <v-select v-model="vueSelected.zone" :options="getZoneNames()" :disabled="!isEditable" :readonly="!isEditable" class="mb-3 ml-2 vue-options-lg" />
              </b-form-row>
            </b-form-group>

            <b-button v-t="'label.back'" type="button" variant="outline-danger" class="mr-2 my-1" @click="backToList" />
            <b-button v-if="isEditable" :variant="theme" type="submit" class="mr-2 my-1" @click="register(false)">
              {{ $i18n.tnl(`label.${isUpdate? 'update': 'register'}`) }}
            </b-button>
            <b-button v-if="isRegistable && !isUpdate" v-t="'label.registerAgain'" :variant="theme" type="submit" class="my-1" @click="register(true)" />
          </b-form>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as VueSelectHelper from '../../../sub/helper/VueSelectHelper'
import * as MenuHelper from '../../../sub/helper/MenuHelper'
import * as Util from '../../../sub/util/Util'
import * as HtmlUtil from '../../../sub/util/HtmlUtil'
import * as ArrayUtil from '../../../sub/util/ArrayUtil'
import editmixinVue from '../../../components/mixin/editmixin.vue'
import controlmixinVue from '../../../components/mixin/controlmixin.vue'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import alert from '../../../components/parts/alert.vue'
import settingtxview from '../../../components/parts/settingtxview.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import { APP } from '../../../sub/constant/config'

export default {
  components: {
    breadcrumb,
    alert,
    settingtxview,
  },
  mixins: [editmixinVue, controlmixinVue],
  data() {
    return {
      name: 'exb',
      id: 'exbId',
      backPath: '/master/exb',
      appServicePath: '/core/exb',
      mutex: false,
      form: ViewHelper.extract(this.$store.state.app_service.exb, [
        'exbId', 'deviceId', 'enabled',
        'location.locationName', 'location.areaId', 'location.locationId', 'location.posId',
        'location.x', 'location.y', 'location.visible', 'location.txViewType',
        'exbSensorList.0.exbSensorPK.sensorId', 'location.locationZoneList.0.locationZonePK.zoneId'
      ]),
      vueSelected: {
        area: null,
        zone: null,
      },
      defValue: {
        'enabled': true,
      },
      deviceId: null,
      deviceIdX: null,
      useZone: ArrayUtil.includesIgnoreCase(APP.EXB.WITH, 'zone') && MenuHelper.isMenuEntry('/master/zoneClass'),
      items: ViewHelper.createBreadCrumbItems('master', {text: 'exb', href: '/master/exb'}, Util.getDetailCaptionKey(this.$store.state.app_service.exb.exbId)),
      txIconsDispFormat: 1,
      txIconsHorizon: 5,
      txIconsVertical: 5,
      TXICONS_DISPFORMAT_TILE: 5,
      maxDeviceId: 65535,
    }
  },
  computed: {
    theme () {
      const theme = getButtonTheme()
      return 'outline-' + theme
    },
    areaOptions() {
      return StateHelper.getOptionsFromState('area', false, true)
    },
    sensorOptionsExb() {
      let options = this.sensorOptions('exb')
      return options
    },
    ...mapState('app_service', [
      'exb',
      'areas',
      'sensors',
      'zones',
    ]),
  },
  watch: {
    'vueSelected.area': {
      handler: function(newVal, oldVal){
        this.form.areaId = Util.getValue(newVal, 'value', null)
        this.vueSelected.zone = null
      },
      deep: true,
    },
    'vueSelected.zone': {
      handler: function(newVal, oldVal){
        this.form.zoneId = Util.getValue(newVal, 'value', null)
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
    this.$nextTick(() => HtmlUtil.setCustomValidationMessage())
  },
  async mounted() {
    await StateHelper.load('area')
    await StateHelper.load('zone')
    this.vueSelected.area = VueSelectHelper.getVueSelectData(this.areaOptions, this.form.areaId)
    this.$nextTick(() => this.vueSelected.zone = VueSelectHelper.getVueSelectData(this.getZoneNames(), this.form.zoneId))
    this.deviceId = this.form.deviceId
    ViewHelper.applyDef(this.form, this.defValue)
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
    getZoneNames() {
      const areaId = this.form.areaId
      const x = this.form.x
      const y = this.form.y
      const isValidVal = (val) => (val || val === 0)
      // EXBがゾーンの範囲内に位置しているか？
      const isInRange = (zone) => {
        if (zone.zoneType !== 0) {
          return true
        }
        if (!isValidVal(zone.x) || !isValidVal(zone.y) || !isValidVal(zone.h) || !isValidVal(zone.w)) {
          return false
        }
        const bottomX = zone.x + zone.w
        const bottomY = zone.y + zone.h
        return zone.x <= x && zone.y <= y && x <= bottomX && y <= bottomY
      }
      return StateHelper.getOptionsFromState('zone', false, true, 
        (zone) => zone.areaId === areaId && isInRange(zone))
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
      const options = this.sensorOptions('exb', index != 0)
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
    beforeReload(){
      this.initExbSensorList()
      this.changeSensors()
      this.form.sensorId = null
      this.vueSelected.area = VueSelectHelper.getVueSelectData(this.areaOptions, null)
      this.vueSelected.zone = VueSelectHelper.getVueSelectData(this.getZoneNames(), null)
    },
    async save() {
      let dummyKey = -1
      if(!this.getZoneNames().find(zone => zone.value == this.form.zoneId)){
        this.form.zoneId = null
      }
      const entity = {
        exbId: this.form.exbId != null? this.form.exbId: dummyKey--,
        deviceId: this.deviceId,
        locationId: this.form.locationId,
        enabled: this.form.enabled,
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
          locationZoneList: this.form.zoneId? [{
            locationZonePK: {
              locationId: this.form.locationId? this.form.locationId: dummyKey--,
              zoneId: this.form.zoneId
            }
          }]: null
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
      // entity.exbSensorList = exbSensorList
      let ret = await AppServiceHelper.bulkSave(this.appServicePath, [entity])
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