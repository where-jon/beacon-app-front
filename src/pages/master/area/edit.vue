<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-row>
        <b-col md="8" offset-md="2">
          <b-form v-if="show" @submit.prevent="doSubmit">
            <b-form-group>
              <label v-t="'label.areaName'" />
              <input v-model="form.areaName" :readonly="!isEditable" type="text" maxlength="20" class="form-control" required>
            </b-form-group>
            <b-form-group>
              <label v-t="'label.areaCd'" />
              <input v-model="form.areaCd" :readonly="!isEditable" type="text" maxlength="16" class="form-control" :pattern="cdPattern" required>
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
              <b-form-select v-model="form.mapConfig" :options="mapConfigTypes" required />
            </b-form-group>

            <b-button v-t="'label.back'" type="button" variant="outline-danger" class="mr-2 my-1" @click="backToList" />
            <b-button v-if="isEditable" :variant="theme" type="submit" class="mr-2 my-1" @click="beforeSubmit(false)">
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
import * as ImageHelper from '../../../sub/helper/ImageHelper'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as ValidateHelper from '../../../sub/helper/ValidateHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
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
      items: ViewHelper.createBreadCrumbItems('master', {text: 'area', href: '/master/area'}, ViewHelper.getDetailCaptionKey(this.$store.state.app_service.area.areaId)),
      form: Util.extract(this.$store.state.app_service.area, ['areaId', 'areaCd', 'areaName', 'mapImage']),
      updateOnlyNN: UPDATE_ONLY_NN.NULL,
      mapUpdate: false,
      oldMap: null,
      cdPattern: PATTERN.MASTER_CD,
    }
  },
  computed: {
    hasId(){
      return Util.hasValue(this.form.areaId)
    },
    ...mapState('app_service', [
      'areas',
      'area',
    ]),
    mapConfigTypes(){
      return [
        {text: this.$i18n.tnl('label.keepPosition'), value: 1},
        {text: this.$i18n.tnl('label.adjustPosition'), value: 2},
        {text: this.$i18n.tnl('label.initPosition'), value: 3},
      ]
    }
  },
  mounted() {
    this.form.mapConfig = this.mapConfigTypes[0].value
    this.oldMap = this.hasId && this.form.mapImage? {width: this.$refs.mapImage.naturalWidth, height: this.$refs.mapImage.naturalHeight}: null
    ValidateHelper.setCustomValidationMessage()
    this.oldMap = this.hasId && this.form.mapImage? {width: this.$refs.mapImage.naturalWidth, height: this.$refs.mapImage.naturalHeight}: null
    if(!Util.hasValue(this.form.areaCd)){
      this.form.areaCd = StateHelper.createMasterCd('area', this.areas, this.area)
    }
  },
  methods: {
    getNameByteLangth(){
      const fileElement = Util.getValue(document.getElementsByClassName('custom-file'), '0', null)
      return fileElement? (fileElement.clientWidth - 80) / 12: 0
    },
    setFileName(name){
      const file = Util.getValue(document.getElementsByClassName('custom-file-label'), '0', null)
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
        const inputFileName = Util.getValue(e, 'target.files.0.name', null)
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
      this.form.areaCd = StateHelper.createMasterCd('area', this.areas, this.area)
    },
    onSaved(){
      StateHelper.setForceFetch('tx', true)
      StateHelper.setForceFetch('exb', true)
      StateHelper.setForceFetch('zone', true)
    },
    beforeSubmit(again){
      if(this.mapUpdate){
        const mapConfigs = this.mapConfigTypes
        this.form.scaleX = `${this.form.mapConfig == mapConfigs[0].value? 1:
          this.form.mapConfig == mapConfigs[1].value? Math.round(this.$refs.mapImage.naturalWidth * 100 / this.oldMap.width) / 100: 0}`
        this.form.scaleY = `${this.form.mapConfig == mapConfigs[0].value? 1:
          this.form.mapConfig == mapConfigs[1].value? Math.round(this.$refs.mapImage.naturalHeight * 100 / this.oldMap.height) / 100: 0}`
      }
      this.doBeforeSubmit(again)
    },
    doSubmit(evt) {
      if (this.form.thumbnail) {
        this.replaceAS({updatedAreaThumbnail: this.form.areaId})
      }
      this.save(evt)
    },
  }
}
</script>

<style scoped lang="scss">

</style>