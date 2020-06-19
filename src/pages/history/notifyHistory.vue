<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" :reload="false" />
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
                {{ val }}<br>
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

          <template slot="companyNames" slot-scope="row">
            <span v-for="(val, key) in row.item.companyNames" :key="key">
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
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import { APP, APP_SERVICE } from '../../sub/constant/config'
import { NOTIFY_STATE } from '../../sub/constant/Constants'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as CsvUtil from '../../sub/util/CsvUtil'
import * as DateUtil from '../../sub/util/DateUtil'
import * as Util from '../../sub/util/Util'
import * as AppServiceHelper from '../../sub/helper/dataproc/AppServiceHelper'
import { getCharSet } from '../../sub/helper/base/CharSetHelper'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import * as LocalStorageHelper from '../../sub/helper/base/LocalStorageHelper'
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
      breadCrumbs: ViewHelper.createBreadCrumbItems('historyTitle', 'notifyHistory'),
      fields: [],
      fields1: ViewHelper.addLabelByKey(this.$i18n, [  // TXボタン押下通知
        {key: 'positionDt', sortable: true, label:'dt'},
        {key: 'notifyTo', sortable: true,label:'notifyTo' },
        {key: 'majors', sortable: true,label:'major' },
        {key: 'minors', sortable: true,label:'minor' },
        {key: 'potNames', sortable: true,label:'txName' },
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
        {key: 'notifyResult', sortable: true,label:'notifyResult' },
      ]),
      fields5: ViewHelper.addLabelByKey(this.$i18n, [  // SOSボタン押下通知
        {key: 'positionDt', sortable: true, label:'dt'},
        {key: 'notifyTo', sortable: true,label:'notifyTo' },
        {key: 'majors', sortable: true,label:'major' },
        {key: 'minors', sortable: true,label:'minor' },
        {key: 'potNames', sortable: true,label:'txName' },
        {key: 'notifyResult', sortable: true,label:'notifyResult' },
      ]),
      fields6: ViewHelper.addLabelByKey(this.$i18n, [  // ユーザ登録通知
        {key: 'positionDt', sortable: true, label:'dt'},
        {key: 'notifyTo', sortable: true,label:'notifyTo' },
        {key: 'minors', sortable: true,label:'minor' },
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
      fields9: ViewHelper.addLabelByKey(this.$i18n, [  // zdcアラート
        {key: 'positionDt', sortable: true, label:'dt'},
        {key: 'notifyTo', sortable: true,label:'notifyTo' },
        {key: 'minor', sortable: true,label:'minor' },
        {key: 'potNames', sortable: true, label:'potName'},
        {key: 'companyNames', sortable: true, label:'companyName'},
        {key: 'workNames', sortable: true, label:'workName'},
        {key: 'lastRcvPosNames', sortable: true,label:'finalReceiveLocation' },
        {key: 'lastRcvDatetimes', sortable: true,label:'finalReceiveTime' },
        {key: 'notifyResult', sortable: true,label:'notifyResult' },
      ]),
      form: {
        tx: null,
        datetimeFrom: null,
        datetimeTo: null,
        notifyState: NOTIFY_STATE.TX_DELIVERY_NOTIFY,
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
    }
  },
  computed: {
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
        this.form.tx = Util.getValue(newVal, 'value')
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
    const isProviderUser = LocalStorageHelper.getLogin().isProviderUser
    if(user.role.roleFeatureList){
      user.role.roleFeatureList.find((tval) =>
        tval.feature.featureName == 'ALL_REGION'? this.userState = 'ALL_REGION':this.userState = null
      )
    }else if(isProviderUser){
      isProviderUser? this.userState = 'ALL_REGION':this.userState = null
    }

    this.bTx = this.userState == 'ALL_REGION'? true: false
    this.bUserCheck = this.userState == 'ALL_REGION'?  true: false
    this.userMinor = this.userState == 'ALL_REGION'? null: user.minor
    this.fields = this.fields1

  },
  mounted() {
    ViewHelper.importElementUI()
    this.changeTx(this.form.txId)
    this.footerMessage = `${this.$i18n.tnl('message.totalRowsMessage', {row: this.viewList.length, maxRows: this.limitViewRows})}`
  },
  methods: {
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
      this.txId = this.txIdMap[newVal]? newVal: null
    },
    async display(){
      this.replace({showAlert: false})
      this.showProgress()
      this.viewList = []
      this.totalRows = 0
      this.footerMessage = `${this.$i18n.tnl('message.totalRowsMessage', {row: this.viewList.length, maxRows: this.limitViewRows})}`

      try {
        const aNotifyState = (this.form.notifyState != null)?this.form.notifyState:0
        this.fields = this.getFields(aNotifyState)
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
        // 変更:ログインユーザーでフィルタしない仕様とする
        fetchList.forEach((notifyData) => {
          const d = new Date(notifyData.notifyDatetime)
          notifyData.positionDt = DateUtil.formatDate(d.getTime())
          notifyData.notifyResult = this.$i18n.tnl('label.' + (notifyData.notifyResult == 0? 'success': 'failed'))
          let arNotifyto = this.getNotifyTo(notifyData.notifyTo)
          arNotifyto ? notifyData.notifyTo = arNotifyto: null
          const entity = this.createEntity(notifyData)
          if (++count <= this.limitViewRows) {
            this.viewList.push(entity)
          }
          this.csvList.push(entity)
        })
        this.totalRows = this.viewList.length
        this.footerMessage = `${this.$i18n.tnl('message.totalRowsMessage', {row: this.viewList.length, maxRows: this.limitViewRows})}`
      }catch (e) {
        console.error(e)
      } finally {
        this.hideProgress()
      }
    },
    createEntity(e) {
      const fieldKeys = this.getFieldKeys()
      const obj = {}
      fieldKeys.forEach(k => obj[k] = e[k])
      if (this.form.notifyState == 'TX_BATTERY_ALERT' && e.minors && e.powerLevels) {
        obj.minors = e.minors.map((minor,index) => {
          return minor + '(' + e.powerLevels[index] + ')'
        })
      }
      return obj
    },
    async exportCsv() {
      const fieldKeys = this.getFieldKeys()
      const records = this.csvList.map(e => this.createEntity(e))
      records.forEach((record) => {
        record.userName = record.userName ? this.csvColumnBrTag(record.userName) : false
        record.notifyTo = record.notifyTo ? this.csvColumnBrTag(record.notifyTo) : false
        record.majors = record.majors ? this.csvColumnBrTag(record.majors) : false
        record.minors = record.minors ? this.csvColumnBrTag(record.minors) : false
        record.potNames = record.potNames ? this.csvColumnBrTag(record.potNames) : false
        record.zoneNames = record.zoneNames ? this.csvColumnBrTag(record.zoneNames) : false
        record.lastRcvPosNames = record.lastRcvPosNames ? this.csvColumnBrTag(record.lastRcvPosNames) : false
        record.deviceIds = record.deviceIds ? this.csvColumnBrTag(record.deviceIds) : false
        record.lastRcvDatetimes = record.lastRcvDatetimes ? this.csvColumnBrTag(record.lastRcvDatetimes) : false
        record.powerLevels = record.powerLevels ? this.csvColumnBrTag(record.powerLevels) : false
        if(this.form.notifyState == 'TX_BATTERY_ALERT' && record.minors && record.powerLevels){
          let minors = record.minors.split(';')
          let powerLevels = record.powerLevels.split(';')
          let minorPowerLevel = ''
          minors.forEach((minor,index) => {
            minorPowerLevel += minor + '(' + powerLevels[index] + ');'
          })
          record.minors = minorPowerLevel
        }
      })
      BrowserUtil.fileDL('notifyHistory.csv', CsvUtil.converToCsv(records, this.getFieldKeys(), this.getCsvHeaderList().join(',') + '\n'), getCharSet(this.$store.state.loginId))
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
      }else if (aNotifyState == NOTIFY_STATE.TX_UNDETECTED_NOTIFY || aNotifyState == NOTIFY_STATE.TX_NEGLECT_NOTIFY || aNotifyState == NOTIFY_STATE.TX_MULTIPLE_NOTIFY) {
        return this.fields9
      }
    },
    getCsvHeaderList() {
      return  this.getFields(this.form.notifyState).map(record => record.label)
    },
    getFieldKeys() {
      return  this.getFields(this.form.notifyState).map(record => record.key)
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/label.scss";
@import "../../sub/constant/vue.scss";
</style>
