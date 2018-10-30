<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">

      <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">{{ message }}</b-alert>

      <b-form @submit="onSubmit" v-if="show">

        <b-form-group>
          <b-form-row>
            <b-col sm="1">
              <label v-t="'label.areaName'" class="control-label" />
            </b-col>
            <b-col sm="3">
              <b-form-select v-model="areaId" :options="areaNames" required />
            </b-col>
          </b-form-row>
        </b-form-group>

        <b-form-group>
          <b-form-row>
            <b-col sm="1" v-if="hasId">
              <label v-t="'label.zoneId'" class="control-label" />
            </b-col>
            <b-col sm="1" v-if="hasId">
              <b-form-input type="text" v-model="form.zoneId" readonly="readonly" />
            </b-col>
            <b-col sm="1">
              <label v-t="'label.zoneName'" class="control-label" />
            </b-col>
            <b-col sm="4">
              <b-form-input type="text" v-model="zoneName" maxlength="20" required :readonly="!isEditable" :disabled="!isEnableNameText" />
            </b-col>
            <b-col sm="1">
              <label v-t="'label.categoryName'" class="control-label" />
            </b-col>
            <b-col sm="3">
              <b-form-select v-model="categoryId" :options="categoryNames" :disabled="!isEnableNameText" />
            </b-col>
            <b-col sm="2">
              <b-button type="button" :variant="theme" v-t="'label.setting'" :disabled="!isEnableNameText" @click="onSetting" />
            </b-col>
          </b-form-row>
        </b-form-group>

        <b-form-group>
          <b-form-row>
            <b-col sm="1">
              <b-button type="button" variant="outline-danger" @click="backToList" v-t="'label.back'" :block="true" />
            </b-col>
            <b-col sm="1">
              <b-button v-if="isEditable" type="button" :variant="theme" @click="regist()" :block="true" >{{ label }}</b-button>
            </b-col>
          </b-form-row>
        </b-form-group>

      </b-form>
      <AreaCanvas :areaId="areaId" :isRegist="isRegist" :name="zoneName" :categoryId="categoryId" :isSetNameCategory="isSetNameCategory"
      @regist="doRegist"
      @selected="onSelected"
      @unselected="unSelected"
      @created="onCreated"
      @deleted="onDeleted"
      />
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
import editmixinVue from '../../../components/editmixin.vue'
import AreaCanvas from '../../../components/areacanvas.vue'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/breadcrumb.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import { CATEGORY, ZONE } from '../../../sub/constant/Constants'
import showmapmixin from '../../../components/showmapmixin.vue'
import { fabric } from 'fabric'

export default {
  mixins: [editmixinVue, showmapmixin],
  components: {
    breadcrumb,
    AreaCanvas,
  },
  data() {
    return {
      id: -1,
      backPath: '/master/zoneClass',
      appServicePath: '/core/zone',
      form: ViewHelper.extract(this.$store.state.app_service.zone, ["zoneId", "zoneName", "areaId", "locationZoneList.0.locationZonePK.locationId", "zoneCategoryList.0.zoneCategoryPK.categoryId"]),
      areaNames: [],
      areaId: null,
      locationNames: [],
      categoryNames: [],
      categoryId: null,
      canvas: null,
      isEnableNameText: false,
      zoneName: null,
      zones: [],
      isRegist: false,
      isSetNameCategory: false,
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.zoneBlock'),
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
      const area = this.$store.state.app_service.areas.find((a) => { return a.areaId === this.areaId })
      return area ? area.mapImage : ''
    },
    hasId (){
      return Util.hasValue(this.form.zoneId)
    },
    theme () {
      const theme = getButtonTheme(this.$store.state.loginId)
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
      this.areaId = this.areaNames[0].value
    },
    async initLocationNames() {
      await StateHelper.load('location')
      this.locationNames = this.locations.map((val) => ({text: val.locationName, value: val.locationId}))
    },
    async initCategoryNames() {
      let categories = await AppServiceHelper.fetchList(`/basic/category/type/${CATEGORY.getTypes()[2].value}`, 'categoryId')
      console.log(categories)
      this.categoryNames = categories.map((val) => ({text: val.categoryName, value: val.categoryId}))
      if (this.categoryNames.length < 1) {
        return
      }
      this.categoryId = this.categoryNames[0].value
    },
    onCreated(zoneData) {
      this.onSelected(zoneData)
    },
    onSelected (zoneData) {
      this.id = zoneData.id
      this.isEnableNameText = true
      this.zoneName = zoneData.name
      this.isSetNameCategory = false
    },
    unSelected() {
      this.isEnableNameText = false
      this.form.zoneName = ''
      this.isSetNameCategory = false
    },
    onDeleted (id) {
      this.zones = this.zones.filter((e) => {
        return e.id !== id
      })
      this.unSelected()
    },
    regist () {
      this.isRegist = true
    },
    onSetting () {
      this.isSetNameCategory = true
    },
    async doRegist (zones, deleted) {
      const path = this.appServicePath
      this.showInfo = false
      this.message = ''
      deleted.forEach((e) => {
        AppServiceHelper.deleteEntity(path, e)
      })
      const areaId = this.areaId
      const entities = zones.map((e) => {
        return {
          zoneId: e.id,
          zoneName: e.name,
          zoneType: ZONE.getTypes()[0].value,
          areaId: areaId,
          x: Math.floor(e.aCoords.tl.x),
          y: Math.floor(e.aCoords.tl.y),
          w: Math.floor(e.aCoords.br.x - e.aCoords.tl.x),
          h: Math.floor(e.aCoords.br.y - e.aCoords.tl.y),
          zoneCategoryList: [{
            zoneCategoryPK: {
              zoneId: e.id,
              categoryId: e.categoryId
            }
          }]
        }
      })
      const saveId = await AppServiceHelper.bulkSave(this.appServicePath, entities, 0)
      this.isRegist = false
      this.isSetNameCategory = false
      this.message = this.$i18n.t('message.updateCompleted', { target: this.$i18n.t('label.zone') })
      this.showInfo = true
      return saveId
    }
  }
}
</script>

<style scoped lang="scss">
  label.control-label {
    padding-top: 7px;
  }
</style>