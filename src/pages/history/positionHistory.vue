<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" :reload="false" />
    <div class="container">
      <alert :message="message" />

      <div class="mapContainer mb-5">
        <b-form inline @submit.prevent>
          <b-form-group class="mr-5">
            <b-form-row>
              <b-form-row class="mb-3 mr-2">
                <label v-t="'label.minor'" class="mr-2" />
                <v-select v-model="form.tx" :options="txOptions" class="mr-2 vue-options" :style="vueSelectStyle">
                  <template slot="no-options">
                    {{ vueSelectNoMatchingOptions }}
                  </template>
                </v-select>
              </b-form-row>
            </b-form-row>
          </b-form-group>
          <b-form-group v-if="enableGroup" class="mr-5">
            <b-form-row>
              <b-form-row class="mb-3 mr-2">
                <label v-t="'label.group'" class="mr-2" />
                <span :title="vueSelectTitle(form.group)">
                  <v-select v-model="form.group" :options="groupOptions" class="mr-2 vue-options" :style="vueSelectStyle">
                    <template slot="selected-option" slot-scope="option">
                      {{ vueSelectCutOn(option) }}
                    </template>
                    <template slot="no-options">
                      {{ vueSelectNoMatchingOptions }}
                    </template>
                  </v-select>
                </span>
              </b-form-row>
            </b-form-row>
          </b-form-group>
        </b-form>
        <b-form inline @submit.prevent>
          <b-form-group class="mr-5">
            <b-form-row>
              <b-form-row class="mb-3 mr-2">
                <label v-t="'label.historyDateFrom'" class="mr-2" />
                <date-picker v-model="form.datetimeFrom" :clearable="false" type="datetime" class="mr-2 inputdatefrom" required />
              </b-form-row>
              <b-form-row class="mb-3 mr-2">
                <label v-t="'label.historyDateTo'" class="mr-2" />
                <date-picker v-model="form.datetimeTo" :clearable="false" type="datetime" class="mr-2 inputdateto" required />
              </b-form-row>
            </b-form-row>
          </b-form-group>
          <b-form-group>
            <b-form-row class="mb-3 mr-2">
              <b-button v-t="'label.display'" :variant="theme" class="mx-1" @click="display" />
              <b-button v-if="!iosOrAndroid && bulkReferenceable" v-t="'label.download'" :variant="theme" class="mx-1" @click="exportCsv" />
            </b-form-row>
          </b-form-group>
        </b-form>
        <slot />
        <b-row class="mt-3" />
        <b-table :items="viewList" :fields="fields" :current-page="currentPage" :per-page="perPage" :sort-by.sync="sortBy" :sort-compare="defaultSortCompare" stacked="md" striped hover outlined />
        <b-row>
          <b-col md="6" class="my-1">
            {{ footerMessage }}
          </b-col>
        </b-row>
        <b-row>
          <b-col md="6" class="mt-1 mb-3">
            <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" class="my-0" />
          </b-col>
        </b-row>
      </div>
    </div>
  </div>
</template>

<script>
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import { APP, DISP, APP_SERVICE } from '../../sub/constant/config'
import * as ArrayUtil from '../../sub/util/ArrayUtil'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as DateUtil from '../../sub/util/DateUtil'
import * as Util from '../../sub/util/Util'
import { getCharSet } from '../../sub/helper/base/CharSetHelper'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import * as MenuHelper from '../../sub/helper/dataproc/MenuHelper'
import * as MasterHelper from '../../sub/helper/domain/MasterHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../../components/mixin/commonmixin.vue'
import alert from '../../components/parts/alert.vue'


