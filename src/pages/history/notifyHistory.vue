<template>
  <div>
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <alert :message="message" />

      <div class="mapContainer mb-5">
        <b-form inline @submit.prevent>

          <!--種別-->
          <b-form-group class="mr-5">
            <b-form-row>
              <b-form-row class="mb-3 mr-2">
                <label v-t="'label.category'" class="mr-2" />
                <b-form-select v-model="form.notifyState" :options="notifyStateOptions" class="mr-2" @change="categoryChange" />
              </b-form-row>
            </b-form-row>
          </b-form-group>

          <!--Tx-->
          <b-form-group v-if="bTx" class="mr-5">
            <b-form-row>
              <b-form-row class="mb-3 mr-2">
                <label v-t="'label.tx'" class="mr-2" />
                <b-form-select v-model="form.tx" :options="txOptions" class="mr-2" @change="changeTx">
                  <div slot="no-options">
                    {{ $i18n.tnl('label.vSelectNoOptions') }}
                  </div>
                </b-form-select>
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
import locale from 'element-ui/lib/locale'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import alert from '../../components/parts/alert.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as HttpHelper from '../../sub/helper/HttpHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import { addLabelByKey } from '../../sub/helper/ViewHelper'
import { getTheme } from '../../sub/helper/ThemeHelper'
import { getCharSet } from '../../sub/helper/CharSetHelper'
import { NOTIFY_STATE } from '../../sub/constant/Constants'
import { APP } from '../../sub/constant/config.js'
import moment from 'moment'
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
      name: 'notifyHistory',
      txId: null,
      bTx:true,
      items: [
        {
          text: this.$i18n.tnl('label.historyTitle'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.notifyHistory'),
          active: true
        }
      ],
      form: {
        tx: null,
        datetimeFrom: null,
        datetimeTo: null,
        notifyState: null,
      },
      viewList: [],
      fields: [],
      fields1: addLabelByKey(this.$i18n, [  // TXボタン押下通知
        {key: 'positionDt', sortable: true, label:'dt'},
        {key: 'notifyTo', sortable: true,label:'notifyTo' },
        {key: 'txName', sortable: true,label:'tx' },
        {key: 'major', sortable: true,label:'major' },
        {key: 'minor', sortable: true,label:'minor' },
        // {key: 'txId', sortable: true,label:'txId' },
        {key: 'notifyResult', sortable: true,label:'notifyResult' },
      ]),
      fields2: addLabelByKey(this.$i18n, [  // GW状態アラート
        {key: 'positionDt', sortable: true, label:'dt'},
        {key: 'notifyTo', sortable: true,label:'notifyTo' },
        {key: 'finalReceiveTime', sortable: true,label:'finalReceiveTime' },
        {key: 'notifyResult', sortable: true,label:'notifyResult' },
      ]),
      fields3: addLabelByKey(this.$i18n, [  // EXB状態アラート
        {key: 'positionDt', sortable: true, label:'dt'},
        {key: 'notifyTo', sortable: true,label:'notifyTo' },
        {key: 'exbName', sortable: true,label:'exbName' },
        {key: 'finalReceiveTime', sortable: true,label:'finalReceiveTime' },
        {key: 'notifyResult', sortable: true,label:'notifyResult' },
      ]),
      fields4: addLabelByKey(this.$i18n, [  // TX電池状態アラート
        {key: 'positionDt', sortable: true, label:'dt'},
        {key: 'notifyTo', sortable: true,label:'notifyTo' },
        {key: 'txName', sortable: true,label:'tx' },
        {key: 'major', sortable: true,label:'major' },
        {key: 'minor', sortable: true,label:'minor' },
        {key: 'powerLevel', sortable: true,label:'powerLevel' },
        {key: 'finalReceiveTime', sortable: true,label:'finalReceiveTime' },
        {key: 'notifyResult', sortable: true,label:'notifyResult' },
      ]),
      fields5: addLabelByKey(this.$i18n, [  // SOSボタン押下通知
        {key: 'positionDt', sortable: true, label:'dt'},
        {key: 'notifyTo', sortable: true,label:'notifyTo' },
        {key: 'txName', sortable: true,label:'tx' },
        {key: 'major', sortable: true,label:'major' },
        {key: 'minor', sortable: true,label:'minor' },
        {key: 'notifyResult', sortable: true,label:'notifyResult' },
      ]),
      currentPage: 1,
      perPage: 20,
      limitViewRows: 100,
      totalRows: 0,
      sortBy: null,
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
      'txs'
    ]),

    notifyStateOptions() {
      return _.slice(NOTIFY_STATE.getOptions()).filter((val) => APP.NOTIFY_STATE_TYPES.includes(val.index))
    },
    txOptions() {
      return StateHelper.getOptionsFromState('tx',
        tx => StateHelper.getTxIdName(tx),
        true
      )
    },
  },
  async created() {
    const date = new Date()
    this.form.datetimeFrom = Util.getDatetime(date, {hours: -1})
    this.form.datetimeTo = Util.getDatetime(date)
    this.form.notifyState = this.notifyStateOptions[0].value
    this.fields = this.fields1
  },
  mounted() {
      import(`element-ui/lib/locale/lang/${this.$i18n.locale}`).then( (mojule) =>{
        locale.use(mojule.default)
      })
      StateHelper.load('tx')
      this.changeTx(this.form.txId)
      this.footerMessage = `${this.$i18n.tnl('message.totalRowsMessage', {row: this.viewList.length, maxRows: this.limitViewRows})}`
  },
  methods: {
    async categoryChange(evt) {
      this.bTx = (evt == 'TX_DELIVERY_NOTIFY' || evt == 'TX_BATTERY_ALERT') ? true: false
    },
    async changeTx(newVal){
      const tx = this.txs.find((tx) => newVal == tx.txId)
      this.txId = tx? tx.txId: null
    },
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
        const aNotifyState = (this.form.notifyState != null)?this.form.notifyState:0
        if (aNotifyState == 'TX_DELIVERY_NOTIFY') {
          this.fields = this.fields1
        }else if (aNotifyState == 'GW_ALERT') {
          this.fields = this.fields2
        }else if (aNotifyState == 'EXB_ALERT') {
          this.fields = this.fields3
        }else if (aNotifyState == 'TX_BATTERY_ALERT') {
          this.fields = this.fields4
        }else if (aNotifyState == 'TX_SOS_ALERT') {
          this.fields = this.fields5
        }
        const aTxId = this.txId
        var fetchList = await HttpHelper.getAppService(
          aTxId? `/core/rcvexcloud/history/${aNotifyState}/${this.form.datetimeFrom.getTime()}/${this.form.datetimeTo.getTime()}?txId=${aTxId}`
            :`/core/rcvexcloud/history/${aNotifyState}/${this.form.datetimeFrom.getTime()}/${this.form.datetimeTo.getTime()}`
        )

        if (fetchList == null || !fetchList.length) {
          this.message = this.$i18n.tnl('message.notFoundData', {target: this.$i18n.tnl('label.notifyHistory')})
          this.replace({showAlert: true})
          return
        }
        let count = 0
        fetchList.forEach((senHist, propKey) => {
          if (senHist.txId != null && this.txId == senHist.txId || this.txId == null) {
            const d = new Date(senHist.notifyDatetime)
            senHist.positionDt = moment(d.getTime()).format('YYYY/MM/DD HH:mm:ss')
            senHist.notifyResult = senHist.notifyResult == 0 ? '成功' : '失敗'
            senHist.txName = senHist.minor + '(' + senHist.txName + ')'

            count++
            if (count < this.limitViewRows) {
              this.viewList.push(senHist)
            }
          }
        })
        this.totalRows = this.viewList.length
        this.footerMessage = `${this.$i18n.tnl('message.totalRowsMessage', {row: this.viewList.length, maxRows: this.limitViewRows})}`
      }catch (e) {
        console.error(e)
      }
    },
    reset() {
      this.isShownMapImage = false
    },
    async fetchData(payload) {
    },
    async exportCsv() {
      const aTxId = this.txId
      const aNotifyState = (this.form.notifyState != null)?this.form.notifyState:0
      HtmlUtil.executeFileDL(
        aTxId? APP_SERVICE.BASE_URL
          + `/core/rcvexcloud/csvdownload/${aNotifyState}/${this.form.datetimeFrom.getTime()}/${this.form.datetimeTo.getTime()}/`
          + getCharSet(this.$store.state.loginId) + `?txId=${aTxId}`: APP_SERVICE.BASE_URL
            + `/core/rcvexcloud/csvdownload/${aNotifyState}/${this.form.datetimeFrom.getTime()}/${this.form.datetimeTo.getTime()}/`
            + getCharSet(this.$store.state.loginId)
      )
    },
  }
}
</script>
