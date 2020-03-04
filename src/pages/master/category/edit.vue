<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-form v-if="show" @submit.prevent="save">
        <b-form-group>
          <label v-t="'label.id'" />
          <input v-model="form.categoryCd" :readonly="!isEditable" type="text" maxlength="20" class="form-control">
        </b-form-group>
        <b-form-group>
          <label v-t="'label.' + categoryNameByType" />
          <input v-model="form.categoryName" :readonly="!isEditable" type="text" maxlength="40" class="form-control" required>
        </b-form-group>
        <b-form-group v-if="!pName && pTypeList.length > 1">
          <label v-t="'label.categoryType'" />
          <b-form-select v-model="form.categoryType" :options="categoryTypes" :disabled="!isEditable" :readonly="!isEditable" required />
        </b-form-group>

        <extform :is-editable="isEditable" :form="form" :p-ext-value="extValue" />

        <b-form-group v-if="!selectZone && pShowIcon">
          <label v-t="'label.shape'" />
          <b-form-select v-model="form.displayShape" :options="shapes" :disabled="!isEditable" :readonly="!isEditable" required />
        </b-form-group>
        <span v-if="!selectZone && pShowIcon">
          <color-picker :caption="'label.textColor'" :name="'displayColor'" />
          <color-picker :caption="'label.bgColor'" :name="'displayBgColor'" />
        </span>
        <b-form-group v-if="pShowAuth">
          <label v-t="'label.zoneGuard'" />
          <v-select v-model="vueSelected.zoneGuards" :options="getZoneGuardOptions()" :disabled="!isEditable" multiple :close-on-select="false" class="vue-options-multi">
            <template slot="no-options">
              {{ vueSelectNoMatchingOptions }}
            </template>
          </v-select>
        </b-form-group>
        <b-form-group v-if="pShowAuth">
          <label v-t="'label.zoneDoor'" />
          <v-select v-model="vueSelected.zoneDoors" :options="getZoneDoorOptions()" :disabled="!isEditable" multiple :close-on-select="false" class="vue-options-multi">
            <template slot="no-options">
              {{ vueSelectNoMatchingOptions }}
            </template>
          </v-select>
        </b-form-group>
        <b-form-group v-if="pShowDescription">
          <label v-t="'label.description'" />
          <b-form-textarea v-model="form.description" :rows="3" :max-rows="6" :readonly="!isEditable" maxlength="1000" />
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
import { CATEGORY, SHAPE, ZONE } from '../../../sub/constant/Constants'
import * as ColorUtil from '../../../sub/util/ColorUtil'
import * as StringUtil from '../../../sub/util/StringUtil'
import * as Util from '../../../sub/util/Util'
import * as AppServiceHelper from '../../../sub/helper/dataproc/AppServiceHelper'
import * as ExtValueHelper from '../../../sub/helper/domain/ExtValueHelper'
import * as MasterHelper from '../../../sub/helper/domain/MasterHelper'
import * as ValidateHelper from '../../../sub/helper/dataproc/ValidateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import * as VueSelectHelper from '../../../sub/helper/ui/VueSelectHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import editmixin from '../../../components/mixin/editmixin.vue'
import alert from '../../../components/parts/alert.vue'
import colorPicker from '../../../components/parts/colorpicker'
import extform from '../../../components/parts/extform.vue'