export default {
  components: {
    DatePicker,
    breadcrumb,
    alert,
  },
  mixins: [commonmixin],
  data () {
    return {
      name: 'positionHistory',
      breadCrumbs: ViewHelper.createBreadCrumbItems('historyTitle', 'positionHistory'),
      fields: ViewHelper.addLabelByKey(this.$i18n, [
        {key: 'positionDt', sortable: true, label:'dt'},
        ...DISP.POSITION_HISTORY.HEADERS.map(header => {
          const ret = { key: header, sortable: true }
          if(header == 'areaName'){
            ret.label = 'area'
          }
          else if(header == 'locationName'){
            ret.label = 'locationZoneName'
          }
          return ret
        })
      ]),
      form: {
        tx: null,
        group: null,
        datetimeFrom: null,
        datetimeTo: null,
      },
      message: '',
      footerMessage: '',
      //
      viewList: [],
      currentPage: 1,
      perPage: 20,
      limitViewRows: 100,
      totalRows: 0,
      sortBy: null,
    }
  },
  computed: {
    txOptions() {
      return MasterHelper.getOptionsFromState('tx',
        tx => tx.minor ? '' + tx.minor : 'txid=' + tx.txId,
        true
      )
    },
    enableGroup () {
      return MenuHelper.isEnabledMenu('group') && ArrayUtil.includesIgnoreCase(APP.POT.WITH, 'group')
    },
    groupOptions() {
      return MasterHelper.getOptionsFromState('group',
        group => group.groupName,
        true
      )
    },
  },
  created() {
    const date = DateUtil.getDefaultDate()
    this.form.datetimeFrom = DateUtil.getDatetime(date, {hours: -1})
    this.form.datetimeTo = DateUtil.getDatetime(date)
  },
  mounted() {
    ViewHelper.importElementUI()
    this.footerMessage = `${this.$i18n.tnl('message.totalRowsMessage', {row: this.viewList.length, maxRows: this.limitViewRows})}`
  },
  methods: {
    async display() {
      this.container ? this.container.removeAllChildren() : null
      await this.displayImpl()
      this.stage ? this.stage.update() : null
    },
    async displayImpl(){
      this.replace({showAlert: false})
      this.viewList = []
      this.totalRows = 0
      this.footerMessage = `${this.$i18n.tnl('message.totalRowsMessage', {row: this.viewList.length, maxRows: this.limitViewRows})}`
      try {
        const txId = (this.form.tx != null && this.form.tx.value != null)?this.form.tx.value:0
        const groupId = (this.form.group != null && this.form.group.value != null)? this.form.group.value: 0
        var fetchList = await HttpHelper.getAppService(
          `/core/positionHistory/find/${groupId}/${txId}/${this.form.datetimeFrom.getTime()}/${this.form.datetimeTo.getTime()}/${this.limitViewRows}`
        )
        if (fetchList.length == null || !fetchList.length) {
          this.message = this.$i18n.tnl('message.notFoundData', {target: this.$i18n.tnl('label.positionHistory')})
          this.replace({showAlert: true})
          return
        }
        for (var posHist of fetchList) {
          const d = new Date(posHist.positionDt)
          posHist.positionDt = DateUtil.formatDateWithTimeZone(d.getTime())
          const tx = this.txIdMap[posHist.txId]
          posHist.potName = Util.getValue(tx, 'pot.potName', '')
          posHist.major = Util.getValue(tx, 'major', '')
          posHist.minor = Util.getValue(tx, 'minor', '')
          const exb = this.exbIdMap[posHist.exbId]
          posHist.deviceId = Util.getValue(exb, 'deviceId', '')
          posHist.deviceIdX = Util.getValue(exb, 'deviceIdX', 0)
          posHist.locationName = Util.getValue(exb, 'locationName', '')
          posHist.areaName = Util.getValue(exb, 'areaName', '')
          posHist.x = Util.getValue(exb, 'x', '')
          posHist.y = Util.getValue(exb, 'y', '')
          this.viewList.push(posHist)
        }
        this.totalRows = this.viewList.length
        this.footerMessage = `${this.$i18n.tnl('message.totalRowsMessage', {row: this.viewList.length, maxRows: this.limitViewRows})}`
      } catch(e) {
        console.error(e)
      }
    },
    async fetchData(payload) {
    },
    async exportCsv() {
      const txId = (this.form.tx != null && this.form.tx.value != null)?this.form.tx.value:0
      const groupId = (this.form.group != null && this.form.group.value != null)? this.form.group.value: 0
      const headerLabels = this.getCsvHeaderList()
      BrowserUtil.executeFileDL(
        APP_SERVICE.BASE_URL
        + `/core/positionHistory/csvdownload/${groupId}/${txId}/${this.form.datetimeFrom.getTime()}/${this.form.datetimeTo.getTime()}/` 
        + getCharSet(this.$store.state.loginId)
        + `?headerLabels=${headerLabels}`
      )
    },
    getCsvHeaderList() {
      const historyHeaders = DISP.POSITION_HISTORY.HEADERS.slice()
      historyHeaders.unshift('positionDt')
      return encodeURI(historyHeaders.map(header => {
        return header == 'locationName'? this.$i18n.tnl('label.locationZoneName'): this.$i18n.tnl('label.' + header)
      }).join(','))
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/vue.scss";
</style>
