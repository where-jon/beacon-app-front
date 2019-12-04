<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-form v-if="show" @submit.prevent="save">
        <b-form-group>
          <b-form-row>
            <label v-t="'label.id'" />
          </b-form-row>
          <b-form-row>
            <b-col sm="5">
              <input v-model="form.zoneCd" :readonly="!isEditable" type="text" maxlength="20" class="form-control" :pattern="cdPattern" required>
            </b-col>
          </b-form-row>
        </b-form-group>
        <b-form-group v-show="zoneTypeOptions.length > 1">
          <label v-t="'label.zoneType'" />
          <b-form-radio-group v-model="form.zoneType" :options="zoneTypeOptions" :disabled="!isEditable || hasId" :required="zoneTypeOptions.length > 1" />
        </b-form-group>
        <b-form-group>
          <b-form-row>
            <label v-t="'label.zoneName'" class="control-label" />
          </b-form-row>
          <b-form-row>
            <b-col sm="5">
              <input v-model="form.zoneName" :readonly="!isEditable" :disabled="!isEnableNameText" type="text" maxlength="20" class="form-control" required>
            </b-col>
          </b-form-row>
        </b-form-group>

        <b-form-group>
          <b-form-row>
            <label v-t="'label.areaName'" class="control-label" />
          </b-form-row>
          <b-form-row>
            <b-col sm="5">
              <v-select v-model="vueSelected.area" :options="areaNames" :disabled="!isEditable" :clearable="false" class="vue-options-lg">
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </b-col>
          </b-form-row>
          <b-form-row>
            <label v-t="'label.categoryName'" class="control-label" />
          </b-form-row>
          <b-form-row>
            <b-col sm="5">
              <v-select v-model="vueSelected.category" :options="categoryNames" :disabled="!isEditable" class="vue-options-lg">
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </b-col>
          </b-form-row>
        </b-form-group>

        <b-button v-t="'label.back'" type="button" variant="outline-danger" class="mr-2 my-1" @click="backToList" />
        <b-button v-if="isEditable" :variant="theme" type="submit" class="mr-2 my-1" @click="doBeforeSubmit(false)">
          {{ $i18n.tnl(`label.${isUpdate? 'update': 'register'}`) }}
        </b-button>
        <b-button v-if="isRegistable && !isUpdate" v-t="'label.registerAgain'" :variant="theme" type="submit" class="my-1" @click="doBeforeSubmit(true)" />
      </b-form>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import { CATEGORY, ZONE, SYSTEM_ZONE_CATEGORY_NAME, PATTERN } from '../../../sub/constant/Constants'
import * as StringUtil from '../../../sub/util/StringUtil'
import * as Util from '../../../sub/util/Util'
import * as AppServiceHelper from '../../../sub/helper/dataproc/AppServiceHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as ValidateHelper from '../../../sub/helper/dataproc/ValidateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import * as VueSelectHelper from '../../../sub/helper/ui/VueSelectHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import editmixin from '../../../components/mixin/editmixin.vue'
import alert from '../../../components/parts/alert.vue'

