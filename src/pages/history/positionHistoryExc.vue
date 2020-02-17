<template>
  <div class="container-fluid">
    <breadcrumb :items="items" :reload="false" />
    <div>
      <alert :message="message" />

      <div class="mb-5">
        <b-form v-if="type != 'location'" inline>
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
                <v-select v-model="year" :options="years" :clearable="false" class="mr-2">
                  <template slot="no-options">
                    {{ vueSelectNoMatchingOptions }}
                  </template>
                </v-select>
              </b-form-row>
              <b-form-row class="mr-2">
                <label v-t="'label.month'" class="mr-2 d-flex align-items-center" />
                <v-select v-model="month" :options="months" :clearable="false" class="mr-2">
                  <template slot="no-options">
                    {{ vueSelectNoMatchingOptions }}
                  </template>
                </v-select>
              </b-form-row>
            </b-form-row>
          </b-form-group>
        </b-form>
        <b-row class="mt-4" />
        <b-table :items="viewList" :fields="fields" :sort-by.sync="sortBy" :sort-desc.sync="sortDesc" striped hover outlined>
          <template slot="actions" slot-scope="row">
            <b-button v-if="bulkReferenceable" v-t="'label.download'" :variant="theme" size="sm" @click.stop="download(row.item)" />
          </template>
        </b-table>
      </div>
    </div>
  </div>
</template>

<script>
import 'element-ui/lib/theme-chalk/index.css'
import { APP, EXCLOUD } from '../../sub/constant/config'
import { SENSOR } from '../../sub/constant/Constants'
import * as ArrayUtil from '../../sub/util/ArrayUtil'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as StringUtil from '../../sub/util/StringUtil'
import * as DateUtil from '../../sub/util/DateUtil'
import * as EXCloudHelper from '../../sub/helper/dataproc/EXCloudHelper'
import * as SensorHelper from '../../sub/helper/domain/SensorHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../../components/mixin/commonmixin.vue'
import alert from '../../components/parts/alert.vue'


export default {
  components: {
    breadcrumb,
    alert,
  },
  mixins: [commonmixin],
  props: {
    pitems: {
      type: Array,
      default: () => null,
    },
    pname: {
      type: String,
      default: null,
    },
    ptype: {
      type: String,
      default: null,
    }
  },
  data () {
    return {
      name: this.pname? this.pname: 'positionHistory',
      items: this.pitems? this.pitems: ViewHelper.createBreadCrumbItems('historyTitle', 'positionHistory'),
      fields: ViewHelper.addLabelByKey(this.$i18n, [
        {key: 'date', sortable: true, label:'date'},
        {key: 'actions', thStyle: {width: '130px !important'}, tdClass: 'action-rowdata' }
      ]),
      message: null,
      viewList: [],
      sortBy: 'date',
      sortDesc: APP.HISTORY_EXC.SORT.toLowerCase() == 'desc',
      type: this.ptype? this.ptype: 'location',
      sensorId: this.ptype? SensorHelper.onlyOne(): null,
      year: DateUtil.getDefaultDate().getFullYear(),
      month: StringUtil.zeroPad(DateUtil.getDefaultDate().getMonth() + 1, 2),
      years: ArrayUtil.range(2019, DateUtil.getDefaultDate().getFullYear()).map(e => ({label: '' + e, value: e})),
      months: Array(12).fill().map((_, i) => ({label: '' + ++i, value: StringUtil.zeroPad(i, 2)})),
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
  mounted() {
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
      BrowserUtil.executeFileDL(url)
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
