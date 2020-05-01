<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" />
    <div class="container">
      <alert :message="message" />

      <b-row>
        <b-col md="8" offset-md="2">
          <b-form v-if="show" @submit.prevent="doSubmit">
            <b-form-group>
              <label v-t="'label.id'" />
              <input v-model="form.areaCd" :readonly="!isEditable" type="text" maxlength="16" class="form-control" :pattern="cdPattern" required>
            </b-form-group>
            <b-form-group>
              <label v-t="'label.areaName'" />
              <input v-model="form.areaName" :readonly="!isEditable" type="text" maxlength="20" class="form-control" required>
            </b-form-group>
            <b-form-group>
              <label v-t="'label.map'" />
              <b-form-file v-if="isEditable" ref="inputThumbnail" v-model="form.mapImageTemp" :placeholder="$t('message.selectFile') " accept="image/jpeg, image/png, image/gif" @change="readImage" />
              <b-button v-if="isEditable && form.mapImage" :variant="theme" type="button" class="float-right mt-3" @click="clearImage">
                {{ $i18n.tnl('label.clear') }}
              </b-button>
              <img v-show="form.mapImage" ref="mapImage" :src="form.mapImage" width="100" class="mt-1 ml-3">
            </b-form-group>
            <b-form-group v-if="isEditable && hasId && mapUpdate && form.mapImage">
              <label v-t="'label.mapConfig'" />
              <b-form-select v-model="form.mapConfig" :options="mapConfigTypes" @change="checkAlert" required />
            </b-form-group>
            <b-form-group v-if="isEditable && hasId && mapUpdate && form.mapImage">
              <label v-t="'label.zoneConfig'" />
              <b-form-select v-model="form.zoneConfig" :options="zoneConfigTypes" @change="checkAlert" required />
            </b-form-group>

            <b-button v-t="'label.back'" type="button" variant="outline-danger" class="mr-2 my-1" @click="backToList" />
            <b-button v-if="isEditable" :variant="theme" :disabled="disabled" type="submit" class="mr-2 my-1" @click="beforeSubmit(false)">
              {{ $i18n.tnl(`label.${isUpdate? 'update': 'register'}`) }}
            </b-button>
            <b-button v-if="isRegistable && !isUpdate" v-t="'label.registerAgain'" :variant="theme" type="submit" class="my-1" @click="beforeSubmit(true)" />
          </b-form>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import { UPDATE_ONLY_NN, PATTERN } from '../../../sub/constant/Constants'
