<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="zones" >
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
        name: 'zone',
        id: 'zoneId',
        editPath: '/master/zoneClass/edit',
        bulkEditPath: '/master/zoneClass/bulkedit',
        appServicePath: '/core/zone',
        csvOut: true,
        fields: addLabelByKey(this.$i18n, [ 
          {key: "zoneId", sortable: true },
          {key: "zoneName", sortable: true },
          {key: "areaName", sortable: true},
          {key: "locationName", label: "locationZoneName", sortable: true},
          {key: "categoryName", sortable: true},
          {key: "actions", thStyle: {width:'130px !important'} }
        ]),
        initTotalRows: this.$store.state.app_service.zones.length
      },
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.zoneClass'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'zones',
    ]),
  },
  methods: {
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        let zones = await AppServiceHelper.fetchList("/core/zone/coordinates", 'zoneId')
        zones = zones.map((val) => ({
          zoneId: val.zoneId,
          zoneName: val.zoneName,
          areaId: Util.hasValue(val.area)? val.area.areaId: null,
          areaName: Util.hasValue(val.area)? val.area.areaName: null,
          locationId: Util.hasValue(val.locationZoneList)? val.locationZoneList[0].locationZonePK.locationId: null,
          locationName: Util.hasValue(val.locationZoneList)? val.locationZoneList[0].location.locationName: null,
          categoryId: Util.hasValue(val.zoneCategoryList)? val.zoneCategoryList[0].zoneCategoryPK.categoryId: null,
          categoryName: Util.hasValue(val.zoneCategoryList)? val.zoneCategoryList[0].category.categoryName: null,
        }))
        if (payload && payload.done) {
          payload.done()
        }
        this.replaceAS({zones})
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
