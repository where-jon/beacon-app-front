<template>
  <div class="container">
    <breadcrumb :items="items" :reload="false" />
    <b-row class="mt-2">
      <b-form inline @submit.prevent>
        <b-form-row class="my-1 ml-2 ml-sm-0">
            <label class="ml-sm-4 ml-2 mr-2">
              {{ $t('label.mode') }}
            </label>
            <span :title="indicatorTypeFilter.label">
            <v-select v-model="indicatorTypeFilter" :options="indicatorTypeOpts" :clearable="false" style="width: 350px;">
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
            <v-select v-model="vueSelected.filter" :options="filterOpts" class="ml-2 inputSelect vue-options" :style="vueSelectStyle">
              <template slot="selected-option" slot-scope="option">
                {{ vueSelectCutOn(option) }}
              </template>
              <template slot="no-options">
                {{ vueSelectNoMatchingOptions }}
              </template>
            </v-select>
          </span>
        </b-form-row>
        <b-form-row class="my-1 ml-2 ml-sm-0">
          <toggle-button class="mr-2 mt-2" :value="isWeek"
          :color="{checked: '#66cdaa', unchecked: '#87cefa', disabled: '#cccccc'}"
          :sync="true"
          :labels="{checked: $t('label.week'), unchecked: $t('label.month')}"
          @change="onChangeToggle"/>
          <date-picker
            ref="datePicker"
            v-show="true"
            v-model="today"
            :type="datePickerType"
            :format="datePickerFormat"
            size="large"
            style="width: 135px;"
            :placeholder="datePickerPlaceholder"
            @blur="onDatePickerBlur"
            >
          </date-picker>
        </b-form-row>
      </b-form>
    </b-row>
    <b-row class="mt-2 mb-3">
      <b-form inline @submit.prevent>
        <b-form-row class="ml-3 ml-sm-3">
          <b-button v-t="'label.display'" :variant="theme" class="mx-1" @click="onClickDisplay" />
          <b-button v-if="!iosOrAndroid && bulkReferenceable" v-t="'label.download'" :variant="theme" class="mx-1" @click="exportCsv" />
        </b-form-row>
      </b-form>
    </b-row>
    <div>
      <b-table sticky-header :items="tItems" :fields="tFields" :current-page="currentPage" :per-page="perPage" :sort-compare="defaultSortCompare" stacked="md" hover outlined>
        <template slot="graph" slot-scope="row">
          <div class="progress">
              <div class="progress-bar" :style="{width: row.item.indicator <= 100 ? row.item.indicator +'%' : '100%'}">  
                  <span>{{ row.item.indicator }}%</span>
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
import { CATEGORY } from '../../sub/constant/Constants'
import { DatePicker } from 'element-ui'
import { importElementUI } from '../../sub/helper/ui/ViewHelper'
import 'element-ui/lib/theme-chalk/index.css'
import { ToggleButton } from 'vue-js-toggle-button'
import { getCharSet } from '../../sub/helper/base/CharSetHelper'
import * as BrowserUtil from '../../sub/util/BrowserUtil'

