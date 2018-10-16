<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="locationZones" >
    </m-list>
  </div>
</template>

<script>
import mList from '../../../components/list.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as Util from '../../../sub/util/Util'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import listmixinVue from '../../../components/listmixin.vue'
import breadcrumb from '../../../components/breadcrumb.vue'

export default {
  mixins: [listmixinVue],
  components: {
    mList, 
    breadcrumb,
  },
  data() {
    return {
      params: {
        name: 'locationZone',
        id: 'key',
        editPath: '/master/locationzone/edit',
        bulkEditPath: '/master/locationzone/bulkedit',
        appServicePath: '/core/location/zone',
        csvOut: true,
        fields: addLabelByKey(this.$i18n, [ 
          {key: "zoneId", sortable: true },
          {key: "zoneName", sortable: true },
          {key: "locationName", sortable: true},
          {key: "categoryName", sortable: true},
          {key: "actions", thStyle: {width:'130px !important'} }
        ]),
        initTotalRows: this.$store.state.app_service.locationZone.length
      },
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.locationZone'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'locationZones',
    ]),
  },
  methods: {
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        let locationZones = await AppServiceHelper.fetchList("/core/location/zone", 'zoneId')
        if(Util.hasValue(locationZones) && Util.isArray(locationZones)){
          locationZones = _(locationZones).sortBy((val) => [val.locationZonePK.zoneId, val.locationZonePK.locationId]).compact().value()
        }
        locationZones = locationZones.map((val) => ({
          key: `${val.locationZonePK.zoneId}/${val.locationZonePK.locationId}`,
          zoneId: val.locationZonePK.zoneId,
          locationId: val.locationZonePK.locationId,
          zoneName: Util.hasValue(val.zone)? val.zone.zoneName: null,
          locationName: Util.hasValue(val.location)? val.location.locationName: null,
          categoryId: Util.hasValue(val.zone.zoneCategoryList)? val.zone.zoneCategoryList[0].zoneCategoryPK.categoryId: null,
          categoryName: Util.hasValue(val.zone.zoneCategoryList)? val.zone.zoneCategoryList[0].category.categoryName: null,
        }))
        if (payload && payload.done) {
          payload.done()
        }
        this.replaceAS({locationZones})
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    },
  }
}
</script>

<style scoped lang="scss">

</style>
