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
import * as MenuHelper from '../../../sub/helper/MenuHelper'
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
        mainColumn: APP.EXB_WITH_EXBID? {name: this.$i18n.tnl('label.exbId'), id: 'exbId'}:
          APP.EXB_WITH_DEVICE_NUM? {name: this.$i18n.tnl('label.deviceNum'), id: 'deviceNum'}:
            APP.EXB_WITH_DEVICE_ID? {name: this.$i18n.tnl('label.deviceId'), id: 'deviceId'}:
              APP.EXB_WITH_DEVICE_IDX? {name: this.$i18n.tnl('label.deviceIdX'), id: 'deviceIdX'}:
                null,
        csvOut: true,
        custumCsvColumns: [
          APP.EXB_WITH_EXBID? 'exbId': null,
          APP.EXB_WITH_DEVICE_NUM? 'deviceNum': null,
          APP.EXB_WITH_DEVICE_ID? 'deviceId': null,
          APP.EXB_WITH_DEVICE_IDX? 'deviceIdX': null,
          'locationName',
          'posId',
          'areaName',
          'x',
          'y',
          'enabled',
          'sensor',
          MenuHelper.isMenuEntry('/master/zoneClass') ? 'zoneName': null
        ].filter((val) => val),
        fields: addLabelByKey(this.$i18n, [ 
          APP.EXB_WITH_EXBID? {key: 'exbId', sortable: true }: null,
          APP.EXB_WITH_DEVICE_NUM? {key: 'deviceNum', sortable: true }: null,
          APP.EXB_WITH_DEVICE_ID? {key: 'deviceId', sortable: true }: null,
          APP.EXB_WITH_DEVICE_IDX? {key: 'deviceIdX', sortable: true }: null,
          {key: 'locationName', label:'locationName', sortable: true,},
          APP.EXB_WITH_POSID? {key: 'posId', label:'posId', sortable: true,}: null,
          {key: 'areaName', label:'area', sortable: true,},
          {key: 'x', label:'locationX', sortable: true,},
          {key: 'y', label:'locationY', sortable: true,},
          {key: 'sensor', label:'type', sortable: true,},
          MenuHelper.isMenuEntry('/master/zoneClass') ?
            {key: 'zoneName', label: 'zoneName', sortable: true,} : null,
          {key: 'actions', thStyle: {width: '130px !important'} }
        ]),
        sortBy: APP.EXB_WITH_EXBID? 'exbId': APP.EXB_WITH_DEVICE_NUM? 'deviceNum': APP.EXB_WITH_DEVICE_ID? 'deviceId': APP.EXB_WITH_DEVICE_IDX? 'deviceIdX': '',
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
      'forceFetchExb',
    ]),
  },
  mounted() {
  },
  methods: {
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        await StateHelper.load('exb', this.forceFetchExb)
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