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
            <b-form-group>
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
            <b-form-group>
              <b-form-checkbox v-model="form.visible" value="true" unchecked-value="false" :disabled="!isEditable" :readonly="!isEditable">
                {{ $t('label.visible') }}
              </b-form-checkbox>
            </b-form-group>

            <settingtxview
              :is-editable="isEditable"
              :disp-format="form.txViewType ? form.txViewType.displayFormat : txIconsDispFormat"
              :horizon="form.txViewType ? form.txViewType.horizon : txIconsHorizon"
              :vertical="form.txViewType ? form.txViewType.vertical : txIconsVertical"
              @change="onChangeTxSetting"
            />
            <b-form-group v-show="useZone">
              <label v-t="'label.zoneClass'" />
              <v-select v-model="vueSelected.zone" :options="getZoneClassOptions()" :disabled="!isEditable" :readonly="!isEditable" class="vue-options-lg">
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </b-form-group>
            <b-form-group v-show="useZone">
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
      name: 'location',
      id: 'locationId',
      backPath: '/master/location',
      appServicePath: '/core/location',
      items: ViewHelper.createBreadCrumbItems('master', {text: 'locationList', href: '/master/location'}, ViewHelper.getDetailCaptionKey(this.$store.state.app_service.location.locationId)),
      useZone: MenuHelper.isMenuEntry('/master/zoneClass'),
      form: Util.extract(this.$store.state.app_service.location, [
        'locationId', 'locationCd', 'locationType', 'locationName',
        'areaId', 'posId', 'x', 'y',
        'visible', 'txViewType', 'locationZoneList',
      ]),
      vueSelected: {
        area: null,
        zone: null,
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
      return StateHelper.getOptionsFromState('area', false, true)
    },
    showLocationTypeOptions(){
      return 0 < APP.LOCATION.TYPE.WITH.length
    },
    locationTypeOptions(){
      return OptionHelper.getLocationTypeOptions()
    },
    zoneBlockOptions(){
      return StateHelper.getOptionsFromState('zone', false, true, zone => zone.zoneType == ZONE.COORDINATE)
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
  },
  async created() {
    this.$nextTick(() => {
      ValidateHelper.setCustomValidationMessage()
      VueSelectHelper.disabledAllSubmit()
    })
  },
  async mounted() {
    this.checkWarnOn()
    await Promise.all(['area', 'zone', 'exb'].map(StateHelper.load))
    this.vueSelected.area = VueSelectHelper.getVueSelectData(this.areaOptions, this.form.areaId)
    if(!Util.hasValue(this.form.locationType)){
      this.form.locationType = Util.getValue(this.locationTypeOptions, '0.value', null)
    }
    if(!Util.hasValue(this.form.locationCd)){
      this.form.locationCd = StateHelper.createMasterCd('location', this.locations, this.location)
    }

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
    onChangeTxSetting(param) {
      this.txIconsDispFormat = param.format
      this.txIconsHorizon = param.horizon
      this.txIconsVertical = param.vertical
    },
    onBeforeReload(){
      this.vueSelected.area = VueSelectHelper.getVueSelectData(this.areaOptions, null)
      this.vueSelected.zone = VueSelectHelper.getVueSelectData(this.getZoneClassOptions(), null)
      this.form.locationCd = StateHelper.createMasterCd('location', this.locations, this.location)
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
        visible: this.form.visible,
        txViewType: {
          displayFormat: this.txIconsDispFormat,
          horizon: this.txIconsHorizon,
          vertical: this.txIconsVertical
        },
        posId: this.form.posId,
        x: this.form.x,
        y: this.form.y,
      }

      entity.deviceIdList = this.exbs.filter(exb => exb.locationId == entity.locationId).map(exb => exb.deviceId)
      entity.locationZoneList = [this.form.zoneId].filter(val => val).map(zoneId => ({
        locationZonePK: {
          locationId: this.form.locationId? this.form.locationId: dummyKey--,
          zoneId: zoneId
        }
      }))
      return await AppServiceHelper.bulkSave(this.appServicePath, [entity])
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
