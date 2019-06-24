<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-form v-if="show" @submit.prevent="onSubmit">
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
              <v-select v-model="vueSelected.area" :options="areaNames" :disabled="!isEditable" :clearable="false" class="vue-options-lg" />
            </b-col>
          </b-form-row>
          <b-form-row>
            <label v-t="'label.categoryName'" class="control-label" />
          </b-form-row>
          <b-form-row>
            <b-col sm="5">
              <v-select v-model="vueSelected.category" :options="categoryNames" :disabled="!isEditable" class="vue-options-lg" />
            </b-col>
          </b-form-row>
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
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as VueSelectHelper from '../../../sub/helper/VueSelectHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import editmixinVue from '../../../components/mixin/editmixin.vue'
import * as HtmlUtil from '../../../sub/util/HtmlUtil'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import alert from '../../../components/parts/alert.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import { CATEGORY, ZONE } from '../../../sub/constant/Constants'
import controlmixinVue from '../../../components/mixin/controlmixin.vue'

export default {
  components: {
    breadcrumb,
    alert,
  },
  mixins: [editmixinVue, controlmixinVue],
  data() {
    return {
      name: 'zone',
      id: 'zoneId',
      backPath: '/master/zoneClass',
      appServicePath: '/core/zone',
      form: ViewHelper.extract(this.$store.state.app_service.zone, ['zoneId', 'zoneName', 'areaId', 'locationZoneList.0.locationZonePK.locationId', 'zoneCategoryList.0.zoneCategoryPK.categoryId']),
      vueSelected: {
        area: null,
        category: null,
      },
      areaNames: [],
      categoryNames: [],
      isEnableNameText: true,
      zones: [],
      isRegist: false,
      items: ViewHelper.createBreadCrumbItems('master', {text: 'zoneClass', href: '/master/zoneClass'}, Util.getDetailCaptionKey(this.$store.state.app_service.zone.zoneId)),
    }
  },
  computed: {
    theme () {
      const theme = getButtonTheme()
      return 'outline-' + theme
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
    await this.initAreaNames()
    await this.initCategoryNames()
    this.vueSelected.area = VueSelectHelper.getVueSelectData(this.areaNames, this.form.areaId, !Util.hasValue(this.form.areaId))
    this.vueSelected.category = VueSelectHelper.getVueSelectData(this.categoryNames, this.form.categoryId)
  },
  mounted(){
    HtmlUtil.setCustomValidationMessage()
  },
  methods: {
    reset () {
    },
    async initAreaNames() {
      await StateHelper.load('area')
      this.areaNames = StateHelper.getOptionsFromState('area', false, true)
      console.log(this.areaNames )
    },
    async initCategoryNames() {
      await StateHelper.load('category')
      this.categoryNames = StateHelper.getOptionsFromState('category',
        category => StateHelper.getDispCategoryName(category),
        true, 
        category => !CATEGORY.POT_AVAILABLE.includes(category.categoryType)
      )
    },
    afterCrud(){
      StateHelper.setForceFetch('tx', true)
      StateHelper.setForceFetch('exb', true)
    },
    async beforeReload(){
      this.vueSelected.area = VueSelectHelper.getVueSelectData(this.areaNames, null, true)
      this.vueSelected.category = VueSelectHelper.getVueSelectData(this.categoryNames, null)
    },
    async save() {
      const zoneId = Util.hasValue(this.form.zoneId)? this.form.zoneId: -1
      const entity = {
        zoneId: zoneId,
        zoneName: this.form.zoneName,
        zoneType: ZONE.NON_COORDINATE,
        areaId: this.form.areaId,
        locationZoneList: this.form.locationId? [{locationZonePK: {zoneId: zoneId, locationId: this.form.locationId}}]: null,
        zoneCategoryList: this.form.categoryId? [{zoneCategoryPK: {zoneId: zoneId, categoryId: this.form.categoryId}}]: null
      }
      return await AppServiceHelper.bulkSave(this.appServicePath + '/edit', [entity])
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../../sub/constant/vue.scss";
label.control-label {
  padding-top: 7px;
}
</style>