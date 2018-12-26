<template>
  <div>
    <breadcrumb :items="items" :reload="true" :is-load="isLoad" @reload="fetchData" />
    <div v-show="!isLoad" class="container">
      <b-row align-h="end">
        <all-count :count="allCount" />
        <b-col md="2" class="mb-3 mr-3">
          <b-button v-t="'label.download'" v-if="!iosOrAndroid" :variant="getButtonTheme()" @click="download()" />
        </b-col>
      </b-row>
      <div class="table-area">
        <table v-if="!isDev" class="table striped">
          <thead>
            <th v-t="'label.major'" />
            <th v-t="'label.minor'" />
            <th v-t="'label.name'" />
            <th v-t="'label.powerLevel'" />
            <th v-t="'label.finalReceiveLocation'" />
            <th v-t="'label.finalReceiveTimestamp'" />
            <th v-t="'label.rssi'" />
            <th v-t="'label.state'" />
          </thead>
          <tbody>
            <tr v-for="(position, index) in positions" :key="index" :class="{undetect: isUndetect('tx', position.updatetime)}">
              <td>{{ position.major }}</td>
              <td>{{ position.minor }}</td>
              <td>{{ position.name }}</td>
              <td>
                <span :class="powerLevelClass(position.power_level)">
                  {{ powerLevelLabel(position.power_level) }}
                </span>
              </td>
              <td>{{ position.finalReceiveLocation }}</td>
              <td>{{ position.finalReceiveTimestamp }}</td>
              <td>{{ position.rssi }} </td>
              <td>
                <span :class="getStateClass('tx', position.updatetime)">
                  {{ position.state }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <vue-scrolling-table v-if="isDev && !isLoad">
          <template slot="thead">
            <th v-for="(val, key) in ['btx_id','device_id','pos_id','phase','power_level','updatetime','nearest1','nearest2','nearest3']"
                :key="key"
                scope="col"
            >
              {{ val }}
            </th>
          </template>
          <template slot="tbody">
            <tr v-for="(pos, index) in positions" :key="index">
              <td scope="row">
                {{ pos.btx_id }}
              </td>
              <td>{{ pos.device_id }}</td>
              <td>{{ pos.pos_id }}</td>
              <td variant="danger">
                {{ pos.phase }}
              </td>
              <td>{{ pos.power_level }}</td>
              <td>{{ pos.updatetime }}</td>
              <td v-for="idx in [0,1,2]" :key="idx">
                <div v-if="pos.nearest && pos.nearest[idx]">
                  <div v-for="(value, key) in pos.nearest[idx]" :key="key">
                    {{ key }}:{{ value }}
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </vue-scrolling-table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import { APP } from '../../sub/constant/config'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import VueScrollingTable from 'vue-scrolling-table'
import moment from 'moment'
import commonmixinVue from '../../components/mixin/commonmixin.vue'
import reloadmixinVue from '../../components/mixin/reloadmixin.vue'
import { getCharSet } from '../../sub/helper/CharSetHelper'
import allCount from '../../components/parts/allcount.vue'
import statusmixinVue from '../../components/mixin/statusmixin.vue'

export default {
  components: {
    breadcrumb,
    VueScrollingTable,
    allCount,
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
      isLoad: false,
      interval: null,
      badgeClassPrefix: 'badge badge-pill badge-',
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
    ...mapState('monitor', [
      'positions',
    ]),
    ...mapState('app_service', [
      'txs', 'exbs'
    ]),
    allCount() {
      return this.positions.length
    },
  },
  mounted() {
    this.fetchData()
    this.replace({title: this.$i18n.tnl('label.position')})
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
    async fetchData(payload) {
      this.replace({showProgress: true})
      this.isLoad = true
      try {
        let positions = await EXCloudHelper.fetchRawPosition()
        positions = await this.makePositionRecords(positions)
        if (payload && payload.done) {
          payload.done()
        }
        this.replaceMonitor({positions})
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
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
          powerLevel: this.powerLevelLabel(e.power_level),
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
    powerLevel(val) {
      if (val > APP.POWER_LEVEL_GOOD) {
        return 'good'
      }
      if (val > APP.POWER_LEVEL_WARN) {
        return 'warning'
      }
      if (val != null) {
        return 'poor'
      }
      return null
    },
    powerLevelLabel(val) {
      let powerLevel = this.powerLevel(val)
      if (powerLevel) {
        return this.$i18n.tnl('label.power-' + powerLevel)
      }
      return '-'
    },
    powerLevelClass(val) {
      const LEVEL_CLASS_MAP = {good:'success', warning:'warning', poor:'danger'}
      let powerLevel = this.powerLevel(val)
      if (powerLevel) {
        return this.badgeClassPrefix + LEVEL_CLASS_MAP[powerLevel]
      }
      return ''
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
@import "../../sub/constant/scrolltable.scss";

div.table-area {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

tbody {
  display:block;
  height:400px;
  overflow:auto;
  min-width: 530px;
}

thead, tbody tr {
  display:table;
  width:100%;
  table-layout:fixed;
}

td {
  word-break: break-all;
}

</style>