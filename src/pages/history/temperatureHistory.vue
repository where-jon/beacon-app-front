<template>
  <div class="container-fluid">
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <alert :message="message" />

      <b-form @submit.prevent>
        <b-form-group>
          <b-form-row>
            <b-form-row class="mr-2">
              <label v-t="'label.historyDateFrom'" class="mr-2 mb-2 d-flex align-items-center" />
              <b-form-input v-if="useInputDate" v-model="inputDateFrom" type="date" required class="mb-2 inputdatefrom" />
              <date-picker v-else v-model="dateFrom" type="date" value-format="yyyyMMdd" class="mr-2 mb-2 inputdatefrom" />
            </b-form-row>
            <b-form-row class="mr-2">
              <label v-t="'label.historyDateTo'" class="mr-2 mb-2 d-flex align-items-center" />
              <b-form-input v-if="useInputDate" v-model="inputDateTo" type="date" required class="mb-2 inputdateto" />
              <date-picker v-else v-model="dateTo" type="date" value-format="yyyyMMdd" class="mb-2 inputdateto" />
            </b-form-row>
          </b-form-row>
        </b-form-group>
        <b-form-group>
          <b-form-row>
            <b-form-row class="mr-2 mb-3">
              <label v-t="'label.zoneCategoryName'" class="mr-2 mb-2 d-flex align-items-center" />
              <v-select v-model="vModelCategory" :options="categoryOptions" :on-change="categoryChange" required class="ml-2 mb-2 vue-options" :style="vueSelectStyle">
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </b-form-row>
            <b-form-row class="mb-2">
              <label v-t="'label.zone'" class="mr-2 mb-2 d-flex align-items-center" />
              <v-select v-model="vModelZone" :options="zoneOptions" :on-change="zoneChange" required class="ml-2 mb-2 vue-options" :style="vueSelectStyle">
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </b-form-row>
          </b-form-row>
        </b-form-group>
        <b-form-group>
          <b-form-radio-group v-model="historyType">
            <b-form-radio :value="0">
              {{ $t('label.temperatureHistoryType0') }}
            </b-form-radio>
            <b-form-radio :value="1">
              {{ $t('label.temperatureHistoryType1') }}
            </b-form-radio>
          </b-form-radio-group>
        </b-form-group>
      </b-form>
      <p />
      <b-row>
        <b-col md="10" offset-md="2">
          <b-button v-if="!iosOrAndroid" v-t="'label.download'" :variant="theme" @click="download()" />
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as CsvUtil from '../../sub/util/CsvUtil'
import * as DateUtil from '../../sub/util/DateUtil'
import * as DomUtil from '../../sub/util/DomUtil'
import * as NumberUtil from '../../sub/util/NumberUtil'
import * as Util from '../../sub/util/Util'
import * as AppServiceHelper from '../../sub/helper/dataproc/AppServiceHelper'
import { getCharSet } from '../../sub/helper/base/CharSetHelper'
import * as OptionHelper from '../../sub/helper/dataproc/OptionHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../../components/mixin/commonmixin.vue'
import reloadmixin from '../../components/mixin/reloadmixin.vue'
import alert from '../../components/parts/alert.vue'

