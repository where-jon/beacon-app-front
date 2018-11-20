<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">
      <b-alert variant="info" dismissible :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">
        <div v-html="message" />
      </b-alert>

      <b-row>
        <b-col md="8" offset-md="2">
          <b-form @submit="onSubmit" v-if="show">
            <b-form-group v-if="hasId">
              <label v-t="'label.areaId'" />
              <b-form-input type="text" v-model="form.areaId" readonly="readonly" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.areaName'" />
              <b-form-input type="text" v-model="form.areaName" maxlength="20" required :readonly="!isEditable" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.map'" />
              <b-form-file v-if="isEditable" @change="readImage" v-model="form.mapImage" ref="inputThumbnail" accept="image/jpeg, image/png, image/gif" :placeholder="$t('message.selectFile') "></b-form-file>
              <b-button v-if="isEditable && form.mapImage" type="button" :variant="getButtonTheme()" @click="clearImage" class="float-right mt-3">{{ $i18n.tnl('label.clear') }}</b-button>
              <img v-if="form.mapImage" ref="mapImage" :src="form.mapImage" width="100" class="mt-1 ml-3" />
            </b-form-group>
            <b-button type="button" variant="outline-danger" @click="backToList" v-t="'label.back'" />
            <b-button v-if="isEditable" type="submit" :variant="getButtonTheme()" @click="beforeSubmit(false)" class="ml-2">{{ label }}</b-button>
            <b-button v-if="isEditable && !isUpdate" type="submit" :variant="getButtonTheme()" @click="beforeSubmit(true)" class="ml-2" v-t="'label.registerAgain'"/>
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
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as Util from '../../../sub/util/Util'
import commonmixinVue from '../../../components/mixin/commonmixin.vue'
import editmixinVue from '../../../components/mixin/editmixin.vue'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import { APP } from '../../../sub/constant/config'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import { UPDATE_ONLY_NN } from '../../../sub/constant/Constants'

export default {
  components: {
    breadcrumb,
  },
  mixins: [editmixinVue],
  mixins: [editmixinVue, commonmixinVue ],
  data() {
    return {
      name: 'area',
      id: 'areaId',
      backPath: '/master/area',
      appServicePath: '/core/area',
      updateOnlyNN: UPDATE_ONLY_NN.NULL,
      form: ViewHelper.extract(this.$store.state.app_service.area, ["areaId", "areaName", "mapImage"]),
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
          text: this.$i18n.tnl('label.area') + this.$i18n.tnl('label.detail'),
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