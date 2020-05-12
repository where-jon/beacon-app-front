<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" />
    <div class="container">
      <alert :message="message" />

      <b-row>
        <b-col md="8" offset-md="2">
          <b-form v-if="show" @submit.prevent="save">
            <b-form-group>
              <b-form-row>
                <label v-t="'label.id'" />
              </b-form-row>
              <b-form-row>
                <input v-model="form.zoneCd" :readonly="!isEditable" type="text" maxlength="20" class="form-control" :pattern="cdPattern" required>
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
                <input v-model="form.zoneName" :readonly="!isEditable" :disabled="!isEnableNameText" type="text" maxlength="20" class="form-control" required>
              </b-form-row>
            </b-form-group>

            <extform :is-editable="isEditable" :form="form" :p-ext-value="extValue" />

            <b-form-group>
              <b-form-row>
                <label v-t="'label.areaName'" class="control-label" />
              </b-form-row>
              <b-form-row>
                <v-select v-model="vueSelected.area" :options="areaNames" :disabled="!isEditable" class="vue-options-lg">
                  <template slot="no-options">
                    {{ vueSelectNoMatchingOptions }}
                  </template>
                </v-select>
              </b-form-row>
              <b-form-row>
                <label v-t="'label.categoryName'" class="control-label" />
              </b-form-row>
              <b-form-row>
                <v-select v-model="vueSelected.category" :options="categoryNames" :disabled="!isEditable" class="vue-options-lg">
                  <template slot="no-options">
                    {{ vueSelectNoMatchingOptions }}
                  </template>
                </v-select>
              </b-form-row>
            </b-form-group>

            <b-form-group>
              <label v-t="'label.capacity'" />
              <input v-model="form.capacity" :readonly="!isEditable" type="number" min="0" max="99999" class="form-control">
            </b-form-group>

            <b-button v-t="'label.back'" type="button" variant="outline-danger" class="mr-2 my-1" @click="backToList" />
            <b-button v-if="isEditable" :variant="theme" type="submit" class="mr-2 my-1" @click="doBeforeSubmit(false)">
              {{ $i18n.tnl(`label.${isUpdate? 'update': 'register'}`) }}
            </b-button>
            <b-button v-if="isRegistable && !isUpdate" v-t="'label.registerAgain'" :variant="theme" type="submit" class="my-1" @click="doBeforeSubmit(true)" />
          </b-form>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import { CATEGORY, ZONE, PATTERN } from '../../../sub/constant/Constants'
