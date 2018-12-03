<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="zones" >
    </m-list>
  </div>
</template>

<script>
import mList from '../../../components/page/list.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as Util from '../../../sub/util/Util'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import listmixinVue from '../../../components/mixin/listmixin.vue'
import breadcrumb from '../../../components/layout/breadcrumb.vue'

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
          //{key: "locationName", label: "locationZoneName", sortable: true},
          {key: "categoryName", sortable: true},
          {key: "actions", thStyle: {width:'130px !important'} }
        ]),
        initTotalRows: this.$store.state.app_service.zones.length
      },
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.zoneClass'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'zones',
      'forceFetchZone',
    ]),
  },
  methods: {
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        await StateHelper.load('zone', this.forceFetchZone)
        if (payload && payload.done) {
          payload.done()
        }
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
