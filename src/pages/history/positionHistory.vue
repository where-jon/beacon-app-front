<template>
  <div>
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <b-alert variant="info" dismissible :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">
        <div v-html="message" />
      </b-alert>
      <div class="mapContainer mb-5">
        <b-form inline @submit.prevent>
          <b-form-group class="mr-5">
            <b-form-row>
              <b-form-row class="mb-3 mr-2">
                <label v-t="'label.minor'" class="mr-2"/>
                <v-select v-model="form.tx" :options="txOptions" class="mr-2">
                  <div slot="no-options">{{$i18n.tnl('label.vSelectNoOptions')}}</div>
                </v-select>
              </b-form-row>
            </b-form-row>
          </b-form-group>
        </b-form>
        <b-form inline @submit.prevent>
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
        <b-table stacked="md" striped hover :items="viewList" :fields="fields" :current-page="currentPage" :per-page="perPage" outlined :sort-by.sync="sortBy">
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
import { EXCLOUD, APP_SERVICE } from '../../sub/constant/config'


export default {
  mixins: [showmapmixin ],
  components: {
    breadcrumb,
    DatePicker,
  },
  data () {
    return {
      name: 'positionHistory',
      items: [
        {
          text: this.$i18n.tnl('label.historyTitle'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.positionHistory'),
          active: true
        }
      ],
      form: {
        tx: null,
        datetimeFrom: null,
        datetimeTo: null,
      },
      viewList: [],
      fields: addLabelByKey(this.$i18n, [
        {key: "positionDt", sortable: true, label:"dt"},
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
        {key: "x", sortable: true, label:"locationX"},
        {key: "y", sortable: true, label:"locationY"},
      ]),
      currentPage: 1,
      perPage: 20,
      limitViewRows: 100,
      totalRows: 0,
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
      'txs', 'exbs'
    ]),
    txOptions() {
      let txOp = this.txs.map(tx => {
        return {
            label: (tx.minor!=null)?(""+tx.minor):"txId=" + tx.txId,
            value: "" + tx.txId
          }
      })
      return txOp
    },
  },
  async created() {
    const date = new Date()
    this.form.datetimeFrom = this.getDatetime(date, {hours: -1})
    this.form.datetimeTo = this.getDatetime(date)
  },
  mounted() {
    import(`element-ui/lib/locale/lang/${this.$i18n.locale}`).then( (mojule) =>{
      locale.use(mojule.default)
    })
    StateHelper.load('tx')
    StateHelper.load('exb')
    this.footerMessage = `${this.$i18n.tnl("message.totalRowsMessage", {row: this.viewList.length, maxRows: this.limitViewRows})}`
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
      this.viewList = []
      this.totalRows = 0
      this.footerMessage = `${this.$i18n.tnl("message.totalRowsMessage", {row: this.viewList.length, maxRows: this.limitViewRows})}`
      try {
        const aTxId = (this.form.tx != null && this.form.tx.value != null)?this.form.tx.value:0
        console.log(aTxId)
        var fetchList = await HttpHelper.getAppService(
          `/core/positionHistory/find/${aTxId}/${this.form.datetimeFrom.getTime()}/${this.form.datetimeTo.getTime()}/${this.limitViewRows}`
        )
        if (fetchList.length == null || !fetchList.length) {
          this.message = this.$i18n.tnl("message.notFoundData", {target: this.$i18n.tnl("label.positionHistory")})
          this.showAlert = true
          return
        }
        for (var posHist of fetchList) {
          const d = new Date(posHist.positionDt)
          posHist.positionDt = moment(d.getTime()).format('YYYY/MM/DD HH:mm:ss')
          let aTx = _.find(this.txs, (tx) => { return tx.txId == posHist.txId })
          posHist.txName = aTx.txName
          let aExb = _.find(this.exbs, (exb) => { return exb.exbId == posHist.exbId })
          posHist.deviceNum = aExb.deviceNum
          posHist.deviceId = aExb.deviceId
          posHist.deviceIdX = aExb.deviceIdX
          posHist.locationName = aExb.locationName
          posHist.posId = aExb.posId
          posHist.areaName = aExb.areaName
          posHist.x = aExb.x
          posHist.y = aExb.y
          this.viewList.push(posHist)
        }
        this.totalRows = this.viewList.length
        this.footerMessage = `${this.$i18n.tnl("message.totalRowsMessage", {row: this.viewList.length, maxRows: this.limitViewRows})}`
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
      HtmlUtil.executeFileDL(
        APP_SERVICE.BASE_URL
        + `/core/positionHistory/csvdownload/${aTxId}/${this.form.datetimeFrom.getTime()}/${this.form.datetimeTo.getTime()}/` 
        + getCharSet(this.$store.state.loginId)
      )
    },
  }
}
</script>