export default {
  components: {
    DatePicker,
    breadcrumb,
    alert,
  },
  mixins: [commonmixin, reloadmixin],
  data () {
    return {
      items: ViewHelper.createBreadCrumbItems('historyTitle', 'thermohumidity'),
      message: '',
      vModelCategory: null,
      vModelZone: null,
      vModelYearMonth: null,
      vModelDay: null,
      categoryOptionList: [{label:'', value:null}],
      zoneOptionList: [],
      //
      zoneCategorys: [],
      categoryId: null,
      zoneId: null,
      inputDateFrom: DateUtil.getDatetime(new Date(), null, 'yyyy-MM-dd'),
      inputDateTo: DateUtil.getDatetime(new Date(), null, 'yyyy-MM-dd'),
      dateFrom: DateUtil.getDatetime(new Date(), null, 'yyyyMMdd'),
      dateTo: DateUtil.getDatetime(new Date(), null, 'yyyyMMdd'),
      historyType: 0,
      temperatureHistoryData: null,
      //
      useInputDate: DomUtil.supportInputType('date'),
    }
  },
  computed: {
    categoryOptions() {
      return this.categoryOptionList
    },
    zoneOptions() {
      return this.zoneOptionList
    },
    ...mapState('monitor', [
      'temperatureHistory',
    ]),
  },
  watch: {
    inputDateFrom: function(newVal, oldVal) {
      this.dateFromChange(newVal)
    },
    inputDateTo: function(newVal, oldVal) {
      this.dateToChange(newVal)
    },
  },
  async mounted() {
    ViewHelper.importElementUI()
    await StateHelper.load('category')
    this.fetchPrev()
  },
  methods: {
    async fetchZoneCategoryList() {
      try {
        this.zoneCategorys = await AppServiceHelper.fetch(
          '/core/zone/categoryList',
          ''
        )
        Util.debug(this.zoneCategorys)
        this.categoryOptionList = OptionHelper.getZoneCategoryOptions(this.zoneCategorys)
      } catch(e) {
        console.error(e)
      }
    },
    async fetchPrev() {
      await this.fetchZoneCategoryList()
      this.categoryChange(null)
    },
    categoryChange(val) {
      this.zoneOptionList = OptionHelper.getZoneOptions(this.zoneCategorys, val)
      if (val == null) {
        this.categoryId = null
        this.vModelCategory = null
      } else {
        this.categoryId = val.value
        this.vModelCategory = val
      }
      this.vModelZone = null
    },
    zoneChange(val) {
      if (val == null) {
        this.zoneId = null
        this.vModelZone = null
      } else {
        this.zoneId = val.value
        this.vModelZone = val
      }
    },
    dateFromChange(val) {
      if (val == null) {
        this.dateFrom = '0'
      } else {
        this.dateFrom = val.substr(0, 4) + val.substr(5, 2) + val.substr(8, 2)
      }
    },
    dateToChange(val) {
      if (val == null) {
        this.dateTo = '0'
      } else {
        this.dateTo = val.substr(0, 4) + val.substr(5, 2) + val.substr(8, 2)
      }
    },
    typeChange(val) {
      if (val == null) {
        this.historyType = 0
      } else {
        this.historyType = val.value
      }
    },
    convertParamDate(fromTime, toTime){
      const retFrom = new Date(fromTime.slice(0, 4), parseInt(fromTime.slice(4, 6)) - 1, fromTime.slice(6, 8))
      const retTo = new Date(toTime.slice(0, 4), parseInt(toTime.slice(4, 6)) - 1, parseInt(toTime.slice(6, 8)) + 1)
      return {from: retFrom.getTime(), to: retTo.getTime() - 1}
    },
    async dataDownload() {
      const paramCategoryId = (this.categoryId != null)?this.categoryId:-1
      const paramZoneId = (this.zoneId != null)?this.zoneId:-1
      const paramExbId = -1
      const paramIsExb = -1
      const paramDate = this.convertParamDate(this.dateFrom, this.dateTo)
      const paramDyFrom = paramDate.from
      const paramDyTo = paramDate.to
      const paramHistoryType = this.historyType
      let list = []
      try {
        list = await AppServiceHelper.fetch(
          `/basic/sensorHistory/${paramCategoryId}/${paramZoneId}/${paramIsExb}/${paramExbId}/${paramDyFrom}/${paramDyTo}/${paramHistoryType}`,
          ''
        )
        if (list.length == null) {
          return []
        }
        list.forEach(data => {
          if(data.temperature){
            data.temperature = NumberUtil.formatTemperature(data.temperature)
          }
          if(data.humidity){
            data.humidity = NumberUtil.formatHumidity(data.humidity)
          }
          if(data.dt){
            data.dt = DateUtil.formatDate(new Date(data.dt))
          }
          delete data['sensorHistoryId']
          delete data['sensorDt']
        })
      } catch (e) {
        console.error(e)
        list = []
      }
      return list
    },
    async download() {
      this.replace({showAlert: false})
      this.replace({showInfo: false})
      if (this.dateFrom == 0 || this.dateTo == 0 || !Util.hasValue(this.dateFrom) || !Util.hasValue(this.dateTo)) {
        this.message = this.$i18n.tnl('message.required', {target: this.$i18n.tnl('label.historyDateFrom')})
        this.replace({showAlert: true})
        return
      }
      this.temperatureHistoryData = await this.dataDownload()
      if (this.temperatureHistoryData == null || this.temperatureHistoryData.length == 0) {
        this.message = this.$i18n.tnl('message.notFound')
        this.replace({showAlert: true})
        return
      }
      BrowserUtil.fileDL(
        'temperatureHistory.csv',
        CsvUtil.converToCsv(this.temperatureHistoryData),
        getCharSet(this.$store.state.loginId)
      )
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/input.scss";
@import "../../sub/constant/vue.scss";
</style>
