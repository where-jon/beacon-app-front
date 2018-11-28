<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">

      <b-alert variant="info" dismissible :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">
        <div v-html="message" />
      </b-alert>

      <b-form @submit="onSubmit" v-if="show">
        <b-form-group v-if="hasId">
          <label v-t="'label.categoryId'" />
          <b-form-input type="text" v-model="form.categoryId" readonly="readonly" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.categoryName'" />
          <b-form-input type="text" v-model="form.categoryName" maxlength="20" required :readonly="!isEditable" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.categoryType'" />
          <b-form-select v-model="form.categoryType" :options="categoryTypes" required :disabled="!isEditable" :readonly="!isEditable" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.shape'" />
          <b-form-select v-model="form.displayShape" :options="shapes" required :disabled="!isEditable" :readonly="!isEditable" />
        </b-form-group>
        <color-picker :caption="'label.textColor'" :name="'displayColor'"></color-picker>
        <color-picker :caption="'label.bgColor'" :name="'displayBgColor'"></color-picker>
        <b-form-group>
          <label v-t="'label.description'" />
          <b-form-textarea v-model="form.description" :rows="3" :max-rows="6" :readonly="!isEditable" ></b-form-textarea>
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
import _ from 'lodash'
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
      defaultColor: "#000000",
      defaultBgColor: "#ffffff",
      form: ViewHelper.extract(this.$store.state.app_service.category, ["categoryId", "categoryName", "categoryType", "display", "description"]),
      defValue: {
        "categoryType": APP.CATEGORY_TYPES[0],
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
          text: this.$i18n.tnl('label.category') + this.$i18n.tnl('label.detail'),
          active: true
        }
      ]
    }
  },
  created() {
    this.beforeReload()
  },
  async mounted() {
    ViewHelper.applyDef(this.form, this.defValue)
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