<template>
  <div class="container-fluid">
    <div class="container">
      <a id="helpAutoLink" :href="fromPage" />
      <a id="initialize" href="#" @click="initialize" />
      
      <div id="indexList">
        <p v-if="isEnableHelp" class="helpLabelHeader">
          {{ getHelpDescription('indexName') }}
        </p>
        <p v-else class="helpLabelHeader">
          {{ getHelpDescription('helpNone') }}
        </p>
        <div v-if="enablePositionList">
          <a href="#main_position-list">
            {{ $i18n.tnl('label.positionList') }}
          </a><br>
        </div>
        <div v-if="enableBulkRegister">
          <a href="#bulkedit">
            {{ $i18n.tnl('label.bulkRegister') }}
          </a><br>
        </div>
        <div v-if="enableRegion">
          <a href="#master_region">
            {{ $i18n.tnl('label.masterRegion') }}
          </a><br>
        </div>
        <div v-if="enableArea">
          <a href="#master_area">
            {{ $i18n.tnl('label.masterArea') }}
          </a><br>
        </div>
        <div v-if="enableExb">
          <a href="#master_exb">
            {{ $i18n.tnl('label.masterExb') }}
          </a><br>
        </div>
        <div v-if="enableTx">
          <a href="#master_tx">
            {{ $i18n.tnl('label.masterTx') }}
          </a><br>
        </div>
        <div v-if="enablePot">
          <a href="#master_pot">
            {{ $i18n.tnl('label.masterPot') }}
          </a><br>
        </div>
        <div v-if="isDisplayCategory">
          <a href="#master_category">
            {{ $i18n.tnl('label.masterCategory') }}
          </a><br>
        </div>
        <div v-if="enableGroup">
          <a href="#master_group">
            {{ $i18n.tnl('label.masterGroup') }}
          </a><br>
        </div>
        <div v-if="enableUser">
          <a href="#master_user">
            {{ $i18n.tnl('label.masterUser') }}
          </a><br>
        </div>
        <div v-if="enableRole">
          <a href="#master_role">
            {{ $i18n.tnl('label.masterRole') }}
          </a><br>
        </div>
        <div v-if="isDisplayZoneClass">
          <a href="#master_zoneClass">
            {{ $i18n.tnl('label.zoneClass') }}
          </a><br>
        </div>
        <div v-if="isDisplayZoneBlock">
          <a href="#master_zoneBlock">
            {{ $i18n.tnl('label.zoneBlock') }}
          </a><br>
        </div>
        <div v-if="enableGateway">
          <a href="#monitor_gateway">
            {{ $i18n.tnl('label.monitorGW') }}
          </a><br>
        </div>
        <div v-if="enableMonitorTX">
          <a href="#monitor_position">
            {{ $i18n.tnl('label.monitorTX') }}
          </a><br>
        </div>
        <div v-if="enableTelemetry">
          <a href="#monitor_telemetry">
            {{ $i18n.tnl('label.monitorEXB') }}
          </a><br>
        </div>
        <div v-if="enableUsageSituation">
          <a href="#sum_usage-situation">
            {{ $i18n.tnl('label.SumUtilizationRatio') }}
          </a><br>
        </div>
        <div v-if="enableSensorGraph">
          <a href="#sum_sensorGraph">
            {{ $i18n.tnl('label.SensorGraph') }}
          </a><br>
        </div>
        <div v-if="enableStayRatio">
          <a href="#sum_stayRatio">
            {{ $i18n.tnl('label.stayRatio') }}
          </a><br>
        </div>
        <div v-if="enableTemperatureHistory">
          <a href="#history_temperatureHistory">
            {{ $i18n.tnl('label.temperatureHistory') }}
          </a><br>
        </div>
        <div v-if="enablePositionHistory">
          <a href="#history_positionHistory">
            {{ $i18n.tnl('label.PositionHistory') }}
          </a><br>
        </div>
        <div v-if="enableSensorHistory">
          <a href="#history_sensorHistory">
            {{ $i18n.tnl('label.SensorHistory') }}
          </a><br>
        </div>
        <div v-if="enableNotifyHistory">
          <a href="#history_notifyHistory">
            {{ $i18n.tnl('label.notifyHistory') }}
          </a><br>
        </div>
        <div v-if="enableStayRatioBase">
          <a href="#sum_stayRatioBase">
            {{ $i18n.tnl('label.stayRatioBase') }}
          </a><br>
        </div>
      </div>
      <div v-if="enablePositionList" id="main_position-list">
        <hr>
        <p class="helpLabelHeader">
          {{ getLabel('positionList') }}
        </p>
        <p class="helpTitle">
          {{ getLabel('state') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('state', {detected: getLabel('detected'), temporaryUndetect: getLabel('temporaryUndetect'), undetect: getLabel('undetect'), none: getLabel('none')}) }}
        </p>
      </div>
      <div v-if="enableBulkRegister" id="bulkedit">
        <hr>
        <p class="helpLabelHeader">
          {{ getLabel('bulkRegister') }}
        </p>
        
        <p class="helpTitle">
          {{ getLabel('notes') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('bulkNotes', {personal: getLabel('personal'), charSet: getLabel('charSet'), SJIS: getLabel('SJIS')}) }}
        </p>
        <p class="helpTitle">
          {{ getLabel('register') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('bulkRegister') }}
        </p>
        <b-table striped hover small :items="bulkItems()" :fields="bulkFields" />
      </div>
      <div v-if="enableRegion" id="master_region">
        <hr>
        <p class="helpLabelHeader">
          {{ getLabel('masterRegion') }}
        </p>
        <p class="helpTitle">
          {{ getLabel('csvFile') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('csvDescription') }}
        </p>
        <b-table striped hover small :items="regionCsvItems()" :fields="csvFields" />
      </div>
      <div v-if="enableArea" id="master_area">
        <hr>
        <p class="helpLabelHeader">
          {{ getLabel('masterArea') }}
        </p>
        <p class="helpTitle">
          {{ getLabel('csvFile') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('csvDescription') }}
        </p>
        <b-table striped hover small :items="areaCsvItems()" :fields="csvFields" />
      </div>
      <div v-if="enableExb" id="master_exb">
        <hr>
        <p class="helpLabelHeader">
          {{ getLabel('masterExb') }}
        </p>
        <p class="helpTitle">
          {{ getLabel('csvFile') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('csvDescription') }}
        </p>
        <b-table striped hover small :items="exbCsvItems()" :fields="csvFields" />
      </div>
      <div v-if="enableTx" id="master_tx">
        <hr>
        <p class="helpLabelHeader">
          {{ getLabel('masterTx') }}
        </p>
        <p class="helpTitle">
          {{ getLabel('csvFile') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('csvDescription') }}
        </p>
        <b-table striped hover small :items="txCsvItems()" :fields="csvFields" />
      </div>
      <div v-if="enablePot" id="master_pot">
        <hr>
        <p class="helpLabelHeader">
          {{ getLabel('masterPot') }}
        </p>
        <p class="helpTitle">
          {{ getLabel('csvFile') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('csvDescription') }}
        </p>
        <b-table striped hover small :items="potCsvItems()" :fields="csvFields" />
      </div>
      <div v-if="isDisplayCategory" id="master_category">
        <hr>
        <p class="helpLabelHeader">
          {{ getLabel('category') }}
        </p>

        <p class="helpTitle">
          {{ getLabel('system') + getLabel('category') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('systemCategory') }}
        </p>
        <p class="helpTitle">
          {{ getLabel('absent') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('absent') }}
        </p>
        <p class="helpTitle">
          {{ getLabel('prohibit') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('prohibit') }}
        </p>
        <p class="helpTitle">
          {{ getLabel('csvFile') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('csvDescription') }}
        </p>
        <b-table striped hover small :items="categoryCsvItems()" :fields="csvFields" />
      </div>
      <div v-if="enableGroup" id="master_group">
        <hr>
        <p class="helpLabelHeader">
          {{ getLabel('masterGroup') }}
        </p>
        <p class="helpTitle">
          {{ getLabel('csvFile') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('csvDescription') }}
        </p>
        <b-table striped hover small :items="groupCsvItems()" :fields="csvFields" />
      </div>
      <div v-if="enableUser" id="master_user">
        <hr>
        <p class="helpLabelHeader">
          {{ getLabel('masterUser') }}
        </p>
        <p class="helpTitle">
          {{ getLabel('csvFile') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('csvDescription') }}
        </p>
        <b-table striped hover small :items="userCsvItems()" :fields="csvFields" />
      </div>
      <div v-if="enableRole" id="master_role">
        <hr>
        <p class="helpLabelHeader">
          {{ getLabel('masterRole') }}
        </p>
        <p class="helpTitle">
          {{ getLabel('csvFile') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('csvDescription') }}
        </p>
        <b-table striped hover small :items="roleCsvItems()" :fields="csvFields" />
      </div>
      <div v-if="isDisplayZoneClass" id="master_zoneClass">
        <hr>
        <p class="helpLabelHeader">
          {{ getLabel('zoneClass') }}
        </p>

        <p class="helpTitle">
          {{ getLabel('zone') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('zoneClass') }}
        </p>
        <p class="helpTitle">
          {{ getLabel('csvFile') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('csvDescription') }}
        </p>
        <b-table striped hover small :items="zoneClassCsvItems()" :fields="csvFields" />
      </div>
      <div v-if="isDisplayZoneBlock" id="master_zoneBlock">
        <hr>
        <p class="helpLabelHeader">
          {{ getLabel('zoneBlock') }}
        </p>

        <p class="helpTitle">
          {{ getLabel('setting') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('zoneBlock', {zoneBlock: getLabel('zoneBlock')}) }}
        </p>
      </div>
      <div v-if="enableGateway" id="monitor_gateway">
        <hr>
        <p class="helpLabelHeader">
          {{ getLabel('monitorGW') }}
        </p>
        <p class="helpTitle">
          {{ getLabel('csvFile') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('csvDescription') }}
        </p>
        <b-table striped hover small :items="GatewayCsvItems()" :fields="csvFields" />
      </div>
      <div v-if="enableMonitorTX" id="monitor_position">
        <hr>
        <p class="helpLabelHeader">
          {{ getLabel('monitorTX') }}
        </p>
        <p class="helpTitle">
          {{ getLabel('csvFile') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('csvDescription') }}
        </p>
        <b-table striped hover small :items="positionCsvItems()" :fields="csvFields" />
      </div>
      <div v-if="enableTelemetry" id="monitor_telemetry">
        <hr>
        <p class="helpLabelHeader">
          {{ getLabel('monitorEXB') }}
        </p>
        <p class="helpTitle">
          {{ getLabel('csvFile') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('csvDescription') }}
        </p>
        <b-table striped hover small :items="telemetryCsvItems()" :fields="csvFields" />
      </div>
      <div v-if="enableUsageSituation" id="sum_usage-situation">
        <hr>
        <p class="helpLabelHeader">
          {{ getLabel('SumUtilizationRatio') }}
        </p>
        <p class="helpTitle">
          {{ getLabel('csvFile') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('csvDescription') }}
        </p>
        <b-table striped hover small :items="usageSituationCsvItems()" :fields="csvFields" />
      </div>
      <div v-if="enableSensorGraph" id="sum_sensorGraph">
        <hr>
        <p class="helpLabelHeader">
          {{ getLabel('SensorGraph') }}
        </p>
        <p class="helpTitle">
          {{ getLabel('csvFile') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('csvDescription') }}
        </p>
        <b-table striped hover small :items="sensorGraphCsvItems()" :fields="csvFields" />
      </div>
      <div v-if="enableStayRatio" id="sum_stayRatio">
        <hr>
        <p class="helpLabelHeader">
          {{ getLabel('stayRatio') }}
        </p>
        <p class="helpTitle">
          {{ getLabel('csvFile') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('csvDescription') }}
        </p>
        <b-table striped hover small :items="stayRatioCsvItems()" :fields="csvFields" />
      </div>
      <div v-if="enableTemperatureHistory" id="history_temperatureHistory">
        <hr>
        <p class="helpLabelHeader">
          {{ getLabel('temperatureHistory') }}
        </p>
        <p class="helpTitle">
          {{ getLabel('csvFile') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('csvDescription') }}
        </p>
        <b-table striped hover small :items="temperatureHistoryCsvItems()" :fields="csvFields" />
      </div>
      <div v-if="enablePositionHistory" id="history_positionHistory">
        <hr>
        <p class="helpLabelHeader">
          {{ getLabel('PositionHistory') }}
        </p>
        <p class="helpTitle">
          {{ getLabel('csvFile') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('csvDescription') }}
        </p>
        <b-table striped hover small :items="positionHistoryCsvItems()" :fields="csvFields" />
      </div>
      <div v-if="enableSensorHistory" id="history_sensorHistory">
        <hr>
        <p class="helpLabelHeader">
          {{ getLabel('SensorHistory') }}
        </p>
        <p class="helpTitle">
          {{ getLabel('csvFile') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('csvDescription') }}
        </p>
        <b-table striped hover small :items="sensorHistoryCsvItems()" :fields="csvFields" />
      </div>
      <div v-if="enableNotifyHistory" id="history_notifyHistory">
        <hr>
        <p class="helpLabelHeader">
          {{ getLabel('notifyHistory') }}
        </p>
        <p class="helpTitle">
          {{ getLabel('csvFile') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('csvDescription') }}
        </p>
        <b-table striped hover small :items="notifyHistoryCsvItems()" :fields="csvFields" />
      </div>
      <div v-if="enableStayRatioBase" id="sum_stayRatioBase">
        <hr>
        <p class="helpLabelHeader">
          {{ getLabel('stayRatioBase') }}
        </p>

        <p class="helpTitle">
          {{ getLabel('download') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('stayRatioBaseDownload') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'

export default {
  props: {
    fromPage: {
      type: String,
      default: '',
    },
  },
  data () {
    return {
      isEnableHelp: true,
      isDisplayPositionList: false,
      isDisplayBulkRegister: false,
      isDisplayRegion: false,
      isDisplayArea: false,
      isDisplayExb: false,
      isDisplayTx: false,
      isDisplayPot: false,
      isDisplayCategory: false,
      isDisplayGroup: false,
      isDisplayUser: false,
      isDisplayRole: false,
      isDisplayZoneClass: false,
      isDisplayZoneBlock: false,
      isDisplayGateway: false,
      isDisplayMonitorTX: false,
      isDisplayTelemetry: false,
      isDisplayUsageSituation: false,
      isDisplaySensorGraph: false,
      isDisplayStayRatio: false,
      isDisplayTemperatureHistory: false,
      isDisplayPositionHistory: false,
      isDisplaySensorHistory: false,
      isDisplayNotifyHistory: false,
      isDisplayStayRatioBase: false,
      csvFields: ViewHelper.addLabelByKey(this.$i18n, [
        {key: 'keyName', sortable: true, label: 'keyName', thClass: 'fields', tdClass: 'items'},
        {key: 'displayName', sortable: false, label: 'displayName', thClass: 'fields', tdClass: 'items'},
      ]),
      bulkFields: ViewHelper.addLabelByKey(this.$i18n, [
        {key: 'error_name', sortable: true, label: 'error', thClass: 'fields', tdClass: 'items'},
        {key: 'description', sortable: false, label: 'detail', thClass: 'fields', tdClass: 'items'},
      ]),
    }
  },
  computed: {
    ...mapState([
      'menu',
    ]),
    enablePositionList() {
      return this.isDisplayPositionList
    },
    enableBulkRegister() {
      return this.isDisplayBulkRegister
    },
    enableRegion() {
      return this.isDisplayRegion
    },
    enableArea() {
      return this.isDisplayArea
    },
    enableExb() {
      return this.isDisplayExb
    },
    enableTx() {
      return this.isDisplayTx
    },
    enablePot() {
      return this.isDisplayPot
    },
    enableCategory() {
      return this.isDisplayCategory
    },
    enableGroup() {
      return this.isDisplayGroup
    },
    enableUser() {
      return this.isDisplayUser
    },
    enableRole() {
      return this.isDisplayRole
    },
    enablePZoneClass() {
      return this.isDisplayZoneClass
    },
    enableZoneBlock() {
      return this.isDisplayZoneBlock
    },
    enableGateway() {
      return this.isDisplayGateway
    },
    enableMonitorTX() {
      return this.isDisplayMonitorTX
    },
    enableTelemetry() {
      return this.isDisplayTelemetry
    },
    enableUsageSituation() {
      return this.isDisplayUsageSituation
    },
    enableSensorGraph() {
      return this.isDisplaySensorGraph
    },
    enableStayRatio() {
      return this.isDisplayStayRatio
    },
    enableTemperatureHistory() {
      return this.isDisplayTemperatureHistory
    },
    enablePositionHistory() {
      return this.isDisplayPositionHistory
    },
    enableSensorHistory() {
      return this.isDisplaySensorHistory
    },
    enableNotifyHistory() {
      return this.isDisplayNotifyHistory
    },
    enableStayRatioBase() {
      return this.isDisplayStayRatioBase
    },
  },
  methods: {
    initialize() {
      this.checkMenu()
      Vue.nextTick(function () {
        // if反映された後の描画を待ってページ内遷移させる
        document.getElementById('helpAutoLink').click()
      })
    },
    checkMenu() {
      this.menu.forEach(function(parent) {
        if (!this.isDisplayPositionList) {
          this.isDisplayPositionList = parent.pages.find((val) => val.path == 'position-list')? true: false
        }
        if (parent.key == 'main' && !this.isDisplayBulkRegister) {
          this.isDisplayBulkRegister = parent.pages.length > 0? true: false
        }
        if (!this.isDisplayRegion) {
          this.isDisplayRegion = parent.pages.find((val) => val.path == 'region')? true: false
        }
        if (!this.isDisplayArea) {
          this.isDisplayArea = parent.pages.find((val) => val.path == 'area')? true: false
        }
        if (!this.isDisplayExb) {
          this.isDisplayExb = parent.pages.find((val) => val.path == 'exb')? true: false
        }
        if (!this.isDisplayTx) {
          this.isDisplayTx = parent.pages.find((val) => val.path == 'tx')? true: false
        }
        if (!this.isDisplayPot) {
          this.isDisplayPot = parent.pages.find((val) => val.path == 'pot')? true: false
        }
        if (!this.isDisplayCategory) {
          this.isDisplayCategory = parent.pages.find((val) => val.path == 'category')? true: false
        }
        if (!this.isDisplayGroup) {
          this.isDisplayGroup = parent.pages.find((val) => val.path == 'group')? true: false
        }
        if (!this.isDisplayUser) {
          this.isDisplayUser = parent.pages.find((val) => val.path == 'user')? true: false
        }
        if (!this.isDisplayRole) {
          this.isDisplayRole = parent.pages.find((val) => val.path == 'role')? true: false
        }
        if (!this.isDisplayZoneClass) {
          this.isDisplayZoneClass = parent.pages.find((val) => val.path == 'zoneClass')? true: false
        }
        if (!this.isDisplayZoneBlock) {
          this.isDisplayZoneBlock = parent.pages.find((val) => val.path == 'zoneBlock')? true: false
        }
        if (!this.isDisplayGateway) {
          this.isDisplayGateway = parent.pages.find((val) => val.path == 'gateway')? true: false
        }
        if (parent.key == 'monitor' && !this.isDisplayMonitorTX) {
          this.isDisplayMonitorTX = parent.pages.find((val) => val.path == 'position')? true: false
        }
        if (!this.isDisplayTelemetry) {
          this.isDisplayTelemetry = parent.pages.find((val) => val.path == 'telemetry')? true: false
        }
        if (!this.isDisplayUsageSituation) {
          this.isDisplayUsageSituation = parent.pages.find((val) => val.path == 'usage-situation')? true: false
        }
        if (!this.isDisplaySensorGraph) {
          this.isDisplaySensorGraph = parent.pages.find((val) => val.path == 'sensorGraph')? true: false
        }
        if (!this.isDisplayStayRatio) {
          this.isDisplayStayRatio = parent.pages.find((val) => val.path == 'stayRatio')? true: false
        }
        if (!this.isDisplayTemperatureHistory) {
          this.isDisplayTemperatureHistory = parent.pages.find((val) => val.path == 'temperatureHistory')? true: false
        }
        if (!this.isDisplayPositionHistory) {
          this.isDisplayPositionHistory = parent.pages.find((val) => val.path == 'positionHistory')? true: false
        }
        if (!this.isDisplaySensorHistory) {
          this.isDisplaySensorHistory = parent.pages.find((val) => val.path == 'sensorHistory')? true: false
        }
        if (!this.isDisplayNotifyHistory) {
          this.isDisplayNotifyHistory = parent.pages.find((val) => val.path == 'notifyHistory')? true: false
        }
        if (!this.isDisplayStayRatioBase) {
          this.isDisplayStayRatioBase = parent.pages.find((val) => val.path == 'stayRatioBase')? true: false
        }
      }.bind(this))

      this.isEnableHelp = this.isDisplayPositionList || 
        this.isDisplayBulkRegister || 
        this.isDisplayRegion || 
        this.isDisplayArea || 
        this.isDisplayExb || 
        this.isDisplayTx || 
        this.isDisplayPot || 
        this.isDisplayCategory || 
        this.isDisplayGroup || 
        this.isDisplayUser || 
        this.isDisplayRole || 
        this.isDisplayZoneClass || 
        this.isDisplayZoneBlock || 
        this.isDisplayGateway || 
        this.isDisplayMonitorTX || 
        this.isDisplayTelemetry || 
        this.isDisplayUsageSituation || 
        this.isDisplaySensorGraph || 
        this.isDisplayStayRatio || 
        this.isDisplayTemperatureHistory || 
        this.isDisplayPositionHistory || 
        this.isDisplaySensorHistory || 
        this.isDisplayNotifyHistory || 
        this.isDisplayStayRatioBase

    },
    getLabel(key, option){
      return this.$i18n.tnl('label.' + key, option)
    },
    getMessage(key, option){
      return this.$i18n.tnl('message.' + key, option)
    },
    getHelpDescription(key, option){
      return this.$i18n.tnl('helpDescription.' + key, option)
    },
    getConfig(key, option){
      return this.$i18n.tnl('config.' + key, option)
    },
    bulkItems() {
      return [
        { isActive: true, description: this.getHelpDescription('bulkUniqueFailed'), error_name: this.getMessage('bulkUniqueFailed', {col: this.getLabel('linage'), value: this.getLabel('keyName')}) },
        { isActive: true, description: this.getHelpDescription('bulkExistFailed'), error_name: this.getMessage('bulkExistFailed', {col: this.getLabel('linage'), value: this.getLabel('keyName')}) },
        { isActive: true, description: this.getHelpDescription('bulkAuthFailed'), error_name: this.getMessage('bulkAuthFailed', {col: this.getLabel('linage'), value: this.getLabel('keyName')}) },
        { isActive: true, description: this.getHelpDescription('bulkSystemUseFailed'), error_name: this.getMessage('bulkSystemUseFailed', {col: this.getLabel('linage'), value: this.getLabel('keyName')}) },
        { isActive: true, description: this.getHelpDescription('bulkSystemUseNameFailed'), error_name: this.getMessage('bulkSystemUseNameFailed', {col: this.getLabel('linage'), value: this.getLabel('keyName')}) },
      ]
    },
    regionCsvItems() {
      return [
        { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.getLabel('regionName'), keyName: 'regionName' },
        { isActive: true, displayName: this.getLabel('meshId'), keyName: 'meshId' },
        { isActive: true, displayName: this.getLabel('description'), keyName: 'description' },
        { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
      ]
    },
    areaCsvItems() {
      return [
        { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.getLabel('areaName'), keyName: 'areaName' },
        { isActive: true, displayName: 'areaCd', keyName: 'areaCd' },
        { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
      ]
    },
    exbCsvItems() {
      return [
        { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.getLabel('deviceId'), keyName: 'deviceId' },
        { isActive: true, displayName: this.getLabel('deviceIdX'), keyName: 'deviceIdX' },
        { isActive: true, displayName: this.getLabel('locationName'), keyName: 'locationName' },
        { isActive: true, displayName: this.getLabel('posId'), keyName: 'posId' },
        { isActive: true, displayName: this.getLabel('areaName'), keyName: 'areaName' },
        { isActive: true, displayName: this.getLabel('locationX'), keyName: 'x' },
        { isActive: true, displayName: this.getLabel('locationY'), keyName: 'y' },
        { isActive: true, displayName: this.getHelpDescription('enabled'), keyName: 'enabled' },
        { isActive: true, displayName: this.getLabel('type'), keyName: 'sensor' },
        { isActive: true, displayName: this.getLabel('zoneName'), keyName: 'zoneName' },
        { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
      ]
    },
    txCsvItems() {
      return [
        { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.getLabel('btxId'), keyName: 'btxId' },
        { isActive: true, displayName: this.getLabel('major'), keyName: 'major' },
        { isActive: true, displayName: this.getLabel('minor'), keyName: 'minor' },
        { isActive: true, displayName: this.getLabel('type'), keyName: 'sensor' },
        { isActive: true, displayName: this.getLabel('disp'), keyName: 'disp' },
        { isActive: true, displayName: this.getHelpDescription('txAreaName'), keyName: 'areaName' },
        { isActive: true, displayName: this.getHelpDescription('txXY'), keyName: 'x' },
        { isActive: true, displayName: this.getHelpDescription('txXY'), keyName: 'y' },
        { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
      ]
    },
    potCsvItems() {
      return [
        { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.getLabel('btxId'), keyName: 'btxId' },
        { isActive: true, displayName: this.getLabel('minor'), keyName: 'minor' },
        { isActive: true, displayName: this.getLabel('potCd'), keyName: 'potCd' },
        { isActive: true, displayName: this.getLabel('potName'), keyName: 'potName' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'potType' },
        { isActive: true, displayName: this.getLabel('displayName'), keyName: 'displayName' },
        { isActive: true, displayName: this.getLabel('group'), keyName: 'groupName' },
        { isActive: true, displayName: this.getLabel('category'), keyName: 'categoryName' },
        { isActive: true, displayName: this.getLabel('post'), keyName: 'post' },
        { isActive: true, displayName: this.getLabel('tel'), keyName: 'tel' },
        { isActive: true, displayName: this.getLabel('description'), keyName: 'description' },
        { isActive: true, displayName: this.getLabel('loginId'), keyName: 'loginId' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'roleName' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'pass' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'email' },
        { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
      ]
    },
    categoryCsvItems() {
      return [
        { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.getLabel('categoryName'), keyName: 'categoryName' },
        { isActive: true, displayName: this.getLabel('categoryType'), keyName: 'categoryTypeName' },
        { isActive: true, displayName: this.getLabel('display'), keyName: 'color' },
        { isActive: true, displayName: this.getLabel('display'), keyName: 'bgColor' },
        { isActive: true, displayName: this.getLabel('display'), keyName: 'Shape' },
        { isActive: true, displayName: this.getLabel('description'), keyName: 'description' },
        { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
      ]
    },
    groupCsvItems() {
      return [
        { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.getLabel('groupName'), keyName: 'groupName' },
        { isActive: true, displayName: this.getLabel('ruby'), keyName: 'ruby' },
        { isActive: true, displayName: this.getLabel('display'), keyName: 'color' },
        { isActive: true, displayName: this.getLabel('display'), keyName: 'bgColor' },
        { isActive: true, displayName: this.getLabel('display'), keyName: 'Shape' },
        { isActive: true, displayName: this.getLabel('description'), keyName: 'description' },
        { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
      ]
    },
    userCsvItems() {
      return [
        { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'userId' },
        { isActive: true, displayName: this.getLabel('loginId'), keyName: 'loginId' },
        { isActive: true, displayName: this.getLabel('name'), keyName: 'name' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'pass' },
        { isActive: true, displayName: this.getLabel('email'), keyName: 'email' },
        { isActive: true, displayName: this.getLabel('role'), keyName: 'roleName' },
        { isActive: true, displayName: this.getLabel('description'), keyName: 'description' },
        { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
      ]
    },
    roleCsvItems() {
      return [
        { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.getLabel('roleName'), keyName: 'roleName' },
        { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
      ]
    },
    zoneClassCsvItems() {
      return [
        { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.getLabel('zoneName'), keyName: 'zoneName' },
        { isActive: true, displayName: this.getLabel('areaName'), keyName: 'areaName' },
        { isActive: true, displayName: this.getLabel('categoryName'), keyName: 'categoryName' },
        { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
      ]
    },
    GatewayCsvItems() {
      return [
        { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.getLabel('no'), keyName: 'num' },
        { isActive: true, displayName: this.getLabel('deviceId'), keyName: 'deviceId' },
        { isActive: true, displayName: this.getLabel('finalReceiveTimestamp'), keyName: 'updated' },
        { isActive: true, displayName: this.getLabel('state'), keyName: 'state' },
        { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
      ]
    },
    positionCsvItems() {
      return [
        { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.getLabel('btx_id'), keyName: 'btx_id' },
        { isActive: true, displayName: this.getLabel('major'), keyName: 'major' },
        { isActive: true, displayName: this.getLabel('minor'), keyName: 'minor' },
        { isActive: true, displayName: this.getLabel('name'), keyName: 'name' },
        { isActive: true, displayName: this.getLabel('powerLevel'), keyName: 'powerLevel' },
        { isActive: true, displayName: this.getLabel('finalReceiveLocation'), keyName: 'location' },
        { isActive: true, displayName: this.getLabel('finalReceiveTimestamp'), keyName: 'timestamp' },
        { isActive: true, displayName: this.getLabel('state'), keyName: 'state' },
        { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
      ]
    },
    telemetryCsvItems() {
      return [
        { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.getLabel('deviceId'), keyName: 'deviceId' },
        { isActive: true, displayName: this.getLabel('deviceIdX'), keyName: 'deviceIdX' },
        { isActive: true, displayName: this.getLabel('exbName'), keyName: 'finalRevceivePlace' },
        { isActive: true, displayName: this.getLabel('powerLevel'), keyName: 'powerLevel' },
        { isActive: true, displayName: this.getLabel('finalReceiveTimestamp'), keyName: 'timestamp' },
        { isActive: true, displayName: this.getLabel('state'), keyName: 'state' },
        { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
      ]
    },
    usageSituationCsvItems() {
      return [
        { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.getLabel('zoneCategoryName'), keyName: 'zoneCategoryName' },
        { isActive: true, displayName: this.getLabel('zoneName'), keyName: 'zoneName' },
        { isActive: true, displayName: this.getLabel('utilizationRatioP'), keyName: 'rate' },
        { isActive: true, displayName: this.getLabel('utilizationTime'), keyName: 'cnt' },
        { isActive: true, displayName: this.getLabel('numOfUsers'), keyName: 'numUse' },
        { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
      ]
    },
    sensorGraphCsvItems() {
      return [
        { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'humidity(lat)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'humidity(max)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'humidity(avg)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'humidity(min)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'temperature(lat)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'temperature(max)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'temperature(avg)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'temperature(min)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'count(lat)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'count(max)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'count(avg)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'count(min)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'step(lat)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'step(max)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'step(avg)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'step(min)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'beat(lat)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'beat(max)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'beat(avg)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'beat(min)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'low(lat)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'low(max)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'low(avg)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'low(min)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'high(lat)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'high(max)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'high(avg)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'high(min)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'down(lat)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'down(max)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'down(avg)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'down(min)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'magnet(max)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'magnet(min)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'pressVol(lat)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'pressVol(max)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'pressVol(avg)' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'pressVol(min)' },
        { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
      ]
    },
    stayRatioCsvItems() {
      return [
        { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.getLabel('date'), keyName: 'date' },
        { isActive: true, displayName: this.getLabel('name'), keyName: 'name' },
        { isActive: true, displayName: this.getLabel('groupName'), keyName: 'groupName' },
        { isActive: true, displayName: this.getLabel('stayTime'), keyName: 'stayTime' },
        { isActive: true, displayName: this.getLabel('absent1Time'), keyName: this.getLabel('stayRatioAbsent1Time') },
        { isActive: true, displayName: this.getLabel('absent2Time'), keyName: this.getLabel('stayRatioAbsent2Time') },
        { isActive: true, displayName: this.getLabel('lostTime'), keyName: 'lostTime' },
        { isActive: true, displayName: this.getLabel('stayRatio'), keyName: 'stayRatio' },
        { isActive: true, displayName: this.getLabel('absent1Ratio'), keyName: this.getLabel('stayRatioAbsent1Ratio') },
        { isActive: true, displayName: this.getLabel('absent2Ratio'), keyName: this.getLabel('stayRatioAbsent2Ratio') },
        { isActive: true, displayName: this.getLabel('lostRatio'), keyName: 'lostRatio' },
        { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
      ]
    },
    temperatureHistoryCsvItems() {
      return [
        { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'sensorHistoryId' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'txId' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'exbId' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'dt' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'sensorDt' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'temperature' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'humidity' },
        { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
      ]
    },
    positionHistoryCsvItems() {
      return [
        { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.getLabel('dt'), keyName: 'positionDt' },
        { isActive: true, displayName: this.getConfig('OPTIONS.POSITION_HISTORY.txName'), keyName: 'txName' },
        { isActive: true, displayName: this.getConfig('OPTIONS.POSITION_HISTORY.major'), keyName: 'major' },
        { isActive: true, displayName: this.getConfig('OPTIONS.POSITION_HISTORY.minor'), keyName: 'minor' },
        { isActive: true, displayName: this.getLabel('deviceId'), keyName: 'exbId' },
        { isActive: true, displayName: this.getConfig('OPTIONS.POSITION_HISTORY.locationName'), keyName: 'locationName' },
        { isActive: true, displayName: this.getLabel('posId'), keyName: 'posId' },
        { isActive: true, displayName: this.getLabel('area'), keyName: 'areaName' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'x' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'y' },
        { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
      ]
    },
    sensorHistoryCsvItems() {
      return [
        { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.getLabel('dt'), keyName: 'sensorDt' },
        { isActive: true, displayName: this.getLabel('sensorName'), keyName: 'sensorName' },
        { isActive: true, displayName: this.getLabel('deviceNum'), keyName: 'deviceNum' },
        { isActive: true, displayName: this.getLabel('deviceId'), keyName: 'deviceId' },
        { isActive: true, displayName: this.getLabel('deviceIdX'), keyName: 'deviceIdX' },
        { isActive: true, displayName: this.getLabel('locationZoneName'), keyName: 'locationName' },
        { isActive: true, displayName: this.getLabel('posId'), keyName: 'posId' },
        { isActive: true, displayName: this.getLabel('areaName'), keyName: 'areaName' },
        { isActive: true, displayName: this.getLabel('temperature'), keyName: 'temperature' },
        { isActive: true, displayName: this.getLabel('humidity'), keyName: 'humidity' },
        { isActive: true, displayName: this.getLabel('numUsers'), keyName: 'count' },
        { isActive: true, displayName: this.getLabel('txName'), keyName: 'txName' },
        { isActive: true, displayName: this.getLabel('major'), keyName: 'major' },
        { isActive: true, displayName: this.getLabel('minor'), keyName: 'minor' },
        { isActive: true, displayName: this.getLabel('h_blood_pressure'), keyName: 'high' },
        { isActive: true, displayName: this.getLabel('l_blood_pressure'), keyName: 'low' },
        { isActive: true, displayName: this.getLabel('heart_rate'), keyName: 'beat' },
        { isActive: true, displayName: this.getLabel('step'), keyName: 'step' },
        { isActive: true, displayName: this.getLabel('down_count'), keyName: 'down' },
        { isActive: true, displayName: this.getLabel('state'), keyName: 'state' },
        { isActive: true, displayName: this.getLabel('pressVol'), keyName: 'pressVol' },
        { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
      ]
    },
    notifyHistoryCsvItems() {
      return [
        { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.getLabel('dt'), keyName: 'positionDt' },
        { isActive: true, displayName: this.getLabel('notifyTo'), keyName: 'notifyTo' },
        { isActive: true, displayName: this.getLabel('major'), keyName: 'majors' },
        { isActive: true, displayName: this.getLabel('minor'), keyName: 'minor' },
        { isActive: true, displayName: this.getLabel('minorPowerLevel'), keyName: 'minors' },
        { isActive: true, displayName: this.getLabel('txName'), keyName: 'txName' },
        { isActive: true, displayName: this.getLabel('deviceNum'), keyName: 'deviceNum' },
        { isActive: true, displayName: this.getLabel('finalReceiveTime'), keyName: 'finalReceiveTime' },
        { isActive: true, displayName: this.getLabel('notifyResult'), keyName: 'notifyResult' },
        { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
      ]
    }
  }
}
</script>

<style lang="scss">
@import "../../sub/constant/config.scss";

.helpLabelHeader {
  font-weight: bold;
  font-size: 16px;
}
.helpTitle {
  font-weight: bold;
  font-size: 14px;
}
.helpDetail {
  font-size: 14px;
}
hr {
  border-color: black;
  border-top: double;
}
.fields {
  font-size: 14px !important;
}
.items {
  font-size: 14px !important;
}

</style>
