<template>
  <div>
    <breadcrumb :items="items" :reload="true" :is-load="isLoad" @reload="fetchData" />
    <div v-show="!isLoad" class="container">
      <monitor-table type="position" :vue-table-mode="isDev" :all-count="allCount" :headers="headers" :datas="positions" :tr-class="getClass" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import moment from 'moment'
import commonmixinVue from '../../components/mixin/commonmixin.vue'
import reloadmixinVue from '../../components/mixin/reloadmixin.vue'
import { getCharSet } from '../../sub/helper/CharSetHelper'
import monitorTable from '../../components/parts/monitortable.vue'
import statusmixinVue from '../../components/mixin/statusmixin.vue'
import { addLabelByKey } from '../../sub/helper/ViewHelper'

export default {
  components: {
    breadcrumb,
    monitorTable,
  },
  mixins: [reloadmixinVue, commonmixinVue, statusmixinVue],
  props: {
    isDev: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      items: [
        {
          text: this.$i18n.tnl('label.monitor'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.position'),
          active: true
        }
      ],
      positions: [],
      headers: addLabelByKey(this.isDev? null: this.$i18n,
        this.isDev? [
          { key: 'btx_id' },
          { key: 'device_id' },
          { key: 'pos_id' },
          { key: 'phase' },
          { key: 'power_level' },
          { key: 'updatetime' },
          { key: 'nearest1' },
          { key: 'nearest2' },
          { key: 'nearest3' },
        ]: [
          { key: 'major' },
          { key: 'minor' },
          { key: 'name' },
          { key: 'powerLevel' },
          { key: 'finalReceiveLocation' },
          { key: 'finalReceiveTimestamp' },
          { key: 'rssi' },
          { key: 'state' },
        ]),
      isLoad: false,
      csvHeaders: this.isDev? {
        'btx_id': 'btx_id',
        'device_id': 'device_id',
        'pos_id': 'pos_id',
        'phase': 'phase',
        'power_level': 'power_level',
        'updatetime': 'updatetime',
        'nearest1': 'nearest1',
        'nearest2': 'nearest2',
        'nearest3': 'nearest3',
      }:
        {
          'major': 'major',
          'minor': 'minor',
          'name': 'name',
          'powerLevel': 'powerLevel',
          'finalReceiveLocation': 'location',
          'finalReceiveTimestamp': 'timestamp',
          'rssi': 'RSSI',
          'state': 'state',
        }
    }
  },
  computed: {
    ...mapState('app_service', [
      'txs', 'exbs'
    ]),
    allCount() {
      return this.positions.length
    },
  },
  mounted() {
    this.fetchData()
    if (!this.isDev) {
      return
    }
    this.items = [
      {
        text: this.$i18n.tnl('label.develop'),
        active: true
      },
      {
        text: this.$i18n.tnl('label.position'),
        active: true
      }
    ]
  },
  methods: {
    getClass(position){
      return {undetect: this.isUndetect('tx', position.updatetime)}
    },
    async fetchData(payload) {
      this.showProgress()
      this.isLoad = true
      try {
        const positions = await EXCloudHelper.fetchRawPosition()
        this.positions = await this.makePositionRecords(positions)
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.hideProgress()
      this.isLoad = false
    },
    async makePositionRecords(positions) {
      if (this.isDev) {
        return positions.map((position) =>{
          return {
            ...position,
            nearest1: position.nearest && position.nearest.length > 0? position.nearest[0]: null,
            nearest2: position.nearest && position.nearest.length > 1? position.nearest[1]: null,
            nearest3: position.nearest && position.nearest.length > 2? position.nearest[2]: null,
          }
        })
      }
      await StateHelper.load('exb')
      await StateHelper.load('tx')
      return positions.map((e) => {
        const tx = this.txs.find((tx) => tx.btxId == e.btx_id)
        const exb = this.exbs.find((exb) => exb.location.posId == e.pos_id)
        return {
          ...e,
          name: tx != null ? tx.txName : '—',
          finalReceiveLocation: exb? exb.location.locationName  : '',
          finalReceiveTimestamp: this.getTimestamp(e.updatetime),
          rssi: this.getRssi(e.nearest),
          powerLevel: this.getPositionPowerLevelLabel(e.power_level),
          state: this.getStateLabel('tx', e.updatetime),
        }
      })
    },
    getRssi(nearestList) {
      const rssiNearIndex = 0
      if (nearestList.length > rssiNearIndex) {
        try {
          return nearestList[rssiNearIndex].rssi.toFixed(1)
        } catch (e) {}
      }
      return this.$i18n.tnl('label.undetect')
    },
    getTimestamp(timestamp) {
      if (timestamp) {
        try {
          return moment(timestamp).format('YYYY/MM/DD HH:mm:ss')
        } catch (e) {}
      }
      return this.$i18n.tnl('label.undetect')
    },
    download() {
      const dldata = this.positions.map((pos) => {
        const obj = {}
        Object.keys(this.csvHeaders).forEach(csvHeader => {
          obj[this.csvHeaders[csvHeader]] = pos[csvHeader]
        })
        return obj
      })
      HtmlUtil.fileDL('position.csv', Util.converToCsv(dldata), getCharSet(this.$store.state.loginId))
    },
  }
}
</script>

<style scoped lang="scss">
</style>