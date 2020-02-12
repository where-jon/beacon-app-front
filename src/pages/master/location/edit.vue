<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />
      <auto-alert :custom="showAreaWarn" :p-custom-message="areaWarnMessage" />

      <b-row>
        <b-col md="8" offset-md="2">
          <b-form v-if="show" @submit.prevent="save">
            <b-form-group>
              <label v-t="'label.id'" />
              <input v-model="form.locationCd" :readonly="!isEditable" type="text" maxlength="20" class="form-control" :pattern="cdPattern" required>
            </b-form-group>
            <b-form-group>
              <label v-t="'label.locationName'" />
              <input v-model="form.locationName" :readonly="!isEditable" type="text" maxlength="40" class="form-control" required>
            </b-form-group>
            <b-form-group v-if="showLocationTypeOptions">
              <label v-t="'label.locationType'" />
              <b-form-select v-model="form.locationType" :options="locationTypeOptions" :disabled="!isEditable" :readonly="!isEditable" :required="showLocationTypeOptions" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.area'" />
              <v-select v-model="vueSelected.area" :options="areaOptions" :disabled="!isEditable" :readonly="!isEditable" class="vue-options-lg">
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </b-form-group>
            <b-form-group v-if="isShown('LOCATION.WITH', 'posId')">
              <label v-t="'label.posId'" />
              <input v-model="form.posId" :readonly="!isEditable" type="number" min="0" max="65535" class="form-control" >
            </b-form-group>
            <b-form-group>
              <label v-t="'label.locationX'" />
              <input v-model="form.x" :readonly="!isEditable" type="number" min="0" max="99999" class="form-control">
            </b-form-group>
            <b-form-group>
              <label v-t="'label.locationY'" />
              <input v-model="form.y" :readonly="!isEditable" type="number" min="0" max="99999" class="form-control">
            </b-form-group>

            <extform :is-editable="isEditable" :form="form" :p-ext-value="extValue" />

            <settingtxview
              :is-editable="isEditable"
              :disp-format="form.txViewType ? form.txViewType.displayFormat : txIconsDispFormat"
              :horizon="form.txViewType ? form.txViewType.horizon : txIconsHorizon"
              :vertical="form.txViewType ? form.txViewType.vertical : txIconsVertical"
              @change="onChangeTxSetting"
            />

            <b-form-group>
              <label v-t="'label.exb'" />
              <v-select v-model="vueSelected.exbIdList" :options="iExbOptions" :disabled="!isEditable" multiple :close-on-select="false" class="vue-options-multi">
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </b-form-group>
            <b-form-group>
              <label v-t="'label.tx'" />
              <v-select v-model="vueSelected.txIdList" :options="iTxOptions" :disabled="!isEditable" multiple :close-on-select="false" class="vue-options-multi">
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </b-form-group>

            <b-form-group v-show="useZoneClass">
              <label v-t="'label.zoneClass'" />
              <v-select v-model="vueSelected.zones" :options="getZoneClassOptions()" :disabled="!isEditable" :readonly="!isEditable" multiple :close-on-select="false" class="vue-options-multi">
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </b-form-group>
            <b-form-group v-show="useZoneBlock">
              <label v-t="'label.zoneBlock'" />
              <v-select :value="getZoneBlockItems()" :options="zoneBlockOptions" disabled multiple class="vue-options-multi" />
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
import { ZONE, PATTERN } from '../../../sub/constant/Constants'
import * as NumberUtil from '../../../sub/util/NumberUtil'
import * as Util from '../../../sub/util/Util'
import * as AppServiceHelper from '../../../sub/helper/dataproc/AppServiceHelper'
import * as ConfigHelper from '../../../sub/helper/dataproc/ConfigHelper'
import * as ExtValueHelper from '../../../sub/helper/domain/ExtValueHelper'
import * as MenuHelper from '../../../sub/helper/dataproc/MenuHelper'
import * as OptionHelper from '../../../sub/helper/dataproc/OptionHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as MasterHelper from '../../../sub/helper/domain/MasterHelper'
import * as ValidateHelper from '../../../sub/helper/dataproc/ValidateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import * as VueSelectHelper from '../../../sub/helper/ui/VueSelectHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import editmixin from '../../../components/mixin/editmixin.vue'
import alert from '../../../components/parts/alert.vue'
import autoAlert from '../../../components/parts/autoAlert.vue'
import extform from '../../../components/parts/extform.vue'
import settingtxview from '../../../components/parts/settingtxview.vue'

