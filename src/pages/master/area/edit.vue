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
              <b-form-file v-if="isEditable" ref="inputThumbnail" v-model="form.mapImageTemp" :placeholder="$t('message.selectFile') " accept="image/jpeg, image/png, image/gif" @change="readImage" />
              <b-button v-if="isEditable && form.mapImage" :variant="getButtonTheme()" type="button" class="float-right mt-3" @click="clearImage">
                {{ $i18n.tnl('label.clear') }}
              </b-button>
              <img v-show="form.mapImage" ref="mapImage" :src="form.mapImage" width="100" class="mt-1 ml-3">
            </b-form-group>

            <b-button v-t="'label.back'" type="button" variant="outline-danger" class="mr-2 my-1" @click="backToList" />
            <b-button v-if="isEditable" :variant="getButtonTheme()" type="submit" class="mr-2 my-1" @click="register(false)">
              {{ $i18n.tnl(`label.${isUpdate? 'update': 'register'}`) }}
            </b-button>
            <b-button v-if="isRegistable && !isUpdate" v-t="'label.registerAgain'" :variant="getButtonTheme()" type="submit" class="my-1" @click="register(true)" />
          </b-form>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
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
      maxFileNameByte: 32,
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.area'),
          href: '/master/area',
        },
        {
          text: this.$i18n.tnl(Util.getDetailCaptionKey(this.$store.state.app_service.area.areaId)),
          active: true
        }
      ]
    }
  },
  computed: {
    hasId(){
      return Util.hasValue(this.form.areaId)
    },
    ...mapState('app_service', [
      'area',
    ]),
  },
  methods: {
    setFileName(name){
      const file = Util.getValue(document.getElementsByClassName('custom-file-label'), '0', null)
      const param = file.textContent? 'textContent': 'innerText'
      file[param] = name? name: this.$refs.inputThumbnail.placeholder
    },
    readImage(e) {
      this.form.mapImage = this.form.mapImageTemp
      this.form.mapImageTemp = null
      this.$nextTick(() => {
        this.readImageView(e, 'mapImage', 'mapWidth', 'mapHeight', 'thumbnail', APP.AREA_THUMBNAIL_MAX)
        this.form.mapImageTemp = this.form.mapImage

        const inputFileName = Util.getValue(e, 'target.files.0.name', null)
        this.setFileName(inputFileName? Util.cutOnLongByte(inputFileName, this.maxFileNameByte): null)
        if(!inputFileName){
          this.clearImage(e)
        }
      })
    },
    clearImage(e) {
      this.$nextTick(() => {
        this.form.mapImageTemp = null
        this.form.mapImage = null
        this.form.thumbnail = null
        this.$refs.inputThumbnail.reset()
        this.setFileName()
      })
    },
    beforeSubmit(again){
      if(this.form.areaId != null){
        this.form.areaId = String(this.form.areaId)
      }
      this.register(again)
    },
  }
}
</script>

<style scoped lang="scss">

</style>