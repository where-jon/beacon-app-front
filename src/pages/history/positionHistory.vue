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
                <label v-t="'label.tx'" class="mr-2"/>
                <b-form-select v-model="form.txId" :options="txOptions" class="mr-2"/>
              </b-form-row>
            </b-form-row>
          </b-form-group>
        </b-form>
        <b-form inline>
          <b-form-group class="mr-5">
            <b-form-row>
              <b-form-row class="mb-3 mr-2">
                <label v-t="'label.historyDateFrom'" class="mr-2"/>
                <date-picker v-model="form.datetimeFrom" type="datetime" :clearable="false" @change="changeDatetimeFrom" class="mr-2 inputdatefrom" required/>
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
              <b-button :variant='theme' class="mx-1" @click="exportCsv" v-t="'label.download'" />
            </b-form-row>
          </b-form-group>
        </b-form>
        <slot></slot>
        <b-row class="mt-3">
        </b-row>
        <b-table show-empty stacked="md" striped hover :items="list" :fields="fields" :current-page="currentPage" :per-page="perPage" outlined :sort-by.sync="sortBy">
        </b-table>
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
        txId: null,
        datetimeFrom: null,
        datetimeTo: null,
      },
      list: [],
      custumCsvColumns: [
        "positionHistoryId", "txId", "major", "minor", "exbId", "locationId", "x", "y", "positionDt"
      ].filter((val) => val),
      fields: addLabelByKey(this.$i18n, [
        {key: "positionHistoryId", sortable: true },
        {key: "txId", sortable: true },
        {key: "major", sortable: true },
        {key: "minor", sortable: true },
        {key: "exbId", sortable: true,},
        {key: "locationId", sortable: true,},
        {key: "x", sortable: true, label:"locationX"},
        {key: "y", sortable: true, label:"locationY"},
        {key: "positionDt", sortable: true, label:"dt"},
      ]),
      currentPage: 1,
      perPage: 10,
      totalRows: this.initTotalRows,
      sortBy: null,
      //
      showInfo: false,
      showAlert: false,
      message: "",
    }
  },
  computed: {
    theme () {
      const theme = getTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'txs'
    ]),
    txOptions() {
      let txOp = this.txs.map((tx) => {
          return {
            value: tx.txId,
            text: tx.txId
          }
        }
      )
      txOp.unshift({value:null, text:''})
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
  },
  methods: {
    changeDatetimeFrom(newVal = this.form.datetimeFrom) {
      if(newVal){
        this.form.datetimeTo = this.getDatetime(newVal, {minutes: APP.ANALYSIS_DATETIME_INTERVAL})
      }
      else{
        this.form.datetimeTo = null
      }
    },
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
      try {
        const aTxid = (this.form.txId != null)?this.form.txId:0
        this.list = await HttpHelper.getAppService(
          `/core/positionHistory/find/${aTxid}/${this.form.datetimeFrom.getTime()}/${this.form.datetimeTo.getTime()}`
        )
        if (this.list.length == null || !this.list.length) {
          this.message = this.$i18n.tnl("message.notFoundData", {target: this.$i18n.tnl("label.positionHistory")})
          this.showAlert = true
          this.list = []
          return
        }
        this.list.forEach(element => {
          const d = new Date(element.positionDt)
          element.positionDt = moment(d.getTime()).format('YYYY/MM/DD HH:mm:ss')
        });
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
      let headers
      if (this.custumCsvColumns) {
        headers = this.custumCsvColumns
      } else {
        headers = _(this.params.fields).map((val) => val.key).uniqWith(_.isEqual).value()
      }
      headers = headers.filter((val) => !["style", "thumbnail", "actions", "updateAction"].includes(val))
      HtmlUtil.fileDL(this.name + ".csv", Util.converToCsv(this.list, headers), getCharSet(this.loginId))
    },
  }
}
</script>
