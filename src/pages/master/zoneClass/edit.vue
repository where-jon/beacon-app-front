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
import { CATEGORY, ZONE, SYSTEM_ZONE_CATEGORY_NAME, PATTERN } from '../../../sub/constant/Constants'
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
  components: {
    breadcrumb,
    alert,
  },
  mixins: [commonmixin, editmixin],
  data() {
    return {
      name: 'zone',
      id: 'zoneId',
      backPath: '/master/zoneClass',
      appServicePath: '/core/zone',
      items: ViewHelper.createBreadCrumbItems('master', {text: 'zoneClass', href: '/master/zoneClass'}, ViewHelper.getDetailCaptionKey(this.$store.state.app_service.zone.zoneId)),
      form: Util.extract(this.$store.state.app_service.zone, ['zoneId', 'zoneCd', 'zoneName', 'areaId', 'locationZoneList.0.locationZonePK.locationId', 'zoneCategoryList.0.zoneCategoryPK.categoryId']),
      vueSelected: {
        area: null,
        category: null,
      },
      areaNames: [],
      categoryNames: [],
      cdPattern: PATTERN.MASTER_CD,
      isEnableNameText: true,
      isRegist: false,
    }
  },
  computed: {
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
    ValidateHelper.setCustomValidationMessage()
    VueSelectHelper.disabledAllSubmit()
    if(!Util.hasValue(this.form.zoneCd)){
      this.form.zoneCd = StateHelper.createMasterCd('zone', this.zones, this.zone)
    }
  },
  methods: {
    reset () {
    },
    async initAreaNames() {
      await StateHelper.load('area')
      this.areaNames = StateHelper.getOptionsFromState('area', false, true)
    },
    async initCategoryNames() {
      const arr = await AppServiceHelper.fetchList('/basic/category/type/3')
      this.categoryNames = arr.sort(v => v.categoryCd).map(v => {
        const name = v.systemUse == 1 ? this.$i18n.tnl('label.' + v.categoryName.toLowerCase()) : v.categoryName
        return { text: name, label: name, value: v.categoryId} 
      })
    },
    onSaved(){
      StateHelper.setForceFetch('tx', true)
      StateHelper.setForceFetch('exb', true)
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
@import "../../../sub/constant/label.scss";
@import "../../../sub/constant/vue.scss";
</style>