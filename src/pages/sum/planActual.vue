<template>
  <div class="container">
    <breadcrumb :items="items" :reload="false" />
    <alert :message="message" />
    <b-row class="mt-2">
      <b-form inline @submit.prevent>
        <b-form-row class="my-1 ml-2 ml-sm-0">
          <label class="ml-sm-4 ml-2 mr-2">
            {{ $t('label.mode') }}
          </label>
          <span :title="indicatorTypeFilter.label">
            <v-select v-model="indicatorTypeFilter" :options="indicatorTypeOpts" :clearable="false" :style="indicatorTypeFilterSelector">
              <template slot="no-options">
                {{ vueSelectNoMatchingOptions }}
              </template>
            </v-select>
          </span>
        </b-form-row>
      </b-form>
    </b-row>
    <b-row class="mt-2">
      <b-form inline @submit.prevent>
        <b-form-row class="my-1 ml-2 ml-sm-0">
          <label class="ml-sm-4 ml-2 mr-1">
            {{ $t('label.filter') }}
          </label>
          <b-form-select v-model="vueSelected.filterType" :options="filterTypeOpts" class="ml-2 inputSelect" />
          <span :title="vueSelectTitle(vueSelected.filter)">
            <v-select v-model="vueSelected.filter" :options="filterOpts" class="ml-2 inputSelect vue-options" style="width: 400px;">
              <template slot="selected-option" slot-scope="option">
                {{ vueSelectCutOnWithWidth(option, 400) }}
              </template>
              <template slot="no-options">
                {{ vueSelectNoMatchingOptions }}
              </template>
            </v-select>
          </span>
        </b-form-row>
        <b-form-row class="my-1 ml-2 ml-sm-0">
          <toggle-button
            class="mr-2 mt-2" :value="isWeek"
            :color="{checked: '#66cdaa', unchecked: '#87cefa', disabled: '#cccccc'}"
            :sync="true"
            :labels="{checked: $t('label.week'), unchecked: $t('label.month')}"
            :width="65"
            @change="onChangeToggle"
          />
          <date-picker
            v-show="true"
            ref="datePicker"
            v-model="today"
            :type="datePickerType"
            :format="datePickerFormat"
            size="large"
            style="width: 11rem;"
            :placeholder="datePickerPlaceholder"
            @blur="onDatePickerBlur"
          />
        </b-form-row>
      </b-form>
    </b-row>
    <b-row class="mt-2 mb-3">
      <b-form inline @submit.prevent>
        <b-form-row class="ml-3 ml-sm-3">
          <b-button v-t="'label.display'" :variant="theme" class="mx-1" @click="onClickDisplay" />
          <b-button v-if="!iosOrAndroid && bulkReferenceable" v-t="'label.download'" :variant="theme" :disabled="!tItems || tItems.length == 0" class="ml-2" @click="exportCsv" />
        </b-form-row>
      </b-form>
    </b-row>
    <div>
      <b-table :items="tItems" :fields="tFields" :current-page="currentPage" :per-page="perPage" :sort-by.sync="sortBy"  :sort-compare="defaultSortCompare" stacked="md" striped hover outlined>
        <template slot="graph" slot-scope="row">
          <div style="position: relative;">
            <div v-for="(bar, index) in row.item.graph" :key="index" :class="bar.name? 'stay-bar': 'lost-bar'" :style="bar.style">
              <span class="graph-arrow-box">
                {{ bar.ratio }}%
              </span>&nbsp;
            </div>
          </div>
        </template>
      </b-table>
      <b-row>
        <b-col md="6" class="mt-1 mb-3">
          <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" class="my-0"/>
        </b-col>
      </b-row>
    </div>
  </div>
</template>
<script>
import moment from 'moment'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../../components/mixin/commonmixin.vue'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as AppServiceHelper from '../../sub/helper/dataproc/AppServiceHelper.js'
import * as Util from '../../sub/util/Util'
import { CATEGORY, POT_TYPE } from '../../sub/constant/Constants'
import { DatePicker } from 'element-ui'
import { importElementUI } from '../../sub/helper/ui/ViewHelper'
import 'element-ui/lib/theme-chalk/index.css'
import { ToggleButton } from 'vue-js-toggle-button'
import { getCharSet } from '../../sub/helper/base/CharSetHelper'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as ColorUtil from '../../sub/util/ColorUtil'
import { APP_SERVICE } from '../../sub/constant/config'
import alert from '../../components/parts/alert.vue'
import * as LocaleHelper from '../../sub/helper/base/LocaleHelper'

