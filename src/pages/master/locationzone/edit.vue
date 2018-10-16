<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">

      <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">{{ message }}</b-alert>

      <b-form @submit="onSubmit" v-if="show">
        <b-form-group>
          <label v-t="'label.zoneName'" />
          <b-form-select v-model="zoneId" :options="zoneNames" class="mb-3 ml-3 col-3" required :disabled="systemReadOnly" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.locationName'" />
          <b-form-select v-model="form.locationId" :options="locationNames" class="mb-3 ml-3 col-3" required :disabled="systemReadOnly" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.categoryName'" />
          <b-form-select v-model="form.categoryId" :options="categoryNames" class="mb-3 ml-3 col-3" required />
        </b-form-group>

        <b-button type="button" variant="outline-danger" @click="backToList" v-t="'label.back'"/>
        <b-button v-if="isEditable" type="submit" :variant="theme" @click="register(false)" class="ml-2" >{{ label }}</b-button>
        <b-button v-if="isEditable && !systemReadOnly" type="submit" :variant="theme" @click="register(true)" class="ml-2" v-t="'label.registerAgain'"/>
      </b-form>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import editmixinVue from '../../../components/editmixin.vue'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/breadcrumb.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import { CATEGORY } from '../../../sub/constant/Constants'

export default {
  mixins: [editmixinVue],
  components: {
    breadcrumb,
  },
  data() {
    return {
      name: 'locationZone',
      id: 'zoneId',
      backPath: '/master/locationzone',
      appServicePath: '/core/location/zone',
      form: ViewHelper.extract(this.$store.state.app_service.locationZone, ["locationZonePK.zoneId", "locationZonePK.locationId", "zone.zoneCategoryList.0.zoneCategoryPK.categoryId"]),
      zoneId: null,
      zoneNames: [],
      locationNames: [],
      categoryNames: [],
      originLocationNames: [],
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.locationZone'),
          href: '/master/locationzone',
        },
        {
          text: this.$i18n.t('label.locationZone') + this.$i18n.t('label.detail'),
          active: true
        }
      ]
    }
  },
  async created() {
    this.zoneId = this.form.zoneId
    this.initZoneNames()
    await this.initLocationNames()
    this.initCategoryNames()
    this.refreshLocationNames()
  },
  watch: {
    zoneId: function(newVal, oldVal) {
      this.refreshLocationNames(newVal)
    },
  },
  computed: {
    theme () {
      const theme = getButtonTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'locationZone', 'locationZones'
    ]),
    systemReadOnly(){
      return !this.isEditable || Util.hasValue(this.form.zoneId)
    },
    label(){
      return this.systemReadOnly? this.$i18n.t(`label.update`): this.$i18n.t(`label.register`)
    },
  },
  methods: {
    async initZoneNames() {
      const zoneList = await AppServiceHelper.fetchList('/core/zone/coordinates', 'zoneId')
      this.zoneNames = zoneList.map((val) => ({text: val.zoneName, value: val.zoneId}))
    },
    async initLocationNames() {
      const locations = await AppServiceHelper.fetchList('/core/location/', 'locationId')
      this.originLocationNames = locations.map((val) => ({text: val.locationName, value: val.locationId}))
    },
    async initCategoryNames() {
      let categories = await AppServiceHelper.fetchList(`/basic/category/type/${CATEGORY.getTypes()[2].value}`, 'categoryId')
      this.categoryNames = categories.map((val) => ({text: val.categoryName, value: val.categoryId}))
    },
    refreshLocationNames(zoneId) {
      let locationZones = zoneId? this.locationZones.filter((val) => val.zoneId == zoneId): []
      locationZones = locationZones.map((val) => val.locationId)
      locationZones = this.originLocationNames.filter((val) => !locationZones.includes(val.value))
      this.locationNames = locationZones
    },
    async beforeReload(){
      this.zoneId = null
      let locationZones = await AppServiceHelper.fetchList("/core/location/zone", 'zoneId')
      locationZones = locationZones.map((val) => ({
        zoneId: val.locationZonePK.zoneId,
        locationId: val.locationZonePK.locationId,
        zoneName: Util.hasValue(val.zone)? val.zone.zoneName: null,
        locationName: Util.hasValue(val.location)? val.location.locationName: null,
        categoryId: Util.hasValue(val.zone.zoneCategoryList)? val.zone.zoneCategoryList[0].zoneCategoryPK.categoryId: null,
        categoryName: Util.hasValue(val.zone.zoneCategoryList)? val.zone.zoneCategoryList[0].category.categoryName: null,
      }))
      this.replaceAS({locationZones})
      this.refreshLocationNames()
    },
    async save() {
      let entity = {
        zoneId: this.zoneId,
        zoneName: "dummy",
        locationZoneList: [{locationZonePK: {zoneId: this.zoneId, locationId: this.form.locationId}}],
        zoneCategoryList: [{zoneCategoryPK: {zoneId: this.zoneId, categoryId: this.form.categoryId}}]
      }
      const saveId = await AppServiceHelper.bulkSave(this.appServicePath, [entity])
      return saveId
    },
  }
}
</script>

<style scoped lang="scss">

</style>