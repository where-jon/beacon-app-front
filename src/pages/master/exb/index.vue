<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="exbs" />
  </div>
</template>

<script>
import mList from '../../../components/list.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import listmixinVue from '../../../components/listmixin.vue'
import breadcrumb from '../../../components/breadcrumb.vue'

export default {
  components: {
    mList, 
    breadcrumb,
  },
  mixins: [listmixinVue],
  data() {
    return {
      params: {
        name: 'exb',
        id: 'exbId',
        editPath: '/master/exb/edit',
        bulkEditPath: '/master/exb/bulkedit',
        appServicePath: '/core/exb',
        csvOut: true,
        fields: addLabelByKey(this.$i18n, [ 
          {key: "exbId", sortable: true },
          {key: "deviceId", sortable: true },
          {key: "deviceIdX", sortable: true },
          {key: "locationName", label:'locationName', sortable: true,},
          {key: "posId", label:'posId', sortable: true,},
          {key: "areaName", label:'areaName', sortable: true,},
          {key: "x", label:'locationX', sortable: true,},
          {key: "y", label:'locationY', sortable: true,},
          {key: "actions", thStyle: {width: '130px !important'} }
        ]),
        initTotalRows: this.$store.state.app_service.exbs.length
      },
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.exb'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'exbs',
      'exbImages',
    ]),
  },
  methods: {
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        let exbs = await AppServiceHelper.fetchList('/core/exb/withLocation', 'exbId')
        console.log(exbs)
        exbs = exbs.map((exb) => {
          const location = exb.location
          const area = location? location.area: undefined
          return {
            ...exb,
            deviceIdX: exb.deviceId.toString(16).toUpperCase(),
            locationName: location? location.locationName: undefined,
            posId: location? location.posId: undefined,
            areaName: area? area.areaName: undefined,
            x: location? location.x: undefined,
            y: location? location.y: undefined,
          }
        })
        if (payload && payload.done) {
          payload.done()
        }
        this.replaceAS({exbs})
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    }
  }
}
</script>

<style scoped lang="scss">

</style>