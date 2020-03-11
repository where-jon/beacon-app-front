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
        <!-- 目次：イントロダクション -->
        <div>
          <div class="list-group mt-3">
            <b>{{ getHelpDescription(introduction) }}</b>
          </div>
          <a v-for="(intro,key) in helpBaseKeys" :key="key" :href="createInternalLink(introduction, intro)" class="list-group-item list-group-item-action">
            {{ getLabel(intro) }}
          </a>
        </div>
        <!-- 目次：画面 -->
        <div v-for="(menuGroup,key) in this.$store.state.menu" :key="key">
          <div class="list-group mt-3">
            <b>{{ getLabel(menuGroup.key) }}</b>
          </div>
          <a v-for="page in menuGroup.pages" :key="page.key" :href="createInternalLink(menuGroup.key, page.key)" class="list-group-item list-group-item-action">
            {{ getLabel(page.key) }}
          </a>
        </div>
      </div>
      <!-- ヘルプ本文：イントロダクション -->
      <div v-for="intro in helpBaseKeys" :id="introduction + '_' + intro" :key="intro">
        <hr>
        <!-- ヘッダー -->
        <div class="helpLabelHeader">
          {{ getLabel(intro) }}
        </div>
        <!-- 概要 -->
        <span class="helpDetail align-top">
          {{ getHelpIntroduction(intro) }}
        </span>
        <!-- CSVファイルの項目説明 -->
        <div v-if="getCsvItems('bulkItems')" class="mt-2">
          <span class="helpTitle">
            {{ getLabel('register') }}
          </span>
          <span class="helpDetail">
            {{ getHelpDescription('bulkRegister') }}
          </span>
          <b-table striped hover small :items="getCsvItems('bulkItems')" :fields="bulkFields" />
        </div>

        <!-- 目次へ戻るボタン -->
        <div class="text-right">
          <a href="#indexList">
            <div class="btn btn-light">
              {{ getHelpDescription('indexName') }}
            </div>
          </a>
        </div>
      </div>
      <!-- ヘルプ本文：画面 -->
      <div v-for="(menuGroup, key) in this.$store.state.menu" :key="key">
        <div v-for="page in menuGroup.pages" :id="menuGroup.key + '_' + page.key" :key="page.key">
          <hr>
          <!-- ヘッダー -->
          <div class="helpLabelHeader">
            {{ getLabel(menuGroup.key) }}：{{ getLabel(page.key) }}
          </div>
          <!-- 概要 -->
          <span class="helpDetail align-top">
            {{ getHelpScreenDescription(page.key) }}
          </span>
          <!-- 概要以外の説明事項 -->
          <div v-for="(addDesc, addkey) in getHelpAdditionalDescription(page.key)" :key="addkey" class="mt-2">
            <span class="helpTitle">
              {{ getLabel(addkey) }}
            </span>
            <span class="helpDetail">
              {{ addDesc }}
            </span>
          </div>
          <!-- CSVファイルの項目説明 -->
          <div v-if="getCsvItems(page.key)" class="mt-2">
            <span class="helpTitle">
              {{ getLabel('download') }}
            </span>
            <span class="helpDetail">
              {{ getHelpDescription('csvDescription') }}
            </span>
            <b-table striped hover small :items="getCsvItems(page.key)" :fields="csvFields" />
          </div>
          <!-- 目次へ戻るボタン -->
          <div class="text-right">
            <a href="#indexList">
              <div class="btn btn-light">
                {{ getHelpDescription('indexName') }}
              </div>
            </a>
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
      csvFields: [],
      bulkFields: [],
      helpBaseKeys: ['overview','notes'],  // 表示対象の説明文のKey(メニュー以外)を追加　helpBaseDescriptionに説明文追加
      introduction: 'introduction'
    }
  },
  computed: {
    ...mapState([
      'menu',
    ]),
  },
  methods: {
    initialize() {
      this.createLabel()
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
    getLabel(key, option){
      return this.$i18n.tnl('label.' + key, option)
    },
    getMessage(key, option){
      return this.$i18n.tnl('message.' + key, option)
    },
    getHelpDescription(key, option){
      return this.$i18n.tnl('helpDescription.' + key, option)
    },
    getHelpIntroduction(key, option){
      return this.$i18n.tnl('helpIntroduction.' + key, option)
    },
    getHelpScreenDescription(key, option){
      return this.$i18n.tnl('helpScreenDescription.' + key, option)
    },
    getConfig(key, option){
      return this.$i18n.tnl('config.' + key, option)
    },
    createInternalLink(groupKey, pageKey){
      return '#'+ groupKey + '_' + pageKey
    },
    getHelpAdditionalDescription(key, option){
      const ret = this.$i18n.tnl('helpAdditionalDescription.' + key, option)
      return ret != 'helpAdditionalDescription.' + key ? ret : null
    },
    // b-tableに表示する項目
    getCsvItems(key){
      switch(key) {
      case 'region':
        return [
          { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
          { isActive: true, displayName: this.getLabel('regionCd'), keyName: this.getLabel('regionCd') }, // TODO: js.jsonに登録
          { isActive: true, displayName: this.getLabel('regionName'), keyName: 'regionName' },
          { isActive: true, displayName: this.getLabel('meshId'), keyName: 'meshId' },
          { isActive: true, displayName: this.getLabel('description'), keyName: 'description' },
          { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
        ]
      case 'area':
        return [
          { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
          { isActive: true, displayName: this.getLabel('areaCd'), keyName: this.getLabel('areaCd') },
          { isActive: true, displayName: this.getLabel('areaName'), keyName: 'areaName' },
          { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
        ]
      case 'exb':
        return [
          { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
          { isActive: true, displayName: this.getLabel('deviceId'), keyName: 'deviceId' },
          { isActive: true, displayName: this.getLabel('threshold1'), keyName: 'threshold1' },
          { isActive: true, displayName: this.getLabel('threshold2'), keyName: 'threshold2' },
          { isActive: true, displayName: this.getLabel('adjust1'), keyName: 'adjust1' },
          { isActive: true, displayName: this.getLabel('adjust2'), keyName: 'adjust2' },
          { isActive: true, displayName: this.getLabel('sensorName'), keyName: 'sensorNames' }, // ラベルは単数形
          { isActive: true, displayName: this.getLabel('locationCdComp'), keyName: 'locationCd' },
          { isActive: true, displayName: this.getLabel('locationName'), keyName: 'locationName' },
          { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
        ]
      case 'tx':
        return [
          { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
          { isActive: true, displayName: this.getLabel('btxId'), keyName: 'btxId' },
          { isActive: true, displayName: this.getLabel('major'), keyName: 'major' },
          { isActive: true, displayName: this.getLabel('type'), keyName: 'sensorNames' },
          { isActive: true, displayName: this.getLabel('minor'), keyName: 'minor' },
          { isActive: true, displayName: this.getLabel('disp'), keyName: 'disp' },
          { isActive: true, displayName: this.getHelpDescription('txAreaName'), keyName: 'areaName' },
          { isActive: true, displayName: this.getHelpDescription('txLocationName'), keyName: 'locationName' },
          { isActive: true, displayName: this.getHelpDescription('txXY'), keyName: 'x' },
          { isActive: true, displayName: this.getHelpDescription('txXY'), keyName: 'y' },
          { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
        ]
      case 'pot':
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
      case 'category':
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
      case 'group':
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
      case 'user':
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
      case 'role':
        return [
          { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
          { isActive: true, displayName: this.getLabel('roleName'), keyName: 'roleName' },
          { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
        ]
      case 'zoneClass':
        return [
          { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
          { isActive: true, displayName: this.getLabel('zoneName'), keyName: 'zoneName' },
          { isActive: true, displayName: this.getLabel('areaName'), keyName: 'areaName' },
          { isActive: true, displayName: this.getLabel('categoryName'), keyName: 'categoryName' },
          { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
        ]
      case 'gateway':
        return [
          { isActive: true, displayName: this.getLabel('no'), keyName: 'num' },
          { isActive: true, displayName: this.getLabel('deviceId'), keyName: 'deviceId' },
          { isActive: true, displayName: this.getLabel('finalReceiveTimestamp'), keyName: 'updated' },
          { isActive: true, displayName: this.getLabel('state'), keyName: 'state' },
        ]
      case 'position':
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
      case 'telemetry':
        return [
          { isActive: true, displayName: this.getLabel('deviceId'), keyName: 'deviceId' },
          { isActive: true, displayName: this.getLabel('deviceIdX'), keyName: 'deviceIdX' },
          { isActive: true, displayName: this.getLabel('exbName'), keyName: 'finalRevceivePlace' },
          { isActive: true, displayName: this.getLabel('powerLevel'), keyName: 'powerLevel' },
          { isActive: true, displayName: this.getLabel('finalReceiveTimestamp'), keyName: 'timestamp' },
          { isActive: true, displayName: this.getLabel('state'), keyName: 'state' },
        ]
      case 'usageSituation':
        return [
          { isActive: true, displayName: this.getLabel('zoneCategoryName'), keyName: 'zoneCategoryName' },
          { isActive: true, displayName: this.getLabel('zoneName'), keyName: 'zoneName' },
          { isActive: true, displayName: this.getLabel('utilizationRatioP'), keyName: 'rate' },
          { isActive: true, displayName: this.getLabel('utilizationTime'), keyName: 'cnt' },
          { isActive: true, displayName: this.getLabel('numOfUsers'), keyName: 'numUse' },
        ]
      case 'sensorGraph':
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
      case 'stayRatio':
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
      case 'positionHistory':
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
      case 'sensorHistory':
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
      case 'notifyHistory':
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
      case 'bulkItems':
        return [
          { isActive: true, description: this.getHelpDescription('bulkUniqueFailed'), error_name: this.getMessage('bulkUniqueFailed', {col: this.getLabel('linage'), value: this.getLabel('keyName')}) },
          { isActive: true, description: this.getHelpDescription('bulkExistFailed'), error_name: this.getMessage('bulkExistFailed', {col: this.getLabel('linage'), value: this.getLabel('keyName')}) },
          { isActive: true, description: this.getHelpDescription('bulkAuthFailed'), error_name: this.getMessage('bulkAuthFailed', {col: this.getLabel('linage'), value: this.getLabel('keyName')}) },
          { isActive: true, description: this.getHelpDescription('bulkSystemUseFailed'), error_name: this.getMessage('bulkSystemUseFailed', {col: this.getLabel('linage'), value: this.getLabel('keyName')}) },
          { isActive: true, description: this.getHelpDescription('bulkSystemUseNameFailed'), error_name: this.getMessage('bulkSystemUseNameFailed', {col: this.getLabel('linage'), value: this.getLabel('keyName')}) },
        ]
      default:
        return null
      }
    },
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
