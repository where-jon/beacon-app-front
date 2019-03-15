<template>
  <div>
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <alert :message="message" />

      <div class="mb-5">
        <b-form inline v-if="type != 'location'">
          <b-form-group class="mr-5">
            <b-form-row>
              <b-form-row class="mb-3 mr-2">
                <label v-t="'label.sensor'" class="mr-2" />
                <b-form-select v-model="sensorId" :options="sensorOptions" class="mr-2" />
              </b-form-row>
            </b-form-row>
          </b-form-group>
        </b-form>
        <b-form inline @submit.prevent>
          <b-form-group>
            <b-form-row>
              <b-form-row class="mr-2">
                <label v-t="'label.year'" class="mr-2 d-flex align-items-center" />
                <v-select v-model="year" :options="years" class="mr-2">
                  <div slot="no-options">
                    {{ $i18n.tnl('label.vSelectNoOptions') }}
                  </div>
                </v-select>
              </b-form-row>
              <b-form-row class="mr-2">
                <label v-t="'label.month'" class="mr-2 d-flex align-items-center" />
                <v-select v-model="month" :options="months" class="mr-2">
                  <div slot="no-options">
                    {{ $i18n.tnl('label.vSelectNoOptions') }}
                  </div>
                </v-select>
              </b-form-row>
            </b-form-row>
          </b-form-group>
        </b-form>
        <b-row class="mt-4" />
        <b-table :items="viewList" :fields="fields" :sort-by.sync="sortBy" :sort-desc.sync="sortDesc" striped hover outlined >
          <template slot="actions" slot-scope="row">
            <b-button v-t="'label.download'" :variant="theme" size="sm" @click.stop="download(row.item)" />
          </template>
        </b-table>
      </div>
    </div>
  </div>
</template>

<script>
import 'element-ui/lib/theme-chalk/index.css'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import alert from '../../components/parts/alert.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import { addLabelByKey } from '../../sub/helper/ViewHelper'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as SensorHelper from '../../sub/helper/SensorHelper'
import * as Util from '../../sub/util/Util'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import { getTheme } from '../../sub/helper/ThemeHelper'
import { EXCLOUD, DISP } from '../../sub/constant/config'
import { SENSOR } from '../../sub/constant/Constants'


export default {
  components: {
    breadcrumb,
    alert,
  },
  mixins: [showmapmixin],
  props: {
    pitems: {
      type: Array,
    },
    pname: {
      type: String,
    },
    ptype: {
      type: String,
    }
  },
  data () {
    return {
      name: this.pname? this.pname: 'positionHistory',
      items: this.pitems? this.pitems: [
        {
          text: this.$i18n.tnl('label.historyTitle'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.positionHistory'),
          active: true
        }
      ],
      type: this.ptype? this.ptype: 'location',
      sensorId: this.ptype? SensorHelper.onlyOne(): null,
      year: new Date().getFullYear(),
      month: Util.zeroPad(new Date().getMonth() + 1, 2),
      years: Util.range(2019, new Date().getFullYear()).map(e => ({label: '' + e, value: e})),
      months: Array(12).fill().map((_, i) => ({label: '' + ++i, value: Util.zeroPad(i, 2)})),
      viewList: [],
      fields: addLabelByKey(this.$i18n, [
        {key: 'date', sortable: true, label:'date'},
        {key: 'actions', thStyle: {width: '130px !important'}, tdClass: 'action-rowdata' }
      ]),
      message: null,
      sortBy: 'date',
      sortDesc: DISP.HISTORY_SORT.toLowerCase() == 'desc',
    }
  },
  watch: {
    month: function(newVal, oldVal) {
      this.loadDate()
    },
    year: function(newVal, oldVal) {
      this.loadDate()
    },
    sensorId: function(newVal, oldVal) {
      this.loadDate()
    }
  },
  computed: {
    theme () {
      const theme = getTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    sensorOptions() { // TODO: refactoring duplicate 
      return StateHelper.getOptionsFromState('sensor', 
        sensor => this.$i18n.tnl('label.' + sensor.sensorName),
        true,
        sensor => {
          return SensorHelper.availableSensorAll().includes(sensor.sensorId) 
            && sensor.sensorId != SENSOR.LED && sensor.sensorId != SENSOR.BUTTON
        }
      )
    },
  },
  mounted() {
    StateHelper.load('sensor')
    this.loadDate()
  },
  methods: {
    async loadDate() {
      let year = this.year
      let month = this.month
      if (year instanceof Object) {
        year = year.value
      }
      if (month instanceof Object) {
        month = month.value
      }

      if (this.type != 'location') {
        if (!this.sensorId) {
          return
        }
        this.type = SENSOR.STRING[this.sensorId]
      }
      if (year && month) {
        this.viewList = await EXCloudHelper.fetchDlList(this.type, year + '' + month)
      }
    },
    async download(item) {
      let url = EXCloudHelper.url(EXCLOUD.DL_URL).replace('{type}', this.type).replace('{yyyymmdd}', item.date.split('/').join('')) + new Date().getTime()
      HtmlUtil.executeFileDL(url)
    },
  }
}
</script>

<style scoped>
.v-select {
  min-width: 100px;
  width: 100px;
}

.table {
  width: 40%;
}
</style>
