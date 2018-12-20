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
            <b-form-group v-if="hasId">
              <label v-t="'label.areaId'" />
              <input v-model="form.areaId" type="text" class="form-control" readonly="readonly">
            </b-form-group>
            <b-form-group>
              <label v-t="'label.areaName'" />
              <input v-model="form.areaName" type="text" maxlength="20" class="form-control" required :readonly="!isEditable">
            </b-form-group>
            <b-form-group>
              <label v-t="'label.map'" />
              <b-form-file v-if="isEditable" ref="inputThumbnail" v-model="form.mapImage" accept="image/jpeg, image/png, image/gif" :placeholder="$t('message.selectFile') " @change="readImage" />
              <b-button v-if="isEditable && form.mapImage" type="button" :variant="getButtonTheme()" class="float-right mt-3" @click="clearImage">
                {{ $i18n.tnl('label.clear') }}
              </b-button>
              <img v-if="form.mapImage" ref="mapImage" :src="form.mapImage" width="100" class="mt-1 ml-3">
            </b-form-group>
            <b-button v-t="'label.back'" type="button" variant="outline-danger" class="mr-2 my-1" @click="backToList" />
            <b-button v-if="isEditable" type="submit" :variant="getButtonTheme()" class="mr-2 my-1" @click="beforeSubmit(false)">
              {{ label }}
            </b-button>
            <b-button v-if="isEditable && !isUpdate" v-t="'label.registerAgain'" type="submit" :variant="getButtonTheme()" class="my-1" @click="beforeSubmit(true)" />
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
import { APP } from '../../../sub/constant/config'
import { UPDATE_ONLY_NN } from '../../../sub/constant/Constants'

export default {
  components: {
    breadcrumb,
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
    readImage(e) {
      this.readImageView(e, 'mapImage', 'mapWidth', 'mapHeight', 'thumbnail', APP.AREA_THUMBNAIL_MAX)
    },
    clearImage(e) {
      this.form.mapImage = undefined
      this.form.thumbnail = undefined
      this.$refs.inputThumbnail.reset()
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