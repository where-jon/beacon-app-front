<template>
  <div class="container">
    <breadcrumb :items="breadCrumbs" :reload="false" />
    <alert :message="message" />
    <b-row class="mt-2">
      <b-form inline @submit.prevent>
        <b-form-row class="my-1 ml-2 ml-sm-0">
          <label class="ml-sm-4 ml-2 mr-1">
            {{ $t('label.mode') }}
          </label>
          <span :title="vueSelectTitle(planModeFilter)">
            <v-select v-model="planModeFilter" :options="planModeOpts" :clearable="false" class="ml-1 mr-2 vue-options" :style="vueSelectStyle">
              <template slot="selected-option" slot-scope="option">
                {{ vueSelectCutOn(option, true) }}
              </template>
              <template slot="no-options">
                {{ vueSelectNoMatchingOptions }}
              </template>
            </v-select>
          </span>
        </b-form-row>
      </b-form>
    </b-row>
    <b-row class="mt-2 mb-2">
      <b-form inline @submit.prevent>
        <b-form-row class="my-1 ml-2 ml-sm-0">
          <label v-t="'label.historyDateFrom'" class="ml-sm-4 ml-2 mr-2" />
          <date-picker v-model="form.datetimeFrom" :clearable="false" type="datetime" class="mr-2 inputdatefrom" required />
          <label v-t="'label.historyDateTo'" class="mr-2" />
          <date-picker v-model="form.datetimeTo" :clearable="false" type="datetime" class="mr-2 inputdateto" required />
        </b-form-row>
        <b-form-row class="my-1 ml-5 ml-sm-5">
          <b-button v-t="'label.display'" :variant="theme" class="mx-1" @click="display" />
          <b-button v-if="!iosOrAndroid && bulkReferenceable" v-t="'label.download'" :variant="theme" class="mx-1" :disabled="!tItems || tItems.length == 0" @click="exportCsv" />
        </b-form-row>
      </b-form>
    </b-row>
    <div>
      <b-table :items="tItems" :fields="tFields" :current-page="currentPage" :per-page="perPage"  :sort-by.sync="sortBy" :sort-compare="defaultSortCompare" stacked="md" striped hover outlined >
      </b-table>
      <b-row>
          <b-col md="6" class="my-1">
            {{ footerMessage }}
          </b-col>
        </b-row>
      <b-row>
        <b-col md="6" class="mt-1 mb-3">
          <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" class="my-0"/>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import { getCharSet } from '../../sub/helper/base/CharSetHelper'
import { DatePicker } from 'element-ui'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import {POT_TYPE, SETTING} from '../../sub/constant/Constants'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../../components/mixin/commonmixin.vue'
import 'element-ui/lib/theme-chalk/index.css'
import moment from 'moment'
import { APP, DISP, APP_SERVICE } from '../../sub/constant/config'
import * as DateUtil from '../../sub/util/DateUtil'
import alert from '../../components/parts/alert.vue'

