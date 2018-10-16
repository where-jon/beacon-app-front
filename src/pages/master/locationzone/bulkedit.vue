<template>
  <div>
    <breadcrumb :items="items" />
    <bulkedit :name="name" :id="id" :backPath="backPath" :app-service-path="appServicePath" :form="form" />
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as Util from '../../../sub/util/Util'
import editmixinVue from '../../../components/editmixin.vue'
import breadcrumb from '../../../components/breadcrumb.vue'
import bulkedit from '../../../components/bulkedit.vue'

export default {
  components: {
    breadcrumb,
    bulkedit,
  },
  mixins: [editmixinVue],
  data() {
    return {
      name: 'locationZone',
      id: 'key',
      backPath: '/master/locationzone',
      appServicePath: '/core/location/zone',
      form: {
        csvFile: null,
      },
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
          text: this.$i18n.t('label.locationZone') + this.$i18n.t('label.bulkRegister'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'locationZone',
    ]),
  },
  methods: {
    async save() {
      const MAIN_COL = ["zoneId", "locationId"]
      const LOCATION_ZONE = ["zoneId", "locationId"]
      const ZONE_CATEGORY = ["zoneId", "categoryId"]
      const NUMBER_TYPE_LIST = ["zoneId", "locationId", "categoryId"]
      await this.bulkSave(MAIN_COL, NUMBER_TYPE_LIST, null, (entity, headerName, val, dummyKey) => {
        if(!entity.zoneName){
          entity.zoneName = "dummy"
        }
        if(!entity.locationZoneList){
          entity.locationZoneList = [{locationZonePK: {}}]
        }
        if(!entity.zoneCategoryList){
          entity.zoneCategoryList = [{zoneCategoryPK: {}}]
        }
        if (headerName === "zoneId" && Util.hasValue(val)) {
          entity.zoneId = Number(val)
          entity.locationZoneList[0].locationZonePK.zoneId = Number(val)
          entity.zoneCategoryList[0].zoneCategoryPK.zoneId = Number(val)
        }
        else if (headerName === "locationId" && Util.hasValue(val)) {
          entity.locationZoneList[0].locationZonePK.locationId = Number(val)
        }
        else if (headerName === "categoryId" && Util.hasValue(val)) {
          entity.zoneCategoryList[0].zoneCategoryPK.categoryId = Number(val)
        }
        return dummyKey
      })
    },
  }
}
</script>

<style scoped lang="scss">

</style>