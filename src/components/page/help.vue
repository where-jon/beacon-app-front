<template>
  <div class="container-fluid">
    <div class="container">
      <a id="helpAutoLink" :href="fromPage" />
      <a id="initialize" href="#" @click="initialize" />
      
      <div id="indexList">
        <!-- 目次の見出し -->
        <p class="helpLabelHeader">
          {{ getHelpDescription('indexName') }}
        </p>
        <!-- 目次 -->
        <div v-for="(menuGroup,key) in this.$store.state.menu" :key="key">
          <div class="list-group mt-3"><b>{{ getLabel(menuGroup.key) }}</b></div>
          <a v-for="page in menuGroup.pages" :key="page.key" :href="createLink(page.key)" class="list-group-item list-group-item-action">
            {{ getLabel(page.key) }}
          </a>
        </div>
      </div>
      <!-- ヘルプ本文 -->
      <div v-for="(menuGroup, key) in this.$store.state.menu" :key="key">
        <div v-for="page in menuGroup.pages" :id="page.key" :key="page.key">
          <hr>
          <!-- ヘッダー -->
          <p class="helpLabelHeader">
            {{ getLabel(menuGroup.key) }}：{{ getLabel(page.key) }}
          </p>
          <!-- 概要 -->
          <p class="helpDetail">
            {{ getHelpDescription(page.key, {detected: getLabel('detected'), temporaryUndetect: getLabel('temporaryUndetect'), undetect: getLabel('undetect'), none: getLabel('none')}) }}
          </p>
          <!-- 追加情報 -->
          <div v-for="(addDesc, addkey) in getHelpAdditionalDescription(page.key)" :key="addkey">
            <span class="helpTitle">
              {{ getLabel(addkey) }}
            </span>
            <p class="helpDetail">
              {{ addDesc }}
            </p>
          </div>
        </div>
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
      isDisplayPositionHistory: false,
      isDisplaySensorHistory: false,
      isDisplayNotifyHistory: false,
      isDisplayStayRatioBase: false,
      csvFields: [],
      bulkFields: [],
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
      this.createLabel()
      this.checkMenu()
      Vue.nextTick(function () {
        // if反映された後の描画を待ってページ内遷移させる
        document.getElementById('helpAutoLink').click()
      })
    },
    createLabel(){
      this.csvFields = ViewHelper.addLabelByKey(this.$i18n, [
        {key: 'keyName', sortable: true, label: 'keyName', thClass: 'fields', tdClass: 'items'},
        {key: 'displayName', sortable: false, label: 'displayName', thClass: 'fields', tdClass: 'items'},
      ])
      this.bulkFields = ViewHelper.addLabelByKey(this.$i18n, [
        {key: 'error_name', sortable: true, label: 'error', thClass: 'fields', tdClass: 'items'},
        {key: 'description', sortable: false, label: 'detail', thClass: 'fields', tdClass: 'items'},
      ])
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
    createLink(key){
      return '#'+ key
    },
    getHelpAdditionalDescription(key, option){
      const ret = this.$i18n.tnl('helpAdditionalDescription.' + key, option)
      return ret != 'helpAdditionalDescription.' + key ? ret : null
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
        { isActive: true, displayName: this.getLabel('loginId'), keyName: 'loginId' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'pass' },
        { isActive: true, displayName: this.getLabel('email'), keyName: 'email' },
        { isActive: true, displayName: this.getLabel('name'), keyName: 'name' },
        { isActive: true, displayName: this.getLabel('regionName'), keyName: 'regionName' },
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
        { isActive: true, displayName: this.getLabel('no'), keyName: 'num' },
        { isActive: true, displayName: this.getLabel('deviceId'), keyName: 'deviceId' },
        { isActive: true, displayName: this.getLabel('finalReceiveTimestamp'), keyName: 'updated' },
        { isActive: true, displayName: this.getLabel('state'), keyName: 'state' },
      ]
    },
    positionCsvItems() {
      return [
        { isActive: true, displayName: this.getLabel('btxId'), keyName: 'btxId' },
        { isActive: true, displayName: this.getLabel('major'), keyName: 'major' },
        { isActive: true, displayName: this.getLabel('minor'), keyName: 'minor' },
        { isActive: true, displayName: this.getLabel('name'), keyName: 'name' },
        { isActive: true, displayName: this.getLabel('powerLevel'), keyName: 'powerLevel' },
        { isActive: true, displayName: this.getLabel('finalReceiveLocation'), keyName: 'location' },
        { isActive: true, displayName: this.getLabel('finalReceiveTimestamp'), keyName: 'timestamp' },
        { isActive: true, displayName: this.getLabel('state'), keyName: 'state' },
      ]
    },
    telemetryCsvItems() {
      return [
        { isActive: true, displayName: this.getLabel('deviceId'), keyName: 'deviceId' },
        { isActive: true, displayName: this.getLabel('deviceIdX'), keyName: 'deviceIdX' },
        { isActive: true, displayName: this.getLabel('exbName'), keyName: 'finalRevceivePlace' },
        { isActive: true, displayName: this.getLabel('powerLevel'), keyName: 'powerLevel' },
        { isActive: true, displayName: this.getLabel('finalReceiveTimestamp'), keyName: 'timestamp' },
        { isActive: true, displayName: this.getLabel('state'), keyName: 'state' },
      ]
    },
    usageSituationCsvItems() {
      return [
        { isActive: true, displayName: this.getLabel('zoneCategoryName'), keyName: 'zoneCategoryName' },
        { isActive: true, displayName: this.getLabel('zoneName'), keyName: 'zoneName' },
        { isActive: true, displayName: this.getLabel('utilizationRatioP'), keyName: 'rate' },
        { isActive: true, displayName: this.getLabel('utilizationTime'), keyName: 'cnt' },
        { isActive: true, displayName: this.getLabel('numOfUsers'), keyName: 'numUse' },
      ]
    },
    sensorGraphCsvItems() {
      return [
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
      ]
    },
    stayRatioCsvItems() {
      return [
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
      ]
    },
    positionHistoryCsvItems() {
      return [
        { isActive: true, displayName: this.getLabel('dt'), keyName: 'positionDt' },
        { isActive: true, displayName: this.getConfig('OPTIONS.POSITION_HISTORY.txName'), keyName: 'txName' },
        { isActive: true, displayName: this.getConfig('OPTIONS.POSITION_HISTORY.major'), keyName: 'major' },
        { isActive: true, displayName: this.getConfig('OPTIONS.POSITION_HISTORY.minor'), keyName: 'minor' },
        { isActive: true, displayName: this.getLabel('deviceId'), keyName: 'exbId' },
        { isActive: true, displayName: this.getConfig('OPTIONS.POSITION_HISTORY.locationName'), keyName: 'locationName' },
        { isActive: true, displayName: this.getLabel('area'), keyName: 'areaName' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'x' },
        { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'y' },
      ]
    },
    sensorHistoryCsvItems() {
      return [
        { isActive: true, displayName: this.getLabel('dt'), keyName: 'sensorDt' },
        { isActive: true, displayName: this.getLabel('sensorName'), keyName: 'sensorName' },
        { isActive: true, displayName: this.getLabel('deviceNum'), keyName: 'deviceNum' },
        { isActive: true, displayName: this.getLabel('deviceId'), keyName: 'deviceId' },
        { isActive: true, displayName: this.getLabel('deviceIdX'), keyName: 'deviceIdX' },
        { isActive: true, displayName: this.getLabel('locationZoneName'), keyName: 'locationName' },
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
      ]
    },
    notifyHistoryCsvItems() {
      return [
        { isActive: true, displayName: this.getLabel('dt'), keyName: 'positionDt' },
        { isActive: true, displayName: this.getLabel('notifyTo'), keyName: 'notifyTo' },
        { isActive: true, displayName: this.getLabel('major'), keyName: 'majors' },
        { isActive: true, displayName: this.getLabel('minor'), keyName: 'minor' },
        { isActive: true, displayName: this.getLabel('minorPowerLevel'), keyName: 'minors' },
        { isActive: true, displayName: this.getLabel('txName'), keyName: 'txName' },
        { isActive: true, displayName: this.getLabel('deviceNum'), keyName: 'deviceNum' },
        { isActive: true, displayName: this.getLabel('finalReceiveTime'), keyName: 'finalReceiveTime' },
        { isActive: true, displayName: this.getLabel('notifyResult'), keyName: 'notifyResult' },
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
  background-color: #e9ecef;
  padding: 7px;
}
.helpTitle {
  font-weight: bold;
  font-size: 14px;
}
.helpDetail {
  font-size: 14px;
  white-space: pre-line;  // ボックス端で自動改行、\nで明示的に改行
}
hr {
  border-color: #e9ecef;
}
.fields {
  font-size: 14px !important;
}
.items {
  font-size: 14px !important;
}

</style>
