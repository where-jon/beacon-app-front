<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">
      <b-alert variant="info" dismissible :show="showInfo">
        {{ message }}
      </b-alert>
      <b-alert variant="danger" dismissible :show="showAlert" @dismissed="showAlert=false">
        <template v-if="Array.isArray(message)">
          <span v-for="line in message" :key="line">
            {{ line }} <br>
          </span>
        </template>
        <span v-else>
          {{ message }}
        </span>
      </b-alert>

      <b-form-group>
        <b-form-row>
          <b-form-row>
            <label v-t="'label.areaName'" class="control-label mr-2" />
            <b-form-select v-model="areaId" :options="areaNames" required />
          </b-form-row>
        </b-form-row>
      </b-form-group>

      <b-form v-if="show" inline @submit.prevent>
        <b-form-row>
          <b-form-row v-if="hasId" class="mr-4 mb-2">
            <label v-t="'label.zoneId'" class="control-label mr-2" />
            <b-form-input v-model="form.zoneId" type="text" readonly="readonly" />
          </b-form-row>
          <b-form-row class="mr-4 mb-2">
            <label v-t="'label.zoneName'" class="control-label mr-2" />
            <input v-model="zoneName" type="text" maxlength="20" class="form-control" required :readonly="!isEditable" :disabled="!isEnableNameText">
          </b-form-row>
          <b-form-row class="mr-4 mb-2">
            <label v-t="'label.categoryName'" class="control-label mr-2 mb-2" />
            <b-form-select v-model="categoryId" :options="categoryNames" class="mr-3 mb-2" :disabled="!isEnableNameText" />
            <b-button v-t="'label.setting'" type="button" :variant="theme" class="mb-2" :disabled="!isEnableNameText" @click="onSetting" />
          </b-form-row>
        </b-form-row>
      </b-form>

      <b-form v-if="show" @submit.prevent="onSubmit">
        <b-form-group>
          <b-form-row>
            <b-form-row>
              <b-button v-t="'label.back'" type="button" variant="outline-danger" @click="backToList" />
              <b-button v-if="isEditable" type="button" :variant="theme" class="ml-2" @click="regist()">
                {{ label }}
              </b-button>
            </b-form-row>
          </b-form-row>
        </b-form-group>
      </b-form>
      <AreaCanvas :area-id="areaId" :is-regist="isRegist" :name="zoneName" :category-id="categoryId" :is-set-name-category="isSetNameCategory"
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
import { mapState } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import editmixinVue from '../../../components/mixin/editmixin.vue'
import AreaCanvas from '../../../components/parts/areacanvas.vue'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import { CATEGORY, ZONE } from '../../../sub/constant/Constants'
import showmapmixin from '../../../components/mixin/showmapmixin.vue'

export default {
  components: {
    breadcrumb,
    AreaCanvas,
  },
  mixins: [editmixinVue, showmapmixin],
  data() {
    return {
      id: -1,
      backPath: '/master/zoneClass',
      appServicePath: '/core/zone',
      form: ViewHelper.extract(this.$store.state.app_service.zone, ['zoneId', 'zoneName', 'areaId', 'locationZoneList.0.locationZonePK.locationId', 'zoneCategoryList.0.zoneCategoryPK.categoryId']),
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
      const areaImage = this.$store.state.app_service.areaImages.find((a) => { return a.areaId === this.areaId })
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
      'zone', 'locations', 'areas', 'pageSendParam'
    ]),
  },
  methods: {
    reset () {
    },
    async initAreaNames() {
      await StateHelper.load('area')
      this.areaNames = this.areas.map((val) => ({text: val.areaName, value: val.areaId}))
      if(this.pageSendParam){
        this.areaId = this.pageSendParam.areaId
        this.replaceAS({pageSendParam: null})
      }
      else{
        this.areaId = this.areaNames[0].value
      }
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