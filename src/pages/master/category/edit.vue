<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">
      <b-alert :show="showInfo" variant="info" dismissible>
        {{ message }}
      </b-alert>
      <b-alert :show="showAlert" variant="danger" dismissible @dismissed="showAlert=false">
        <template v-if="Array.isArray(message)">
          <span v-for="line in message" :key="line">
            {{ line }} <br>
          </span>
        </template>
        <span v-else>
          {{ message }}
        </span>
      </b-alert>

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
          {{ label }}
        </b-button>
        <b-button v-if="isEditable && !isUpdate" v-t="'label.registerAgain'" :variant="theme" type="submit" class="my-1" @click="register(true)" />
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
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import { CATEGORY, SHAPE } from '../../../sub/constant/Constants'
import colorPicker from '../../../components/parts/colorpicker'
import { APP } from '../../../sub/constant/config'

export default {
  components: {
    breadcrumb,
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
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.category'),
          href: '/master/category',
        },
        {
          text: this.$i18n.tnl(Util.getDetailCaptionKey(this.$store.state.app_service.category.categoryId)),
          active: true
        }
      ]
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
    async save() {
      const entity = {
        categoryId: this.form.categoryId || -1,
        categoryName: this.form.categoryName,
        categoryType: this.form.categoryType,
        description: this.form.description,
        display: {
          shape: this.form.displayShape,
          color: Util.colorCd4db(this.form.displayColor),
          bgColor: Util.colorCd4db(this.form.displayBgColor),
        },
      }
      return await AppServiceHelper.bulkSave(this.appServicePath, [entity])
    },
  },
}
</script>

<style scoped lang="scss">

</style>