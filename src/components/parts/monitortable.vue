<template>
  <div>
    <b-row align-h="end">
      <all-count :count="allCount" />
      <b-col v-if="bulkReferenceable" md="2" class="mb-3 mr-3">
        <b-button v-if="!iosOrAndroid" v-t="'label.download'" :variant="theme" @click="download()" />
      </b-col>
    </b-row>
    <div class="table-area">
      <table v-if="!vueTableMode" class="table table-hover">
        <thead>
          <tr>
            <th v-for="(header, index) in headers" :key="index" scope="col">
              {{ header.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(data, dataIndex) in datas" :key="dataIndex" :class="trClass(data, dataIndex)">
            <td v-for="(header, headerIndex) in headers" :key="headerIndex" :class="tdClass(dataIndex, header, headerIndex)">
              <span v-if="header.key == 'state' && type == 'gw'">
                <span :class="getStateClass('gw', data.updated)">
                  {{ getStateLabel('gw', data.updated) }}
                </span>
              </span>
              <span v-else-if="header.key == 'state' && type == 'position'">
                <span :class="getStateClass('tx', data.updatetime)">
                  {{ data.state }}
                </span>
              </span>
              <span v-else-if="header.key == 'powerLevel' && type == 'position'">
                <span :class="getPositionPowerLevelClass(data.power_level)">
                  {{ getPositionPowerLevelLabel(data.power_level) }}
                </span>
              </span>
              <span v-else-if="header.key == 'powerLevel' && type == 'telemetry'">
                <font-awesome-icon :icon="['fas', getTelemetryPowerLevelClass(data.powerLevel)]" :class="getTelemetryPowerLevelClass(data.powerLevel, true)" />{{ data.powerLevel }}
              </span>
              <span v-else-if="header.key == 'state' && type == 'telemetry'" :class="getStateClass('exb', data.timestamp)">
                {{ data[header.key] }}
              </span>
              <span v-else>
                {{ data[header.key] }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <vue-scrolling-table v-else>
        <template slot="thead">
          <th v-for="(header, index) in headers" :key="index" scope="col">
            {{ header.label }}
          </th>
        </template>
        <template slot="tbody">
          <tr v-for="(data, index) in datas" :key="index">
            <td v-for="(header, headerIndex) in headers" :key="headerIndex" scope="row">
              <span v-if="header.key.includes('nearest') && type == 'position'">
                <div v-for="(value, key) in data[header.key]" :key="key">
                  {{ key }}:{{ value }}
                </div>
              </span>
              <span v-else>
                {{ data[header.key] }}
              </span>
            </td>
          </tr>
        </template>
      </vue-scrolling-table>
    </div>
  </div>
</template>

<script>
import VueScrollingTable from 'vue-scrolling-table'
import * as DetectStateHelper from '../../sub/helper/domain/DetectStateHelper'
import * as TelemetryHelper from '../../sub/helper/domain/TelemetryHelper'
import commonmixin from '../mixin/commonmixin.vue'
import reloadmixin from '../mixin/reloadmixin.vue'
import allCount from './allcount.vue'

export default {
  components: {
    VueScrollingTable,
    allCount,
  },
  mixins: [commonmixin, reloadmixin],
  props: {
    isDev: {
      type: Boolean,
      default: false
    },
    vueTableMode: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: ''
    },
    allCount: {
      type: Number,
      default: 0
    },
    headers: {
      type: Array,
      default: () => []
    },
    datas: {
      type: Array,
      default: () => []
    },
    trClass: {
      type: Function,
      default: () => ''
    },
    tdClass: {
      type: Function,
      default: () => ''
    },
  },
  data () {
    return {
      badgeClassPrefix: 'badge badge-pill badge-',
    }
  },
  methods: {
    getTelemetryPowerLevelClass(val, isPowerState = false){
      TelemetryHelper.getTelemetryPowerLevelClass(val, isPowerState)
    },
    getStateClass(type, updatetime) {
      return this.badgeClassPrefix + DetectStateHelper.getClass(DetectStateHelper.getStateFromDetail(type, updatetime))
    },
    getStateLabel(type, updatetime) {
      return DetectStateHelper.getLabel(DetectStateHelper.getStateFromDetail(type, updatetime))
    },
    getPositionPowerLevelLabel(val) {
      const powerLevel = TelemetryHelper.getPositionPowerLevel(val)
      if (powerLevel) {
        return this.$i18n.tnl('label.power-' + powerLevel)
      }
      return '-'
    },
    getPositionPowerLevelClass(val) {
      const LEVEL_CLASS_MAP = {good:'success', warning:'warning', poor:'danger'}
      const powerLevel = TelemetryHelper.getPositionPowerLevel(val)
      if (powerLevel) {
        return this.badgeClassPrefix + LEVEL_CLASS_MAP[powerLevel]
      }
      return ''
    },
    async fetchData(payload) {
      if(this.$parent.$options.methods.fetchData){
        await this.$parent.$options.methods.fetchData.call(this.$parent, payload)
      }
    },
    download() {
      this.$parent.$options.methods.download.call(this.$parent)
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

span.badge {
  margin-right: 0px;
}

td.exb-state {
  padding: 0.75rem 0rem 0.75rem 0rem;
}

thead {
  width: calc( 100% - 1em )
}

.power-safe {
  color: #28a745;
}

.power-warning {
  color: #ffd700;
}

.power-empty {
  color: #f17777;
}

</style>
