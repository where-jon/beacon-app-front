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
        <div v-if="enableRegion">
          <a href="#region">
            {{ $i18n.tnl('label.masterRegion') }}
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
      <div v-if="enableRegion" id="region">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.masterRegion') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('label.csvFile') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.csvDescription') }}
        </p>
        <b-table striped hover small :items="regionCsvItems" :fields="csvFields" />
      </div>
      <div v-if="enableArea" id="area">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.masterArea') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('label.csvFile') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.csvDescription') }}
        </p>
        <b-table striped hover small :items="areaCsvItems" :fields="csvFields" />
      </div>
      <div v-if="enableExb" id="exb">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.masterExb') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('label.csvFile') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.csvDescription') }}
        </p>
        <b-table striped hover small :items="exbCsvItems" :fields="csvFields" />
      </div>
      <div v-if="enableTx" id="tx">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.masterTx') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('label.csvFile') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.csvDescription') }}
        </p>
        <b-table striped hover small :items="txCsvItems" :fields="csvFields" />
      </div>
      <div v-if="enablePot" id="pot">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.masterPot') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('label.csvFile') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.csvDescription') }}
        </p>
        <b-table striped hover small :items="potCsvItems" :fields="csvFields" />
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
        <p class="helpTitle">
          {{ $i18n.tnl('label.csvFile') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.csvDescription') }}
        </p>
        <b-table striped hover small :items="categoryCsvItems" :fields="csvFields" />
      </div>
      <div v-if="enableGroup" id="group">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.masterGroup') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('label.csvFile') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.csvDescription') }}
        </p>
        <b-table striped hover small :items="groupCsvItems" :fields="csvFields" />
      </div>
      <div v-if="enableUser" id="user">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.masterUser') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('label.csvFile') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.csvDescription') }}
        </p>
        <b-table striped hover small :items="userCsvItems" :fields="csvFields" />
      </div>
      <div v-if="enableRole" id="role">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.masterRole') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('label.csvFile') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.csvDescription') }}
        </p>
        <b-table striped hover small :items="roleCsvItems" :fields="csvFields" />
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
        <p class="helpTitle">
          {{ $i18n.tnl('label.csvFile') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.csvDescription') }}
        </p>
        <b-table striped hover small :items="zoneClassCsvItems" :fields="csvFields" />
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
        <p class="helpTitle">
          {{ $i18n.tnl('label.csvFile') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.csvDescription') }}
        </p>
        <b-table striped hover small :items="GatewayCsvItems" :fields="csvFields" />
      </div>
      <div v-if="enablePosition" id="position">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.monitorTX') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('label.csvFile') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.csvDescription') }}
        </p>
        <b-table striped hover small :items="positionCsvItems" :fields="csvFields" />
      </div>
      <div v-if="enableTelemetry" id="telemetry">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.monitorEXB') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('label.csvFile') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.csvDescription') }}
        </p>
        <b-table striped hover small :items="telemetryCsvItems" :fields="csvFields" />
      </div>
      <div v-if="enableUsageSituation" id="usage-situation">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.SumUtilizationRatio') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('label.csvFile') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.csvDescription') }}
        </p>
        <b-table striped hover small :items="usageSituationCsvItems" :fields="csvFields" />
      </div>
      <div v-if="enableSensorGraph" id="sensorGraph">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.SensorGraph') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('label.csvFile') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.csvDescription') }}
        </p>
        <b-table striped hover small :items="sensorGraphCsvItems" :fields="csvFields" />
      </div>
      <div v-if="enableStayRatio" id="stayRatio">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.stayRatio') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('label.csvFile') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.csvDescription') }}
        </p>
        <b-table striped hover small :items="stayRatioCsvItems" :fields="csvFields" />
      </div>
      <div v-if="enableTemperatureHistory" id="temperatureHistory">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.temperatureHistory') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('label.csvFile') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.csvDescription') }}
        </p>
        <b-table striped hover small :items="temperatureHistoryCsvItems" :fields="csvFields" />
      </div>
      <div v-if="enablePositionHistory" id="positionHistory">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.PositionHistory') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('label.csvFile') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.csvDescription') }}
        </p>
        <b-table striped hover small :items="positionHistoryCsvItems" :fields="csvFields" />
      </div>
      <div v-if="enableSensorHistory" id="sensorHistory">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.SensorHistory') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('label.csvFile') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.csvDescription') }}
        </p>
        <b-table striped hover small :items="sensorHistoryCsvItems" :fields="csvFields" />
      </div>
      <div v-if="enableNotifyHistory" id="notifyHistory">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.notifyHistory') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('label.csvFile') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.csvDescription') }}
        </p>
        <b-table striped hover small :items="notifyHistoryCsvItems" :fields="csvFields" />
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
      csvFields: ViewHelper.addLabelByKey(this.$i18n, [
        {key: 'keyName', sortable: true, label: 'keyName', thClass: 'fields', tdClass: 'items'},
        {key: 'displayName', sortable: false, label: 'displayName', thClass: 'fields', tdClass: 'items'},
      ]),
      regionCsvItems: [
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.$i18n.tnl('label.regionName'), keyName: 'regionName' },
        { isActive: true, displayName: this.$i18n.tnl('label.meshId'), keyName: 'meshId' },
        { isActive: true, displayName: this.$i18n.tnl('label.description'), keyName: 'description' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.delFlg'), keyName: 'delFlg' },
      ],
      areaCsvItems: [
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.$i18n.tnl('label.areaName'), keyName: 'areaName' },
        { isActive: true, displayName: 'areaCd', keyName: 'areaCd' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.delFlg'), keyName: 'delFlg' },
      ],
      exbCsvItems: [
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.$i18n.tnl('label.deviceId'), keyName: 'deviceId' },
        { isActive: true, displayName: this.$i18n.tnl('label.deviceIdX'), keyName: 'deviceIdX' },
        { isActive: true, displayName: this.$i18n.tnl('label.locationName'), keyName: 'locationName' },
        { isActive: true, displayName: this.$i18n.tnl('label.posId'), keyName: 'posId' },
        { isActive: true, displayName: this.$i18n.tnl('label.areaName'), keyName: 'areaName' },
        { isActive: true, displayName: this.$i18n.tnl('label.locationX'), keyName: 'x' },
        { isActive: true, displayName: this.$i18n.tnl('label.locationY'), keyName: 'y' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.enabled'), keyName: 'enabled' },
        { isActive: true, displayName: this.$i18n.tnl('label.type'), keyName: 'sensor' },
        { isActive: true, displayName: this.$i18n.tnl('label.zoneName'), keyName: 'zoneName' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.delFlg'), keyName: 'delFlg' },
      ],
      txCsvItems: [
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.$i18n.tnl('label.btxId'), keyName: 'btxId' },
        { isActive: true, displayName: this.$i18n.tnl('label.major'), keyName: 'major' },
        { isActive: true, displayName: this.$i18n.tnl('label.minor'), keyName: 'minor' },
        { isActive: true, displayName: this.$i18n.tnl('label.type'), keyName: 'sensor' },
        { isActive: true, displayName: this.$i18n.tnl('label.disp'), keyName: 'disp' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.txAreaName'), keyName: 'areaName' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.txXY'), keyName: 'x' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.txXY'), keyName: 'y' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.delFlg'), keyName: 'delFlg' },
      ],
      potCsvItems: [
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.$i18n.tnl('label.btxId'), keyName: 'btxId' },
        { isActive: true, displayName: this.$i18n.tnl('label.minor'), keyName: 'minor' },
        { isActive: true, displayName: this.$i18n.tnl('label.potCd'), keyName: 'potCd' },
        { isActive: true, displayName: this.$i18n.tnl('label.potName'), keyName: 'potName' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'potType' },
        { isActive: true, displayName: this.$i18n.tnl('label.displayName'), keyName: 'displayName' },
        { isActive: true, displayName: this.$i18n.tnl('label.group'), keyName: 'groupName' },
        { isActive: true, displayName: this.$i18n.tnl('label.category'), keyName: 'categoryName' },
        { isActive: true, displayName: this.$i18n.tnl('label.post'), keyName: 'post' },
        { isActive: true, displayName: this.$i18n.tnl('label.tel'), keyName: 'tel' },
        { isActive: true, displayName: this.$i18n.tnl('label.description'), keyName: 'description' },
        { isActive: true, displayName: this.$i18n.tnl('label.loginId'), keyName: 'loginId' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'roleName' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'pass' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'email' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.delFlg'), keyName: 'delFlg' },
      ],
      categoryCsvItems: [
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.$i18n.tnl('label.categoryName'), keyName: 'categoryName' },
        { isActive: true, displayName: this.$i18n.tnl('label.categoryType'), keyName: 'categoryTypeName' },
        { isActive: true, displayName: this.$i18n.tnl('label.display'), keyName: 'color' },
        { isActive: true, displayName: this.$i18n.tnl('label.display'), keyName: 'bgColor' },
        { isActive: true, displayName: this.$i18n.tnl('label.display'), keyName: 'Shape' },
        { isActive: true, displayName: this.$i18n.tnl('label.description'), keyName: 'description' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.delFlg'), keyName: 'delFlg' },
      ],
      groupCsvItems: [
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.$i18n.tnl('label.groupName'), keyName: 'groupName' },
        { isActive: true, displayName: this.$i18n.tnl('label.ruby'), keyName: 'ruby' },
        { isActive: true, displayName: this.$i18n.tnl('label.display'), keyName: 'color' },
        { isActive: true, displayName: this.$i18n.tnl('label.display'), keyName: 'bgColor' },
        { isActive: true, displayName: this.$i18n.tnl('label.display'), keyName: 'Shape' },
        { isActive: true, displayName: this.$i18n.tnl('label.description'), keyName: 'description' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.delFlg'), keyName: 'delFlg' },
      ],
      userCsvItems: [
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'userId' },
        { isActive: true, displayName: this.$i18n.tnl('label.loginId'), keyName: 'loginId' },
        { isActive: true, displayName: this.$i18n.tnl('label.name'), keyName: 'name' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'pass' },
        { isActive: true, displayName: this.$i18n.tnl('label.email'), keyName: 'email' },
        { isActive: true, displayName: this.$i18n.tnl('label.role'), keyName: 'roleName' },
        { isActive: true, displayName: this.$i18n.tnl('label.description'), keyName: 'description' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.delFlg'), keyName: 'delFlg' },
      ],
      roleCsvItems: [
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.$i18n.tnl('label.roleName'), keyName: 'roleName' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.delFlg'), keyName: 'delFlg' },
      ],
      zoneClassCsvItems: [
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.$i18n.tnl('label.zoneName'), keyName: 'zoneName' },
        { isActive: true, displayName: this.$i18n.tnl('label.areaName'), keyName: 'areaName' },
        { isActive: true, displayName: this.$i18n.tnl('label.categoryName'), keyName: 'categoryName' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.delFlg'), keyName: 'delFlg' },
      ],
      GatewayCsvItems: [
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.$i18n.tnl('label.no'), keyName: 'num' },
        { isActive: true, displayName: this.$i18n.tnl('label.deviceId'), keyName: 'deviceId' },
        { isActive: true, displayName: this.$i18n.tnl('label.finalReceiveTimestamp'), keyName: 'updated' },
        { isActive: true, displayName: this.$i18n.tnl('label.state'), keyName: 'state' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.delFlg'), keyName: 'delFlg' },
      ],
      positionCsvItems: [
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.$i18n.tnl('label.btx_id'), keyName: 'btx_id' },
        { isActive: true, displayName: this.$i18n.tnl('label.major'), keyName: 'major' },
        { isActive: true, displayName: this.$i18n.tnl('label.minor'), keyName: 'minor' },
        { isActive: true, displayName: this.$i18n.tnl('label.name'), keyName: 'name' },
        { isActive: true, displayName: this.$i18n.tnl('label.powerLevel'), keyName: 'powerLevel' },
        { isActive: true, displayName: this.$i18n.tnl('label.finalReceiveLocation'), keyName: 'location' },
        { isActive: true, displayName: this.$i18n.tnl('label.finalReceiveTimestamp'), keyName: 'timestamp' },
        { isActive: true, displayName: this.$i18n.tnl('label.state'), keyName: 'state' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.delFlg'), keyName: 'delFlg' },
      ],
      telemetryCsvItems: [
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.$i18n.tnl('label.deviceId'), keyName: 'deviceId' },
        { isActive: true, displayName: this.$i18n.tnl('label.deviceIdX'), keyName: 'deviceIdX' },
        { isActive: true, displayName: this.$i18n.tnl('label.exbName'), keyName: 'finalRevceivePlace' },
        { isActive: true, displayName: this.$i18n.tnl('label.powerLevel'), keyName: 'powerLevel' },
        { isActive: true, displayName: this.$i18n.tnl('label.finalReceiveTimestamp'), keyName: 'timestamp' },
        { isActive: true, displayName: this.$i18n.tnl('label.state'), keyName: 'state' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.delFlg'), keyName: 'delFlg' },
      ],
      usageSituationCsvItems: [
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.$i18n.tnl('label.zoneCategoryName'), keyName: 'zoneCategoryName' },
        { isActive: true, displayName: this.$i18n.tnl('label.zoneName'), keyName: 'zoneName' },
        { isActive: true, displayName: this.$i18n.tnl('label.utilizationRatioP'), keyName: 'rate' },
        { isActive: true, displayName: this.$i18n.tnl('label.utilizationTime'), keyName: 'cnt' },
        { isActive: true, displayName: this.$i18n.tnl('label.numOfUsers'), keyName: 'numUse' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.delFlg'), keyName: 'delFlg' },
      ],
      sensorGraphCsvItems: [
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'humidity(lat)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'humidity(max)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'humidity(avg)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'humidity(min)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'temperature(lat)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'temperature(max)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'temperature(avg)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'temperature(min)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'count(lat)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'count(max)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'count(avg)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'count(min)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'step(lat)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'step(max)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'step(avg)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'step(min)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'beat(lat)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'beat(max)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'beat(avg)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'beat(min)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'low(lat)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'low(max)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'low(avg)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'low(min)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'high(lat)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'high(max)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'high(avg)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'high(min)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'down(lat)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'down(max)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'down(avg)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'down(min)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'magnet(max)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'magnet(min)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'pressVol(lat)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'pressVol(max)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'pressVol(avg)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'pressVol(min)' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.delFlg'), keyName: 'delFlg' },
      ],
      stayRatioCsvItems: [
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.$i18n.tnl('label.date'), keyName: 'date' },
        { isActive: true, displayName: this.$i18n.tnl('label.name'), keyName: 'name' },
        { isActive: true, displayName: this.$i18n.tnl('label.groupName'), keyName: 'groupName' },
        { isActive: true, displayName: this.$i18n.tnl('label.stayTime'), keyName: 'stayTime' },
        { isActive: true, displayName: this.$i18n.tnl('label.absent1Time'), keyName: this.$i18n.tnl('label.stayRatioAbsent1Time') },
        { isActive: true, displayName: this.$i18n.tnl('label.absent2Time'), keyName: this.$i18n.tnl('label.stayRatioAbsent2Time') },
        { isActive: true, displayName: this.$i18n.tnl('label.lostTime'), keyName: 'lostTime' },
        { isActive: true, displayName: this.$i18n.tnl('label.stayRatio'), keyName: 'stayRatio' },
        { isActive: true, displayName: this.$i18n.tnl('label.absent1Ratio'), keyName: this.$i18n.tnl('label.stayRatioAbsent1Ratio') },
        { isActive: true, displayName: this.$i18n.tnl('label.absent2Ratio'), keyName: this.$i18n.tnl('label.stayRatioAbsent2Ratio') },
        { isActive: true, displayName: this.$i18n.tnl('label.lostRatio'), keyName: 'lostRatio' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.delFlg'), keyName: 'delFlg' },
      ],
      temperatureHistoryCsvItems: [
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'sensorHistoryId' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'txId' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'exbId' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'dt' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'sensorDt' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'temperature' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'humidity' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.delFlg'), keyName: 'delFlg' },
      ],
      positionHistoryCsvItems: [
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.$i18n.tnl('label.dt'), keyName: 'positionDt' },
        { isActive: true, displayName: this.$i18n.tnl('config.OPTIONS.POSITION_HISTORY.txName'), keyName: 'txName' },
        { isActive: true, displayName: this.$i18n.tnl('config.OPTIONS.POSITION_HISTORY.major'), keyName: 'major' },
        { isActive: true, displayName: this.$i18n.tnl('config.OPTIONS.POSITION_HISTORY.minor'), keyName: 'minor' },
        { isActive: true, displayName: this.$i18n.tnl('label.deviceId'), keyName: 'exbId' },
        { isActive: true, displayName: this.$i18n.tnl('config.OPTIONS.POSITION_HISTORY.locationName'), keyName: 'locationName' },
        { isActive: true, displayName: this.$i18n.tnl('label.posId'), keyName: 'posId' },
        { isActive: true, displayName: this.$i18n.tnl('label.area'), keyName: 'areaName' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'x' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.empty'), keyName: 'y' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.delFlg'), keyName: 'delFlg' },
      ],
      sensorHistoryCsvItems: [
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.$i18n.tnl('label.dt'), keyName: 'sensorDt' },
        { isActive: true, displayName: this.$i18n.tnl('label.sensorName'), keyName: 'sensorName' },
        { isActive: true, displayName: this.$i18n.tnl('label.deviceNum'), keyName: 'deviceNum' },
        { isActive: true, displayName: this.$i18n.tnl('label.deviceId'), keyName: 'deviceId' },
        { isActive: true, displayName: this.$i18n.tnl('label.deviceIdX'), keyName: 'deviceIdX' },
        { isActive: true, displayName: this.$i18n.tnl('label.locationZoneName'), keyName: 'locationName' },
        { isActive: true, displayName: this.$i18n.tnl('label.posId'), keyName: 'posId' },
        { isActive: true, displayName: this.$i18n.tnl('label.areaName'), keyName: 'areaName' },
        { isActive: true, displayName: this.$i18n.tnl('label.temperature'), keyName: 'temperature' },
        { isActive: true, displayName: this.$i18n.tnl('label.humidity'), keyName: 'humidity' },
        { isActive: true, displayName: this.$i18n.tnl('label.numUsers'), keyName: 'count' },
        { isActive: true, displayName: this.$i18n.tnl('label.txName'), keyName: 'txName' },
        { isActive: true, displayName: this.$i18n.tnl('label.major'), keyName: 'major' },
        { isActive: true, displayName: this.$i18n.tnl('label.minor'), keyName: 'minor' },
        { isActive: true, displayName: this.$i18n.tnl('label.h_blood_pressure'), keyName: 'high' },
        { isActive: true, displayName: this.$i18n.tnl('label.l_blood_pressure'), keyName: 'low' },
        { isActive: true, displayName: this.$i18n.tnl('label.heart_rate'), keyName: 'beat' },
        { isActive: true, displayName: this.$i18n.tnl('label.step'), keyName: 'step' },
        { isActive: true, displayName: this.$i18n.tnl('label.down_count'), keyName: 'down' },
        { isActive: true, displayName: this.$i18n.tnl('label.state'), keyName: 'state' },
        { isActive: true, displayName: this.$i18n.tnl('label.pressVol'), keyName: 'pressVol' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.delFlg'), keyName: 'delFlg' },
      ],
      notifyHistoryCsvItems: [
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.updateKey'), keyName: 'updateKey' },
        { isActive: true, displayName: this.$i18n.tnl('label.dt'), keyName: 'positionDt' },
        { isActive: true, displayName: this.$i18n.tnl('label.notifyTo'), keyName: 'notifyTo' },
        { isActive: true, displayName: this.$i18n.tnl('label.major'), keyName: 'majors' },
        { isActive: true, displayName: this.$i18n.tnl('label.minor'), keyName: 'minor' },
        { isActive: true, displayName: this.$i18n.tnl('label.minorPowerLevel'), keyName: 'minors' },
        { isActive: true, displayName: this.$i18n.tnl('label.txName'), keyName: 'txName' },
        { isActive: true, displayName: this.$i18n.tnl('label.deviceNum'), keyName: 'deviceNum' },
        { isActive: true, displayName: this.$i18n.tnl('label.finalReceiveTime'), keyName: 'finalReceiveTime' },
        { isActive: true, displayName: this.$i18n.tnl('label.notifyResult'), keyName: 'notifyResult' },
        { isActive: true, displayName: this.$i18n.tnl('helpDescription.delFlg'), keyName: 'delFlg' },
      ],
      isEnableHelp: false,
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
      isDisplayPosition: false,
      isDisplayTelemetry: false,
      isDisplayUsageSituation: false,
      isDisplaySensorGraph: false,
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
