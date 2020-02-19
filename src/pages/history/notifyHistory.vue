<template>
  <div class="container-fluid">
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
                <v-select v-model="vueSelected.tx" :options="txOptions" class="mr-2 vue-options" :style="vueSelectStyle">
                  <template slot="no-options">
                    {{ vueSelectNoMatchingOptions }}
                  </template>
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
              <b-button v-if="!iosOrAndroid && bulkReferenceable" v-t="'label.download'" :variant="theme" class="mx-1" @click="exportCsv" />
            </b-form-row>
          </b-form-group>
        </b-form>
        <slot />
        <b-row class="mt-3" />
        <b-table :items="viewList" :fields="fields" :current-page="currentPage" :per-page="perPage" :sort-by.sync="sortBy" :sort-compare="defaultSortCompare" stacked="md" striped hover outline>
          <template slot="txNames" slot-scope="row">
            <span v-if="!bUserCheck">
              {{ row.item.txNames }}
            </span>
            <span v-if="bUserCheck">
              <span v-for="(val, key) in row.item.txNames" :key="key">
                {{ val }} <br>
              </span>
            </span>
          </template>
          <template slot="notifyTo" slot-scope="row">
            <div v-for="(val, key) in row.item.notifyTo" :key="key" class="word-break">
              {{ val }} <br>
            </div>
          </template>
          <template slot="majors" slot-scope="row">
            <span v-if="!bUserCheck">
              <span v-for="(val, key) in row.item.majors" :key="key">
                {{ val }}
              </span>
            </span>
            <span v-if="bUserCheck">
              <span v-for="(val, key) in row.item.majors" :key="key">
                <div>{{ val }}<br></div>
              </span>
            </span>
          </template>

          <template slot="minor" slot-scope="row">
            <span v-for="(val, key) in row.item.minors" :key="key">
              <div v-if="!bUserCheck && userMinor == val">
                {{ val }}
              </div>
              <div v-if="bUserCheck">
                {{ val }}<br>
              </div>
            </span>
          </template>

          <template slot="minors" slot-scope="row">
            <span v-for="(val, key) in row.item.minors" :key="key">
              <div v-if="!bUserCheck && userMinor == val">
                {{ val }}({{ gPowerLevel }})
              </div>
              <div v-if="bUserCheck">
                {{ val }}({{ row.item.powerLevels[key] }})<br>
              </div>
            </span>
          </template>
          <template slot="potNames" slot-scope="row">
            <span v-for="(val, key) in row.item.potNames" :key="key">
              {{ val }}<br>
            </span>
          </template>
          <template slot="zoneNames" slot-scope="row">
            <span v-for="(val, key) in row.item.zoneNames" :key="key">
              {{ val }}<br>
            </span>
          </template>

          <template slot="minors" slot-scope="row">
            <span v-for="(val, key) in row.item.minors" :key="key">
              {{ val }}<br>
            </span>
          </template>
          <template slot="deviceIds" slot-scope="row">
            <span v-for="(val, key) in row.item.deviceIds" :key="key">
              {{ val }} <br>
            </span>
          </template>
          <template slot="lastRcvDatetimes" slot-scope="row">
            <span v-for="(val, key) in row.item.lastRcvDatetimes" :key="key">
              {{ val }} <br>
            </span>
          </template>
          <template slot="lastRcvPosNames" slot-scope="row">
            <span v-for="(val, key) in row.item.lastRcvPosNames" :key="key">
              {{ val }} <br>
            </span>
          </template>
        </b-table>

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
import { mapState } from 'vuex'
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import { APP } from '../../sub/constant/config'
import { NOTIFY_STATE } from '../../sub/constant/Constants'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as CsvUtil from '../../sub/util/CsvUtil'
import * as DateUtil from '../../sub/util/DateUtil'
import * as Util from '../../sub/util/Util'
import * as AppServiceHelper from '../../sub/helper/dataproc/AppServiceHelper'
import { getCharSet } from '../../sub/helper/base/CharSetHelper'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import * as LocalStorageHelper from '../../sub/helper/base/LocalStorageHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as MasterHelper from '../../sub/helper/domain/MasterHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import commonmixin from '../../components/mixin/commonmixin.vue'
import breadcrumb from '../../components/layout/breadcrumb.vue'
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
      name: 'notifyHistory',
      items: ViewHelper.createBreadCrumbItems('historyTitle', 'notifyHistory'),
      fields: [],
      fields1: ViewHelper.addLabelByKey(this.$i18n, [  // TXボタン押下通知
        {key: 'positionDt', sortable: true, label:'dt'},
        {key: 'notifyTo', sortable: true,label:'notifyTo' },
        {key: 'majors', sortable: true,label:'major' },
        {key: 'minor', sortable: true,label:'minor' },
        {key: 'txNames', sortable: true,label:'txName' },
        {key: 'notifyResult', sortable: true,label:'notifyResult' },
      ]),
      fields2: ViewHelper.addLabelByKey(this.$i18n, [  // GW状態アラート
        {key: 'positionDt', sortable: true, label:'dt'},
        {key: 'notifyTo', sortable: true,label:'notifyTo' },
        {key: 'deviceIds', sortable: true,label:'deviceId' },
        {key: 'lastRcvDatetimes', sortable: true,label:'finalReceiveTime' },
        {key: 'notifyResult', sortable: true,label:'notifyResult' },
      ]),
      fields3: ViewHelper.addLabelByKey(this.$i18n, [  // EXB状態アラート
        {key: 'positionDt', sortable: true, label:'dt'},
        {key: 'notifyTo', sortable: true,label:'notifyTo' },
        {key: 'deviceIds', sortable: true,label:'deviceId' },
        {key: 'lastRcvDatetimes', sortable: true,label:'finalReceiveTime' },
        {key: 'notifyResult', sortable: true,label:'notifyResult' },
      ]),
      fields4: ViewHelper.addLabelByKey(this.$i18n, [  // TX電池状態アラート
        {key: 'positionDt', sortable: true, label:'dt'},
        {key: 'notifyTo', sortable: true,label:'notifyTo' },
        {key: 'minors', sortable: true,label:'minorPowerLevel'},
        {key: 'txNames', sortable: true,label:'txName' },
        {key: 'notifyResult', sortable: true,label:'notifyResult' },
      ]),
      fields5: ViewHelper.addLabelByKey(this.$i18n, [  // SOSボタン押下通知
        {key: 'positionDt', sortable: true, label:'dt'},
        {key: 'notifyTo', sortable: true,label:'notifyTo' },
        {key: 'majors', sortable: true,label:'major' },
        {key: 'minor', sortable: true,label:'minor' },
        {key: 'txNames', sortable: true,label:'txName' },
        {key: 'notifyResult', sortable: true,label:'notifyResult' },
      ]),
      fields6: ViewHelper.addLabelByKey(this.$i18n, [  // ユーザ登録通知
        {key: 'positionDt', sortable: true, label:'dt'},
        {key: 'notifyTo', sortable: true,label:'notifyTo' },
        {key: 'minor', sortable: true,label:'minor' },
        {key: 'userName', sortable: true,label:'txName' },
        {key: 'notifyResult', sortable: true,label:'notifyResult' },
      ]),
      fields7: ViewHelper.addLabelByKey(this.$i18n, [  // 進入禁止通知
        {key: 'positionDt', sortable: true, label:'dt'},
        {key: 'notifyTo', sortable: true,label:'notifyTo' },
        {key: 'minors', sortable: true,label:'minor' },
        {key: 'potNames', sortable: true, label:'potSearchName'},
        {key: 'zoneNames', sortable: true, label:'zoneName'},
        {key: 'lastRcvDatetimes', sortable: true,label:'finalReceiveTime' },
        {key: 'notifyResult', sortable: true,label:'notifyResult' },
      ]),
      fields8: ViewHelper.addLabelByKey(this.$i18n, [  // 重要物品持ち出しアラート
        {key: 'positionDt', sortable: true, label:'dt'},
        {key: 'notifyTo', sortable: true,label:'notifyTo' },
        {key: 'minors', sortable: true,label:'minor' },
        {key: 'potNames', sortable: true, label:'potSearchName'},
        {key: 'zoneNames', sortable: true, label:'zoneName'},
        {key: 'lastRcvPosNames', sortable: true,label:'finalReceiveLocation' },
        {key: 'lastRcvDatetimes', sortable: true,label:'finalReceiveTime' },
        {key: 'notifyResult', sortable: true,label:'notifyResult' },
      ]),
      form: {
        tx: null,
        datetimeFrom: null,
        datetimeTo: null,
        notifyState: null,
      },
      vueSelected: {
        tx: null,
      },
      message: '',
      footerMessage: '',
      viewList: [],
      csvList: [],
      txId: null,
      userState:null,
      bUserCheck:false,
      userMinor:null,
      gPowerLevel:null,
      bTx:false,
      currentPage: 1,
      perPage: 20,
      limitViewRows: 100,
      totalRows: 0,
      sortBy: null,
      csvHeaders: this.getCsvHeaders('TX_DELIVERY_NOTIFY'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'txs'
    ]),

    notifyStateOptions() {
      return _.slice(NOTIFY_STATE.getOptions()).filter((val) => APP.NOTIFY.STATE_TYPES.includes(val.index))
    },
    txOptions() {
      let result =  MasterHelper.getOptionsFromState('tx',
        tx => MasterHelper.getTxIdName(tx),
        true
      )
      return result
    },
  },
  watch: {
    'vueSelected.tx': {
      handler: function(newVal, oldVal){
        this.form.tx = Util.getValue(newVal, 'value', null)
        this.changeTx(this.form.tx)
      },
      deep: true,
    },
  },
  async created() {
    const date = DateUtil.getDefaultDate()
    this.form.datetimeFrom = DateUtil.getDatetime(date, {hours: -1})
    this.form.datetimeTo = DateUtil.getDatetime(date)
    this.form.notifyState = this.notifyStateOptions[0].value
    const user = await AppServiceHelper.getCurrentUser()
    const isProvider = LocalStorageHelper.getLogin().isProvider
    if(user.role.roleFeatureList){
      user.role.roleFeatureList.find((tval) =>
        tval.feature.featureName == 'ALL_REGION'? this.userState = 'ALL_REGION':this.userState = null
      )
    }else if(isProvider){
      isProvider? this.userState = 'ALL_REGION':this.userState = null
    }

    this.userState == 'ALL_REGION'? this.bTx = true: this.bTx = false
    this.userState == 'ALL_REGION'? this.bUserCheck = true: this.bUserCheck = false
    this.userState == 'ALL_REGION'? null: this.userMinor = user.minor
    this.fields = this.fields1

  },
  mounted() {
    ViewHelper.importElementUI()
    this.changeTx(this.form.txId)
    this.footerMessage = `${this.$i18n.tnl('message.totalRowsMessage', {row: this.viewList.length, maxRows: this.limitViewRows})}`
  },
  methods: {
    getCsvHeaders(num){
      switch(num) {
      case 'TX_DELIVERY_NOTIFY':
        return {
          positionDt: 'notifyDatetime',
          notifyTo : 'notifyTo',
          majors : 'majors',
          minors  : 'minors',
          major : 'major',
          minor  : 'minor',
          txNames : 'txNames',
          notifyResult : 'notifyResult',
        }
      case 'GW_ALERT':
        return {
          positionDt: 'notifyDatetime',
          notifyTo : 'notifyTo',
          deviceIds  : 'deviceIds',
          lastRcvDatetimes : 'lastRcvDatetimes',
          notifyResult : 'notifyResult',
        }
      case 'EXB_ALERT':
        return {
          positionDt: 'notifyDatetime',
          notifyTo : 'notifyTo',
          deviceIds  : 'deviceIds',
          lastRcvDatetimes : 'lastRcvDatetimes',
          notifyResult : 'notifyResult',
        }
      case 'TX_BATTERY_ALERT':
        return {
          positionDt: 'notifyDatetime',
          notifyTo : 'notifyTo',
          minorPowerLevel  : 'minorPowerLevel',
          txNames : 'txNames',
          notifyResult : 'notifyResult',
          minors  : 'minors',
          minor  : 'minor',
          powerLevels  : 'powerLevels',
        }
      case 'TX_SOS_ALERT':
        return {
          positionDt: 'notifyDatetime',
          notifyTo : 'notifyTo',
          minors  : 'minors',
          minor  : 'minor',
          txNames : 'txNames',
          notifyResult : 'notifyResult',
        }
      case 'USER_REG_NOTIFY':
        return {
          positionDt: 'notifyDatetime',
          notifyTo : 'notifyTo',
          minors  : 'minors',
          minor  : 'minor',
          userName : 'userName',
          notifyResult : 'notifyResult',
        }
      case 'PROHIBIT_NOTIFY':
        return {
          positionDt: 'notifyDatetime',
          notifyTo : 'notifyTo',
          minors  : 'minors',
          minor  : 'minor',
          potNames : 'potName',
          zoneNames : 'zoneName',
          lastRcvDatetimes : 'lastRcvDatetime',
          notifyResult : 'notifyResult',
        }
      case 'LOST_NOTIFY':
        return {
          positionDt: 'notifyDatetime',
          notifyTo : 'notifyTo',
          minors  : 'minors',
          minor  : 'minor',
          potNames : 'potName',
          zoneNames : 'zoneName',
          lastRcvPosNames: 'lastRcvPosName',
          lastRcvDatetimes : 'lastRcvDatetime',
          notifyResult : 'notifyResult',
        }
      }
    },
    csvColumnBrTag(csvColumn){
      let tempNames = csvColumn.toString()
      return tempNames.replace( /,/gi, ';')
    },
    getNotifyTo(notifyToData){
      let notifysTo = notifyToData.split(',')
      let arNotify = []
      if(notifysTo){
        notifysTo.forEach((notifyTo) => {
          arNotify.push(notifyTo)
        })
      }else{
        arNotify = null
      }
      return arNotify
    },
    async categoryChange(evt) {
      this.vueSelected.tx = null
      this.bTx = ((evt == 'TX_DELIVERY_NOTIFY' || evt == 'TX_BATTERY_ALERT' || evt == 'USER_REG_NOTIFY') && this.userState == 'ALL_REGION') ? true: false
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
        this.fields = this.getFields(aNotifyState)
        this.csvHeaders = this.getCsvHeaders(aNotifyState)
        const aTxId = this.txId
        const fetchList = await HttpHelper.getAppService(
          aTxId? `/core/rcvexcloud/history/${aNotifyState}/${this.form.datetimeFrom.getTime()}/${this.form.datetimeTo.getTime()}?txId=${aTxId}`
            :`/core/rcvexcloud/history/${aNotifyState}/${this.form.datetimeFrom.getTime()}/${this.form.datetimeTo.getTime()}`
        )

        if (fetchList == null || !fetchList.length) {
          this.message = this.$i18n.tnl('message.notFoundData', {target: this.$i18n.tnl('label.notifyHistory')})
          this.replace({showAlert: true})
          return
        }
        let count = 0
        this.csvList = []
        fetchList.forEach((notifyData) => {
          const d = new Date(notifyData.notifyDatetime)
          notifyData.positionDt = DateUtil.formatDate(d.getTime())
          notifyData.notifyResult = this.$i18n.tnl('label.' + (notifyData.notifyResult == 0? 'success': 'failed'))
          if(this.userState == 'ALL_REGION' || aNotifyState == 'GW_ALERT' || aNotifyState == 'EXB_ALERT'){
            let arNotifyto = this.getNotifyTo(notifyData.notifyTo)
            arNotifyto ? notifyData.notifyTo = arNotifyto: null
            if (++count <= this.limitViewRows) {
              this.viewList.push(notifyData)
            }
            this.csvList.push(notifyData)
          }else{
            let tempIndex = 0
            notifyData.minors.find((tval,index) =>
              tval == this.userMinor ? tempIndex = index:null
            )
            notifyData.minors = notifyData.minors[tempIndex]
            this.gPowerLevel= notifyData.powerLevels[tempIndex]
            notifyData.majors = notifyData.majors[tempIndex]
            notifyData.txNames = notifyData.txNames[tempIndex]
            let arNotifyto = this.getNotifyTo(notifyData.notifyTo)
            arNotifyto ? notifyData.notifyTo = arNotifyto: null
            if (++count <= this.limitViewRows) {
              notifyData.minors == this.userMinor? this.viewList.push(notifyData) : null
            }
            notifyData.minors == this.userMinor? this.csvList.push(notifyData) : null
            notifyData.minors == this.userMinor? count++:null
          }
        })
        this.totalRows = this.viewList.length
        this.footerMessage = `${this.$i18n.tnl('message.totalRowsMessage', {row: this.viewList.length, maxRows: this.limitViewRows})}`
      }catch (e) {
        console.error(e)
      }
    },
    async exportCsv() {
      const records = this.csvList.map(e => {
        const obj = {}
        Object.keys(this.csvHeaders)
          .filter(csvHeader => this.csvHeaders[csvHeader])
          .forEach(csvHeader => obj[this.csvHeaders[csvHeader]] = e[csvHeader])
        obj.majors? obj.major=obj.majors:null
        obj.majors? delete obj.majors:null
        obj.minors? obj.minor=obj.minors:null
        obj.minors? delete obj.minors:null
        return obj
      })
      records.forEach((record) => {
        record.txNames?record.txNames=this.csvColumnBrTag(record.txNames):false
        record.userName?record.userName=this.csvColumnBrTag(record.userName):false
        record.notifyTo?record.notifyTo=this.csvColumnBrTag(record.notifyTo):false
        record.major?record.major=this.csvColumnBrTag(record.major):false
        record.minor?record.minor=this.csvColumnBrTag(record.minor):false
        record.potName?record.potName=this.csvColumnBrTag(record.potName):false
        record.zoneName?record.zoneName=this.csvColumnBrTag(record.zoneName):false
        record.lastRcvPosName?record.lastRcvPosName=this.csvColumnBrTag(record.lastRcvPosName):false
        record.deviceIds?record.deviceIds=this.csvColumnBrTag(record.deviceIds):false
        record.lastRcvDatetimes?record.lastRcvDatetimes= record.lastRcvDatetimes=this.csvColumnBrTag(record.lastRcvDatetimes):false
        record.lastRcvDatetime?record.lastRcvDatetime=this.csvColumnBrTag(record.lastRcvDatetime):false
        record.powerLevels?record.powerLevels=this.csvColumnBrTag(record.powerLevels):false

        if(this.form.notifyState == 'TX_BATTERY_ALERT' && record.minor && record.powerLevels){
          let minors = record.minor.split(';')
          let powerLevels = record.powerLevels.split(';')
          let minorPowerLevel = ''
          minors.forEach((minor,index) => {
            minorPowerLevel += minor + '(' + powerLevels[index] + ');'
          })
          record.minorPowerLevel = minorPowerLevel
          delete record.minor
          delete record.minors
          delete record.powerLevels
        }
      })
      BrowserUtil.fileDL('notifyHistory.csv', CsvUtil.converToCsv(records, null, this.getCsvHeaderList()), getCharSet(this.$store.state.loginId))
    },
    getFields(aNotifyState) {
      if (aNotifyState == NOTIFY_STATE.TX_DELIVERY_NOTIFY) {
        return this.fields1
      }else if (aNotifyState == NOTIFY_STATE.GW_ALERT) {
        return this.fields2
      }else if (aNotifyState == NOTIFY_STATE.EXB_ALERT) {
        return this.fields3
      }else if (aNotifyState == NOTIFY_STATE.TX_BATTERY_ALERT) {
        return this.fields4
      }else if (aNotifyState == NOTIFY_STATE.TX_SOS_ALERT) {
        return this.fields5
      }else if (aNotifyState == NOTIFY_STATE.USER_REG_NOTIFY) {
        return this.fields6
      }else if (aNotifyState == NOTIFY_STATE.PROHIBIT_NOTIFY) {
        return this.fields7
      }else if (aNotifyState == NOTIFY_STATE.LOST_NOTIFY) {
        return this.fields8
      }
    },
    async fetchData(payload) {
    },
    getCsvHeaderList() {
      return  this.getFields(this.form.notifyState).map((record) => {
        return record.label
      }).join(',') + '\n'
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/label.scss";
@import "../../sub/constant/vue.scss";
</style>
