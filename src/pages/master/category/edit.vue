<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-form v-if="show" @submit.prevent="onSubmit">
        <b-form-group v-if="hasId">
          <label v-t="'label.categoryId'" />
          <b-form-input v-model="form.categoryId" type="text" class="form-control" readonly="readonly" />
        </b-form-group>
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
        <b-button v-if="isEditable" :variant="theme" type="submit" class="mr-2 my-1" @click="register(false)">
          {{ $i18n.tnl(`label.${isUpdate? 'update': 'register'}`) }}
        </b-button>
        <b-button v-if="isRegistable && !isUpdate" v-t="'label.registerAgain'" :variant="theme" type="submit" class="my-1" @click="register(true)" />
      </b-form>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import editmixinVue from '../../../components/mixin/editmixin.vue'
import * as Util from '../../../sub/util/Util'
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
    return {
      name: 'category',
      id: 'categoryId',
      backPath: '/master/category',
      appServicePath: '/basic/category',
      defaultColor: '#000000',
      defaultBgColor: '#ffffff',
      form: ViewHelper.extract(this.$store.state.app_service.category, ['categoryId', 'categoryName', 'categoryType', 'display', 'description']),
      defValue: {
        'categoryType': APP.CATEGORY_TYPES[0],
      },
      items: ViewHelper.createBreadCrumbItems('master', {text: 'category', href: '/master/category'}, Util.getDetailCaptionKey(this.$store.state.app_service.category.categoryId)),
    }
  },
  computed: {
    hasId(){
      return Util.hasValue(this.form.categoryId)
    },
    theme() {
      const theme = getButtonTheme()
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'category',
    ]),
    categoryTypes(){
      return CATEGORY.getTypes().filter((val) => APP.CATEGORY_TYPES.includes(val.value))
    },
    shapes(){
      return SHAPE.getShapes()
    },
  },
  created() {
    this.beforeReload()
  },
  async mounted() {
    ViewHelper.applyDef(this.form, this.defValue)
  },
  methods: {
    beforeReload(){
      this.form.displayShape = this.form.display? this.form.display.shape: null
      this.form.displayColor = Util.colorCd4display(this.form.display? this.form.display.color: null, this.defaultColor)
      this.form.displayBgColor = Util.colorCd4display(this.form.display? this.form.display.bgColor: null, this.defaultBgColor)
    },
    afterCrud(){
      StateHelper.setForceFetch('pot', true)
    },
    async save() {
      const entity = {
        categoryId: this.form.categoryId || -1,
        categoryName: this.form.categoryName,
        categoryType: this.form.categoryType,
        description: this.form.description,
        display: {
          shape: `${this.form.displayShape}`,
          color: Util.colorCd4display(this.form.displayColor),
          bgColor: Util.colorCd4display(this.form.displayBgColor),
        },
      }
      return await AppServiceHelper.bulkSave(this.appServicePath, [entity])
    },
  },
}
</script>

<style scoped lang="scss">

</style>