<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" />
    <div class="container">
      <alert :message="message" />

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
            <b-form-group v-if="isShown('EXB.WITH', 'exbType')">
              <label v-t="'label.exbType'" />
              <b-form-select v-model="form.exbType" :options="exbTypeOptions" :disabled="!isEditable" :readonly="!isEditable" class="ml-3 col-4" />
            </b-form-group>
            <b-form-group v-for="(param, index) in adjustParams" :key="index">
              <label>
                {{ $i18n.tnl('label.' + param.key) }}
              </label>
              <input v-model="form[param.key]" :readonly="!isEditable" type="number" :min="param.min" :max="param.max" class="form-control">
            </b-form-group>

            <b-form-group>
              <span v-for="(exbSensor, index) in form.exbSensorList" :key="index">
                <b-form-group v-show="showSensor(index)">
                  <label>
                    {{ $i18n.tnl('label.type') + getSensorIndex(index) }}
                  </label>
                  <b-form-select v-model="exbSensor.sensorId" :options="getSensorOptionsExb(index)" :disabled="!isEditable" :readonly="!isEditable" class="ml-3 col-4" @change="changeSensors($event, index)" />
                </b-form-group>
              </span>
            </b-form-group>
            <b-form-row class="mb-3">
              <b-col>
                <label v-t="'label.area'" />
                <v-select v-model="vueSelected.area" :options="areaOptions" :disabled="!isEditable" :readonly="!isEditable" class="vue-options-lg">
                  <template slot="no-options">
                    {{ vueSelectNoMatchingOptions }}
                  </template>
                </v-select>
              </b-col>
              <b-col>
                <label v-t="'label.locationName'" />
                <v-select v-model="vueSelected.location" :options="getLocationOptions()" :disabled="!isEditable" :readonly="!isEditable" class="vue-options-lg">
                  <template slot="no-options">
                    {{ vueSelectNoMatchingOptions }}
                  </template>
                </v-select>
              </b-col>
            </b-form-row>

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
import { EXB } from '../../../sub/constant/Constants'
import * as Util from '../../../sub/util/Util'
import * as AppServiceHelper from '../../../sub/helper/dataproc/AppServiceHelper'
import * as ConfigHelper from '../../../sub/helper/dataproc/ConfigHelper'
import * as OptionHelper from '../../../sub/helper/dataproc/OptionHelper'
import * as MasterHelper from '../../../sub/helper/domain/MasterHelper'
import * as ValidateHelper from '../../../sub/helper/dataproc/ValidateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import * as VueSelectHelper from '../../../sub/helper/ui/VueSelectHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import editmixin from '../../../components/mixin/editmixin.vue'
import alert from '../../../components/parts/alert.vue'

