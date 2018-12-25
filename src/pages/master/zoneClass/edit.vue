<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">

      <b-alert variant="info" dismissible :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">
        <div v-html="message" />
      </b-alert>

      <b-form @submit.prevent="onSubmit" v-if="show">
        <b-form-group>
          <b-form-row v-if="hasId">
            <label v-t="'label.zoneId'" class="control-label" />
          </b-form-row>
          <b-form-row v-if="hasId">
            <b-col sm="2">
              <b-form-input type="text" v-model="form.zoneId" readonly="readonly" />
            </b-col>
          </b-form-row>
          <b-form-row>
            <label v-t="'label.zoneName'" class="control-label" />
          </b-form-row>
          <b-form-row>
            <b-col sm="5">
              <input type="text" v-model="form.zoneName" maxlength="20" class="form-control" required :readonly="!isEditable" :disabled="!isEnableNameText" />
            </b-col>
          </b-form-row>
        </b-form-group>

        <b-form-group>
          <b-form-row>
            <label v-t="'label.areaName'" class="control-label" />
          </b-form-row>
          <b-form-row>
            <b-col sm="5">
              <b-form-select v-model="form.areaId" :options="areaNames" required />
            </b-col>
          </b-form-row>
          <b-form-row>
            <label v-t="'label.categoryName'" class="control-label" />
          </b-form-row>
          <b-form-row>
            <b-col sm="5">
              <b-form-select v-model="form.categoryId" :options="categoryNames" />
            </b-col>
          </b-form-row>
        </b-form-group>

        <b-button type="button" variant="outline-danger" @click="backToList" class="mr-2 my-1" v-t="'label.back'"/>
        <b-button v-if="isEditable" type="submit" :variant="theme" @click="register(false)" class="mr-2 my-1" >{{ label }}</b-button>
        <b-button v-if="isEditable && !isUpdate" type="submit" :variant="theme" @click="register(true)" class="my-1" v-t="'label.registerAgain'"/>
      </b-form>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { Shape, Stage, Container, Bitmap, Text, Touch } from '@createjs/easeljs/dist/easeljs.module'
import * as StateHelper from '../../../sub/helper/StateHelper'
import _ from 'lodash'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import editmixinVue from '../../../components/mixin/editmixin.vue'
import AreaCanvas from '../../../components/parts/areacanvas.vue'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import { CATEGORY, ZONE } from '../../../sub/constant/Constants'
import showmapmixin from '../../../components/mixin/showmapmixin.vue'
import { fabric } from 'fabric'

export default {
  mixins: [editmixinVue, showmapmixin],
  components: {
    breadcrumb,
    AreaCanvas,
  },
  data() {
    return {
      name: 'zone',
      id: 'zoneId',
      backPath: '/master/zoneClass',
      appServicePath: '/core/zone',
      form: ViewHelper.extract(this.$store.state.app_service.zone, ["zoneId", "zoneName", "areaId", "locationZoneList.0.locationZonePK.locationId", "zoneCategoryList.0.zoneCategoryPK.categoryId"]),
      areaNames: [],
      locationNames: [],
      categoryNames: [],
      canvas: null,
      isEnableNameText: true,
      zones: [],
      isRegist: false,
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.zoneClass'),
          href: '/master/zoneClass',
        },
        {
          text: this.$i18n.tnl(Util.getDetailCaptionKey(this.$store.state.app_service.zone.zoneId)),
          active: true
        }
      ]
    }
  },
  created() {
    this.initAreaNames()
    this.initLocationNames()
    this.initCategoryNames()
  },
  mounted() {
  },
  computed: {
    base64 () {
      const areaImage = this.$store.state.app_service.areaImages.find((a) => { return a.areaId === this.form.areaId })
      return areaImage ? areaImage.mapImage : ''
    },
    hasId (){
      return Util.hasValue(this.form.zoneId)
    },
    theme () {
      const theme = getButtonTheme()
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'zone', 'locations', 'areas'
    ]),
  },
  methods: {
    reset () {
    },
    async initAreaNames() {
      await StateHelper.load('area')
      this.areaNames = this.areas.map((val) => ({text: val.areaName, value: val.areaId}))
      console.log(this.areaNames )
    },
    async initLocationNames() {
      await StateHelper.load('location')
      this.locationNames = this.locations.map((val) => ({text: val.locationName, value: val.locationId}))
    },
    async initCategoryNames() {
      let categories = await AppServiceHelper.fetchList(`/basic/category/type/${CATEGORY.getTypes()[2].value}`, 'categoryId')
      this.categoryNames = categories.map((val) => ({text: val.categoryName, value: val.categoryId}))
      this.categoryNames.unshift({value:null, text:''})
    },
    async save() {
      const zoneId = Util.hasValue(this.form.zoneId)? this.form.zoneId: -1
      let entity = {
        zoneId: zoneId,
        zoneName: this.form.zoneName,
        zoneType: ZONE.getTypes()[1].value,
        areaId: this.form.areaId,
        locationZoneList: this.form.locationId? [{locationZonePK: {zoneId: zoneId, locationId: this.form.locationId}}]: null,
        zoneCategoryList: this.form.categoryId? [{zoneCategoryPK: {zoneId: zoneId, categoryId: this.form.categoryId}}]: null
      }
      return await AppServiceHelper.bulkSave(this.appServicePath, [entity])
    },
  }
}
</script>

<style scoped lang="scss">
  label.control-label {
    padding-top: 7px;
  }
</style>