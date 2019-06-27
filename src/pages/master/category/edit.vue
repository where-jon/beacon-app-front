<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-form v-if="show" @submit.prevent="save">
        <b-form-group>
          <label v-t="'label.categoryName'" />
          <input v-model="form.categoryName" :readonly="!isEditable" type="text" maxlength="20" class="form-control" required>
        </b-form-group>
        <b-form-group>
          <label v-t="'label.categoryType'" />
          <b-form-select v-model="form.categoryType" :options="categoryTypes" :disabled="!isEditable" :readonly="!isEditable" required />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.shape'" />
          <b-form-select v-model="form.displayShape" :options="shapes" :disabled="!isEditable" :readonly="!isEditable" required />
        </b-form-group>
        <color-picker :caption="'label.textColor'" :name="'displayColor'" />
        <color-picker :caption="'label.bgColor'" :name="'displayBgColor'" />
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
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import editmixinVue from '../../../components/mixin/editmixin.vue'
import * as Util from '../../../sub/util/Util'
import * as HtmlUtil from '../../../sub/util/HtmlUtil'
import * as ColorUtil from '../../../sub/util/ColorUtil'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as StateHelper from '../../../sub/helper/StateHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import alert from '../../../components/parts/alert.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import { CATEGORY, SHAPE } from '../../../sub/constant/Constants'
import colorPicker from '../../../components/parts/colorpicker'
import { APP } from '../../../sub/constant/config'

export default {
  components: {
    breadcrumb,
    alert,
    colorPicker,
  },
  mixins: [editmixinVue],
  data() {
    let category = this.$store.state.app_service.category
    return {
      name: 'category',
      id: 'categoryId',
      backPath: '/master/category',
      appServicePath: '/basic/category',
      defaultColor: '#000000',
      defaultBgColor: '#ffffff',
      form: ViewHelper.extract(category, ['categoryId', 'categoryName', 'categoryType', 'display', 'description']),
      oldType: Util.getValue(category, 'categoryType', null),
      oldShape: Util.getValue(category, 'display.shape', null),
      oldColor: Util.getValue(category, 'display.color', null),
      oldBgColor: Util.getValue(category, 'display.bgColor', null),
      defValue: {
        'categoryType': APP.CATEGORY.TYPES[0],
      },
      items: ViewHelper.createBreadCrumbItems('master', {text: 'category', href: '/master/category'}, Util.getDetailCaptionKey(this.$store.state.app_service.category.categoryId)),
    }
  },
  computed: {
    theme() {
      return getButtonTheme()
    },
    ...mapState('app_service', [
      'category',
    ]),
    categoryTypes(){
      return CATEGORY.getTypes().filter((val) => APP.CATEGORY.TYPES.includes(val.value))
    },
    shapes(){
      return SHAPE.getShapes()
    },
  },
  created() {
    this.onBeforeReload()
  },
  async mounted() {
    ViewHelper.applyDef(this.form, this.defValue)
    HtmlUtil.setCustomValidationMessage()
  },
  methods: {
    onBeforeReload(){
      if (this.form) {
        this.form.categoryType = this.oldType? this.oldType: this.categoryTypes[0].value
        this.form.displayShape = this.oldShape? this.oldShape: this.shapes[0].value
        this.form.displayColor = ColorUtil.colorCd4display(this.oldColor? this.oldColor: null, this.defaultColor)
        this.form.displayBgColor = ColorUtil.colorCd4display(this.oldBgColor? this.oldBgColor: null, this.defaultBgColor)
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