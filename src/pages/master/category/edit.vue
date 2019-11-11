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
          <label v-t="'label.' + categoryTypeName" />
          <input v-model="form.categoryName" :readonly="!isEditable" type="text" maxlength="40" class="form-control" required>
        </b-form-group>
        <b-form-group v-if="!pName && pTypeList.length > 1">
          <label v-t="'label.categoryType'" />
          <b-form-select v-model="form.categoryType" :options="categoryTypes" :disabled="!isEditable" :readonly="!isEditable" required />
        </b-form-group>
        <b-form-group v-if="!selectZone && pShowIcon">
          <label v-t="'label.shape'" />
          <b-form-select v-model="form.displayShape" :options="shapes" :disabled="!isEditable" :readonly="!isEditable" required />
        </b-form-group>
        <span  v-if="!selectZone && pShowIcon">
          <color-picker :caption="'label.textColor'" :name="'displayColor'" />
          <color-picker :caption="'label.bgColor'" :name="'displayBgColor'" />
        </span>
        <b-form-group>
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
import { CATEGORY, SHAPE } from '../../../sub/constant/Constants'
import * as ColorUtil from '../../../sub/util/ColorUtil'
import * as StringUtil from '../../../sub/util/StringUtil'
import * as Util from '../../../sub/util/Util'
import * as AppServiceHelper from '../../../sub/helper/dataproc/AppServiceHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as ValidateHelper from '../../../sub/helper/dataproc/ValidateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import editmixin from '../../../components/mixin/editmixin.vue'
import alert from '../../../components/parts/alert.vue'
import colorPicker from '../../../components/parts/colorpicker'

export default {
  props: {
    pName: {
      type: String,
      default: '',
    },
    pShowIcon: {
      type: Boolean,
      default: true,
    },
    pPath: {
      type: String,
      default: '/master/category',
    },
    pTypeList: {
      type: Array,
      default: () => [CATEGORY.PERSON, CATEGORY.THING, CATEGORY.ZONE],
    },
  },
  components: {
    breadcrumb,
    alert,
    colorPicker,
  },
  mixins: [commonmixin, editmixin],
  data() {
    const category = this.$store.state.app_service.category
    return {
      name: 'category',
      id: 'categoryId',
      appServicePath: '/basic/category',
      form: Util.extract(category, ['categoryId', 'categoryCd', 'categoryName', 'categoryType', 'display', 'description']),
      defaultColor: '#000000',
      defaultBgColor: '#ffffff',
      oldType: Util.getValue(category, 'categoryType', null),
      oldShape: Util.getValue(category, 'display.shape', null),
      oldColor: Util.getValue(category, 'display.color', null),
      oldBgColor: Util.getValue(category, 'display.bgColor', null),
    }
  },
  computed: {
    ...mapState('app_service', [
      'category', 'categories',
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
    categoryTypeName() {
      return StringUtil.concatCamel(this.pName, 'categoryName')
    },
  },
  created() {
    this.onBeforeReload(true)
  },
  mounted() {
    Util.applyDef(this.form, this.defValue)
    if(!Util.hasValue(this.form.categoryCd)){
      const categoryList = this.categories.filter(category => category.systemUse == 0)
      this.form.categoryCd = StateHelper.createMasterCd('category', categoryList, this.category)
    }
    ValidateHelper.setCustomValidationMessage()
  },
  methods: {
    onBeforeReload(isInit){
      if (this.form) {
        if(!isInit) {
          this.form.categoryType = this.oldType? this.oldType: this.categoryTypes[0].value
        }
        this.form.displayShape = this.oldShape? this.oldShape: this.shapes[0].value
        this.form.displayColor = ColorUtil.colorCd4display(this.oldColor? this.oldColor: null, this.defaultColor)
        this.form.displayBgColor = ColorUtil.colorCd4display(this.oldBgColor? this.oldBgColor: null, this.defaultBgColor)
        const categoryList = this.categories.filter(category => category.systemUse == 0)
        this.form.categoryCd = StateHelper.createMasterCd('category', categoryList, this.category)
      }
    },
    onSaved(){
      StateHelper.setForceFetch('pot', true)
      StateHelper.setForceFetch('tx', true)
      StateHelper.setForceFetch('zone', true)
    },
    async onSaving() {
      const entity = {
        categoryId: this.form.categoryId || -1,
        categoryCd: this.form.categoryCd,
        categoryName: this.form.categoryName,
        categoryType: this.form.categoryType,
        description: this.form.description,
        display: {
          shape: `${this.form.displayShape}`,
          color: ColorUtil.colorCd4display(this.form.displayColor),
          bgColor: ColorUtil.colorCd4display(this.form.displayBgColor),
        },
      }
      this.oldType = this.form.categoryType
      this.oldShape = this.form.displayShape
      this.oldColor = this.form.displayColor
      this.oldBgColor = this.form.displayBgColor
      return await AppServiceHelper.bulkSave(this.appServicePath, [entity])
    },
  },
}
</script>

<style scoped lang="scss">

</style>