import * as StringUtil from '../../../sub/util/StringUtil'
import * as Util from '../../../sub/util/Util'
import * as ImageHelper from '../../../sub/helper/base/ImageHelper'
import * as MasterHelper from '../../../sub/helper/domain/MasterHelper'
import * as ValidateHelper from '../../../sub/helper/dataproc/ValidateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import * as AppServiceHelper from '../../../sub/helper/dataproc/AppServiceHelper'
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
      name: 'area',
      id: 'areaId',
      backPath: '/master/area',
      appServicePath: '/core/area',
      breadCrumbs: ViewHelper.createBreadCrumbItems('master', {text: 'area', href: '/master/area'}, ViewHelper.getDetailCaptionKey(this.$store.state.app_service.area.areaId)),
      form: Util.extract(this.$store.state.app_service.area, ['areaId', 'areaCd', 'areaName', 'mapImage']),
      updateOnlyNN: UPDATE_ONLY_NN.NULL,
      mapUpdate: false,
      oldMap: null,
      cdPattern: PATTERN.MASTER_CD,
      posError: false,
      uploadError: false,
      disabled: false,
      selectedType: 1,
    }
  },
  computed: {
    hasId(){
      return Util.hasValue(this.form.areaId)
    },
    ...mapState('app_service', [
      'area',
    ]),
    mapConfigTypes(){
      return [
        {text: this.$i18n.tnl('label.keepPosition'), value: 1},
        {text: this.$i18n.tnl('label.adjustPosition'), value: 2},
        {text: this.$i18n.tnl('label.initPosition'), value: 3},
      ]
    },
    zoneConfigTypes(){
      return [
        {text: this.$i18n.tnl('label.zoneKeepPosition'), value: 1},
        {text: this.$i18n.tnl('label.zoneAdjustPosition'), value: 2},
      ]
    }
  },
  async created() {
  },
  mounted() {
    this.form.mapConfig = this.mapConfigTypes[0].value
    this.form.zoneConfig = this.zoneConfigTypes[0].value
    this.oldMap = this.hasId && this.form.mapImage? {width: this.$refs.mapImage.naturalWidth, height: this.$refs.mapImage.naturalHeight}: null
    ValidateHelper.setCustomValidationMessage()
    this.oldMap = this.hasId && this.form.mapImage? {width: this.$refs.mapImage.naturalWidth, height: this.$refs.mapImage.naturalHeight}: null
    if(!Util.hasValue(this.form.areaCd)){
      this.form.areaCd = MasterHelper.createMasterCd('area', this.areas, this.area)
    }
  },
  methods: {
    getNameByteLangth(){
      const fileElement = Util.getValue(document.getElementsByClassName('custom-file'), '0')
      return fileElement? (fileElement.clientWidth - 80) / 12: 0
    },
    setFileName(name){
      const file = Util.getValue(document.getElementsByClassName('custom-file-label'), '0')
      const param = file.textContent? 'textContent': 'innerText'
      file[param] = name? name: this.$refs.inputThumbnail.placeholder
    },
    readImage(e) {
      this.form.mapImage = this.form.mapImageTemp
      this.form.mapImageTemp = null
      this.$nextTick(() => {
        ImageHelper.readImageView(this, e, 'mapImage', 'mapWidth', 'mapHeight', 'thumbnail', APP.AREA_THUMBNAIL_MAX)
        this.form.mapImageTemp = this.form.mapImage

        if(this.oldMap){
          this.mapUpdate = true
        }
        const inputFileName = Util.getValue(e, 'target.files.0.name')
        this.setFileName(inputFileName? StringUtil.cutOnLongByte(inputFileName, this.getNameByteLangth()): null)
        if(!inputFileName){
          this.clearImage(e)
        }
      })
      if(this.oldMap){
        this.mapUpdate = true
      }
    },
    clearImage(e) {
      this.$nextTick(() => {
        this.form.mapImageTemp = null
        this.form.mapImage = null
        this.form.thumbnail = null
        this.$refs.inputThumbnail.reset()
        if(this.hasId && this.oldMap){
          this.form.scaleX = '0'
          this.form.scaleY = '0'
        }
        this.setFileName()
        if(this.hasId && this.oldMap){
          this.form.scaleX = '0'
          this.form.scaleY = '0'
        }
      })
    },
    onBeforeReload(){
    },
    async onSaved(){
      this.$set(this.form, 'areaCd', MasterHelper.createMasterCd('area', this.areas, this.area))
      this.$store.commit('main/replaceMain', {selectedAreaId: null})
    },
    async onSaving() {
      const entity = {
        updateKey: this.form.areaId || null,
        ID: this.form.areaCd,
      }
      Object.keys(this.form).forEach(key => {
        entity[key] = this.form[key]
      })
      return await AppServiceHelper.bulkSaveByCsvStr(this.appServicePath, [entity])
    },
    beforeSubmit(again){
      if(this.mapUpdate){
        const mapConfigs = this.mapConfigTypes
        const zoneConfigs = this.zoneConfigTypes
        this.form.scaleX = `${this.form.mapConfig == mapConfigs[0].value? 1:
          this.form.mapConfig == mapConfigs[1].value? Math.round(this.$refs.mapImage.naturalWidth * 100 / this.oldMap.width) / 100: 0}`
        this.form.scaleY = `${this.form.mapConfig == mapConfigs[0].value? 1:
          this.form.mapConfig == mapConfigs[1].value? Math.round(this.$refs.mapImage.naturalHeight * 100 / this.oldMap.height) / 100: 0}`
        this.form.zoneScaleX = `${this.form.zoneConfig == zoneConfigs[0].value? 1:
          this.form.zoneConfig == zoneConfigs[1].value? Math.round(this.$refs.mapImage.naturalWidth * 100 / this.oldMap.width) / 100: 0}`
        this.form.zoneScaleY = `${this.form.zoneConfig == zoneConfigs[0].value? 1:
          this.form.zoneConfig == zoneConfigs[1].value? Math.round(this.$refs.mapImage.naturalHeight * 100 / this.oldMap.height) / 100: 0}`
      }
      this.doBeforeSubmit(again)
    },
    doSubmit(evt) {
      if (this.form.thumbnail) {
        this.replaceAS({updatedAreaThumbnail: this.form.areaId})
      }
      this.save(evt)
    },
    checkSize(width, height){
      const areaId = this.area.areaId
      const exbError = _.some(this.exbs, exb => {
        return areaId == exb.areaId && (exb.x >= width || exb.y >= height)
      })
      const txError = _.some(this.txs, tx => {
        const location = tx.location
        return location && location.areaId && location.x && location.y && location.areaId == areaId && (location.x >= width || location.y >= height)
      })
      const zoneErrors = _.filter(this.zones, zone => {
        return zone.areaId && zone.x && zone.y && zone.areaId == areaId && ((zone.x + zone.w) >= width || (zone.y + zone.h) >= height)
      })
      const zoneSizeErrors = _.filter(this.zones, zone => {
        return zone.areaId && zone.x && zone.y && zone.areaId == areaId && (zone.w > width || zone.h > height)
      })

      this.posError = exbError || txError || Util.hasValue(zoneErrors) || Util.hasValue(zoneSizeErrors)
      this.uploadError = false

      if(this.selectedType != 1){
        this.replace({showAlert: false})
        this.disabled = false
        return
      }
      if(exbError){
        this.message = this.$i18n.tnl('message.outExb')
        this.replace({showAlert: true})
        this.disabled = true
        return
      }
      if(txError){
        this.message = this.$i18n.tnl('message.outTx')
        this.replace({showAlert: true})
        this.disabled = true
        return
      }
      if(Util.hasValue(zoneErrors)){
        this.message = this.$i18n.tnl('message.outZone', {zone : zoneErrors.map(z => z.zoneName).join(',')})
        this.replace({showAlert: true})
        this.disabled = true
        return
      }
      if(Util.hasValue(zoneSizeErrors)){
        this.message = this.$i18n.tnl('message.overSizeZone', {zone : zoneSizeErrors.map(z => z.zoneName).join(',')})
        this.replace({showAlert: true})
        this.disabled = true
        return
      }
      this.replace({showAlert: false})
      this.disabled = false
    },
    onUploadError(){
      this.uploadError = true
      this.disabled = true
    },
    checkAlert(value){
      this.selectedType = value
      if(this.uploadError){
        this.disabled = true
      }else if(value==1 && this.posError){
        this.replace({showAlert: true})
        this.disabled = true
      }else{
        this.replace({showAlert: false})
        this.disabled = false
      }
    }
  }
}
</script>

<style scoped lang="scss">

</style>