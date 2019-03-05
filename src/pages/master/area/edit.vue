<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-row>
        <b-col md="8" offset-md="2">
          <b-form v-if="show" @submit.prevent="onSubmit">
            <b-form-group v-if="hasId">
              <label v-t="'label.areaId'" />
              <input v-model="form.areaId" type="text" class="form-control" readonly="readonly">
            </b-form-group>
            <b-form-group>
              <label v-t="'label.areaName'" />
              <input v-model="form.areaName" :readonly="!isEditable" type="text" maxlength="20" class="form-control" required>
            </b-form-group>
            <b-form-group>
              <label v-t="'label.map'" />
              <b-form-file v-if="isEditable" ref="inputThumbnail" v-model="form.mapImage" :placeholder="$t('message.selectFile') " accept="image/jpeg, image/png, image/gif" @change="readImage" />
              <b-button v-if="isEditable && form.mapImage" :variant="getButtonTheme()" type="button" class="float-right mt-3" @click="clearImage">
                {{ $i18n.tnl('label.clear') }}
              </b-button>
              <img v-if="form.mapImage" ref="mapImage" :src="form.mapImage" width="100" class="mt-1 ml-3">
            </b-form-group>
            <b-form-group v-if="isEditable && hasId && mapUpdate">
              <label v-t="'label.mapConfig'" />
              <b-form-select v-model="form.mapConfig" :options="mapConfigTypes" required />
            </b-form-group>

            <b-button v-t="'label.back'" type="button" variant="outline-danger" class="mr-2 my-1" @click="backToList" />
            <b-button v-if="isEditable" :variant="getButtonTheme()" type="submit" class="mr-2 my-1" @click="beforeSubmit(false)">
              {{ $i18n.tnl(`label.${isUpdate? 'update': 'register'}`) }}
            </b-button>
            <b-button v-if="isRegistable && !isUpdate" v-t="'label.registerAgain'" :variant="getButtonTheme()" type="submit" class="my-1" @click="beforeSubmit(true)" />
          </b-form>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as Util from '../../../sub/util/Util'
import commonmixinVue from '../../../components/mixin/commonmixin.vue'
import editmixinVue from '../../../components/mixin/editmixin.vue'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import alert from '../../../components/parts/alert.vue'
import { APP } from '../../../sub/constant/config'
import { UPDATE_ONLY_NN } from '../../../sub/constant/Constants'

export default {
  components: {
    breadcrumb,
    alert,
  },
  mixins: [editmixinVue, commonmixinVue],
  data() {
    return {
      name: 'area',
      id: 'areaId',
      backPath: '/master/area',
      appServicePath: '/core/area',
      updateOnlyNN: UPDATE_ONLY_NN.NULL,
      form: ViewHelper.extract(this.$store.state.app_service.area, ['areaId', 'areaName', 'mapImage']),
      items: ViewHelper.createBreadCrumbItems('master', {text: 'area', href: '/master/area'}, Util.getDetailCaptionKey(this.$store.state.app_service.area.areaId)),
      mapUpdate: false,
      oldMap: null,
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
    }
  },
  mounted() {
    this.form.mapConfig = this.mapConfigTypes[0].value
    this.oldMap = this.hasId && this.form.mapImage? {width: this.$refs.mapImage.naturalWidth, height: this.$refs.mapImage.naturalHeight}: null
  },
  methods: {
    readImage(e) {
      this.readImageView(e, 'mapImage', 'mapWidth', 'mapHeight', 'thumbnail', APP.AREA_THUMBNAIL_MAX)
      if(this.oldMap){
        this.mapUpdate = true
      }
    },
    clearImage(e) {
      this.form.mapImage = undefined
      this.form.thumbnail = undefined
      this.$refs.inputThumbnail.reset()
      if(this.hasId && this.oldMap){
        this.form.scaleX = '0'
        this.form.scaleY = '0'
      }
    },
    async afterCrud(again){
      await StateHelper.load('tx', true)
      await StateHelper.load('exb', true)
    },
    beforeSubmit(again){
      if(this.mapUpdate){
        const mapConfigs = this.mapConfigTypes
        this.form.scaleX = `${this.form.mapConfig == mapConfigs[0].value? 1:
          this.form.mapConfig == mapConfigs[1].value? Math.round(this.$refs.mapImage.naturalWidth * 100 / this.oldMap.width) / 100: 0}`
        this.form.scaleY = `${this.form.mapConfig == mapConfigs[0].value? 1:
          this.form.mapConfig == mapConfigs[1].value? Math.round(this.$refs.mapImage.naturalHeight * 100 / this.oldMap.height) / 100: 0}`
      }
      this.register(again)
    },
  }
}
</script>

<style scoped lang="scss">

</style>