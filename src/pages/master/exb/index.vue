<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="exbs" />
  </div>
</template>

<script>
import mList from '../../../components/page/list.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import { APP } from '../../../sub/constant/config.js'
import listmixinVue from '../../../components/mixin/listmixin.vue'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import * as Util from '../../../sub/util/Util'

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
        custumCsvColumns: [
          APP.EXB_WITH_EXBID? "exbId": null,
          APP.EXB_WITH_DEVICE_NUM? "deviceNum": null,
          APP.EXB_WITH_DEVICE_ID? "deviceId": null,
          APP.EXB_WITH_DEVICE_IDX? "deviceIdX": null,
          "locationName", "posId", "areaName", "x", "y", "enabled", "sensor", "zoneName"
        ].filter((val) => val),
        fields: addLabelByKey(this.$i18n, [ 
          APP.EXB_WITH_EXBID? {key: "exbId", sortable: true }: null,
          APP.EXB_WITH_DEVICE_NUM? {key: "deviceNum", sortable: true }: null,
          APP.EXB_WITH_DEVICE_ID? {key: "deviceId", sortable: true }: null,
          APP.EXB_WITH_DEVICE_IDX? {key: "deviceIdX", sortable: true }: null,
          {key: "locationName", label:'locationName', sortable: true,},
          APP.EXB_WITH_POSID? {key: "posId", label:'posId', sortable: true,}: null,
          {key: "areaName", label:'areaName', sortable: true,},
          {key: "x", label:'locationX', sortable: true,},
          {key: "y", label:'locationY', sortable: true,},
          {key: "sensor", label:'type', sortable: true,},
          {key: "zoneName", sortable: true,},
          {key: "actions", thStyle: {width: '130px !important'} }
        ]),
        initTotalRows: this.$store.state.app_service.exbs.length
      },
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.exb'),
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
  mounted() {
  },
  methods: {
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        await StateHelper.load('exb')
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