export default {
  components: {
    breadcrumb, DatePicker, ToggleButton, alert
  },
  mixins: [commonmixin],
  data () {
    return {
      name: 'planActual',
      id: 'planActualId',
      appServicePath: '/office/plans/indicators',
      items: ViewHelper.createBreadCrumbItems('sumTitle', 'planActual'),
      sortBy: 'name',
      message: '',
      locale: null,

      indicatorTypeOpts: [
        {value:0, label: `${this.$i18n.tnl('label.operatingRate')}（${this.$i18n.tnl('label.operatingHours')}／${this.$i18n.tnl('label.workingHours')}）`},
        {value:1, label: `${this.$i18n.tnl('label.reservationRate')}（${this.$i18n.tnl('label.reservationHours')}／${this.$i18n.tnl('label.workingHours')}）`},
        {value:2, label: `${this.$i18n.tnl('label.reserveOperatingRate')}（${this.$i18n.tnl('label.reserveOperatingHours')}／${this.$i18n.tnl('label.reservationHours')}）`},
        {value:3, label: `${this.$i18n.tnl('label.unreserveOperatingRate')}（${this.$i18n.tnl('label.unreserveOperatingHours')}／${this.$i18n.tnl('label.workingHours')}）`},
        {value:4, label: `${this.$i18n.tnl('label.emptyReservationCount')}`},
      ],
      indicatorTypeFilter: null,

      currentPage: 1,
      perPage: 20,
      totalRows: 0,
      tFieldsOperatingRate: [
        {key: 'name', sortable: true, label: this.$i18n.tnl('label.name')},
        {key: 'indicator', sortable: true, label: this.$i18n.tnl('label.operatingRate')},
        {key: 'graph', sortable: false, label: this.$i18n.tnl('label.normalGraph'), thStyle: {height: '50px !important', width:'400px !important'} },
        {key: 'hour', sortable: true, label: this.$i18n.tnl('label.operatingHours')},
        {key: 'hour2', sortable: true, label: this.$i18n.tnl('label.workingHours')},
      ],
      tFieldsReservationRate: [
        {key: 'name', sortable: true, label: this.$i18n.tnl('label.name')},
        {key: 'indicator', sortable: true, label: this.$i18n.tnl('label.reservationRate')},
        {key: 'graph', sortable: false, label: this.$i18n.tnl('label.normalGraph'), thStyle: {height: '50px !important', width:'400px !important'} },
        {key: 'hour', sortable: true, label: this.$i18n.tnl('label.reservationHours')},
        {key: 'hour2', sortable: true, label: this.$i18n.tnl('label.workingHours')},
      ],
      tFieldsReserveOperatingRate: [
        {key: 'name', sortable: true, label: this.$i18n.tnl('label.name')},
        {key: 'indicator', sortable: true, label: this.$i18n.tnl('label.reserveOperatingRate')},
        {key: 'graph', sortable: false, label: this.$i18n.tnl('label.normalGraph'), thStyle: {height: '50px !important', width:'400px !important'} },
        {key: 'hour', sortable: true, label: this.$i18n.tnl('label.reserveOperatingHours')},
        {key: 'hour2', sortable: true, label: this.$i18n.tnl('label.reservationHours')},
      ],
      tFieldsUnreserveOperatingRate: [
        {key: 'name', sortable: true, label: this.$i18n.tnl('label.name')},
        {key: 'indicator', sortable: true, label: this.$i18n.tnl('label.unreserveOperatingRate')},
        {key: 'graph', sortable: false, label: this.$i18n.tnl('label.normalGraph'), thStyle: {height: '50px !important', width:'400px !important'} },
        {key: 'hour', sortable: true, label: this.$i18n.tnl('label.unreserveOperatingHours')},
        {key: 'hour2', sortable: true, label: this.$i18n.tnl('label.workingHours')},
      ],
      tFieldsEmptyReservationCount: [
        {key: 'name', sortable: true, label: this.$i18n.tnl('label.name')},
        {key: 'indicator', sortable: true, label: this.$i18n.tnl('label.emptyReservationCount')},
        null,
        null,
        null,
      ],
      tFields: [],
      tItems: [],

      // カレンダー
      isWeek: true,
      datePickerType: 'week',
      datePickerFormatWeek: 'yyyy-MM-dd ' + this.$t('label.week'),
      datePickerFormatMonth: 'yyyy-MM',
      datePickerFormat: null,
      datePickerPlaceholderWeek: this.$t('label.week'),
      datePickerPlaceholderMonth: this.$t('label.month'),
      datePickerPlaceholder: null,
      today: moment().day(1).set({hour:0,minute:0,second:0,millisecond:0}).toDate(),
      preDate: moment().day(1).set({hour:0,minute:0,second:0,millisecond:0}).toDate(),

      // マスタ情報
      areaOpts: [],
      zoneOpts: [],
      locationOpts: [],
      zoneCategoryOpts: [],
      potThingOpts: [],

      // フィルター
      filterTypeOpts: [
        {value:null, text: ''},
        {value:'areas', text: this.$t('label.area')},
        {value:'zones', text: this.$t('label.zone')},
        {value:'locations', text: this.$t('label.location')},
        {value:'zoneCategories', text: this.$t('label.zoneCategory')},
        {value:'potThings', text: this.$t('label.potThing')},
      ],
      filterOpts: [],
      selectedFilter: {
        filterType: null,
        filterId: null,
      },
      vueSelected: {
        filterType: null,
        filter: null,
      },
    }
  },
  computed: {
    indicatorTypeFilterSelector() {
      return this.locale == 'ja' ? 'width: 400px;' : 'width: 570px;'
    }
  },
  watch: {
    indicatorTypeFilter: {
      handler: function(newVal, oldVal){
        this.totalRows = 0
        this.tItems = []
        switch (newVal.value) {
          case 0:
            this.tFields = this.tFieldsOperatingRate
            break
          case 1:
            this.tFields = this.tFieldsReservationRate
            break
          case 2:
            this.tFields = this.tFieldsReserveOperatingRate
            break
          case 3:
            this.tFields = this.tFieldsUnreserveOperatingRate
            break
          default:
            this.tFields = this.tFieldsEmptyReservationCount
        }
      },
      deep: false,
    },
    'vueSelected.filterType': {
      handler: function(newVal, oldVal){
        console.log('vueSelected')
        this.selectedFilter.filterType = newVal
        this.selectedFilter.filterId = null
        this.vueSelected.filter = null
        switch (newVal) {
          case 'areas':
            this.filterOpts = this.areaOpts
            break;
          case 'zones':
            this.filterOpts = this.zoneOpts
            break;
          case 'locations':
            this.filterOpts = this.locationOpts
            break;
          case 'zoneCategories':
            this.filterOpts = this.zoneCategoryOpts
            break;
          case 'potThings':
            this.filterOpts = this.potThingOpts
            break;
          default:
            this.filterOpts = []
        }
      },
      deep: false,
    },
    'vueSelected.filter': {
      handler: function(newVal, oldVal){
        if (newVal != null) {
          this.selectedFilter.filterId = newVal.value
        }
      },
      deep: true,
    },
  },
  async created() {
    this.datePickerFormat = this.datePickerFormatWeek
    this.datePickerPlaceholder = this.datePickerPlaceholderWeek
    this.indicatorTypeFilter = this.indicatorTypeOpts[0]
    this.loadMaster()
  },
  async mounted() {
    this.locale = LocaleHelper.getSystemLocale()
    importElementUI()
    this.tFields = this.tFieldsReservationRate
  },
  methods: {
    onChangeToggle(e) {
      this.isWeek = !this.isWeek
      if (this.isWeek) {
        this.datePickerType = 'week'
        this.datePickerFormat = this.datePickerFormatWeek
        this.datePickerPlaceholder = this.datePickerPlaceholderWeek
      } else {
        this.datePickerType = 'month'
        this.datePickerFormat = this.datePickerFormatMonth
        this.datePickerPlaceholder = this.datePickerPlaceholderMonth
      }
    },
    onDatePickerBlur(e) {
      const picker = this.$refs.datePicker
      let dt = new Date(picker.value)
      dt = this.datePickerType == 'week' ? moment(dt).day(1).toDate() : moment(dt).date(1).toDate()
      this.preDate = dt
    },
    // マスタ
    async loadMaster() {
      this.areaOpts = this.areas.map(area => {
        return {value: area.areaId, label: area.areaName}
      })
      this.zoneOpts = this.zones.map(zone => {
        return {value: zone.zoneId, label: zone.zoneName}
      })
      this.locationOpts = this.locations.map(location => {
        return {value: location.locationId, label: location.locationName}
      })
      this.zoneCategoryOpts = this.categories.filter(cate => cate.categoryType == CATEGORY.ZONE).map(cate => {
        return {value: cate.categoryId, label: cate.categoryName}
      })
      this.potThingOpts = this.pots.filter(pot => pot.potType == POT_TYPE.THING).map(pot => {
        return {value: pot.potId, label: pot.potName}
      })
    },
    onClickDisplay(e) {
      this.fetchData()
    },
    async fetchData() {
      try {
        const [startDt, endDt] = this.getDateRange()
        this.tItems = []
        let uri = `${this.appServicePath}?startDt=${startDt}&endDt=${endDt}&indicatorType=${this.indicatorTypeFilter.value}`
        if (this.selectedFilter.filterType && this.selectedFilter.filterId) {
          uri = `${uri}&filterType=${this.selectedFilter.filterType}&filterId=${this.selectedFilter.filterId}`
        }
        const data = await HttpHelper.getAppService(uri)
        this.loadIndicators(data)
      }
      catch(e) {
        console.error(e)
        this.message = e.response.data
        this.replace({showAlert: true})
        window.scrollTo(0, 0)
      }
    },
    getDateRange() {
      const picker = this.$refs.datePicker
      let sDt, eDt
      if (this.isWeek) {
        sDt = new Date(picker.value)
        sDt.setDate(sDt.getDate() - 1)
        eDt = new Date(picker.value)
        eDt.setDate(sDt.getDate() + 6)
      } else {
        const dt = new Date(picker.value)
        sDt = new Date(dt.getFullYear(), dt.getMonth(), 1)
        eDt = new Date(sDt.getFullYear(), sDt.getMonth() + 1, 0)
      }
      const startDt = moment(sDt).format("YYYY-MM-DDT00:00:00.000")
      const endDt = moment(eDt).format("YYYY-MM-DDT23:59:59.999")
      return [startDt, endDt]
    },
    exportCsv() {
      try {
        const [startDt, endDt] = this.getDateRange()
        let uri = `${APP_SERVICE.BASE_URL}${this.appServicePath}/csvdownload?charset=${getCharSet(this.$store.state.loginId)}&startDt=${startDt}&endDt=${endDt}&indicatorType=${this.indicatorTypeFilter.value}`
        if (this.selectedFilter.filterType && this.selectedFilter.filterId) {
          uri += `&filterType=${this.selectedFilter.filterType}&filterId=${this.selectedFilter.filterId}`
        }
        BrowserUtil.executeFileDL(uri)
      }
      catch(e) {
        console.error(e)
        this.message = e.response.data
        this.replace({showAlert: true})
        window.scrollTo(0, 0)
      }
    },
    round(value) {
      const base = 100
      return Math.round(value * base) / base
    },
    getPercentage(v1, v2) {
      const per = this.round(v1 / v2 * 100)
      return per > 100 ? 100 : per
    },
    loadIndicators(data) {
      const color = ColorUtil.getStackColor(1)
      const arr = data.indicators.map((e) => {
        let per = 0
        let hour2 = 0
        const graph = []
        switch (this.indicatorTypeFilter.value) {
          case 0: // 稼働率（稼働時間/(就業時間*定員数)）
          case 1: // 予約率（予約時間/(就業時間*定員数)）
          case 3: // 予約外稼働率（予約外稼働時間/(就業時間*定員数)）
            if (0 < data.sumOfWorkingHours) {
              hour2 = data.sumOfWorkingHours * e.capacity
            }
            if (0 < e.value && 0 < hour2) {
              per = this.getPercentage(e.value, hour2)
            }
            graph.push({
              name: 1, 
              style: `width: ${per}% !important; background: ${color};`,
              ratio: per
            })
            graph.push({
              name: 0,
              style: `width: ${100-per}% !important; background: gray;`,
              ratio: 100-per
            })
            return {
              name: e.targetName, 
              indicator: per,
              hour: this.round(e.value),
              hour2: hour2,
              graph: graph
            }
          case 2:
            // 予約内稼働率（予約内稼働時間/(予約時間*定員数)）
            if (0 < e.sumOfReservationHours) {
              hour2 = e.sumOfReservationHours * e.capacity
            }
            if (0 < e.value && 0 < hour2) {
              per = this.getPercentage(e.value, hour2)
            }
            graph.push({
              name: 1, 
              style: `width: ${per}% !important; background: ${color};`,
              ratio: per
            })
            graph.push({
              name: 0,
              style: `width: ${100-per}% !important; background: gray;`,
              ratio: 100-per
            })
            return {
              name: e.targetName, 
              indicator: per,
              hour: this.round(e.value),
              hour2: hour2,
              graph: graph
            }
          default:
            // 空予約数
            return { 
              name: e.targetName, 
              indicator: e.value,
            }
        }
      })
      this.totalRows = arr.length
      this.tItems = arr
    },
  }
}
</script>
<style lang="scss">
.stay-bar {
  position: relative;
  display: inline-block;
  cursor: default;
  box-sizing:border-box;
}
.lost-bar {
  position: relative;
  display: inline-block;
  background: #ccc;
  cursor: default;
  box-sizing:border-box;
}
.graph-arrow-box {
  display: none;
  position: absolute;
  top: 100%;
  padding: 8px;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;  
  border-radius: 5px;
  background: #333;
  color: #fff;
  white-space: nowrap;
  z-index: 5;
}
.stay-bar:hover .graph-arrow-box, .lost-bar:hover .graph-arrow-box {
  display: block;
}
</style>