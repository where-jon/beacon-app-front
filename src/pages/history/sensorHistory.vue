<template>
  <div>
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <b-alert variant="info" dismissible :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">
        <div v-html="message" />
      </b-alert>
      <div class="mapContainer mb-5">
        <b-form inline>
          <b-form-group class="mr-5">
            <b-form-row>
              <b-form-row class="mb-3 mr-2">
                <label v-t="'label.sensor'" class="mr-2"/>
                <b-form-select v-model="form.sensorId" :options="sensorOptions" class="mr-2"/>
              </b-form-row>
            </b-form-row>
          </b-form-group>
        </b-form>
        <b-form inline>
          <b-form-group class="mr-5">
            <b-form-row>
              <b-form-row class="mb-3 mr-2">
                <label v-t="'label.historyDateFrom'" class="mr-2"/>
                <date-picker v-model="form.datetimeFrom" type="datetime" :clearable="false" class="mr-2 inputdatefrom" required/>
              </b-form-row>
              <b-form-row class="mb-3 mr-2">
                <label v-t="'label.historyDateTo'" class="mr-2" />
                <date-picker v-model="form.datetimeTo" type="datetime" :clearable="false" class="mr-2 inputdateto" required/>
              </b-form-row>
            </b-form-row>
          </b-form-group>
          <b-form-group>
            <b-form-row class="mb-3 mr-2">
              <b-button :variant="theme" class="mx-1" @click="display" v-t="'label.display'" />
              <b-button :variant='theme' class="mx-1" v-if="!iosOrAndroid" @click="exportCsv" v-t="'label.download'" />
            </b-form-row>
          </b-form-group>
        </b-form>
        <slot></slot>
        <b-row class="mt-3">
        </b-row>
        <b-table show-empty stacked="md" striped hover :items="viewList" :fields="fields" :current-page="currentPage" :per-page="perPage" outlined :sort-by.sync="sortBy">
        </b-table>
        <b-row>
          <b-col md="6" class="my-1">{{ footerMessage }}</b-col>
        </b-row>
        <b-row>
          <b-col md="6" class="my-1">
            <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" class="my-0" />
          </b-col>
        </b-row>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as HttpHelper from '../../sub/helper/HttpHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import { addLabelByKey } from '../../sub/helper/ViewHelper'
import { getTheme } from '../../sub/helper/ThemeHelper'
import { getCharSet } from '../../sub/helper/CharSetHelper'
import * as Util from '../../sub/util/Util'
import { CATEGORY } from '../../sub/constant/Constants'
import { APP } from '../../sub/constant/config.js'
import moment from 'moment'