import * as StringUtil from '../../../sub/util/StringUtil'
import * as Util from '../../../sub/util/Util'
import * as AppServiceHelper from '../../../sub/helper/dataproc/AppServiceHelper'
import * as ExtValueHelper from '../../../sub/helper/domain/ExtValueHelper'
import * as MenuHelper from '../../../sub/helper/dataproc/MenuHelper'
import * as MasterHelper from '../../../sub/helper/domain/MasterHelper'
import * as ValidateHelper from '../../../sub/helper/dataproc/ValidateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import * as VueSelectHelper from '../../../sub/helper/ui/VueSelectHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import editmixin from '../../../components/mixin/editmixin.vue'
import alert from '../../../components/parts/alert.vue'
import extform from '../../../components/parts/extform.vue'

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
      default: '/core/zone',
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
    extform,
  },
  mixins: [commonmixin, editmixin],
  data() {
    return {
      name: 'zone',
      id: 'zoneId',
      form: Util.extract(this.$store.state.app_service.zone, [
        'zoneId', 'zoneCd', 'zoneType', 'zoneName', 'capacity',
        'areaId', 'locationZoneList.0.locationZonePK.locationId', 'zoneCategoryList',
        ...ExtValueHelper.getExtValueKeys(APP.ZONE, true)
      ]),
      vueSelected: {
        area: null,
        category: null,
      },
      areaNames: [],
      categoryNames: [],
      cdPattern: this.pPattern,
      isEnableNameText: true,
      isRegist: false,
      zoneCdOld: null,
    }
  },
  computed: {
    hasId(){
      return Util.hasValue(this.form.zoneId)
    },
    backPath() {
      return this.pPath
    },
    breadCrumbs() {
      return ViewHelper.createBreadCrumbItems('master', {text: StringUtil.concatCamel('zone', this.pName), href: this.backPath}, ViewHelper.getDetailCaptionKey(this.$store.state.app_service.zone.zoneId))
    },
    zoneTypeOptions() {
      return ZONE.getOptions().filter(option => this.pTypeList.includes(option.value))
    },
    defValue() {
      return { 'zoneType': Util.getValue(this.zoneTypeOptions, '0.value', ZONE.NON_COORDINATE) }
    },
    extValue() {
      return ExtValueHelper.getExtValue(APP.ZONE)
    },
    useToilet() {
      return MenuHelper.isEnabledMenu('toiletStatus')
    },
    ...mapState('app_service', [
      'zone',
    ]),
  },
  watch: {
    'vueSelected.area': {
      handler: function(newVal, oldVal){
        this.form.areaId = Util.getValue(newVal, 'value')
      },
      deep: true,
    },
    'vueSelected.category': {
      handler: function(newVal, oldVal){
        this.form.categoryId = Util.getValue(newVal, 'value')
      },
      deep: true,
    },
  },
  async created() {
    await this.initAreaNames()
    await this.initCategoryNames()
    this.initForm()
  },
  mounted(){
    ValidateHelper.setCustomValidationMessage()
    VueSelectHelper.disabledAllSubmit()
    if(!Util.hasValue(this.form.zoneCd)){
      this.form.zoneCd = MasterHelper.createMasterCd('zone', this.zones, this.zone)
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
      this.form.categoryId = Util.getValue(zoneCategory, 'zoneCategoryPK.categoryId')
      this.form.zoneCategoryList = zoneCategoryList.filter(zoneCategory => categoryMap[zoneCategory.zoneCategoryPK.categoryId] != CATEGORY.ZONE)

      this.vueSelected.area = VueSelectHelper.getVueSelectData(this.areaNames, this.form.areaId)
      this.vueSelected.category = VueSelectHelper.getVueSelectData(this.categoryNames, this.form.categoryId)
    },
    initAreaNames() {
      this.areaNames = MasterHelper.getOptionsFromState('area', false, true)
    },
    async initCategoryNames() {
      const arr = await AppServiceHelper.fetchList('/basic/category/type/3')
      this.categoryNames = arr.sort(v => v.categoryCd).map(v => {
        const name = v.systemUse == 1 ? this.$i18n.tnl('label.' + v.categoryName.toLowerCase()) : v.categoryName
        return { text: name, label: name, value: v.categoryId} 
      })
    },
    async onSaved(){
      this.zoneCdOld = this.form.zoneCd
    },
    async onBeforeReload(){
      this.vueSelected.area = VueSelectHelper.getVueSelectData(this.areaNames)
      this.vueSelected.category = VueSelectHelper.getVueSelectData(this.categoryNames)
      this.form.zoneCd = MasterHelper.nextCd(this.zoneCdOld)
    },
    async onSaving() {
      const entity = {
        updateKey: Util.hasValue(this.form.zoneId)? this.form.zoneId: null,
        ID: this.form.zoneCd,
        zoneName: this.form.zoneName,
        extValue: null,
        capacity: this.form.capacity
      }

      const extValue = {}
      ExtValueHelper.getExtValueKeys(APP.ZONE).forEach(key => {
        if (this.form[key]) {
          extValue[key] = this.form[key]
        }
      })
      if (Object.keys(extValue).length > 0) {
        entity.extValue = JSON.stringify(extValue)
      }

      const category = this.categories.find(category => category.categoryId == this.form.categoryId)
      if (category) {
        entity.categoryCd = category.categoryCd
      } else {
        entity.categoryCd = ""
      }

      const area = this.areas.find(ar => ar.areaId == this.form.areaId)
      if (area) {
        entity.areaCd = area.areaCd
      }

      const zoneType = this.zoneTypeOptions.find(zt => zt.value == this.form.zoneType)
      if (zoneType) {
        entity.zoneType = zoneType.text
      }

      return await AppServiceHelper.bulkSaveByCsvStr(this.pAppServicePath, [entity])
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../../sub/constant/label.scss";
@import "../../../sub/constant/vue.scss";
</style>