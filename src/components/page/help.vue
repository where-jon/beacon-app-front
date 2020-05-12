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
          <a v-for="(intro,key) in helpBaseKeys" :key="key" :href="createIntrolLink(introduction, intro)" class="list-group-item list-group-item-action">
            {{ getLabel(intro) }}
          </a>
        </div>
        <!-- 目次：画面 -->
        <div v-for="(menuGroup,key) in this.$store.state.menu" :key="key">
          <div class="list-group mt-3">
            <b>{{ getLabel(menuGroup.key) }}</b>
          </div>
          <a v-for="page in menuGroup.pages" :key="page.key" :href="createInternalLink(menuGroup.base, page.path)" class="list-group-item list-group-item-action">
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
        <div v-if="intro == 'notes' && getIntroductionItems('bulkItems')" class="mt-2">
          <span class="helpTitle">
            {{ getLabel('bulkRegister') }}
          </span>
          <span class="helpDetail">
            {{ getHelpDescription('bulkRegister') }}
          </span>
          <b-table striped hover small :items="getIntroductionItems('bulkItems')" :fields="bulkFields" />
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
        <div v-for="page in menuGroup.pages" :id="createId(menuGroup.base, page.path)" :key="page.key">
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
import * as StringUtil from '../../sub/util/StringUtil'

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
      introduction: 'introduction',
      hasAdditionalDescriptionKeys: ['positionList','category','stayRatioBase','stayTime','positionSummary'],  // ヘルプの説明分に追加する画面のkeyリスト
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
        {key: 'keyName', sortable: true, label: 'keyName', thClass: 'keyFields', tdClass: 'items'},
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
    getLabelWith(key, withKey, option){
      return this.getLabel(key, option) + '(' + this.getLabel(withKey, option) + ')'
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
    createIntrolLink(groupKey, pageKey){
      return '#'+ groupKey + '_' + StringUtil.kebab2camel(pageKey) 
    },
    createInternalLink(groupKey, pageKey){
      return '#'+ groupKey.replace('/','_') + StringUtil.kebab2camel(pageKey) 
    },
    createId(groupKey, pageKey){
      return groupKey.replace('/','_') + StringUtil.kebab2camel(pageKey)
    },
    getHelpAdditionalDescription(key, option){
      // i18nに存在しないkeyを渡すと警告が表示されるため、概要以外の説明を表示する場合はhasAdditionalDescriptionKeysに存在するもののみ必要なヘルプのみ表示する
      return this.hasAdditionalDescriptionKeys.includes(key) ? this.$i18n.t('helpAdditionalDescription.' + key,'')  : null
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
      case 'locationList':
        return [
          { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
          { isActive: true, displayName: this.getLabel('locationCd'), keyName: this.getLabel('locationCd') },
          { isActive: true, displayName: this.getLabel('locationName'), keyName: 'locationName' },
          { isActive: true, displayName: this.getLabel('areaName'), keyName: 'areaName' },
          { isActive: true, displayName: this.getHelpDescription('locationXY'), keyName: 'x' },
          { isActive: true, displayName: this.getHelpDescription('locationXY'), keyName: 'y' },
          { isActive: true, displayName: this.getLabel('txViewType'), keyName: 'txViewType' },
          { isActive: true, displayName: this.getLabel('visible'), keyName: 'visible' },
          { isActive: true, displayName: this.getLabel('zoneClass'), keyName: 'zoneClass' },
          { isActive: true, displayName: this.getLabel('zoneBlock'), keyName: 'zoneBlock' },
          { isActive: true, displayName: this.getLabel('deviceId'), keyName: 'deviceId' },
          { isActive: true, displayName: this.getLabel('btxId'), keyName: 'btxId' },
          { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
          { isActive: true, displayName: this.getLabel('capacity'), keyName: 'capacity' },
        ]
      case 'pot':
        return [
          { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
          { isActive: true, displayName: this.getLabel('potCd'), keyName: this.getLabel('potCd') },
          { isActive: true, displayName: this.getLabel('btxId'), keyName: 'btxId' },
          { isActive: true, displayName: this.getLabel('potName'), keyName: 'potName' },
          { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'potType' },
          { isActive: true, displayName: this.getLabel('displayName'), keyName: 'displayName' },
          { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
          { isActive: true, displayName: this.getLabel('category'), keyName: 'categoryName' },
          { isActive: true, displayName: this.getLabel('ruby'), keyName: 'ruby' },
          { isActive: true, displayName: this.getLabel('description'), keyName: 'description' },
          { isActive: true, displayName: this.getLabel('group'), keyName: 'groupName' },
        ]
      case 'potPerson':
        return [
          { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
          { isActive: true, displayName: this.getLabel('potCd'), keyName: 'potCd' },
          { isActive: true, displayName: this.getLabel('btxId'), keyName: 'btxId' },
          { isActive: true, displayName: this.getLabel('potName'), keyName: 'potName' },
          { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'potType' },
          { isActive: true, displayName: this.getLabel('displayName'), keyName: 'displayName' },
          { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
          { isActive: true, displayName: this.getLabel('category'), keyName: 'categoryName' },
          { isActive: true, displayName: this.getLabel('ruby'), keyName: 'ruby' },
          { isActive: true, displayName: this.getLabel('description'), keyName: 'description' },
        ]
      case 'potThing':
        return [
          { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
          { isActive: true, displayName: this.getLabel('potCd'), keyName: 'potCd' },
          { isActive: true, displayName: this.getLabel('btxId'), keyName: 'btxId' },
          { isActive: true, displayName: this.getLabel('potName'), keyName: 'potName' },
          { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'potType' },
          { isActive: true, displayName: this.getLabel('displayName'), keyName: 'displayName' },
          { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
          { isActive: true, displayName: this.getLabel('category'), keyName: 'categoryName' },
          { isActive: true, displayName: this.getLabel('ruby'), keyName: 'ruby' },
          { isActive: true, displayName: this.getLabel('description'), keyName: 'description' },
        ]
      case 'potOther':
        return [
          { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
          { isActive: true, displayName: this.getLabel('potCd'), keyName: 'potCd' },
          { isActive: true, displayName: this.getLabel('btxId'), keyName: 'btxId' },
          { isActive: true, displayName: this.getLabel('potName'), keyName: 'potName' },
          { isActive: true, displayName: this.getHelpDescription('empty'), keyName: 'potType' },
          { isActive: true, displayName: this.getLabel('displayName'), keyName: 'displayName' },
          { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
          { isActive: true, displayName: this.getLabel('category'), keyName: 'categoryName' },
          { isActive: true, displayName: this.getLabel('ruby'), keyName: 'ruby' },
          { isActive: true, displayName: this.getLabel('description'), keyName: 'description' },
        ]
      case 'category':
        return [
          { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
          { isActive: true, displayName: this.getLabel('categoryCd'), keyName: 'ID' },
          { isActive: true, displayName: this.getLabel('categoryName'), keyName: 'categoryName' },
          { isActive: true, displayName: this.getLabel('categoryType'), keyName: 'categoryTypeName' },
          { isActive: true, displayName: this.getLabel('color'), keyName: 'color' },
          { isActive: true, displayName: this.getLabel('bgColor'), keyName: 'bgColor' },
          { isActive: true, displayName: this.getLabel('shape'), keyName: 'Shape' },
          { isActive: true, displayName: this.getLabel('description'), keyName: 'description' },
          { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
        ]
      case 'categoryPerson':
        return [
          { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
          { isActive: true, displayName: this.getLabel('categoryCd'), keyName: 'ID' },
          { isActive: true, displayName: this.getLabel('categoryName'), keyName: 'categoryName' },
          { isActive: true, displayName: this.getLabel('categoryType'), keyName: 'categoryTypeName' },
          { isActive: true, displayName: this.getLabel('color'), keyName: 'color' },
          { isActive: true, displayName: this.getLabel('bgColor'), keyName: 'bgColor' },
          { isActive: true, displayName: this.getLabel('shape'), keyName: 'Shape' },
          { isActive: true, displayName: this.getLabel('description'), keyName: 'description' },
          { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
        ]
      case 'categoryThing':
        return [
          { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
          { isActive: true, displayName: this.getLabel('categoryCd'), keyName: 'ID' },
          { isActive: true, displayName: this.getLabel('categoryName'), keyName: 'categoryName' },
          { isActive: true, displayName: this.getLabel('categoryType'), keyName: 'categoryTypeName' },
          { isActive: true, displayName: this.getLabel('color'), keyName: 'color' },
          { isActive: true, displayName: this.getLabel('bgColor'), keyName: 'bgColor' },
          { isActive: true, displayName: this.getLabel('shape'), keyName: 'Shape' },
          { isActive: true, displayName: this.getLabel('description'), keyName: 'description' },
          { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
        ]
      case 'categoryZone':
        return [
          { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
          { isActive: true, displayName: this.getLabel('categoryCd'), keyName: 'ID' },
          { isActive: true, displayName: this.getLabel('categoryName'), keyName: 'categoryName' },
          { isActive: true, displayName: this.getLabel('categoryType'), keyName: 'categoryTypeName' },
          { isActive: true, displayName: this.getLabel('color'), keyName: 'color' },
          { isActive: true, displayName: this.getLabel('bgColor'), keyName: 'bgColor' },
          { isActive: true, displayName: this.getLabel('shape'), keyName: 'Shape' },
          { isActive: true, displayName: this.getLabel('description'), keyName: 'description' },
          { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
        ]
      case 'categoryAuth':
        return [
          { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
          { isActive: true, displayName: this.getLabel('categoryCd'), keyName: 'ID' },
          { isActive: true, displayName: this.getLabel('authCategoryName'), keyName: 'categoryName' },
          { isActive: true, displayName: this.getLabel('categoryType'), keyName: 'categoryTypeName' },
          { isActive: true, displayName: this.getLabel('zoneGuard'), keyName: 'guardNames' },
          { isActive: true, displayName: this.getLabel('zoneDoor'), keyName: 'doorNames' },
        ]
      case 'group':
        return [
          { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
          { isActive: true, displayName: this.getLabel('groupCd'), keyName: 'ID' },
          { isActive: true, displayName: this.getLabel('groupName'), keyName: 'groupName' },
          { isActive: true, displayName: this.getLabel('ruby'), keyName: 'ruby' },
          { isActive: true, displayName: this.getLabel('color'), keyName: 'color' },
          { isActive: true, displayName: this.getLabel('bgColor'), keyName: 'bgColor' },
          { isActive: true, displayName: this.getLabel('shape'), keyName: 'Shape' },
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
          { isActive: true, displayName: this.getLabel('role'), keyName: 'roleName' },
          { isActive: true, displayName: this.getLabel('description'), keyName: 'description' },
          { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
        ]
      case 'role':
        return [
          { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
          { isActive: true, displayName: this.getLabel('roleName'), keyName: 'roleName' },
          { isActive: true, displayName: this.getHelpDescription('featureId'), keyName: 'featureId' },
          { isActive: true, displayName: this.getLabel('featureName'), keyName: 'featureName' },
          { isActive: true, displayName: this.getLabel('path'), keyName: 'path' },
          { isActive: true, displayName: this.getLabel('mode'), keyName: 'mode' },
          { isActive: true, displayName: this.getLabel('featureType'), keyName: 'featureType' },
          { isActive: true, displayName: this.getLabel('version'), keyName: 'version' },
          { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
          { isActive: true, displayName: this.getHelpDescription('roleId'), keyName: 'roleId' },
        ]
      case 'zoneClass':
        return [
          { isActive: true, displayName: this.getHelpDescription('updateKey'), keyName: 'updateKey' },
          { isActive: true, displayName: this.getLabel('categoryCd'), keyName: 'ID' },
          { isActive: true, displayName: this.getLabel('categoryType'), keyName: 'zoneType' },
          { isActive: true, displayName: this.getLabel('zoneName'), keyName: 'zoneName' },
          { isActive: true, displayName: this.getLabel('areaName'), keyName: 'areaName' },
          { isActive: true, displayName: this.getLabel('categoryName'), keyName: 'categoryName' },
          { isActive: true, displayName: this.getHelpDescription('delFlg'), keyName: 'delFlg' },
        ]
      case 'gateway':
        return [
          { isActive: true, displayName: this.getLabel('no'), keyName: this.getLabel('no') },
          { isActive: true, displayName: this.getLabel('deviceId'), keyName: this.getLabel('deviceId') },
          { isActive: true, displayName: this.getLabel('finalReceiveTimestamp'), keyName: this.getLabel('finalReceiveTimestamp') },
          { isActive: true, displayName: this.getLabel('state'), keyName: this.getLabel('state') },
        ]
      case 'position':
        return [
          { isActive: true, displayName: this.getLabel('btxId'), keyName: this.getLabel('btxId') },
          { isActive: true, displayName: this.getLabel('major'), keyName: this.getLabel('major') },
          { isActive: true, displayName: this.getLabel('minor'), keyName: this.getLabel('minor') },
          { isActive: true, displayName: this.getLabel('name'), keyName: this.getLabel('name') },
          { isActive: true, displayName: this.getLabel('powerLevel'), keyName: this.getLabel('powerLevel') },
          { isActive: true, displayName: this.getLabel('finalReceiveLocation'), keyName: this.getLabel('finalReceiveLocation') },
          { isActive: true, displayName: this.getLabel('finalReceiveTimestamp'), keyName: this.getLabel('finalReceiveTimestamp') },
          { isActive: true, displayName: this.getLabel('state'), keyName: this.getLabel('state') },
          { isActive: true, displayName: this.getLabel('powerLevelTimestamp'), keyName: this.getLabel('powerLevelTimestamp') },
        ]
      case 'telemetry':
        return [
          { isActive: true, displayName: this.getLabel('deviceId'), keyName: this.getLabel('deviceId') },
          { isActive: true, displayName: this.getLabel('locationName'), keyName: this.getLabel('locationName') },
          { isActive: true, displayName: this.getLabel('powerLevel'), keyName: this.getLabel('powerLevel') },
          { isActive: true, displayName: this.getLabel('finalReceiveTimestamp'), keyName: this.getLabel('finalReceiveTimestamp') },
          { isActive: true, displayName: this.getLabel('state'), keyName: this.getLabel('state') },
        ]
      case 'usageSituation':
        return [
          { isActive: true, displayName: this.getLabel('date'), keyName: this.getLabel('date') },
          { isActive: true, displayName: this.getLabel('zoneCategoryName'), keyName: this.getLabel('zoneCategoryName') },
          { isActive: true, displayName: this.getLabel('zoneName'), keyName: this.getLabel('zoneName') },
          { isActive: true, displayName: this.getLabel('utilizationRatioP'), keyName: this.getLabel('utilizationRatioP') },
          { isActive: true, displayName: this.getLabel('utilizationTime'), keyName: this.getLabel('utilizationTime') },
          { isActive: true, displayName: this.getLabel('numOfUsers'), keyName: this.getLabel('numOfUsers') },
        ]
      case 'sensorGraph':
        return [
          { isActive: true, displayName: this.getLabelWith('humidity', 'max'), keyName: this.getLabelWith('humidity', 'max') }, // TODO専用メソッド作成
          { isActive: true, displayName: this.getLabelWith('humidity', 'avg'), keyName: this.getLabelWith('humidity', 'avg') },
          { isActive: true, displayName: this.getLabelWith('humidity', 'min'), keyName: this.getLabelWith('humidity', 'min') },
          { isActive: true, displayName: this.getLabelWith('temperature', 'max'), keyName: this.getLabelWith('temperature', 'max') },
          { isActive: true, displayName: this.getLabelWith('temperature', 'avg'), keyName: this.getLabelWith('temperature', 'avg') },
          { isActive: true, displayName: this.getLabelWith('temperature', 'min'), keyName: this.getLabelWith('temperature', 'min') },
          { isActive: true, displayName: this.getLabelWith('count', 'max'), keyName: this.getLabelWith('count', 'max') },
          { isActive: true, displayName: this.getLabelWith('count', 'avg'), keyName: this.getLabelWith('count', 'avg') },
          { isActive: true, displayName: this.getLabelWith('count', 'min'), keyName: this.getLabelWith('count', 'min') },
          { isActive: true, displayName: this.getLabelWith('step', 'max'), keyName: this.getLabelWith('step', 'max') },
          { isActive: true, displayName: this.getLabelWith('step', 'avg'), keyName: this.getLabelWith('step', 'avg') },
          { isActive: true, displayName: this.getLabelWith('step', 'min'), keyName: this.getLabelWith('step', 'min') },
          { isActive: true, displayName: this.getLabelWith('beat', 'max'), keyName: this.getLabelWith('beat', 'max') },
          { isActive: true, displayName: this.getLabelWith('beat', 'avg'), keyName: this.getLabelWith('beat', 'avg') },
          { isActive: true, displayName: this.getLabelWith('beat', 'min'), keyName: this.getLabelWith('beat', 'min') },
          { isActive: true, displayName: this.getLabelWith('low', 'max'), keyName: this.getLabelWith('low', 'max') },
          { isActive: true, displayName: this.getLabelWith('low', 'avg'), keyName: this.getLabelWith('low', 'avg') },
          { isActive: true, displayName: this.getLabelWith('low', 'min'), keyName: this.getLabelWith('low', 'min') },
          { isActive: true, displayName: this.getLabelWith('high', 'max'), keyName: this.getLabelWith('high', 'max') },
          { isActive: true, displayName: this.getLabelWith('high', 'avg'), keyName: this.getLabelWith('high', 'avg') },
          { isActive: true, displayName: this.getLabelWith('high', 'min'), keyName: this.getLabelWith('high', 'min') },
          { isActive: true, displayName: this.getLabelWith('down', 'max'), keyName: this.getLabelWith('down', 'max') },
          { isActive: true, displayName: this.getLabelWith('down', 'avg'), keyName: this.getLabelWith('down', 'avg') },
          { isActive: true, displayName: this.getLabelWith('down', 'min'), keyName: this.getLabelWith('down', 'min') },
          { isActive: true, displayName: this.getLabelWith('magnet', 'max'), keyName: this.getLabelWith('magnet', 'max') },
          { isActive: true, displayName: this.getLabelWith('magnet', 'min'), keyName: this.getLabelWith('magnet', 'min') },
          { isActive: true, displayName: this.getLabelWith('pressVol', 'max'), keyName: this.getLabelWith('pressVol', 'max') },
          { isActive: true, displayName: this.getLabelWith('pressVol', 'avg'), keyName: this.getLabelWith('pressVol', 'avg') },
          { isActive: true, displayName: this.getLabelWith('pressVol', 'min'), keyName: this.getLabelWith('pressVol', 'min') },
        ]
      case 'stayRatioGp':
        return [
          { isActive: true, displayName: this.getLabel('date'), keyName: this.getLabel('date') },
          { isActive: true, displayName: this.getLabel('name'), keyName: this.getLabel('name') },
          { isActive: true, displayName: this.getLabel('groupName'), keyName: this.getLabel('groupName') },
          { isActive: true, displayName: this.getLabel('stayTime'), keyName: this.getLabel('stayTime') },
          { isActive: true, displayName: this.getLabel('absent1Time'), keyName: this.getLabel('stayRatioAbsent1Time') },
          { isActive: true, displayName: this.getLabel('absent2Time'), keyName: this.getLabel('stayRatioAbsent2Time') },
          { isActive: true, displayName: this.getLabel('lostTime'), keyName: this.getLabel('lostTime') },
          { isActive: true, displayName: this.getLabel('stayRatio'), keyName: this.getLabel('stayRatio') },
          { isActive: true, displayName: this.getLabel('absent1Ratio'), keyName: this.getLabel('stayRatioAbsent1Ratio') },
          { isActive: true, displayName: this.getLabel('absent2Ratio'), keyName: this.getLabel('stayRatioAbsent2Ratio') },
          { isActive: true, displayName: this.getLabel('lostRatio'), keyName: this.getLabel('lostRatio') },
        ]
      case 'stayRatioBase':
        return [
          { isActive: true, displayName: this.getLabel('date'), keyName: this.getLabel('date') },
          { isActive: true, displayName: this.getLabel('name'), keyName: this.getLabel('name') },
          { isActive: true, displayName: this.getLabel('groupName'), keyName: this.getLabel('groupName') },
          { isActive: true, displayName: this.getLabel('stayTime'), keyName: this.getLabel('stayTime') },
          { isActive: true, displayName: this.getLabel('absent1Time'), keyName: this.getLabel('stayRatioAbsent1Time') },
          { isActive: true, displayName: this.getLabel('absent2Time'), keyName: this.getLabel('stayRatioAbsent2Time') },
          { isActive: true, displayName: this.getLabel('lostTime'), keyName: this.getLabel('lostTime') },
          { isActive: true, displayName: this.getLabel('stayRatio'), keyName: this.getLabel('stayRatio') },
          { isActive: true, displayName: this.getLabel('absent1Ratio'), keyName: this.getLabel('stayRatioAbsent1Ratio') },
          { isActive: true, displayName: this.getLabel('absent2Ratio'), keyName: this.getLabel('stayRatioAbsent2Ratio') },
          { isActive: true, displayName: this.getLabel('lostRatio'), keyName: this.getLabel('lostRatio') },
        ]
      case 'positionHistory':
        return [
          { isActive: true, displayName: this.getLabel('dt'), keyName: this.getLabel('dt') },
          { isActive: true, displayName: this.getLabel('txName'), keyName: this.getLabel('txName') },
          { isActive: true, displayName: this.getLabel('major'), keyName: this.getLabel('major') },
          { isActive: true, displayName: this.getLabel('minor'), keyName: this.getLabel('minor') },
          { isActive: true, displayName: this.getLabel('deviceId'), keyName: this.getLabel('deviceId') },
          { isActive: true, displayName: this.getLabel('locationName'), keyName: this.getLabel('locationName') },
          { isActive: true, displayName: this.getLabel('area'), keyName: this.getLabel('area') },
        ]
      case 'positionHistoryExc':
        return [
          { isActive: true, displayName: this.getLabel('basetime'), keyName: this.getLabel('basetime') },
          { isActive: true, displayName: this.getLabel('receivedtime'), keyName: this.getLabel('receivedtime') },
          { isActive: true, displayName: this.getLabel('txId'), keyName: this.getLabel('txId') },
          { isActive: true, displayName: this.getLabel('posId'), keyName: this.getLabel('posId') },
        ]
      case 'sensorHistory':
        return [
          { isActive: true, displayName: this.getLabel('dt'), keyName: this.getLabel('dt') },
          { isActive: true, displayName: this.getLabel('sensorName'), keyName: this.getLabel('sensorName') },
          { isActive: true, displayName: this.getLabel('deviceId'), keyName: this.getLabel('deviceId') },
          { isActive: true, displayName: this.getLabel('locationZoneName'), keyName: this.getLabel('locationZoneName') },
          { isActive: true, displayName: this.getLabel('areaName'), keyName: this.getLabel('areaName') },
          { isActive: true, displayName: this.getLabel('temperature'), keyName: this.getLabel('temperature') },
          { isActive: true, displayName: this.getLabel('humidity'), keyName: this.getLabel('humidity') },
        ]
      case 'sensorHistoryExc':
        return [
          { isActive: true, displayName: this.getLabel('receivedtime'), keyName: this.getLabel('receivedtime') },
          { isActive: true, displayName: this.getLabel('deviceId'), keyName: this.getLabel('deviceId') },
          { isActive: true, displayName: this.getLabel('temperature'), keyName: this.getLabel('temperature') },
          { isActive: true, displayName: this.getLabel('humidity'), keyName: this.getLabel('humidity') },
        ]
      case 'notifyHistory':
        return [
          { isActive: true, displayName: this.getLabel('dt'), keyName: this.getLabel('dt') },
          { isActive: true, displayName: this.getLabel('notifyTo'), keyName: this.getLabel('notifyTo') },
          { isActive: true, displayName: this.getLabel('major'), keyName: this.getLabel('major') },
          { isActive: true, displayName: this.getLabel('minor'), keyName: this.getLabel('minor') },
          { isActive: true, displayName: this.getLabel('minorPowerLevel'), keyName: this.getLabel('minorPowerLevel') },
          { isActive: true, displayName: this.getLabel('txName'), keyName: this.getLabel('txName') },
          { isActive: true, displayName: this.getLabel('deviceNum'), keyName: this.getLabel('deviceNum') },
          { isActive: true, displayName: this.getLabel('finalReceiveTime'), keyName: this.getLabel('finalReceiveTime') },
          { isActive: true, displayName: this.getLabel('notifyResult'), keyName: this.getLabel('notifyResult') },
        ]
      case 'planActualHistory':
        return [
          { isActive: true, displayName: this.getLabel('startDt'), keyName: 'startDt' },
          { isActive: true, displayName: this.getLabel('endDt'), keyName: 'endDt' },
          { isActive: true, displayName: this.getLabel('planId'), keyName: 'planId' },
          { isActive: true, displayName: this.getLabel('planName'), keyName: 'planName' },
          { isActive: true, displayName: this.getLabel('planDetailId'), keyName: 'planDetailId' },
          { isActive: true, displayName: this.getLabel('zoneId'), keyName: 'zoneId' },
          { isActive: true, displayName: this.getLabel('zoneName'), keyName: 'zoneName' },
          { isActive: true, displayName: this.getLabel('potId'), keyName: 'potId' },
          { isActive: true, displayName: this.getLabel('potName'), keyName: 'potName' },
          { isActive: true, displayName: this.getLabel('potCategoryType'), keyName: 'potCategoryType' },
        ]
      case 'meetingGraph':
        return [
          { isActive: true, displayName: this.getLabel('datetime'), keyName: this.getLabel('datetime') },
          { isActive: true, displayName: this.getLabel('id'), keyName: this.getLabel('id') },
          { isActive: true, displayName: this.getLabel('locationName'), keyName: this.getLabel('locationName') },
          { isActive: true, displayName: this.getLabel('count'), keyName: this.getLabel('count') },
        ]
      default:
        return null
      }
    },
    // イントロダクションに表示する表の内容
    getIntroductionItems(key){
      switch(key) {
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
.keyFields {
  font-size: 14px !important;
  width: 20%;
}
.items {
  font-size: 14px !important;
}

</style>
