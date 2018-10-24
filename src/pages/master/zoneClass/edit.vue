<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">

      <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">{{ message }}</b-alert>

      <b-form @submit="onSubmit" v-if="show">
        <b-form-group v-if="hasId">
          <label v-t="'label.zoneId'" />
          <b-form-row>
            <b-col sm="5">
              <b-form-input type="text" v-model="form.zoneId" readonly="readonly" />
            </b-col>
          </b-form-row>
        </b-form-group>
        <b-form-group>
          <label v-t="'label.zoneName'" />
          <b-form-row>
            <b-col sm="5">
                <b-form-input type="text" v-model="form.zoneName" maxlength="20" required :readonly="!isEditable" />
            </b-col>
          </b-form-row>
        </b-form-group>
        <b-form-group>
          <label v-t="'label.areaName'" />
          <b-form-select v-model="form.areaId" :options="areaNames" required class="mb-3 ml-3 col-3" :disabled="!isEditable" />
        </b-form-group>
        <!--
        <b-form-group>
          <label v-t="'label.locationZoneName'" />
          <b-form-select v-model="form.locationId" :options="locationNames" required class="mb-3 ml-3 col-3" :disabled="!isEditable" />
        </b-form-group>
        -->
        <b-form-group>
          <label v-t="'label.categoryName'" />
          <b-form-select v-model="form.categoryId" :options="categoryNames" class="mb-3 ml-3 col-3" :disabled="!isEditable" />
        </b-form-group>

        <b-button type="button" variant="outline-danger" @click="backToList" v-t="'label.back'"/>
        <b-button v-if="isEditable" type="submit" :variant="theme" @click="register(false)" class="ml-2" >{{ label }}</b-button>
        <b-button v-if="isEditable && !isUpdate" type="submit" :variant="theme" @click="register(true)" class="ml-2" v-t="'label.registerAgain'"/>
      </b-form>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import _ from 'lodash'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import editmixinVue from '../../../components/editmixin.vue'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/breadcrumb.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import { CATEGORY, ZONE } from '../../../sub/constant/Constants'

export default {
  mixins: [editmixinVue],
  components: {
    breadcrumb,
  },
  data() {
    return {
      name: 'zone',
      id: 'zoneId',
      backPath: '/master/zoneClass',
      appServicePath: '/core/zone',
      form: ViewHelper.extract(this.$store.state.app_service.zone, ["zoneId", "zoneName", "areaId", "locationZoneList.0.locationZonePK.locationId", "zoneCategoryList.0.zoneCategoryPK.categoryId"]),
      areaNames: [],
      locationNames: [],
      categoryNames: [],
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.zoneClass'),
          href: '/master/zoneClass',
        },
        {
          text: this.$i18n.t('label.zoneClass') + this.$i18n.t('label.detail'),
          active: true
        }
      ]
    }
  },
  created() {
    this.initAreaNames()
    this.initLocationNames()
    this.initCategoryNames()
  },
  computed: {
    hasId(){
      return Util.hasValue(this.form.zoneId)
    },
    theme () {
      const theme = getButtonTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'zone', 'locations', 'areas'
    ]),
  },
  methods: {
    async initAreaNames() {
      await StateHelper.load('area')
      this.areaNames = this.areas.map((val) => ({text: val.areaName, value: val.areaId}))
    },
    async initLocationNames() {
      await StateHelper.load('location')
      this.locationNames = this.locations.map((val) => ({text: val.locationName, value: val.locationId}))
    },
    async initCategoryNames() {
      let categories = await AppServiceHelper.fetchList(`/basic/category/type/${CATEGORY.getTypes()[2].value}`, 'categoryId')
      this.categoryNames = categories.map((val) => ({text: val.categoryName, value: val.categoryId}))
      this.categoryNames.unshift({value:null, text:''})
    },
    async save() {
      const zoneId = Util.hasValue(this.form.zoneId)? this.form.zoneId: -1
      let entity = {
        zoneId: zoneId,
        zoneName: this.form.zoneName,
        zoneType: ZONE.getTypes()[1].value,
        areaId: this.form.areaId,
        locationZoneList: this.form.locationId? [{locationZonePK: {zoneId: zoneId, locationId: this.form.locationId}}]: null,
        zoneCategoryList: this.form.categoryId? [{zoneCategoryPK: {zoneId: zoneId, categoryId: this.form.categoryId}}]: null
      }
      const saveId = await AppServiceHelper.bulkSave(this.appServicePath, [entity])
      return saveId
    },
  }
}
</script>

<style scoped lang="scss">

</style>