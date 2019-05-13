<template>
  <div class="container-fluid">
    <div class="container">
      <a id="helpAutoLink" :href="fromPage" />
      <a id="initialize" href="#" v-on:click="initialize" />
      
      <div id="indexList">
        <p v-if="isEnableHelp" class="helpLabelHeader">
          {{ $i18n.tnl('helpDescription.indexName') }}
        </p>
        <p v-else class="helpLabelHeader">
          {{ $i18n.tnl('helpDescription.helpNone') }}
        </p>
        <div v-if="enablePositionList">
          <a href="#position-list">
            {{ $i18n.tnl('label.positionList') }}
          </a><br>
        </div>
        <div v-if="enableBulkRegister">
          <a href="#bulkedit">
            {{ $i18n.tnl('label.bulkRegister') }}
          </a><br>
        </div>
        <div v-if="enableArea">
          <a href="#area">
            {{ $i18n.tnl('label.masterArea') }}
          </a><br>
        </div>
        <div v-if="enableExb">
          <a href="#exb">
            {{ $i18n.tnl('label.masterExb') }}
          </a><br>
        </div>
        <div v-if="enableTx">
          <a href="#tx">
            {{ $i18n.tnl('label.masterTx') }}
          </a><br>
        </div>
        <div v-if="enablePot">
          <a href="#pot">
            {{ $i18n.tnl('label.masterPot') }}
          </a><br>
        </div>
        <div v-if="isDisplayCategory">
          <a href="#category">
            {{ $i18n.tnl('label.masterCategory') }}
          </a><br>
        </div>
        <div v-if="enableGroup">
          <a href="#group">
            {{ $i18n.tnl('label.masterGroup') }}
          </a><br>
        </div>
        <div v-if="enableUser">
          <a href="#user">
            {{ $i18n.tnl('label.masterUser') }}
          </a><br>
        </div>
        <div v-if="enableRole">
          <a href="#role">
            {{ $i18n.tnl('label.masterRole') }}
          </a><br>
        </div>
        <div v-if="isDisplayZoneClass">
          <a href="#zoneClass">
            {{ $i18n.tnl('label.zoneClass') }}
          </a><br>
        </div>
        <div v-if="isDisplayZoneBlock">
          <a href="#zoneBlock">
            {{ $i18n.tnl('label.zoneBlock') }}
          </a><br>
        </div>
        <div v-if="enableGateway">
          <a href="#gateway">
            {{ $i18n.tnl('label.monitorGW') }}
          </a><br>
        </div>
        <div v-if="enablePosition">
          <a href="#position">
            {{ $i18n.tnl('label.monitorTX') }}
          </a><br>
        </div>
        <div v-if="enableTelemetry">
          <a href="#telemetry">
            {{ $i18n.tnl('label.monitorEXB') }}
          </a><br>
        </div>
        <div v-if="enableUsageSituation">
          <a href="#usage-situation">
            {{ $i18n.tnl('label.SumUtilizationRatio') }}
          </a><br>
        </div>
        <div v-if="enableSensorGraph">
          <a href="#sensorGraph">
            {{ $i18n.tnl('label.SensorGraph') }}
          </a><br>
        </div>
        <div v-if="enableStayTime">
          <a href="#stayTime">
            {{ $i18n.tnl('label.stayTime') }}
          </a><br>
        </div>
        <div v-if="enableStayRatio">
          <a href="#stayRatio">
            {{ $i18n.tnl('label.stayRatio') }}
          </a><br>
        </div>
        <div v-if="enableTemperatureHistory">
          <a href="#temperatureHistory">
            {{ $i18n.tnl('label.temperatureHistory') }}
          </a><br>
        </div>
        <div v-if="enablePositionHistory">
          <a href="#positionHistory">
            {{ $i18n.tnl('label.PositionHistory') }}
          </a><br>
        </div>
        <div v-if="enableSensorHistory">
          <a href="#sensorHistory">
            {{ $i18n.tnl('label.SensorHistory') }}
          </a><br>
        </div>
        <div v-if="enableNotifyHistory">
          <a href="#notifyHistory">
            {{ $i18n.tnl('label.notifyHistory') }}
          </a><br>
        </div>
      </div>
      <div v-if="enablePositionList" id="position-list">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.positionList') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('label.state') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.state', {detected: detected, temporaryUndetect: temporaryUndetect, undetect: undetect, none: none}) }}
        </p>
      </div>
      <div v-if="enableBulkRegister" id="bulkedit">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.bulkRegister') }}
        </p>
        
        <p class="helpTitle">
          {{ $i18n.tnl('label.notes') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.bulkNotes', {personal: personal, charSet: charSet, SJIS: SJIS}) }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('label.register') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.bulkRegister') }}
        </p>
        <b-table striped hover small :items="bulkItems" :fields="bulkFields" />
      </div>
      <div v-if="enableArea" id="area">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.masterArea') }}
        </p>

      </div>
      <div v-if="enableExb" id="exb">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.masterExb') }}
        </p>

      </div>
      <div v-if="enableTx" id="tx">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.masterTx') }}
        </p>

      </div>
      <div v-if="enablePot" id="pot">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.masterPot') }}
        </p>

      </div>
      <div v-if="isDisplayCategory" id="category">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.category') }}
        </p>

        <p class="helpTitle">
          {{ $i18n.tnl('label.system') + $i18n.tnl('label.category') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.systemCategory') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('label.absent') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.absent') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('label.prohibit') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.prohibit') }}
        </p>
      </div>
      <div v-if="enableGroup" id="group">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.masterGroup') }}
        </p>

      </div>
      <div v-if="enableUser" id="user">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.masterUser') }}
        </p>

      </div>
      <div v-if="enableRole" id="role">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.masterRole') }}
        </p>

      </div>
      <div v-if="isDisplayZoneClass" id="zoneClass">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.zoneClass') }}
        </p>

        <p class="helpTitle">
          {{ $i18n.tnl('label.zone') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.zoneClass') }}
        </p>
      </div>
      <div v-if="isDisplayZoneBlock" id="zoneBlock">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.zoneBlock') }}
        </p>

        <p class="helpTitle">
          {{ $i18n.tnl('label.setting') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.zoneBlock', {zoneBlock: zoneBlock}) }}
        </p>
      </div>
      <div v-if="enableGateway" id="gateway">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.monitorGW') }}
        </p>

      </div>
      <div v-if="enablePosition" id="position">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.monitorTX') }}
        </p>

      </div>
      <div v-if="enableTelemetry" id="telemetry">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.monitorEXB') }}
        </p>

      </div>
      <div v-if="enableUsageSituation" id="usage-situation">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.SumUtilizationRatio') }}
        </p>

      </div>
      <div v-if="enableSensorGraph" id="sensorGraph">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.SensorGraph') }}
        </p>

      </div>
      <div v-if="enableStayTime" id="stayTime">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.stayTime') }}
        </p>

      </div>
      <div v-if="enableStayRatio" id="stayRatio">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.stayRatio') }}
        </p>

      </div>
      <div v-if="enableTemperatureHistory" id="temperatureHistory">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.temperatureHistory') }}
        </p>

      </div>
      <div v-if="enablePositionHistory" id="positionHistory">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.PositionHistory') }}
        </p>

      </div>
      <div v-if="enableSensorHistory" id="sensorHistory">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.SensorHistory') }}
        </p>

      </div>
      <div v-if="enableNotifyHistory" id="notifyHistory">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.notifyHistory') }}
        </p>

      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import * as ViewHelper from '../../sub/helper/ViewHelper'

export default {
  props: {
    fromPage: {
      type: String,
      default: '',
    },
  },
  data () {
    return {
      linage: this.$i18n.tnl('label.linage'),
      keyName: this.$i18n.tnl('label.keyName'),
      detected: this.$i18n.tnl('label.detected'),
      temporaryUndetect: this.$i18n.tnl('label.temporaryUndetect'),
      undetect: this.$i18n.tnl('label.undetect'),
      none: this.$i18n.tnl('label.none'),
      personal: this.$i18n.tnl('label.personal'),
      charSet: this.$i18n.tnl('label.charSet'),
      SJIS: this.$i18n.tnl('label.SJIS'),
      zoneBlock: this.$i18n.tnl('label.zoneBlock'),
      bulkFields: ViewHelper.addLabelByKey(this.$i18n, [
        {key: 'error_name', sortable: true, label: 'error', thClass: 'fields', tdClass: 'items'},
        {key: 'description', sortable: false, label: 'detail', thClass: 'fields', tdClass: 'items'},
      ]),
      bulkItems: [
        { isActive: true, description: this.$i18n.tnl('helpDescription.bulkUniqueFailed'), error_name: this.$i18n.tnl('message.bulkUniqueFailed', {col: this.$i18n.tnl('label.linage'), value: this.$i18n.tnl('label.keyName')}) },
        { isActive: true, description: this.$i18n.tnl('helpDescription.bulkExistFailed'), error_name: this.$i18n.tnl('message.bulkExistFailed', {col: this.$i18n.tnl('label.linage'), value: this.$i18n.tnl('label.keyName')}) },
        { isActive: true, description: this.$i18n.tnl('helpDescription.bulkAuthFailed'), error_name: this.$i18n.tnl('message.bulkAuthFailed', {col: this.$i18n.tnl('label.linage'), value: this.$i18n.tnl('label.keyName')}) },
        { isActive: true, description: this.$i18n.tnl('helpDescription.bulkSystemUseFailed'), error_name: this.$i18n.tnl('message.bulkSystemUseFailed', {col: this.$i18n.tnl('label.linage'), value: this.$i18n.tnl('label.keyName')}) },
        { isActive: true, description: this.$i18n.tnl('helpDescription.bulkSystemUseNameFailed'), error_name: this.$i18n.tnl('message.bulkSystemUseNameFailed', {col: this.$i18n.tnl('label.linage'), value: this.$i18n.tnl('label.keyName')}) },
      ],
      isEnableHelp: false,
      isDisplayPositionList: false,
      isDisplayBulkRegister: false,
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
      isDisplayPosition: false,
      isDisplayTelemetry: false,
      isDisplayUsageSituation: false,
      isDisplaySensorGraph: false,
      isDisplayStayTime: false,
      isDisplayStayRatio: false,
      isDisplayTemperatureHistory: false,
      isDisplayPositionHistory: false,
      isDisplaySensorHistory: false,
      isDisplayNotifyHistory: false,
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
    enablePosition() {
      return this.isDisplayPosition
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
    enableStayTime() {
      return this.isDisplayStayTime
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
        if (!this.isDisplayPosition) {
          this.isDisplayPosition = parent.pages.find((val) => val.path == 'position')? true: false
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
        if (!this.isDisplayStayTime) {
          this.isDisplayStayTime = parent.pages.find((val) => val.path == 'stayTime')? true: false
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
      }.bind(this))

      this.isEnableHelp = this.isDisplayPositionList || this.isDisplayBulkRegister || 
      this.isDisplayArea || this.isDisplayExb || this.isDisplayTx || this.isDisplayPot || 
      this.isDisplayCategory || this.isDisplayGroup || this.isDisplayUser || this.isDisplayRole || 
      this.isDisplayZoneClass || this.isDisplayZoneBlock
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