export default {
  components: {
    breadcrumb,
    alert,
    autoAlert,
    extform,
    settingtxview,
  },
  mixins: [commonmixin, editmixin],
  data() {
    return {
      name: 'location',
      id: 'locationId',
      backPath: '/master/location',
      appServicePath: '/core/location',
      items: ViewHelper.createBreadCrumbItems('master', {text: 'locationList', href: '/master/location'}, ViewHelper.getDetailCaptionKey(this.$store.state.app_service.location.locationId)),
      useZoneClass: MenuHelper.isMenuEntry('/master/zoneClass') && this.isShown('LOCATION.WITH', 'zoneClass'),
      useZoneBlock: MenuHelper.isMenuEntry('/master/zoneBlock') && this.isShown('LOCATION.WITH', 'zoneBlock'),
      form: Util.extract(this.$store.state.app_service.location, [
        'locationId', 'locationCd', 'locationType', 'locationName',
        'areaId', 'posId', 'x', 'y',
        'txViewType', 'locationZoneList',
        'exbIds', 'txIds', 
        ...ExtValueHelper.getExtValueKeys(APP.LOCATION, true)
      ]),
      vueSelected: {
        area: null,
        exbIdList: [],
        txIdList: [],
        zones: [],
      },
      txIconsDispFormat: 1,
      txIconsHorizon: 5,
      txIconsVertical: 5,
      checkWarn: false,
      showAreaWarn: false,
    }
  },
  computed: {
    areaOptions() {
      return MasterHelper.getOptionsFromState('area', false, true)
    },
    showLocationTypeOptions(){
      return 0 < APP.LOCATION.TYPE.WITH.length
    },
    locationTypeOptions(){
      return OptionHelper.getLocationTypeOptions()
    },
    iExbOptions() {
      return MasterHelper.getOptionsFromState(
        'exb',
        ConfigHelper.includesDeviceType('deviceId')? 'deviceId': 'deviceIdX',
        true,
        exb => !Util.hasValue(exb.location) || exb.location.locationId == this.form.locationId
      )
    },
    iTxOptions() {
      return MasterHelper.getOptionsFromState(
        'tx',
        tx => MasterHelper.getLocationTxName(tx),
        true,
        tx => !Util.hasValue(tx.location) || tx.location.locationId == this.form.locationId
      )
    },
    zoneBlockOptions(){
      return MasterHelper.getOptionsFromState('zone', false, true, zone => zone.x != null && zone.y != null)
    },
    ...mapState('app_service', [
      'areas', 'zones', 'exbs', 'location', 'locations',
    ]),
    areaWarnMessage(){
      return this.$i18n.tnl('message.resetFromTo', {
        from: this.$i18n.tnl('label.area'),
        to: this.$i18n.tnl('label.zone'),
      })
    },
    cdPattern(){
      return PATTERN.LOCATION_CD
    },
    extValue() {
      return ExtValueHelper.getExtValue(APP.LOCATION)
    },
  },
  watch: {
    'vueSelected.area': {
      handler: function(newVal, oldVal){
        this.form.areaId = Util.getValue(newVal, 'value', null)
        this.vueSelected.zones = []
        if(this.checkWarn && Util.hasValue(this.form.locationZoneList) && Util.getValue(oldVal, 'value', null) != null){
          this.showAreaWarn = true
        }
      },
      deep: true,
    },
    'vueSelected.exbIdList': {
      handler: function(newVal, oldVal){
        this.form.exbIds = newVal.map(val => val.value)
      },
      deep: true,
    },
    'vueSelected.txIdList': {
      handler: function(newVal, oldVal){
        this.form.txIds = newVal.map(val => val.value)
      },
      deep: true,
    },
    'vueSelected.zones': {
      handler: function(newVal, oldVal){
        this.$nextTick(() => {
          const nVal = Util.hasValue(newVal)? newVal.filter(val => val): []
          this.form.locationZoneList = nVal.map(val => ({locationZonePK: {zoneId: val.value}}))
          if(this.showAreaWarn && Util.hasValue(this.form.locationZoneList)){
            this.showAreaWarn = false
          }
        })
      },
      deep: true,
    },
  },
  async created() {
    this.$nextTick(() => {
      ValidateHelper.setCustomValidationMessage()
      VueSelectHelper.disabledAllSubmit()
    })
  },
  async mounted() {
    this.checkWarnOn()
    this.vueSelected.area = VueSelectHelper.getVueSelectData(this.areaOptions, this.form.areaId)
    if(!Util.hasValue(this.form.locationType)){
      this.form.locationType = Util.getValue(this.locationTypeOptions, '0.value', null)
    }
    if(!Util.hasValue(this.form.locationCd)){
      this.form.locationCd = MasterHelper.createMasterCd('location', this.locations, this.location)
    }

    this.$nextTick(() => {
      if(Util.hasValue(this.form.exbIds)){
        this.vueSelected.exbIdList = _(this.form.exbIds).map(exbId => 
          VueSelectHelper.getVueSelectData(this.iExbOptions, exbId)
        ).filter(option => option).sort((a, b) => a.label < b.label? -1: 1).uniqWith(_.isEqual).value()
      }
      if(Util.hasValue(this.form.txIds)){
        this.vueSelected.txIdList = _(this.form.txIds).map(txId => 
          VueSelectHelper.getVueSelectData(this.iTxOptions, txId)
        ).filter(option => option).sort((a, b) => a.label < b.label? -1: 1).uniqWith(_.isEqual).value()
      }
      const locationZoneList = this.form.locationZoneList
      if(Util.hasValue(locationZoneList)){
        this.vueSelected.zones = _(locationZoneList).map(locationZone => 
          VueSelectHelper.getVueSelectData(this.getZoneClassOptions(), locationZone.locationZonePK.zoneId)
        ).filter(option => option).sort((a, b) => a.label < b.label? -1: 1).uniqWith(_.isEqual).value()
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
    checkWarnOn(){
      this.checkWarn = false
      this.$nextTick(() => {
        this.checkWarn = true
        this.showAreaWarn = false
      })
    },
    getZoneClassOptions(){
      return MasterHelper.getOptionsFromState('zone', false, true,
        zone => zone.x == null && zone.y == null && ([this.form.areaId, null].includes(zone.areaId))
      )
    },
    getZoneBlockItems(){
      return MasterHelper.getOptionsFromState('zone', false, true,
        zone => zone.x != null && zone.y != null && zone.areaId === this.form.areaId && NumberUtil.inRange(zone, this.form))
    },
    onChangeTxSetting(param) {
      this.txIconsDispFormat = param.format
      this.txIconsHorizon = param.horizon
      this.txIconsVertical = param.vertical
    },
    onBeforeReload(){
      this.vueSelected.area = VueSelectHelper.getVueSelectData(this.areaOptions, null)
      this.vueSelected.zone = VueSelectHelper.getVueSelectData(this.getZoneClassOptions(), null)
      this.checkWarnOn()
    },
    async onSaving() {
      let dummyKey = -1
      const entity = {
        locationId: this.form.locationId? this.form.locationId: dummyKey--,
        locationCd: this.form.locationCd,
        locationType: this.form.locationType,
        areaId: this.form.areaId,
        locationName: this.form.locationName,
        txViewType: {
          displayFormat: this.txIconsDispFormat,
          horizon: this.txIconsHorizon,
          vertical: this.txIconsVertical
        },
        extValue: {},
        posId: this.form.posId,
        x: this.form.x,
        y: this.form.y,
        exbIdList: this.form.exbIds,
        txIdList: this.form.txIds,
      }
      ExtValueHelper.getExtValueKeys(APP.LOCATION).forEach(key => entity.extValue[key] = this.form[key])

      entity.locationZoneList = Util.getValue(this.form, 'locationZoneList', []).map(locationZone => ({
        locationZonePK: {
          locationId: this.form.locationId? this.form.locationId: dummyKey--,
          zoneId: locationZone.locationZonePK.zoneId
        }
      }))
      return await AppServiceHelper.bulkSave(this.appServicePath, [entity])
    },
    async onSaved(){
      this.$set(this.form, 'locationCd', MasterHelper.createMasterCd('location', this.locations, this.location))
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../../sub/constant/vue.scss";

label.txicons-num {
  margin-left: 20px;
}
</style>