export default {
  mixins: [commonmixin],
  components: {
    breadcrumb, DatePicker, ToggleButton
  },
  data () {
    return {
      name: 'planActual',
      id: 'planActualId',
      appServicePath: '/office/plans/indicators',
      items: ViewHelper.createBreadCrumbItems('sumTitle', 'planActual'),

      isWeek: true,
      indicatorTypeOpts: [
        {value:0, label: '予約率（予約時間／就業時間）'},
        {value:1, label: '稼働率（稼働／就業時間）'},
        {value:2, label: '予約稼働率（利用／予約時間）'},
        {value:3, label: '予約外利用率（予約外利用／就業時間）'},
        {value:4, label: '空予約回数'},
      ],
      indicatorTypeFilter: null,

      currentPage: 1,
      perPage: 20,
      totalRows: 0,
      tFields: [
        {key: 'name', sortable: true, label: this.$i18n.tnl('label.name')},
        {key: 'indicator', sortable: true, label: this.$i18n.tnl('label.indicator')},
        {key: 'graph', sortable: false, label: this.$i18n.tnl('label.graph'), thStyle: {height: '50px !important', width:'400px !important'} },
        {key: 'hour', sortable: true, label: this.$i18n.tnl('label.hour')},
      ],
      tItems: [],

      // カレンダー
      today: moment().format("YYYY-MM-DD"),
      isWeek: true,
      datePickerType: 'week',
      datePickerFormatWeek: 'week WW',
      datePickerFormatMonth: 'MMM',
      datePickerFormat: null,
      datePickerPlaceholderWeek: this.$t('label.week'),
      datePickerPlaceholderMonth: this.$t('label.month'),
      datePickerPlaceholder: null,

      // マスタ情報
      loadStates: ['area', 'zone', 'location', 'category', 'pot'],
      zoneCategoryOpts: [],
      potThingOpts: [],

      // フィルター
      filterTypeOpts: [
        {value:null, text: ''},
        {value:'areas', text: this.$t('label.area')},
        {value:'zones', text: this.$t('label.zone')},
        {value:'locations', text: this.$t('label.location')},
        {value:'categories', text: this.$t('label.zoneCategory')},
        {value:'pots', text: this.$t('label.potThing')},
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
  },
  watch: {
    datePickerPlaceholder() {
      return this.isWeek ? this.datePickerPlaceholderWeek : this.datePickerPlaceholderMonth
    },
    datePickerFormat() {
      return this.isWeek ? this.datePickerFormatWeek : this.datePickerFormatMonth 
    },
    'vueSelected.filterType': {
      handler: function(newVal, oldVal){
        console.log('vueSelected')
        this.selectedFilter.filterType = newVal
        this.selectedFilter.filterId = null
        this.vueSelected.filter = null
        if (newVal == 'category') {
          this.filterOpts = this.zoneCategoryOpts
        } else if (newVal == 'pot') {
          this.filterOpts = this.potThingOpts
        } else {
          this.filterOpts = this.getOpts(newVal)
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
    this.indicatorTypeFilter = this.indicatorTypeOpts[0]
    this.loadMaster()
  },
  async mounted() {
    importElementUI()
  },
  methods: {
    onChangeToggle(e) {
      this.isWeek = !this.isWeek
      this.datePickerType = this.isWeek ? 'week' : 'month'
    },
    onDatePickerBlur(e) {
      const picker = this.$refs.datePicker
      if (!picker.value['getDate']) {
        return
      }
    },
    // マスタ
    async loadMaster() {
      await Promise.all(this.loadStates.map(state => StateHelper.load(state)))
      this.zoneCategoryOpts = this.categories.filter(cate => cate.categoryType == CATEGORY.ZONE)
      this.potThingOpts = this.pots.filter(pot => pot.potType == CATEGORY.THING)
    },
    getOpts(master) {
      return this[master]
    },
    onClickDisplay(e) {
      this.fetchData()
    },
    async fetchData() {
      try {
        const picker = this.$refs.datePicker
        if (!picker.value['getDate']) {
          return
        }
        const [startDt, endDt] = this.getDateRange()
        this.tItems = []
        let uri = `${this.appServicePath}?startDt=${startDt}&endDt=${endDt}&indicatorType=${this.indicatorTypeFilter.value}&workingTimeType=range`
        if (this.selectedFilter.filterType && this.selectedFilter.filterId) {
          uri = `${uri}&filterType=${this.selectedFilter.filterType}&filterId=${this.selectedFilter.filterId}`
        }
        const data = await HttpHelper.getAppService(uri)
        this.loadIndicators(data)
      }
      catch(err) {
        console.error(err)
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
      const picker = this.$refs.datePicker
      if (!picker.value['getDate']) {
        return
      }
      const [startDt, endDt] = this.getDateRange()
      let uri = `${APP_SERVICE.BASE_URL}${this.appServicePath}?}/csvdownload?charset=${getCharSet(this.$store.state.loginId)}&startDt=${startDt}&endDt=${endDt}&indicatorType=${this.indicatorTypeFilter.value}`
      if (this.selectedFilter.filterType && this.selectedFilter.filterId) {
        uri += `&filterType=${this.selectedFilter.filterType}&filterId=${this.selectedFilter.filterId}`
      }
      BrowserUtil.executeFileDL(uri)
    },
    loadIndicators(data) {
      const arr = data.indicators.map((e) => {
        switch (this.indicatorTypeFilter.value) {
          case 0: // 予約率（予約時間／就業時間）
          case 1: // 稼働率（稼働／就業時間）
          case 3: // 予約外利用率（予約外利用／就業時間）
            return { 
              name: e.targetName, 
              indicator: e.value / data.sumOfWorkingHours * 100, 
              hour: e.value
            }
          case 2:
            // 予約稼働率（利用／予約時間）
            return { 
              name: e.targetName, 
              indicator: e.value / data.sumOfReservationHours * 100, 
              hour: e.value
            }
          case 4:
            // 空予約率（空予約数／予約数）
            return { 
              name: e.targetName, 
              indicator: e.value / e.scheduleNum * 100, 
              hour: e.value
            }
        }
      })
      this.totalRows = arr.length
      this.tItems = arr
    },
  }
}
</script>
<style>
.progress{
    margin-bottom: 0px;
    /* height: 30px; */
    width: 440px!important;
    border-radius: 0px;
}
.progress-bar{
    background-color: #A8C0DE;
    color :#333;
    text-align: right;
}
.vue-options-lg-aa {
  margin-left: 0px;
  width: 100% !important;
}
</style>