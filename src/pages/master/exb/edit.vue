<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">
      <b-alert variant="info" dismissible :show="showInfo">
        {{ message }}
      </b-alert>
      <b-alert variant="danger" dismissible :show="showAlert" @dismissed="showAlert=false">
        <div v-html="message" />
      </b-alert>

      <b-row>
        <b-col md="8" offset-md="2">
          <b-form v-if="show" @submit.prevent="onSubmit">
            <b-form-group v-if="hasId" v-show="isShown('EXB_WITH_EXBID')">
              <label v-t="'label.exbId'" />
              <b-form-input v-model="form.exbId" type="text" readonly="readonly" />
            </b-form-group>
            <b-form-group v-show="isShown('EXB_WITH_DEVICE_NUM')">
              <label v-t="'label.deviceNum'" />
              <input v-model.lazy="deviceNum" type="number" class="form-control" min="0" :max="maxDeviceNum" required :readonly="!isEditable">
            </b-form-group>
            <b-form-group v-show="isShown('EXB_WITH_DEVICE_ID')">
              <label v-t="'label.deviceId'" />
              <input v-model.lazy="deviceId" type="number" class="form-control" min="0" :max="maxDeviceId" required :readonly="!isEditable">
            </b-form-group>
            <b-form-group v-show="isShown('EXB_WITH_DEVICE_IDX')">
              <label v-t="'label.deviceIdX'" />
              <input v-model.lazy="deviceIdX" type="text" class="form-control" required :readonly="!isEditable">
            </b-form-group>
            <b-form-group>
              <label v-t="'label.locationName'" />
              <input v-model="form.locationName" type="text" maxlength="20" class="form-control" required :readonly="!isEditable">
            </b-form-group>
            <b-form-group>
              <label v-t="'label.area'" />
              <b-form-select v-model="form.areaId" :options="areaOptions" class="mb-3 ml-3 col-4" :disabled="!isEditable" :readonly="!isEditable" />
            </b-form-group>
            <b-form-group v-show="isShown('EXB_WITH_POSID')">
              <label v-t="'label.posId'" />
              <input v-model="form.posId" type="number" min="0" max="65535" class="form-control" required :readonly="!isEditable">
            </b-form-group>
            <b-form-group>
              <label v-t="'label.locationX'" />
              <input v-model="form.x" type="number" min="0" max="99999" class="form-control" :readonly="!isEditable">
            </b-form-group>
            <b-form-group>
              <label v-t="'label.locationY'" />
              <input v-model="form.y" type="number" min="0" max="99999" class="form-control" :readonly="!isEditable">
            </b-form-group>
            <b-form-group>
              <b-form-checkbox v-model="form.enabled" value="true" unchecked-value="false" :disabled="!isEditable" :readonly="!isEditable">
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
            <!--
            <settingtxview
              :isEditable="isEditable"
              :dispFormat="form.txViewType ? form.txViewType.displayFormat : txIconsDispFormat"
              :horizon="form.txViewType ? form.txViewType.horizon : txIconsHorizon"
              :vertical="form.txViewType ? form.txViewType.vertical : txIconsVertical"
              @change="onChangeTxSetting"
            />
            -->
            <b-form-group>
              <label v-t="'label.type'" />
              <b-form-select v-model="form.sensorId" :options="sensorOptionsExb" class="mb-3 ml-3 col-4" :disabled="!isEditable" :readonly="!isEditable" />
            </b-form-group>
            <b-form-group v-show="useZone">
              <label v-t="'label.zone'" />
              <b-form-select v-model="form.zoneId" :options="zoneNames" class="mb-3 ml-3 col-4" :disabled="!isEditable" :readonly="!isEditable" />
            </b-form-group>
            <b-button v-t="'label.back'" type="button" variant="outline-danger" class="mr-2 my-1" @click="backToList" />
            <b-button v-if="isEditable" type="submit" :variant="theme" class="mr-2 my-1" @click="register(false)">
              {{ label }}
            </b-button>
            <b-button v-if="isEditable && !isUpdate" v-t="'label.registerAgain'" type="submit" :variant="theme" class="my-1" @click="register(true)" />
          </b-form>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as MenuHelper from '../../../sub/helper/MenuHelper'
import * as Util from '../../../sub/util/Util'
import editmixinVue from '../../../components/mixin/editmixin.vue'
import { APP } from '../../../sub/constant/config.js'
import { TX_VIEW_TYPES, txViewTypes } from '../../../sub/constant/Constants'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import settingtxview from '../../../components/parts/settingtxview.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'

export default {
  components: {
    breadcrumb,
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
    sensorOptionsExb() {
      let options = this.sensorOptions('exb')
      options.unshift({value:null, text:this.$i18n.tnl('label.normal')})
      return options
    },
    areaOptions() {
      return this.areas.map((area) => {
        return {
          value: area.areaId,
          text: area.areaName
        }
      }
      )
    },
    zoneNames() {
      let options = this.zones.filter((zone) => zone.areaId == this.form.areaId)
        .map((zone) => {
          return {
            value: zone.zoneId,
            text: zone.zoneName
          }
        }
        )
      Util.addNoSelect(options)
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
  mounted() {
    this.deviceId = this.form.deviceId
    ViewHelper.applyDef(this.form, this.defValue)
    StateHelper.load('sensor')
    StateHelper.load('area')
    StateHelper.load('zone')
    if (!this.form.txViewType) {
      return
    }
    this.txIconsDispFormat = this.form.txViewType.displayFormat
    this.txIconsHorizon = this.form.txViewType.horizon
    this.txIconsVertical = this.form.txViewType.vertical
  },
  methods: {
    onChangeTxSetting(param) {
      this.txIconsDispFormat = param.format
      this.txIconsHorizon = param.horizon
      this.txIconsVertical = param.vertical
    },
    async save() {
      if(!this.zoneNames.find((zone) => zone.value == this.form.zoneId)){
        this.form.zoneId = null
      }
      let entity = {
        exbId: this.form.exbId != null? this.form.exbId: -1,
        deviceId: this.deviceId,
        locationId: this.form.locationId,
        enabled: this.form.enabled,
        location: {
          locationId: this.form.locationId? this.form.locationId: -2,
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
              locationId: this.form.locationId? this.form.locationId: -2,
              zoneId: this.form.zoneId
            }
          }]: null
        },
        exbSensorList: this.form.sensorId? [
          {exbSensorPK: {sensorId: this.form.sensorId}}
        ]: null
      }
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