export default {
  props: {
    pName: {
      type: String,
      default: 'class',
    },
    pPath: {
      type: String,
      default: '/master/zoneClass',
    },
    pAppServicePath: {
      type: String,
      default: '/core/zone/edit',
    },
    pTypeList: {
      type: Array,
      default: () => APP.ZONE.TYPES,
    },
    pPattern: {
      type: String,
      default: PATTERN.MASTER_CD,
    },
  },
  components: {
    breadcrumb,
    alert,
  },
  mixins: [commonmixin, editmixin],
  data() {
    return {
      name: 'zone',
      id: 'zoneId',
      form: Util.extract(this.$store.state.app_service.zone, ['zoneId', 'zoneCd', 'zoneType', 'zoneName', 'areaId', 'locationZoneList.0.locationZonePK.locationId', 'zoneCategoryList']),
      vueSelected: {
        area: null,
        category: null,
      },
      areaNames: [],
      categoryNames: [],
      cdPattern: this.pPattern,
      isEnableNameText: true,
      isRegist: false,
    }
  },
  computed: {
    hasId(){
      return Util.hasValue(this.form.zoneId)
    },
    backPath() {
      return this.pPath
    },
    items() {
      return ViewHelper.createBreadCrumbItems('master', {text: StringUtil.concatCamel('zone', this.pName), href: this.backPath}, ViewHelper.getDetailCaptionKey(this.$store.state.app_service.zone.zoneId))
    },
    zoneTypeOptions() {
      return ZONE.getOptions().filter(option => this.pTypeList.includes(option.value))
    },
    defValue() {
      return { 'zoneType': Util.getValue(this.zoneTypeOptions, '0.value', ZONE.NON_COORDINATE) }
    },
    ...mapState('app_service', [
      'zone',
    ]),
  },
  watch: {
    'vueSelected.area': {
      handler: function(newVal, oldVal){
        this.form.areaId = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
    'vueSelected.category': {
      handler: function(newVal, oldVal){
        this.form.categoryId = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
  },
  async created() {
    await Promise.all(['area', 'category'].map(state => StateHelper.load(state)))
    await this.initAreaNames()
    await this.initCategoryNames()
    this.initForm()
    this.vueSelected.area = VueSelectHelper.getVueSelectData(this.areaNames, this.form.areaId, !Util.hasValue(this.form.areaId))
    this.vueSelected.category = VueSelectHelper.getVueSelectData(this.categoryNames, this.form.categoryId)
  },
  mounted(){
    ValidateHelper.setCustomValidationMessage()
    VueSelectHelper.disabledAllSubmit()
    if(!Util.hasValue(this.form.zoneCd)){
      this.form.zoneCd = StateHelper.createMasterCd('zone', this.zones, this.zone)
    }
  },
  methods: {
    reset () {
    },
    initForm() {
      if(this.form.zoneType == null){
        this.form.zoneType = this.defValue.zoneType
      }
      const categoryMap = {}
      this.categories.forEach(category => categoryMap[category.categoryId] = category.categoryType)

      const zoneCategoryList = Util.getValue(this.form, 'zoneCategoryList', [])
      const zoneCategory = zoneCategoryList.find(zoneCategory => categoryMap[zoneCategory.zoneCategoryPK.categoryId] == CATEGORY.ZONE)
      this.form.categoryId = zoneCategory? zoneCategory.zoneCategoryPK.categoryId: null
      this.form.zoneCategoryList = zoneCategoryList.filter(zoneCategory => categoryMap[zoneCategory.zoneCategoryPK.categoryId] != CATEGORY.ZONE)
    },
    initAreaNames() {
      this.areaNames = StateHelper.getOptionsFromState('area', false, true)
    },
    initCategoryNames() {
      this.categoryNames = StateHelper.getOptionsFromState('category',
        category => StateHelper.getDispCategoryName(category),
        true, 
        category => !CATEGORY.POT_AVAILABLE.includes(category.categoryType) && category.categoryType != CATEGORY.AUTH && category.categoryName != SYSTEM_ZONE_CATEGORY_NAME.ABSENT_DISPLAY
      )
    },
    onSaved(){
      StateHelper.setForceFetch('tx', true)
      StateHelper.setForceFetch('exb', true)
      StateHelper.setForceFetch('category', true)
    },
    async onBeforeReload(){
      this.vueSelected.area = VueSelectHelper.getVueSelectData(this.areaNames, null, true)
      this.vueSelected.category = VueSelectHelper.getVueSelectData(this.categoryNames, null)
      this.form.zoneCd = StateHelper.createMasterCd('zone', this.zones, this.zone)
    },
    async onSaving() {
      const zoneId = Util.hasValue(this.form.zoneId)? this.form.zoneId: -1
      const entity = {
        zoneId: zoneId,
        zoneCd: this.form.zoneCd,
        zoneName: this.form.zoneName,
        zoneType: this.form.zoneType,
        areaId: this.form.areaId,
        locationZoneList: this.form.locationId? [{locationZonePK: {zoneId: zoneId, locationId: this.form.locationId}}]: null,
        zoneCategoryList: this.form.zoneCategoryList
      }
      if(this.form.categoryId) {
        entity.zoneCategoryList.push({ zoneCategoryPK: {zoneId: zoneId, categoryId: this.form.categoryId} })
      }
      return await AppServiceHelper.bulkSave(this.pAppServicePath, [entity])
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../../sub/constant/label.scss";
@import "../../../sub/constant/vue.scss";
</style>