export default {
  mixins: [showmapmixin ],
  components: {
    breadcrumb,
    DatePicker,
  },
  data () {
    return {
      name: 'sensorHistory',
      items: [
        {
          text: this.$i18n.tnl('label.historyTitle'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.sensorHistory'),
          active: true
        }
      ],
      form: {
        sensorId: null,
        datetimeFrom: null,
        datetimeTo: null,
      },
      fetchList: [],
      viewList: [],
      custumCsvColumns: [],
      custumCsvColumns1: [
        "sensorDt",
        "txName",
        "major",
        "minor",
        APP.EXB_WITH_EXBID?"exbId":null,
        APP.EXB_WITH_DEVICE_NUM?"deviceNum":null,
        APP.EXB_WITH_DEVICE_ID?"deviceId":null,
        APP.EXB_WITH_DEVICE_IDX?"deviceIdX":null,
        "locationName",
        APP.EXB_WITH_POSID?"posId":null,
        "areaName",
        "humidity",
        "temperature",
      ].filter((val) => val),
      custumCsvColumns2: [
        "sensorDt",
        "txName",
        "major",
        "minor",
        APP.EXB_WITH_EXBID?"exbId":null,
        APP.EXB_WITH_DEVICE_NUM?"deviceNum":null,
        APP.EXB_WITH_DEVICE_ID?"deviceId":null,
        APP.EXB_WITH_DEVICE_IDX?"deviceIdX":null,
        "locationName",
        APP.EXB_WITH_POSID?"posId":null,
        "areaName",
        "count",
      ].filter((val) => val),
      fields: [],
      fields1: addLabelByKey(this.$i18n, [
        {key: "sensorDt", sortable: true, label:"dt"},
        {key: "txName", sortable: true },
        {key: "major", sortable: true },
        {key: "minor", sortable: true },
        APP.EXB_WITH_EXBID? {key: "exbId", sortable: true }: null,
        APP.EXB_WITH_DEVICE_NUM? {key: "deviceNum", sortable: true }: null,
        APP.EXB_WITH_DEVICE_ID? {key: "deviceId", sortable: true }: null,
        APP.EXB_WITH_DEVICE_IDX? {key: "deviceIdX", sortable: true }: null,
        {key: "locationName", label:'locationZoneName', sortable: true,},
        APP.EXB_WITH_POSID? {key: "posId", label:'posId', sortable: true,}: null,
        {key: "areaName", label:'area', sortable: true,},
        {key: "humidity", sortable: true},
        {key: "temperature", sortable: true},
      ]),
      fields2: addLabelByKey(this.$i18n, [
        {key: "sensorDt", sortable: true, label:"dt"},
        {key: "txName", sortable: true },
        {key: "major", sortable: true },
        {key: "minor", sortable: true },
        APP.EXB_WITH_EXBID? {key: "exbId", sortable: true }: null,
        APP.EXB_WITH_DEVICE_NUM? {key: "deviceNum", sortable: true }: null,
        APP.EXB_WITH_DEVICE_ID? {key: "deviceId", sortable: true }: null,
        APP.EXB_WITH_DEVICE_IDX? {key: "deviceIdX", sortable: true }: null,
        {key: "locationName", label:'locationZoneName', sortable: true,},
        APP.EXB_WITH_POSID? {key: "posId", label:'posId', sortable: true,}: null,
        {key: "areaName", label:'area', sortable: true,},
        {key: "count", label:"numUsers", sortable: true},
      ]),
      currentPage: 1,
      perPage: 20,
      totalRows: 0,
      fetchRows: 0,
      maxRows: 100,
      sortBy: null,
      //
      showInfo: false,
      showAlert: false,
      message: "",
      footerMessage: "",
    }
  },
  computed: {
    theme () {
      const theme = getTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'sensors'
    ]),
    sensorOptions() {
      let sensorOp = this.sensors.map((sensor) => {
          return {
            value: sensor.sensorId,
            text: this.$i18n.tnl('label.' + sensor.sensorName)
          }
        }
      )
      return sensorOp
    },
  },
  async created() {
    this.form.sensorId = 1
    const date = new Date()
    this.form.datetimeFrom = this.getDatetime(date, {hours: -1})
    this.form.datetimeTo = this.getDatetime(date)
    this.custumCsvColumns = this.custumCsvColumns1
    this.fields = this.fields1
  },
  mounted() {
    import(`element-ui/lib/locale/lang/${this.$i18n.locale}`).then( (mojule) =>{
      locale.use(mojule.default)
    })
    StateHelper.load('sensor')
    this.footerMessage = `${this.$i18n.tnl("message.totalRowsMessage", {row: this.fetchRows, maxRows: this.maxRows})}`
  },
  methods: {
    getDatetime(baseDatetime, controlData){
      const datetime = new Date(baseDatetime.getTime())
      datetime.setMilliseconds(0)
      if(!controlData){
        return datetime
      }
      datetime.setFullYear(datetime.getFullYear() + (controlData.year? controlData.year: 0))
      datetime.setDate(datetime.getDate() + (controlData.date? controlData.date: 0))
      datetime.setHours(datetime.getHours() + (controlData.hours? controlData.hours: 0))
      datetime.setMinutes(datetime.getMinutes() + (controlData.minutes? controlData.minutes: 0))
      datetime.setSeconds(datetime.getSeconds() + (controlData.seconds? controlData.seconds: 0))
      return datetime
    },
    async display() {
      this.container ? this.container.removeAllChildren() : null
      await this.displayImpl()
      this.stage ? this.stage.update() : null
    },
    async displayImpl(){
      this.showAlert = false
      this.fetchList = []
      this.viewList = []
      this.footerMessage = `${this.$i18n.tnl("message.totalRowsMessage", {row: this.fetchRows, maxRows: this.maxRows})}`
      try {
        const aSensorId = (this.form.sensorId != null)?this.form.sensorId:0
        if (aSensorId == 1) {
          this.custumCsvColumns = this.custumCsvColumns1
          this.fields = this.fields1
        }
        if (aSensorId == 2) {
          this.custumCsvColumns = this.custumCsvColumns2
          this.fields = this.fields2
        }
        this.fetchList = await HttpHelper.getAppService(
          `/basic/sensorHistory/findsensor/${aSensorId}/${this.form.datetimeFrom.getTime()}/${this.form.datetimeTo.getTime()}`
        )
        if (this.fetchList.length == null || !this.fetchList.length) {
          this.message = this.$i18n.tnl("message.notFoundData", {target: this.$i18n.tnl("label.sensorHistory")})
          return
        }
        var count = 0
        for (var senHist of this.fetchList) {
          const d = new Date(senHist.sensorDt)
          senHist.sensorDt = moment(d.getTime()).format('YYYY/MM/DD HH:mm:ss')
          if (senHist.txId != null) {
            let aTx = _.find(this.txs, (tx) => { return tx.txId == senHist.txId })
            senHist.txName = aTx.txName
          } else {
            senHist.txName = ""
          }
          let aExb = _.find(this.exbs, (exb) => { return exb.exbId == senHist.exbId })
          if (aExb != null) {
            senHist.deviceNum = aExb.deviceNum
            senHist.deviceId = aExb.deviceId
            senHist.deviceIdX = aExb.deviceIdX
            senHist.locationName = aExb.locationName
            senHist.posId = aExb.posId
            senHist.areaName = aExb.areaName
          } else {
            senHist.deviceNum = ""
            senHist.deviceId = ""
            senHist.deviceIdX = ""
            senHist.locationName = ""
            senHist.posId = ""
            senHist.areaName = ""
          }
          if (senHist.sensorId == 1) {
            senHist.humidity = senHist.value.humidity
            senHist.temperature = senHist.value.temperature
          }
          if (senHist.sensorId == 2 || senHist.sensorId == 3) {
            senHist.count = senHist.value.count
          }
          count++
          if (count < this.maxRows) {
            this.viewList.push(senHist)
          }
        }
        this.fetchRows = this.viewList.length
        this.footerMessage = `${this.$i18n.tnl("message.totalRowsMessage", {row: this.fetchRows, maxRows: this.maxRows})}`
      } catch(e) {
        console.error(e)
      }
    },
    reset() {
      this.isShownMapImage = false
    },
    async fetchData(payload) {
    },
    setEmptyMessage(){
      this.message = null
      this.error = null
    },
    exportCsv() {
      this.setEmptyMessage()
      if (this.fetchList.length == 0) {
        return
      }
      let headers
      if (this.custumCsvColumns) {
        headers = this.custumCsvColumns
      } else {
        headers = _(this.params.fields).map((val) => val.key).uniqWith(_.isEqual).value()
      }
      headers = headers.filter((val) => !["style", "thumbnail", "actions", "updateAction"].includes(val))
      HtmlUtil.fileDL(this.name + ".csv", Util.converToCsv(this.fetchList, headers), getCharSet(this.loginId))
    },
  }
}
</script>