export default {
  components: {
    breadcrumb,
    alert,
    colorPicker,
    extform,
  },
  mixins: [commonmixin, editmixin],
  props: {
    pName: {
      type: String,
      default: '',
    },
    pShowAuth: {
      type: Boolean,
      default: false,
    },
    pShowDescription: {
      type: Boolean,
      default: true,
    },
    pShowIcon: {
      type: Boolean,
      default: true,
    },
    pPath: {
      type: String,
      default: '/master/category',
    },
    pAppServicePath: {
      type: String,
      default: '/basic/category',
    },
    pTypeList: {
      type: Array,
      default: () => [CATEGORY.PERSON, CATEGORY.THING, CATEGORY.ZONE, CATEGORY.OTHER],
    },
  },
  data() {
    const category = this.$store.state.app_service.category
    return {
      name: 'category',
      id: 'categoryId',
      appServicePath: '/basic/category',
      form: Util.extract(category, [
        'categoryId', 'categoryCd', 'categoryName', 'categoryType',
        'display', 'zoneCategoryList', 'description',
        ...ExtValueHelper.getExtValueKeys(APP.CATEGORY, true)
      ]),
      defaultColor: '#000000',
      defaultBgColor: '#ffffff',
      oldType: Util.getValue(category, 'categoryType'),
      oldShape: Util.getValue(category, 'display.shape'),
      oldColor: Util.getValue(category, 'display.color'),
      oldBgColor: Util.getValue(category, 'display.bgColor'),
      vueSelected: {
        zoneGuards: [],
        zoneDoors: [],
      },
    }
  },
  computed: {
    ...mapState('app_service', [
      'category',
    ]),
    backPath() {
      return this.pPath
    },
    defValue() {
      return { 'categoryType': this.pTypeList[0] }
    },
    items() {
      return ViewHelper.createBreadCrumbItems('master', {text: StringUtil.concatCamel('category', this.pName), href: this.backPath}, ViewHelper.getDetailCaptionKey(this.$store.state.app_service.category.categoryId))
    },
    categoryTypes(){
      return CATEGORY.getTypes().filter(val => APP.CATEGORY.TYPES.includes(val.value))
    },
    shapes(){
      return SHAPE.getShapes()
    },
    selectZone(){
      return this.form.categoryType == CATEGORY.ZONE
    },
    dispName() {
      return StringUtil.concatCamel('category', this.pName)
    },
    categoryNameByType() {
      return StringUtil.concatCamel(this.pName, 'categoryName')
    },
    extValue() {
      return ExtValueHelper.getExtValue(APP.CATEGORY)
    },
  },
  watch: {
    'vueSelected.zoneGuards': {
      handler: function(newVal, oldVal){
        this.form.zoneGuardList = newVal.map(val => ({zoneCategoryPK: { zoneId: val.value }}))
      },
      deep: true,
    },
    'vueSelected.zoneDoors': {
      handler: function(newVal, oldVal){
        this.form.zoneDoorList = newVal.map(val => ({zoneCategoryPK: { zoneId: val.value }}))
      },
      deep: true,
    },
  },
  created() {
    this.onBeforeReload(true)
  },
  async mounted() {
    Util.applyDef(this.form, this.defValue)
    if(!Util.hasValue(this.form.categoryCd)){
      const categoryList = this.categories.filter(category => category.systemUse == 0)
      this.form.categoryCd = MasterHelper.createMasterCd('category', categoryList, this.category)
    }
    if(Util.hasValue(this.form.zoneCategoryList)){
      this.vueSelected.zoneGuards = this.form.zoneCategoryList.filter(zoneCategory => 
        zoneCategory.zone.zoneType == ZONE.GUARD
      ).map(zoneCategory =>
        VueSelectHelper.getVueSelectData(this.getZoneGuardOptions(), zoneCategory.zoneCategoryPK.zoneId)
      ).sort((a, b) => Util.getValue(a, 'label') < Util.getValue(b, 'label')? -1: 1)

      this.vueSelected.zoneDoors = this.form.zoneCategoryList.filter(zoneCategory => 
        zoneCategory.zone.zoneType == ZONE.DOOR
      ).map(zoneCategory =>
        VueSelectHelper.getVueSelectData(this.getZoneDoorOptions(), zoneCategory.zoneCategoryPK.zoneId)
      ).sort((a, b) => Util.getValue(a, 'label') < Util.getValue(b, 'label')? -1: 1)
    }
    ValidateHelper.setCustomValidationMessage()
    VueSelectHelper.disabledAllSubmit()
  },
  methods: {
    getZoneOptions(type){
      return this.zones.filter(zone => zone.zoneType == type).map(zone => ({ value: zone.zoneId, text: zone.zoneName, label: zone.zoneName }))
    },
    getZoneGuardOptions(){
      return this.getZoneOptions(ZONE.GUARD)
    },
    getZoneDoorOptions(){
      return this.getZoneOptions(ZONE.DOOR)
    },
    onBeforeReload(isInit){
      if (this.form) {
        if(!isInit) {
          this.form.categoryType = this.oldType? this.oldType: this.categoryTypes[0].value
          this.vueSelected.zoneGuards = []
          this.vueSelected.zoneDoors = []
        }
        this.form.displayShape = this.oldShape? this.oldShape: this.shapes[0].value
        this.form.displayColor = ColorUtil.colorCd4display(this.oldColor? this.oldColor: null, this.defaultColor)
        this.form.displayBgColor = ColorUtil.colorCd4display(this.oldBgColor? this.oldBgColor: null, this.defaultBgColor)
        const categoryList = this.categories.filter(category => category.systemUse == 0)
        // TODO:大容量のときはcategoryマスタを保持できないのでいったんコメントアウト
        //this.form.categoryCd = MasterHelper.createMasterCd('category', categoryList, this.category)
      }
    },
    structZoneCategory(getDummyKeyFunc){
      return Util.getValue(this.form, 'zoneGuardList', []).concat(Util.getValue(this.form, 'zoneDoorList', [])).map(zoneCategory => {
        zoneCategory.zoneCategoryPK.categoryId = getDummyKeyFunc()
        return zoneCategory
      })
    },
    async onSaving() {
      let dummyKey = -1
      const entity = {
        categoryId: this.form.categoryId || dummyKey--,
        categoryCd: this.form.categoryCd,
        categoryName: this.form.categoryName,
        categoryType: this.form.categoryType,
        extValue: {},
        description: this.form.description,
        display: {
          shape: `${this.form.displayShape}`,
          color: ColorUtil.colorCd4display(this.form.displayColor),
          bgColor: ColorUtil.colorCd4display(this.form.displayBgColor),
        },
        zoneCategoryList: this.structZoneCategory(() => dummyKey--)
      }
      ExtValueHelper.getExtValueKeys(APP.CATEGORY).forEach(key => entity.extValue[key] = this.form[key])
      this.oldType = this.form.categoryType
      this.oldShape = this.form.displayShape
      this.oldColor = this.form.displayColor
      this.oldBgColor = this.form.displayBgColor
      return await AppServiceHelper.bulkSave(this.pAppServicePath, [entity])
    },
    async onSaved(){
      const categoryList = this.categories.filter(category => category.systemUse == 0)
      this.$set(this.form, 'categoryCd', MasterHelper.createMasterCd('category', categoryList, this.category))
    }
  },
}
</script>

<style scoped lang="scss">

</style>