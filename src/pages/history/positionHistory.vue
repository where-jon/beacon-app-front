<template>
  <div>
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <alert :message="message" />

      <div class="mapContainer mb-5">
        <b-form inline @submit.prevent>
          <b-form-group class="mr-5">
            <b-form-row>
              <b-form-row class="mb-3 mr-2">
                <label v-t="'label.minor'" class="mr-2" />
                <v-select v-model="form.tx" :options="txOptions" class="mr-2">
                  <div slot="no-options">
                    {{ $i18n.tnl('label.vSelectNoOptions') }}
                  </div>
                </v-select>
              </b-form-row>
            </b-form-row>
          </b-form-group>
          <b-form-group v-if="enableGroup" class="mr-5">
            <b-form-row>
              <b-form-row class="mb-3 mr-2">
                <label v-t="'label.group'" class="mr-2" />
                <v-select v-model="form.group" :options="groupOptions" class="mr-2">
                  <div slot="no-options">
                    {{ $i18n.tnl('label.vSelectNoOptions') }}
                  </div>
                </v-select>
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
              <b-button v-if="!iosOrAndroid" v-t="'label.download'" :variant="theme" class="mx-1" @click="exportCsv" />
            </b-form-row>
          </b-form-group>
        </b-form>
        <slot />
        <b-row class="mt-3" />
        <b-table :items="viewList" :fields="fields" :current-page="currentPage" :per-page="perPage" :sort-by.sync="sortBy" stacked="md" striped hover outlined />
        <b-row>
          <b-col md="6" class="my-1">
            {{ footerMessage }}
          </b-col>
        </b-row>
        <b-row>
          <b-col md="6" class="my-1">
            <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" class="my-0" />
          </b-col>
        </b-row>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import alert from '../../components/parts/alert.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as HttpHelper from '../../sub/helper/HttpHelper'
import * as ViewHelper from '../../sub/helper/ViewHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import { getTheme } from '../../sub/helper/ThemeHelper'
import { getCharSet } from '../../sub/helper/CharSetHelper'
import { APP } from '../../sub/constant/config.js'
import { APP_SERVICE } from '../../sub/constant/config'


export default {
  components: {
    breadcrumb,
    alert,
    DatePicker,
  },
  mixins: [showmapmixin ],
  data () {
    return {
      name: 'positionHistory',
      items: ViewHelper.createBreadCrumbItems('historyTitle', 'positionHistory'),
      form: {
        tx: null,
        group: null,
        datetimeFrom: null,
        datetimeTo: null,
      },
      viewList: [],
      fields: ViewHelper.addLabelByKey(this.$i18n, [
        {key: 'positionDt', sortable: true, label:'dt'},
        {key: 'txName', sortable: true },
        {key: 'major', sortable: true },
        {key: 'minor', sortable: true },
        APP.EXB_WITH_EXBID? {key: 'exbId', sortable: true }: null,
        APP.EXB_WITH_DEVICE_NUM? {key: 'deviceNum', sortable: true }: null,
        APP.EXB_WITH_DEVICE_ID? {key: 'deviceId', sortable: true }: null,
        APP.EXB_WITH_DEVICE_IDX? {key: 'deviceIdX', sortable: true }: null,
        {key: 'locationName', label:'locationZoneName', sortable: true,},
        APP.EXB_WITH_POSID? {key: 'posId', label:'posId', sortable: true,}: null,
        {key: 'areaName', label:'area', sortable: true,},
        {key: 'x', sortable: true, label:'locationX'},
        {key: 'y', sortable: true, label:'locationY'},
      ]),
      currentPage: 1,
      perPage: 20,
      limitViewRows: 100,
      totalRows: 0,
      sortBy: null,
      //
      message: '',
      footerMessage: '',
    }
  },
  computed: {
    theme () {
      const theme = getTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'txs', 'exbs'
    ]),
    txOptions() {
      return StateHelper.getOptionsFromState('tx',
        tx => tx.minor ? '' + tx.minor : 'txid=' + tx.txId,
        true
      )
    },
    enableGroup () {
      return this.isEnabledMenu('group') && APP.POT_WITH_GROUP
    },
    groupOptions() {
      return StateHelper.getOptionsFromState('group',
        group => group.groupName,
        true
      )
    },
  },
  async created() {
    StateHelper.load('group')
    const date = new Date()
    this.form.datetimeFrom = Util.getDatetime(date, {hours: -1})
    this.form.datetimeTo = Util.getDatetime(date)
  },
  mounted() {
    HtmlUtil.importElementUI()
    StateHelper.load('tx')
    StateHelper.load('exb')
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
        const aTxId = (this.form.tx != null && this.form.tx.value != null)?this.form.tx.value:0
        console.log(aTxId)
        const aGroupId = (this.form.group != null && this.form.group.value != null)? this.form.group.value: 0
        var fetchList = await HttpHelper.getAppService(
          `/core/positionHistory/find/${aGroupId}/${aTxId}/${this.form.datetimeFrom.getTime()}/${this.form.datetimeTo.getTime()}/${this.limitViewRows}`
        )
        if (fetchList.length == null || !fetchList.length) {
          this.message = this.$i18n.tnl('message.notFoundData', {target: this.$i18n.tnl('label.positionHistory')})
          this.replace({showAlert: true})
          return
        }
        for (var posHist of fetchList) {
          const d = new Date(posHist.positionDt)
          posHist.positionDt = Util.formatDate(d.getTime())
          posHist.txName = Util.getValue(posHist, 'tx.txName', '')
          posHist.deviceId = Util.getValue(posHist, 'exb.deviceId', '')
          posHist.deviceNum =  Util.getValue(posHist, 'exb.deviceId', 0) - this.$store.state.currentRegion.deviceOffset
          posHist.deviceIdX = Util.getValue(posHist, 'exb.deviceId', 0).toString(16).toUpperCase()
          posHist.locationName = Util.getValue(posHist, 'exb.location.locationName', '')
          posHist.posId = Util.getValue(posHist, 'exb.location.posId', '')
          posHist.areaName = Util.getValue(posHist, 'exb.location.area.areaName', '')
          posHist.x = Util.getValue(posHist, 'exb.location.x', '')
          posHist.y = Util.getValue(posHist, 'exb.location.y', '')
          this.viewList.push(posHist)
        }
        this.totalRows = this.viewList.length
        this.footerMessage = `${this.$i18n.tnl('message.totalRowsMessage', {row: this.viewList.length, maxRows: this.limitViewRows})}`
      } catch(e) {
        console.error(e)
      }
    },
    reset() {
      this.isShownMapImage = false
    },
    async fetchData(payload) {
    },
    async exportCsv() {
      const aTxId = (this.form.tx != null && this.form.tx.value != null)?this.form.tx.value:0
      const aGroupId = (this.form.group != null && this.form.group.value != null)? this.form.group.value: 0
      HtmlUtil.executeFileDL(
        APP_SERVICE.BASE_URL
        + `/core/positionHistory/csvdownload/${aGroupId}/${aTxId}/${this.form.datetimeFrom.getTime()}/${this.form.datetimeTo.getTime()}/` 
        + getCharSet(this.$store.state.loginId)
      )
    },
  }
}
</script>