export default {
  mixins: [commonmixin],
  components: {
    breadcrumb, DatePicker, alert
  },
  data () {
    return {
      name: 'planActualHistory',
      appServicePath: '/office/plans/histories',
      breadCrumbs: ViewHelper.createBreadCrumbItems('historyTitle', 'planActualHistory'),
      planModeOpts: [
        {value: 0, label: this.$t('label.plan')},
        {value: 1, label: this.$t('label.actual')},
      ],
      planModeFilter: null,
      message: '',

      form: {
        datetimeFrom: null,
        datetimeTo: null,
      },

      footerMessage: null,
      tItems: [],
      currentPage: 1,
      perPage: 20,
      totalRows: 0,
      rowlimit: 100,
      tFields: [],
      tFieldsPlan: [
        {key: 'planName', sortable: true, label: this.$i18n.tnl('label.planName')},
        {key: 'startDt', sortable: true, label: this.$i18n.tnl('label.dt') + '(' + this.$i18n.tnl('label.start') + ')'},
        {key: 'endDt', sortable: true, label: this.$i18n.tnl('label.dt') + '(' + this.$i18n.tnl('label.end') + ')'},
        {key: 'zone', sortable: true, label: this.$i18n.tnl('label.zoneName')},
        {key: 'location', sortable: true, label: this.$i18n.tnl('label.locationName')},
        {key: 'potPerson', sortable: true, label: this.$i18n.tnl('label.potPerson')},
        {key: 'potThing', sortable: true, label: this.$i18n.tnl('label.potThing')},
      ],
      tFieldsActual: [
        {key: 'startDt', sortable: true, label: this.$i18n.tnl('label.dt') + '(' + this.$i18n.tnl('label.start') + ')'},
        {key: 'endDt', sortable: true, label: this.$i18n.tnl('label.dt') + '(' + this.$i18n.tnl('label.end') + ')'},
        {key: 'zone', sortable: true, label: this.$i18n.tnl('label.zoneName')},
        {key: 'location', sortable: true, label: this.$i18n.tnl('label.locationName')},
        {key: 'potPerson', sortable: true, label: this.$i18n.tnl('label.potPerson')},
        {key: 'potThing', sortable: true, label: this.$i18n.tnl('label.potThing')},
      ],
      sortBy: null,
    }
  },
  watch: {
    planModeFilter: {
      handler: function(newVal, oldVal){
        this.tItems = []
        if (this.planModeFilter.value == 0) { // plan
          this.tFields = this.tFieldsPlan
        } else {
          this.tFields = this.tFieldsActual
        }
      },
      deep: false,
    },
  },
  created() {
    this.planModeFilter = this.planModeOpts[0]
  },
  mounted() {
    ViewHelper.importElementUI()
    this.footerMessage = `${this.$i18n.tnl('message.totalRowsMessage', {row: this.tItems.length, maxRows: this.rowlimit})}`
    const now = moment(DateUtil.getDefaultDate(),SETTING.DATE_NOTATION)
    this.form.datetimeFrom = now.set({hour:0,minute:0,second:0,millisecond:0}).toDate()
    this.form.datetimeTo = now.set({hour:23,minute:59,second:59,millisecond:999}).toDate()
  },
  methods: {
    async display() {
      try {
        const df = 'YYYY-MM-DDTHH:mm:ss.SSS'
        const startDt = moment(this.form.datetimeFrom).format(df)
        const endDt = moment(this.form.datetimeTo).format(df)
        const data = await HttpHelper.getAppService(`${this.appServicePath}?startDt=${startDt}&endDt=${endDt}&isActual=${this.planModeFilter.value}&limit=${this.rowlimit}`)
        if (Array.isArray(data)) {
          if (data.length == 0) {
            this.message = this.$i18n.tnl('message.notFoundData', {target: this.planModeFilter.label})
            this.replace({showAlert: true})
            window.scrollTo(0, 0)
          } else {
            this.replace({showAlert: false})
          }
          this.loadData(data)
        }
      }
      catch(e) {
        console.error(e)
        this.message = e.response.data
        this.replace({showAlert: true})
        window.scrollTo(0, 0)
      }
    },
    loadData(data) {
      const df = 'YYYY-MM-DD HH:mm'
      const arr = []
      data.forEach((e) => {
        let potType = null
        if (e.potCategoryType) {
          if (e.potCategoryType == POT_TYPE.PERSON) {
            potType = this.$i18n.tnl('label.person')
          } else {
            potType = this.$i18n.tnl('label.thing')
          }
        }
        let obj = {
          startDt: moment(e.startDt).format(df),
          endDt: moment(e.endDt).format(df),
          zoneId: e.zoneId,
          zoneName: e.zoneName,
          locationId: e.locationId,
          locationName: e.locationName,
          potId: e.potId,
          potType: potType,
          potName: e.potName,
          zone: e.zoneName == null ? '-' : e.zoneName,
          location: e.locationName == null ? '-' : e.locationName,
          potPerson: e.potCategoryType && e.potCategoryType == POT_TYPE.PERSON ? e.potName : '-',
          potThing: e.potCategoryType && e.potCategoryType == POT_TYPE.THING ? e.potName : '-',
        }
        if (this.planModeFilter.value == 0) { // plan
          obj.planId = e.planId
          obj.planName = e.planName
        } else { // actual
          obj.stayTimeId = e.stayTimeId
        }
        arr.push(obj)
      })
      this.totalRows = arr.length
      this.tItems = arr
      this.footerMessage = `${this.$i18n.tnl('message.totalRowsMessage', {row: this.tItems.length, maxRows: this.rowlimit})}`
    },
    getCsvCols() {
      const start = this.$i18n.tnl('label.dt') + '(' + this.$i18n.tnl('label.start') + ')'
      const end = this.$i18n.tnl('label.dt') + '(' + this.$i18n.tnl('label.end') + ')'

      const cols = [start, end, this.$i18n.tnl('label.zoneId'), this.$i18n.tnl('label.zoneName'), this.$i18n.tnl('label.locationId'), this.$i18n.tnl('label.locationName'), this.$i18n.tnl('label.potId'), this.$i18n.tnl('label.type'), this.$i18n.tnl('label.potName')]

      if (this.planModeFilter.value == 0) {
        return [this.$i18n.tnl('label.planId'), this.$i18n.tnl('label.planName')].concat(cols)
      } else {
        return [this.$i18n.tnl('label.actual') + ' ID'].concat(cols)
      }
    },
    exportCsv() {
      const df = 'YYYY-MM-DD'
      const fromStr = moment(this.form.datetimeFrom).format(df)
      const toStr = moment(this.form.datetimeTo).format(df)
      const fileName = this.planModeFilter.value == 0 ? 'planHistory' : 'actualHistory'

      let csv = this.getCsvCols().join(',') + "\n"
      this.tItems.forEach(e => {
        let cols = [e.startDt, e.endDt, e.zoneId, e.zoneName, e.locationId, e.locationName, e.potId, e.potType, e.potName]
        if (this.planModeFilter.value == 0) {
          csv += [e.planId, e.planName].concat(cols).join(',') + "\n"
        } else {
          csv += [e.stayTimeId].concat(cols).join(',') + "\n"
        }
      })
      BrowserUtil.fileDL(
        `${fromStr}_${toStr}_${fileName}.csv`,
        csv,
        getCharSet(this.$store.state.loginId)
      )
    }
  }
}
</script>
<style scoped lang="scss">
@import "../../sub/constant/vue.scss";
</style>
