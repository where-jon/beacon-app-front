<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-row>
        <b-col md="8" offset-md="2">
          <b-form v-if="show" @submit.prevent="onSubmit">
            <b-form-group v-if="hasId" v-show="isShown('EXB_WITH_EXBID')">
              <label v-t="'label.exbId'" />
              <b-form-input v-model="form.exbId" type="text" readonly="readonly" />
            </b-form-group>
            <b-form-group v-show="isShown('EXB_WITH_DEVICE_NUM')">
              <label v-t="'label.deviceNum'" />
              <input v-model.lazy="deviceNum" :max="maxDeviceNum" :readonly="!isEditable" type="number" class="form-control" min="0" required>
            </b-form-group>
            <b-form-group v-show="isShown('EXB_WITH_DEVICE_ID')">
              <label v-t="'label.deviceId'" />
              <input v-model.lazy="deviceId" :max="maxDeviceId" :readonly="!isEditable" type="number" class="form-control" min="0" required>
            </b-form-group>
            <b-form-group v-show="isShown('EXB_WITH_DEVICE_IDX')">
              <label v-t="'label.deviceIdX'" />
              <input v-model.lazy="deviceIdX" :readonly="!isEditable" type="text" class="form-control" required>
            </b-form-group>
            <b-form-group>
              <label v-t="'label.locationName'" />
              <input v-model="form.locationName" :readonly="!isEditable" type="text" maxlength="20" class="form-control" required>
            </b-form-group>
            <b-form-group>
              <label v-t="'label.area'" />
              <b-form-select v-model="form.areaId" :options="areaOptions" :disabled="!isEditable" :readonly="!isEditable" class="mb-3 ml-3 col-4" />
            </b-form-group>
            <b-form-group v-show="isShown('EXB_WITH_POSID')">
              <label v-t="'label.posId'" />
              <input v-model="form.posId" :readonly="!isEditable" type="number" min="0" max="65535" class="form-control" required>
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
            <span v-for="(exbSensor, index) in form.exbSensorList" :key="index">
              <b-form-group v-show="showSensor(index)">
                <label>
                  {{ $i18n.tnl('label.type') + getSensorIndex(index) }}
                </label>
                <b-form-select v-model="exbSensor.sensorId" :options="getSensorOptionsExb(index)" :disabled="!isEditable" :readonly="!isEditable" class="mb-3 ml-3 col-4" @change="changeSensors($event, index)" />
              </b-form-group>
            </span>
            <b-form-group v-show="useZone">
              <label v-t="'label.zone'" />
              <b-form-select v-model="form.zoneId" :options="zoneNames" :disabled="!isEditable" :readonly="!isEditable" class="mb-3 ml-3 col-4" />
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
import * as MenuHelper from '../../../sub/helper/MenuHelper'
import * as Util from '../../../sub/util/Util'
import editmixinVue from '../../../components/mixin/editmixin.vue'
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
  mixins: [editmixinVue],
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
        'exbSensorList.0.sensor.sensorId', 'location.locationZoneList.0.locationZonePK.zoneId'
      ]
      ),
      defValue: {
        'enabled': true,
      },
      deviceId: null,
      deviceIdX: null,
      deviceNum: null,
      useZone: MenuHelper.isMenuEntry('/master/zoneClass'),
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.exb'),
          href: '/master/exb',
        },
        {
          text: this.$i18n.tnl(Util.getDetailCaptionKey(this.$store.state.app_service.exb.exbId)),
          active: true
        }
      ],
      txIconsDispFormat: 1,
      txIconsHorizon: 5,
      txIconsVertical: 5,
      TXICONS_DISPFORMAT_TILE: 5,
      maxDeviceId: 65535,
      maxDeviceNum: 65535 - this.$store.state.currentRegion.deviceOffset,
    }
  },
  computed: {
    hasId(){
      return Util.hasValue(this.form.exbId)
    },
    theme () {
      const theme = getButtonTheme()
      return 'outline-' + theme
    },
    areaOptions() {
      return StateHelper.getOptionsFromState('area', false, true)
    },
    zoneNames() {
      return StateHelper.getOptionsFromState('zone', false, false, 
        zone => zone.areaId == this.form.areaId
      )
    },
    ...mapState('app_service', [
      'exb',
      'areas',
      'sensors',
      'zones',
    ]),
  },
  watch: {
    deviceId: function(newVal, oldVal) {
      if (!this.mutex) {
        this.mutex = true
        this.deviceId = newVal 
        this.deviceIdX = newVal? Number(newVal).toString(16).toUpperCase(): null
        this.deviceNum = newVal? Number(newVal) - this.$store.state.currentRegion.deviceOffset: null
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
    deviceNum: function(newVal, oldVal) {
      if (!this.mutex) {
        this.mutex = true
        if (newVal) {
          this.deviceNum = newVal 
          this.deviceId = Number(newVal) + this.$store.state.currentRegion.deviceOffset
        }
        this.mutex = false
      }
    },
  },
  async created() {
    this.initExbSensorList()
    this.changeSensors()
    await StateHelper.load('sensor')
    await StateHelper.load('area')
    await StateHelper.load('zone')
  },
  mounted() {
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
    showSensor(index){
      if(index == 0){
        return true
      }
      if(!APP.EXB_MULTI_SENSOR){
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
      return APP.EXB_MULTI_SENSOR && !this.isNormalSensor() && 1 < APP.EXB_SENSOR_MAX? `${index + 1}`: ''
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
        return APP.EXB_MULTI_SENSOR && idx < APP.EXB_SENSOR_MAX || !APP.EXB_MULTI_SENSOR && idx == 0? {
          exbId: null,
          sensorId: val.sensor.sensorId,
        }: null
      }).filter((val) => val): []
      const maxSensor = APP.EXB_MULTI_SENSOR? APP.EXB_SENSOR_MAX: 1
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
    async save() {
      let dummyKey = -1
      if(!this.zoneNames.find((zone) => zone.value == this.form.zoneId)){
        this.form.zoneId = null
      }
      let entity = {
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
      }
      const exbSensorList = []
      this.form.exbSensorList.forEach((exbSensor) => {
        if(exbSensor.sensorId){
          exbSensorList.push({
            exbSensorPK: {
              exbId: this.form.exbId || dummyKey--,
              sensorId: exbSensor.sensorId
            }
          })
        }
      })
      entity.exbSensorList = exbSensorList
      let ret = await AppServiceHelper.bulkSave(this.appServicePath, [entity])
      this.deviceId = null
      this.deviceIdX = null
      this.deviceNum = null
      return ret
    },
  }
}
</script>

<style scoped lang="scss">
label.txicons-num {
  margin-left: 20px;
}
</style>