export default {
  components: {
    breadcrumb,
    alert,
  },
  mixins: [commonmixin, editmixin],
  data() {
    return {
      name: 'exb',
      id: 'exbId',
      backPath: '/master/exb',
      appServicePath: '/core/exb',
      breadCrumbs: ViewHelper.createBreadCrumbItems('master', {text: 'masterExb', href: '/master/exb'}, ViewHelper.getDetailCaptionKey(this.$store.state.app_service.exb.exbId)),
      form: Util.extract(this.$store.state.app_service.exb, [
        'exbId', 'deviceId', 'location.areaId', 'locationId', 'exbSensorList',
        'exbType', 'threshold1', 'threshold2', 'adjust1', 'adjust2'
      ]),
      vueSelected: {
        area: null,
        location: null,
      },
      mutex: false,
      deviceId: null,
      deviceIdX: null,
      maxDeviceId: 65535,
    }
  },
  computed: {
    adjustParams() {
      return [
        { key: 'threshold1', min: -65535, max: 0 },
        { key: 'threshold2', min: -65535, max: 0 },
        { key: 'adjust1', min: -50, max: 50 },
        { key: 'adjust2', min: -50, max: 50 },
      ]
    },
    exbTypeOptions(){
      return EXB.getTypes()
    },
    ...mapState('app_service', [
      'exb',
    ]),
  },
  watch: {
    'vueSelected.area': {
      handler: function(newVal, oldVal){
        this.form.areaId = Util.getValue(newVal, 'value')
        this.vueSelected.location = null
      },
      deep: true,
    },
    'vueSelected.location': {
      handler: function(newVal, oldVal){
        this.form.locationId = Util.getValue(newVal, 'value')
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
    this.$nextTick(() => {
      ValidateHelper.setCustomValidationMessage()
      VueSelectHelper.disabledAllSubmit()
    })
  },
  async mounted() {
    this.vueSelected.area = VueSelectHelper.getVueSelectData(this.areaOptions, this.form.areaId)
    this.$nextTick(() => this.vueSelected.location = VueSelectHelper.getVueSelectData(this.getLocationOptions(), this.form.locationId))
    this.deviceId = this.form.deviceId
  },
  methods: {
    isNormalSensor(index){
      return Util.getValue(this.form, `exbSensorList.${index && 0 <= index? index: 0}.sensorId`)? false: true
    },
    includesDeviceType(name){
      return ConfigHelper.includesDeviceType(name)
    },
    getLocationOptions(){
      return MasterHelper.getOptionsFromState('location', false, true, location => location.areaId == this.form.areaId)
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
      return Util.hasValue(this.form.exbSensorList)? options.filter(val => {
        const length = this.form.exbSensorList.length
        for(let cnt = 0; cnt < length; cnt++){
          if(index != cnt && val.value != null && val.value == this.form.exbSensorList[cnt].sensorId){
            return false
          }
        }
        return true
      }): options
    },
    changeSensors(newVal, index) {
      if(newVal == null){
        this.form.exbSensorList.forEach((sensor, idx) => {
          if(index == 0 || index < idx){
            sensor.sensorId = null
          }
        })
      }
      this.$nextTick(() => this.$forceUpdate())
    },
    initExbSensorList(){
      this.form.exbSensorList = this.exb.exbSensorList? this.exb.exbSensorList.map((val, idx) => { // TODO: master取得と形式を合わせ、sensorListにしたい
        return APP.EXB.MULTI_SENSOR && idx < APP.EXB.SENSOR_MAX || !APP.EXB.MULTI_SENSOR && idx == 0? {
          exbId: null,
          sensorId: val.exbSensorPK.sensorId,
        }: null
      }).filter(val => val): []
      const maxSensor = APP.EXB.MULTI_SENSOR? APP.EXB.SENSOR_MAX: 1
      const length = this.form.exbSensorList.length 
      for(let cnt = length; cnt < maxSensor; cnt++){
        this.form.exbSensorList.push({ exbId: null, sensorId: null })
      }
    },
    onBeforeReload(){
      this.initExbSensorList()
      this.changeSensors()
      this.form.sensorId = null
      this.vueSelected.area = VueSelectHelper.getVueSelectData(this.areaOptions)
      this.vueSelected.location = null
    },
    async onSaving() {
      const entity = {
        updateKey: this.form.exbId != null? this.form.exbId: null,
        deviceId: this.deviceId,
        exbType: this.form.exbType,
      }

      if (this.form.locationId) {
        entity.locationCd = this.locations.find(e => e.locationId == this.form.locationId).locationCd
      }

      this.adjustParams.forEach(param => entity[param.key] = this.form[param.key])

      const sensorOptions = OptionHelper.getSensorOptions('exb', false)
      const sensorNames = []
      this.form.exbSensorList.forEach(exbSensor => {
        if(exbSensor.sensorId){
          const opt = sensorOptions.filter(opt => opt.value == exbSensor.sensorId)[0]
          sensorNames.push(opt.text)
        }
      })
      entity.sensorNames = sensorNames.join(";")

      let ret = await AppServiceHelper.save2(this.appServicePath, entity)
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
