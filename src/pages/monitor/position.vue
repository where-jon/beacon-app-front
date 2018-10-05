<template>
  <div>
    <breadcrumb :items="items" :reload="true" :isLoad="isLoad" @click-reload-button="fetchData" />
    <div class="container">
      <b-row align-h="end">
        <b-col md="2" class="mb-3 mr-3">
          <b-button :variant='getTheme' @click="download()" v-t="'label.download'" />
        </b-col>
      </b-row>
      <div class="table-area">
        <table v-if="!isDev" class="table striped">
          <thead>
            <th scope="col" v-for="(val, key) in positions[0]" :key="key" >{{ key }}</th>
          </thead>
          <tbody>
            <tr v-for="(position, index) in positions" :key="index" :class="{undetect: isUndetect(position[label_timestamp])}">
              <td scope="row" v-for="(val, key) in position" :key="key">
                <span :class="powerLevel(val, true)" v-if="key === label_powerLevel">{{ powerLevel(val, false) }}</span>
                {{ key !== label_powerLevel ? val : ''}}
              </td>
            </tr>
          </tbody>
        </table>
        <vue-scrolling-table v-if="isDev">
          <template slot="thead">
            <th scope="col"
            v-for="(val, key) in ['btx_id','device_id','pos_id','phase','power_level','updatetime','nearest1','nearest2','nearest3']"
            :key="key" >{{ val }}</th>
          </template>
          <template slot="tbody">
            <tr v-for="(pos, index) in positions" :key="index" :class="{undetect: isUndetect(pos.updatetime)}">
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
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import { EventBus } from '../../sub/helper/EventHelper'
import { EXB, DISP, APP } from '../../sub/constant/config'
import breadcrumb from '../../components/breadcrumb.vue'
import VueScrollingTable from "vue-scrolling-table"
import { getTheme } from '../../sub/helper/ThemeHelper'
import moment from 'moment'

export default {
  components: {
    breadcrumb,
    VueScrollingTable,
  },
  data () {
    return {
      items: [
        {
          text: this.$i18n.t('label.monitor'),
          active: true
        },
        {
          text: this.$i18n.t('label.position'),
          active: true
        }
      ],
      isLoad: false,
      label_txId: null,
      label_powerLevel: null,
      label_name: null,
      label_finalPlace: null,
      label_timestamp: null,
      label_undetect: null,
      label_powerLevelGood: null,
      label_powerLevelWarn: null,
      label_powerLevelPoor: null,
      interval: null,
      powerLevelGood: 69,
      powerLevelWarn: 39,
    }
  },
  props: {
    isDev: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    getTheme () {
      const theme = getTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    ...mapState('monitor', [
      'positions',
    ])
  },
  mounted() {
    this.fetchData()
    this.replace({title: this.$i18n.t('label.position')})
  },
  created(){
    EventBus.$on('reload', (payload)=>{
       this.fetchData(payload)
    })
    this.label_txId = this.$i18n.t('label.txId')
    this.label_powerLevel = this.$i18n.t('label.power-level')
    this.label_name = this.$i18n.t('label.name')
    this.label_finalPlace = this.$i18n.t('label.final-receive-place')
    this.label_timestamp = this.$i18n.t('label.final-receive-timestamp')
    this.label_undetect = this.$i18n.t('label.undetect')
    this.label_powerLevelGood = this.$i18n.t('label.power-good')
    this.label_powerLevelWarn = this.$i18n.t('label.power-warning')
    this.label_powerLevelPoor = this.$i18n.t('label.power-poor')
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
      let persons = await AppServiceHelper.fetchList("/basic/person/withThumbnail", 'personId')
      const map = {}
      persons.forEach((e) => {
        map[e.txId] = e.personName
      })

      const txId = this.label_txId
      const powerLevel = this.label_powerLevel
      const personName = this.label_name
      const finalPlace = this.label_finalPlace
      const timestamp = this.label_timestamp

      return positions.map((e) => {
        const name = map[e.btx_id]
        const record = {}
        record[txId] = e.btx_id
        record[powerLevel] = e.power_level
        record[personName] = (typeof name) !== 'undefined' ? name : 'ー'
        record[timestamp] = this.getTimestamp(e.updatetime)
        return record
      })
    },
    getTimestamp(timestamp) {
      if (!timestamp || (typeof timestamp) === 'undefined') {
        return this.label_undetect
      }
      try {
        const d = new Date(timestamp)
        return moment(d.getTime()).format('YYYY/MM/DD hh:mm:ss')
      } catch (e) {
        return this.label_undetect
      }
    },
    powerLevel(val, isClass) {
      const classes = 'badge badge-pill badge-'
      if (val > this.powerLevelGood) {
        return isClass ? (classes + 'success') : this.label_powerLevelGood
      }
      if (val > this.powerLevelWarn) {
        return isClass ? (classes + 'warning') : this.label_powerLevelWarn
      }
      return isClass ? (classes + 'danger') : this.label_powerLevelPoor
    },
    isUndetect(updated) {
      return updated.length < 1 ||
      updated === this.label_undetect ||
      new Date() - new Date(updated) > APP.UNDETECT_TIME
    },
    download() {
      HtmlUtil.fileDL("position.csv", Util.converToCsv(this.positions, ["btx_id","device_id","pos_id","phase","power_level","updatetime","nearest"]))
    },
    ...mapMutations([
      'replace', 
    ]),
    ...mapMutations('monitor', [
      'replaceMonitor', 
    ]),
  }
}
</script>

<style scoped lang="scss">
  @import "../../sub/constant/scrolltable.scss";

  tbody {
    display:block;
    height:400px;
    overflow:auto;
  }

  thead, tbody tr {
    display:table;
    width:100%;
    table-layout:fixed;
  }
  
  thead {
    width: calc( 100% - 1em )
  }

  .badge-warning {
    color: white;
  }
</style>