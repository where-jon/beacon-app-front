<template>
  <div>
    <breadcrumb :items="items" :reload="true" :isLoad="isLoad" @reload="fetchData" />
    <div class="container" v-show="!isLoad">
      <b-row align-h="end">
        <all-count :count="allCount" />
        <b-col md="2" class="mb-3 mr-3">
          <b-button v-if="!ios" :variant='getButtonTheme()' @click="download()" v-t="'label.download'" />
        </b-col>
      </b-row>
      <div class="table-area">
        <table v-if="!isDev" class="table striped">
          <thead>
            <th scope="col" v-for="(val, key) in positions[0]" :key="key" >{{ key }}</th>
          </thead>
          <tbody>
            <tr v-for="(position, index) in positions" :key="index">
              <td scope="row" v-for="(val, key) in position" :key="key">
                <span :class="powerLevel(val, true)" v-if="key === label_powerLevel">{{ powerLevel(val, false) }}</span>
                <span :class="txStateClass(val)" v-else-if="key === label_state">{{ val }}</span>
                {{ key !== label_powerLevel && key !== label_state ? val : ''}}
              </td>
            </tr>
          </tbody>
        </table>
        <vue-scrolling-table v-if="isDev && !isLoad">
          <template slot="thead">
            <th scope="col"
            v-for="(val, key) in ['btx_id','device_id','pos_id','phase','power_level','updatetime','nearest1','nearest2','nearest3']"
            :key="key" >{{ val }}</th>
          </template>
          <template slot="tbody">
            <tr v-for="(pos, index) in positions" :key="index">
              <td scope="row">{{ pos.btx_id }}</td>
              <td>{{ pos.device_id }}</td>
              <td>{{ pos.pos_id }}</td>
              <td variant="danger" >{{ pos.phase }}</td>
              <td>{{ pos.power_level }}</td>
              <td>{{ pos.updatetime }}</td>
              <td v-for="index in [0,1,2]" :key="index">
                <div v-if="pos.nearest && pos.nearest[index]">
                  <div v-for="(value, key) in pos.nearest[index]" :key="key">
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
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import { EventBus } from '../../sub/helper/EventHelper'
import { EXB, DISP, APP } from '../../sub/constant/config'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import VueScrollingTable from "vue-scrolling-table"
import moment from 'moment'
import commonmixinVue from '../../components/mixin/commonmixin.vue'
import reloadmixinVue from '../../components/mixin/reloadmixin.vue'
import { getCharSet } from '../../sub/helper/CharSetHelper'
import _ from 'lodash'
import allCount from '../../components/parts/allcount.vue'

export default {
  mixins: [reloadmixinVue, commonmixinVue ],
  components: {
    breadcrumb,
    VueScrollingTable,
    allCount,
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
      label_minor: this.$i18n.tnl('label.minor'),
      label_powerLevel: this.$i18n.tnl('label.power-level'),
      label_name: this.$i18n.tnl('label.name'),
      label_receivePlace: this.$i18n.tnl('label.receive-place'),
      label_timestamp: this.$i18n.tnl('label.final-receive-timestamp'),
      label_undetect: this.$i18n.tnl('label.undetect'),
      label_powerLevelGood: this.$i18n.tnl('label.power-good'),
      label_powerLevelWarn: this.$i18n.tnl('label.power-warning'),
      label_powerLevelPoor: this.$i18n.tnl('label.power-poor'),
      label_state: this.$i18n.tnl('label.state'),
      label_receiveNormal: this.$i18n.tnl('label.receiveNormal'),
      label_absent: this.$i18n.tnl('label.absent'),
      label_undetect: this.$i18n.tnl('label.undetect'),
      interval: null,
      powerLevelGood: 69,
      powerLevelWarn: 39,
      locationMap: {},
      badgeClassPrefix: 'badge badge-pill badge-',
      csvHeaders: {
        ['minor']: 'minor',
        [this.$i18n.tnl('label.name')]: 'name',
        [this.$i18n.tnl('label.final-receive-timestamp')]: 'timestamp',
        [this.$i18n.tnl('label.receive-place')]: 'finalReceivePlace',
        [this.$i18n.tnl('label.state')]: 'state',
        [this.$i18n.tnl('label.power-level')]: 'powerLevel'
      }
    }
  },
  props: {
    isDev: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState('monitor', [
      'positions',
    ]),
    ...mapState('app_service', [
      'pots', 'exbs'
    ]),
    allCount() {
      return this.positions.length
    },
  },
  mounted() {
    this.fetchData()
    this.replace({title: this.$i18n.tnl('label.position')})
    this.locationMap = this.getExbRecords()
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
        return positions
      }
      await StateHelper.load('pot')
      const map = {}
      this.pots.forEach((e) => {
        if (e.tx) {
          map[e.tx.btxId] = e.tx.txName
        }
      })

      return positions.map((e) => {
        const name = map[e.btx_id]
        const record = {
          [this.label_minor]: e.minor,
          [this.label_name]: name != null ? name : '—',
          [this.label_receivePlace]: this.locationMap[e.device_id],
          [this.label_powerLevel]: e.power_level,
          [this.label_timestamp]: this.getTimestamp(e.updatetime),
          [this.label_state]: this.txState(e.updatetime),
        }
        return record
      })
    },
    getTimestamp(timestamp) {
      if (!timestamp || timestamp == null) {
        return this.label_undetect
      }
      try {
        const d = new Date(timestamp)
        return moment(d.getTime()).format('YYYY/MM/DD HH:mm:ss')
      } catch (e) {
        return this.label_undetect
      }
    },
    powerLevel(val, isClass) {
      if (val > this.powerLevelGood) {
        return isClass ? (this.badgeClassPrefix + 'success') : this.label_powerLevelGood
      }
      if (val > this.powerLevelWarn) {
        return isClass ? (this.badgeClassPrefix + 'warning') : this.label_powerLevelWarn
      }
      if (val != null) {
        return isClass ? (this.badgeClassPrefix + 'danger') : this.label_powerLevelPoor
      }
      return isClass ? "": "-"
    },
    txState(updatetime) {
      const time = new Date().getTime() - moment(updatetime).local().toDate().getTime()
      if (time < APP.MONITOR_TX.ABSENT) {
        return this.label_receiveNormal
      }

      if (time < APP.MONITOR_TX.UNDETECT) {
        return this.label_absent
      }

      return this.label_undetect
    },
    txStateClass(txState) {
      return this.badgeClassPrefix + (txState === this.label_receiveNormal ?
      'success' : (txState === this.label_absent ? 'warning' : 'danger'))
    },
    download() {
      const records = this.positions.map(e => {
        const obj = {}
        Object.keys(e).forEach(k => {
          obj[this.csvHeaders[k]] = e[k]
        })
        return obj
      })
      HtmlUtil.fileDL("position.csv", Util.converToCsv(records), getCharSet(this.$store.state.loginId))
    },
    async getExbRecords() {
      await StateHelper.load('exb')
      this.locationMap = this.exbs.reduce((obj, record) => {
        obj[record.deviceId] = record.location.locationName
        return obj
      }, {})
    }
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
  
  thead {
    /* width: calc( 100% - 1em ) */
  }

  .badge-warning {
    color: white;
  }
</style>