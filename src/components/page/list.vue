<template>
  <b-form inline autocomlete="off" @submit.prevent>
    <input type="password" style="display:none">
    <b-container :fluid="isFluid" @click="resetDetail">
      <alert :message="showMessage? message: error" :force-hide="alertForceHide" />
      <div v-if="systemPopupObj" id="systemPopup" :style="systemPopupObj.style" @mouseleave="hideSystemPopup">{{ systemPopupObj.title }}</div>

      <!-- searchbox -->
      <template v-if="!params.hideSearchBox">
        <b-form-row class="mb-2">
          <b-form-row v-if="!params.hideNormalSearchBox" class="mr-4 mb-2">
            <!-- 標準絞り込みフィルタ -->
            <label v-t="'label.filter'" class="mr-2" />
            <b-input-group>
              <input v-model="filter.word" class="form-control align-self-center" :maxlength="maxFilterLength">
              <button v-if="compactMode" @click="fetchCompactListOnNext()">
                <font-awesome-icon class="" icon="search" fixed-width />
              </button>
              <b-input-group-append>
                <b-btn v-t="'label.clear'" :disabled="!filter.word" variant="secondary" class="align-self-center" @click="filter.word = ''; compactMode? fetchCompactListOnNext(): () => {}" />
              </b-input-group-append>
            </b-input-group>
          </b-form-row>
          <!-- カスタムフィルタ -->
          <template v-if="params.extraFilter">
            <b-form-row v-for="item in extraFilterSpec()" :key="item.key" class="mr-4 mb-2">
              <b-form-row v-if="item.show">
                <label v-t="'label.' + item.key" for="item.key" class="mr-2" />
                <b-input-group v-if="item.useVueSelect">
                  <span :title="vueSelectTitle(vueSelected[item.key])">
                    <v-select v-model="vueSelected[item.key]" :input-id="item.key" :options="item.options" class="extra-filter vue-options" :style="vueSelectStyle">
                      <template slot="selected-option" slot-scope="option">
                        {{ vueSelectCutOn(option) }}
                      </template>
                      <template slot="no-options">
                        {{ vueSelectNoMatchingOptions }}
                      </template>
                    </v-select>
                  </span>
                </b-input-group>
                <b-input-group v-else>
                  <b-form-select :id="item.key" v-model="filter.extra[item.key]" :options="item.options"
                                 class="extra-filter" @change="item.change"
                  />
                </b-input-group>
              </b-form-row>
            </b-form-row>
          </template>
          <b-form-row v-if="useDetailFilter" class="mr-4 mb-2">
            <detail-filter component-id="list" save-filter @detailFilter="onDetailFilter" />
          </b-form-row>
          <div v-if="params.extraFilter" class="w-100 mb-2 " />
        </b-form-row>
        <b-form-row v-if="params.delFilter" class="mb-2">
          <b-form-row>
            <!-- 削除済みフィルタ -->
            <b-form-checkbox id="delFilter" v-model="filter.del" :value="true" :unchecked-value="false">
              <span v-text="$i18n.tnl('label.delFilter')" />
            </b-form-checkbox>
          </b-form-row>
        </b-form-row>
        <b-form-row v-if="params.allShowFilter" class="mb-2">
          <b-form-row>
            <!-- 全て表示する -->
            <b-form-checkbox id="allShowFilter" v-model="filter.allShow" :value="true" :unchecked-value="false">
              <span v-text="$i18n.tnl('label.allShowFilter')" />
            </b-form-checkbox>
          </b-form-row>
        </b-form-row>
        <b-form-row class="mb-1">
          <!-- ボタン部 -->
          <b-col v-if="!params.disableTableButtons && (isRegistable || isBulkRegistable || isBulkReferenceable)" cols="auto" class="ml-auto">
            <b-button v-if="isRegistable" v-t="'label.createNew'" :variant="theme" class="mx-1"
                      @click="edit()"
            />
            <b-button v-if="isBulkRegistable && params.bulkEditPath && !iosOrAndroid" v-t="'label.bulkRegister'" :variant="theme" class="mx-1" 
                      @click="bulkEdit()"
            />
            <b-button v-if="isBulkReferenceable && params.csvOut && !iosOrAndroid" v-t="'label.download'" :variant="theme" class="mx-1"
                      @click="exportCsv"
            />
          </b-col>
        </b-form-row>
      </template>

      <slot />

      <b-row class="mt-3" />

      <!-- table -->
      <b-table
        :items="items"
        :fields="fields"
        :current-page="compactMode? 1: currentPage" :per-page="perPage"
        :filter="compactMode? () => true: executeFilter" :bordered="params.bordered"
        :sort-by.sync="sortBy" :sort-compare="compactMode? () => 0: sortCompare" :sort-desc.sync="sortDesc" :empty-filtered-text="emptyMessage"
        :responsive="!iosOrAndroid" :stacked="iosOrAndroid ? 'md' : null"
        show-empty striped hover outlined caption-top
        @filtered="onFiltered"
        @sort-changed="compactMode? fetchCompactListOnNext(): () => {}"
      >
        <template v-if="params.tableDescription" slot="table-caption">
          {{ $i18n.tnl('label.' + params.tableDescription) }}
        </template>
        <template slot="style" slot-scope="row">
          <div :style="style(row.item)">
            A
          </div>
        </template>
        <template slot="actions" slot-scope="row">
          <!-- 参照ボタン -->
          <b-button v-if="isDetailReferenceable" v-t="'label.refer'" :variant="theme" :style="actionButtonStyle" size="sm" class="mr-1 my-1" @click.stop="edit(row.item, row.index, $event.target)" />
          <!-- 更新ボタン -->
          <b-button v-if="isUpdatable" v-t="'label.update'" :variant="theme" :style="actionButtonStyle" size="sm" class="mr-1 my-1" :disabled="disabledTenantButton(row.item)" @click.stop="edit(row.item, row.index, $event.target)" />
          <!-- 削除ボタン -->
          <b-button v-if="isDeleteable" v-t="'label.delete'" :style="actionButtonStyle" size="sm" variant="outline-danger" class="mr-1 my-1" @click.stop="deleteConfirm(row.item, row.index, $event.target)" />
          <!-- jump another master page -->
          <div v-if="isEditable && anotherPageParams" :style="{'width': '100px'}">
            <!-- zone button -->
            <!-- <div v-if="getAnotherPageParam('zone', row.item)">
              <b-button size="sm" @click.stop="jumpAnotherPage('zone', row.item)" :variant="theme" class="btn-block mt-1 mb-1" v-t="'label.zone'" :style="anotherActionButtonStyle" />
            </div> -->
            <!-- location button -->
            <div v-if="getAnotherPageParam('location', row.item)">
              <b-button v-t="'label.location'" :variant="theme" :style="anotherActionButtonStyle" size="sm" class="btn-block my-1" @click.stop="jumpAnotherPage('location', row.item)" />
            </div>
          </div>
          <!-- for tenant -->
          <div v-if="isTenantAdmin && params.tenantAction" :style="{'width': '100px'}">
            <!-- switch button -->
            <div>
              <b-button v-if="isCurrentTenant(row.item)" v-t="'label.now'" :variant="theme" :style="anotherActionButtonStyle" :disabled="true" size="sm" class="btn-block my-1" style="opacity: 1.0 !important; border-radius: 0px;" />
              <b-button v-else v-t="'label.switch'" :variant="theme" :style="anotherActionButtonStyle" size="sm" class="btn-block my-1" :disabled="disabledTenantButton(row.item)" @click.stop="switchTenant(row.item)" />
            </div>
          </div>
        </template>
        <template slot="thumbnail" slot-scope="row">
          <img v-if="row.item.existThumbnail" :src="thumbnail(row.item)" height="70">
        </template>
        <!-- ID (デバッグ用に属性にpkey付加) -->
        <template slot="ID" slot-scope="row">
          <div :updateKey="row.item.updateKey">
            {{ row.item.ID }}
          </div>
        </template>
        <template slot="btxId" slot-scope="row">
          <div :updateKey="row.item.updateKey">
            {{ row.item.btxId }}
          </div>
        </template>
        <template slot="deviceId" slot-scope="row">
          <div :updateKey="row.item.updateKey">
            {{ row.item.deviceId }}
          </div>
        </template>
        <!-- リージョン名 -->
        <template slot="regionNames" slot-scope="row">
          <div>
            {{ row.item.regionNames }}
          </div>
        </template>
        <!-- tx名 -->
        <template slot="txIdName" slot-scope="row">
          <div v-for="(txIdName, index) in row.item.txIdNames" :key="index">
            {{ txIdName }}
          </div>
        </template>
        <!-- ゾーン名 -->
        <template slot="zoneClass" slot-scope="row">
          <div v-for="(zoneName, index) in row.item.zoneClass" :key="index">
            {{ zoneName }}
          </div>
        </template>
        <template slot="zoneBlock" slot-scope="row">
          <div v-for="(zoneName, index) in row.item.zoneBlock" :key="index">
            {{ zoneName }}
          </div>
        </template>
        <template slot="guardNames" slot-scope="row">
          <div v-for="(guardName, index) in row.item.guardNames.split(';')" :key="index">
            {{ guardName }}
          </div>
        </template>
        <template slot="doorNames" slot-scope="row">
          <div v-for="(doorName, index) in row.item.doorNames.split(';')" :key="index">
            {{ doorName }}
          </div>
        </template>
        <!-- カテゴリ名 -->
        <template slot="auth" slot-scope="row">
          <div v-for="(categoryName, index) in row.item.authCategoryNames" :key="index">
            {{ categoryName }}
          </div>
        </template>
        <!-- EXBタイプ名 -->
        <template slot="exbTypeName" slot-scope="row">
          <div>
            {{ row.item.exbTypeName }}
          </div>
        </template>
        <!-- センサ名 -->
        <template slot="sensorNames" slot-scope="row">
          <div v-for="(sensorIdName, index) in row.item.sensorNames" :key="index">
            {{ sensorIdName }}
          </div>
        </template>
        <!-- 電池レベル -->
        <template slot="powerLevel" slot-scope="row">
          <span :class="'badge badge-pill badge-' + row.item.powerLevel.class">
            {{ row.item.powerLevel.text }}
          </span>
        </template>
        <template slot="locationName" slot-scope="row">
          <span :variant="theme" size="sm" :class="'mx-1 ' + row.item.blinking">
            {{ row.item.locationName }}
          </span>
        </template>
        <!-- マップ表示 -->
        <template slot="mapDisplay" slot-scope="row">
          <b-button v-t="'label.mapDisplay'" :variant="theme" :disabled="row.item.noSelectedTx || row.item.isDisableArea"
                    size="sm" class="mx-1" @click.stop="mapDisplay(row.item)"
          />
        </template>
        <!-- カテゴリ等アイコン横並び表示 -->
        <template slot="icons" slot-scope="row">
          <div class="empty-icon d-inline-flex" /><!-- 横幅0の「支柱」 -->
          <div class="d-inline-flex flex-wrap">
            <span v-if="useTxPopup">
              <div v-for="position in row.item.positions" :key="position.txId"
                   :style="position.display" :class="'d-inline-flex m-1 '+ position.blinking" @click="txOnClick($event,position.tx)"
              >
                {{ position.label }}
              </div>
            </span>
            <span v-else>
              <div v-for="position in row.item.positions" :key="position.txId"
                   :style="position.display" :class="'d-inline-flex m-1 '+ position.blinking" @click.stop="mapDisplay(position, true)"
              >
                {{ position.label }}
              </div>
            </span>
          </div>
        </template>
        <!-- 設定用 -->
        <template slot="key" slot-scope="row">
          <div class="systemPopup" @mouseover="onSystemItemHover($event, row.item)" @mouseleave="hideSystemPopup">
            <span>
              {{ row.item.key }}
            </span>
          </div>
        </template>
        <template slot="keyName" slot-scope="row">
          <div class="systemPopup" @mouseover="onSystemItemHover($event, row.item)" @mouseleave="hideSystemPopup">
            <span>
              {{ row.item.keyName }}
            </span>
          </div>
        </template>
        <template slot="value" slot-scope="row">
          <settinginput v-if="!row.item.isParent" :input-model="getItem(row.item)" input-key="value" :input-type="row.item.valType" :form-id="params.formId" />
        </template>
        <template slot="clear" slot-scope="row">
          <b-button v-if="!row.item.isParent" v-t="'label.clear'" :variant="theme" size="sm" class="ml-2" @click.stop="clearAction(row.item)" />
        </template>
      </b-table>

      <!-- pager -->
      <b-row>
        <b-col v-if="usePagenation" md="6" class="mt-1 mb-3">
          <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" class="my-0" @input="compactMode? fetchCompactListOnNext(): () => {}" />
        </b-col>
        <!-- bulk upload button -->
        <b-col v-if="isBulkRegistable && params.bulkUploadPath && !iosOrAndroid" md="6" class="my-1">
          <b-button v-t="'label.bulkUpload'"
                    :variant="theme" class="float-right" @click="bulkUpload()"
          />
        </b-col>
      </b-row>

      <!-- Tx詳細表示（ポップアップ） -->
      <div v-if="selectedTx.btxId && showReady">
        <txdetail :selected-tx="selectedTx" :selected-sensor="selectedSensor()" :is-show-modal="isShowModal()" @resetDetail="resetDetail" />
      </div>
      <!-- modal -->
      <b-modal id="modalInfo" :title="modalInfo.title" @hide="resetModal" @ok="execDelete(modalInfo.id)">
        {{ modalInfo.content }}
      </b-modal>
    </b-container>
  </b-form>
</template>

<script>

import { mapState, mapMutations } from 'vuex'
import { APP, APP_SERVICE , EXCLOUD} from '../../sub/constant/config'
import { SENSOR, KEY } from '../../sub/constant/Constants'
import * as ArrayUtil from '../../sub/util/ArrayUtil'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as StringUtil from '../../sub/util/StringUtil'
import * as Util from '../../sub/util/Util'
import * as DomUtil from '../../sub/util/DomUtil'
import * as AppServiceHelper from '../../sub/helper/dataproc/AppServiceHelper'
import * as VueSelectHelper from '../../sub/helper/ui/VueSelectHelper'
import * as AuthHelper from '../../sub/helper/base/AuthHelper'
import { getCharSet } from '../../sub/helper/base/CharSetHelper'
import * as DetectStateHelper from '../../sub/helper/domain/DetectStateHelper'
import * as LocalStorageHelper from '../../sub/helper/base/LocalStorageHelper'
import * as MenuHelper from '../../sub/helper/dataproc/MenuHelper'
import * as MasterHelper from '../../sub/helper/domain/MasterHelper'
import * as PositionHelper from '../../sub/helper/domain/PositionHelper'
import * as TxDetailHelper from '../../sub/helper/domain/TxDetailHelper'
import * as SensorHelper from '../../sub/helper/domain/SensorHelper'
import * as PotHelper from '../../sub/helper/domain/PotHelper'
import commonmixin from '../mixin/commonmixin.vue'
import detailFilter from '../../components/parts/detailFilter.vue'
import alert from '../parts/alert.vue'
import settinginput from '../parts/settinginput.vue'
import txdetail from '../../components/parts/txdetail.vue'

export default {
  components: {
    detailFilter,
    alert,
    settinginput,
    txdetail,
  },
  mixins: [commonmixin],
  props: {
    params: {
      type: Object,
      required: true,
    },
    list: {
      type: Array,
      default: () => [],
    },
    isFluid: {
      type: Boolean,
      default: false,
    },
    anotherPageParams: {
      type: Array,
      default: () => [],
    },
    alertForceHide: {
      type: Boolean,
      default: false,
    },
    perPage: {
      type: [String, Number],
      default: 10,
    },
    usePagenation: {
      type: Boolean,
      default: true,
    },
    maxFilterLength: {
      type: [String, Number],
      default: 20,
    },
    useDetailFilter: {
      type: Boolean,
      default: false,
    },
    compactMode: { // 一覧表示のページ分だけサーバから取得する場合true
      type: Boolean,
      default: false,
    },
    // Txをクリックした場合、ポップアップを出す
    pShowDetail: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      currentPage: 1,
      totalRows: 0,
      dataItemList: [],
      showReady: false, //  pir, positio
      preloadThumbnail: new Image(),
      thumbnailUrl: APP_SERVICE.BASE_URL + EXCLOUD.POT_THUMBNAIL_URL,
      useTxPopup: APP.POS_STACK.USE_POPUP,
      filter: {
        word: '',
        extra: {
          category: '',
          group: '',
          area: '',
          sensor: SENSOR.TEMPERATURE,
          zone: '',
          zoneCategory: '',
          detectState: null,
          keyCategory: '',
          settingCategory: '',
        },
        detail: null,
        del: false,
        allShow: false,
      },
      vueSelected: {
        category: null,
        group: null,
        area: null,
        zone: null,
        zoneCategory: null,
      },
      old: {
        sortBy: null,
        sortDesc: false,
      },
      emptyMessage: this.$i18n.tnl('message.listEmpty'),
      modalInfo: { title: '', content: '', id:'' },
      file: null,
      message: null,
      error: null,
      sortBy: null,
      sortDesc: false,
      lasteFetched: 0,
      sortCompare: (aData, bData, key) => this.sortCompareCustom(aData, bData, key),
      ...this.params,
      systemPopupObj: null,
      navRect: null,
      sidebarRect: null,
      systemPopupHoverX: 0,
      systemPopupHoverY: 0,
    }
  },
  computed: {
    items() {
      const dataList = this.compactMode? this.dataItemList: this.list
      if(!dataList){
        return []
      }
      return dataList.map(item => { // allDispFieldsに指定されていないフィールドの場合、max50文字に短縮しているようだ
        return _.reduce(item, (result, val, key) => {
          const isAllDisp = Util.hasValue(this.params.allDispFields) && this.params.allDispFields.includes(key)
          result[key] = isAllDisp? val: StringUtil.cutOnLong(val, 50)
          return result
        }, {})
      })
    },
    isDetailReferenceable() {
      return this.callParentComputedOrMenu('isDetailReferenceable')
    },
    isUpdatable() {
      return this.callParentComputedOrMenu('isUpdatable')
    },
    isDeleteable() {
      return this.callParentComputedOrMenu('isDeleteable')
    },
    isRegistable() {
      return this.callParentComputedOrMenu('isRegistable')
    },
    isBulkRegistable() {
      return this.callParentComputedOrMenu('isBulkRegistable')
    },
    isBulkReferenceable() {
      return this.callParentComputedOrMenu('isBulkReferenceable')
    },
    isEditable() {
      return this.callParentComputedOrMenu('isEditable')
    },
    ...mapState([
      'featureList',
    ]),
    ...mapState('app_service', [
      'listMessage',
      'editPage',
      'moveEditPage',
    ]),
    ...mapState('main', [
      'selectedTx',
    ]),
    detectStateOptions() {
      let options = DetectStateHelper.getTypes()
      options.unshift({value:null, text:''})
      return options
    },
    keyCategoryOptions() {
      const options = this.$i18n.tnl('config.OPTIONS.KEY_CATEGORY')
      if(!Util.hasValue(options)) {
        return [{ value: null, text: '' }]
      }
      const ret = Object.keys(options).map(key => ({value: key, text: options[key]}))
      ret.unshift({ value: null, text: '' })
      return ret
    },
    settingCategoryOptions() {
      const options = APP.MANAGE.SETTING_CATEGORY
      if(!Util.hasValue(options)) {
        return [{ value: null, text: '' }]
      }
      const ret = options.map(key => ({value: key, text: key}))
      ret.unshift({ value: null, text: '' })
      return ret
    },
    showMessage(){
      return Util.hasValue(this.message)
    },
    showError(){
      return Util.hasValue(this.error)
    },
    actionButtonStyle(){
      return BrowserUtil.getLangShort() == 'ja'? {}: {width: '110px !important'}
    },
    anotherActionButtonStyle(){
      return BrowserUtil.getLangShort() == 'ja'? {width: '100px !important'}: {width: '110px !important'}
    },
  },
  watch: {
    vueSelected: {
      handler: function(newVal, oldVal) {
        Object.keys(this.vueSelected).forEach(key => {
          const nVal = Util.getValue(newVal[key], 'value')
          this.filter.extra[key] = nVal // このfilterの値の変更をトリガーに、b-tableのfilterが処理される
          if (key == 'category') {
            this.selectedCategoryId = nVal
          }
          if (key == 'group') {
            this.selectedGroupId = nVal
          }
        })
        if (this.compactMode) {
          this.fetchCompactListOnNext() // コンパクトモードの場合、ここで一覧データ取得
        }
      },
      deep: true,
    },
    selectedAreaId: function(newVal, oldVal) {
      LocalStorageHelper.setLocalStorage(KEY.CURRENT.AREA, newVal)
    },
  },
  async created() {
  },
  async mounted() {
    const currentArea = LocalStorageHelper.getLocalStorage(KEY.CURRENT.AREA)
    if(Util.hasValue(currentArea)) {
      this.selectedAreaId = currentArea
    }
    this.vueSelected.category = VueSelectHelper.getVueSelectData(this.categoryOptions, this.selectedCategoryId, false)
    this.vueSelected.group = VueSelectHelper.getVueSelectData(this.groupOptions, this.selectedGroupId, false)
    const strageMessage = LocalStorageHelper.popLocalStorage('listMessage')
    this.message = Util.hasValue(strageMessage)? strageMessage: this.listMessage
    this.replaceAS({listMessage: null})
    if(this.compactMode) {
      await this.fetchCompactList()
    } else {
      this.callParentMethod('fetchData') // TODO: ここで呼ばなくても別途呼ばれる
    }
    // if (this.params.extraFilter) { // TODO: このロジック必要？
    //   const filterColumnList = this.params.extraFilter.filter(e => e != 'detectState')
    //   filterColumnList.filter(e => ['category', 'group', 'area'].includes(e)).forEach(e => {
    //     const selectedKey = StringUtil.concatCamel('selected', e, 'id')
    //     this.vueSelected[e] = VueSelectHelper.getVueSelectData(this[e + 'Options'], this[selectedKey])
    //   })
    // }
    this.sortBy = this.params.sortBy? this.params.sortBy: null
    this.replace({showWarn: false, showAlert: this.showError, showInfo: this.showMessage})

    this.$nextTick(() => {
      if(this.moveEditPage && this.editPage){
        this.currentPage = this.editPage
      }
      this.replaceAS({editPage: null, moveEditPage: false})
    })

    this.navRect = DomUtil.getRect('nav')
    this.sidebarRect = DomUtil.getRect('#bd-sidebar')
  },
  // beforeDestroy() {
  //   document.removeEventListener('touchstart', this.touchEnd)
  //   this.resetDetail()
  // },
  methods: {
    ...mapMutations('app_service', [
      'replaceAS', 
    ]),
    ...mapMutations('main', [
      'replaceMain', 
    ]),
    ...mapMutations([
      'replace', 
    ]),

    // 共通
    callParentComputedOrMenu(method) {
      const ret = this.callParentComputed(method)
      if (ret !== undefined) return ret
      return MenuHelper[method](this.indexPath)
    },
    thumbnail(row) {
      return this.callParentMethod('thumbnail', row)
    },
    style(index) {
      return this.callParentMethod('style', index)
    },
    setEmptyMessage(){
      this.message = null
      this.error = null
      this.replace({showWarn: false, showAlert: false, showInfo: false})
      this.$forceUpdate()
    },
    sortCompareCustom(aData, bData, key){
      if(key == 'txIdName'){
        return ArrayUtil.sortByArray(aData.txIdNames, bData.txIdNames)
      }
      return this.defaultSortCompare(aData, bData, key)
    },

    // システム設定関連
    getItem(key){
      return this.callParentMethodOrDef('getItem', {}, key)
    },
    onSystemItemHover(event, item) {
      if(Util.hasValue(item.title)){
        const elm = DomUtil.closest(event.target, '.systemPopup')
        const rect = elm.getBoundingClientRect()
        const scrollY = window.scrollY
        window.scrollTo(0, scrollY)
        const title = item.title
        const fontSize = 13
        const lineHeight = 1.5
        const padding = 5
        this.systemPopupObj = {
          title: title,
          style : {
            'font-size': fontSize + 'px',
            'line-height': lineHeight,
            left: rect.left - this.sidebarRect.width + 'px',
            top: scrollY + rect.top - this.navRect.height - (title.split("\n").length * fontSize * lineHeight) - padding * 2 + 'px',
            'white-space': 'pre-wrap',
            position: 'absolute',
            'box-sizing': 'border-box',
            'border': 'solid 1px #808080',
            'border-radius': '5px',
            'background-color': '#ffffe0',
            'padding': padding + 'px',
            'z-index': 99
          },
        }
        this.systemPopupHoverX = event.pageX
        this.systemPopupHoverY = event.pageY
      }
    },
    hideSystemPopup(event) {
      if (event.pageX != this.systemPopupHoverX || event.pageY != this.systemPopupHoverY) {
        this.systemPopupObj = null
        this.systemPopupHoverX = 0
        this.systemPopupHoverY = 0
      }
    },
    clearAction(key){
      this.callParentMethod('clearAction', key)
    },

    // テナント管理関係
    isCurrentTenant(item){
      return item.tenantId == LocalStorageHelper.getLogin().currentTenant.tenantId
    },
    disabledTenantButton(item){
      if(item.tenantId == null){
        return false
      }
      return item.delFlg != 0
    },
    async switchTenant(item){
      await AuthHelper.switchTenant(item.tenantId)
      location.reload()
    },

    // 一覧表示（マスタ系）
    fetchCompactListOnNext() {
      this.$nextTick(() => this.fetchCompactList())
    },
    async fetchCompactList() { // マスタ一覧をサーバから取得
      let now = new Date().getTime()
      if (now - this.lasteFetched < 100) { // IEで2回リクエストを送ってしまう問題への対応
        return
      }
      this.lasteFetched = now
      if(!Util.hasValue(this.sortBy)) {
        this.sortBy = this.old.sortBy
        this.sortDesc = this.old.sortDesc
        return
      }
      this.showProgress()
      try {
        const params = {...this.createListParam(this.filter.word)}
        params.word = this.filter.word
        params.category = this.selectedCategoryId
        params.group = this.selectedGroupId
        // EXT_DEFでlistタイプのもので選択肢が多言語化される場合、予め絞り込みを行ってサーバに送る（"toilet=male,share;item=abc"のように指定）
        if (params.word) {
          const lword = this.createListWordParam(params.word)
          if (lword) params.lword = lword
        }
        const response = await AppServiceHelper.fetchCompactList(`${this.appServicePath}/list/${this.perPage}/${this.currentPage}/${this.sortBy}/${this.sortDesc? 'desc': 'asc'}` , params)
        if (response.data) {
          this.callParentMethod('editResponse', response.data)
        }
        this.dataItemList = response.data
        this.totalRows = response.count
        this.old.sortBy = this.sortBy
        this.old.sortDesc = this.sortDesc
      }
      catch(e) {
        console.error(e)
      }
      finally {
        this.hideProgress()
      }
    },
    createListParam(word) {
      return this.callParentMethodOrDef('createListParams', {}, word)
    },
    createListWordParam(word) { // EXT_DEFのlistタイプの検索用パラメータを作成
      const ret = []
      const WITH = Util.v(APP[this.params.name.toUpperCase()], 'WITH', [])
      const EXT_DEF = Util.v(APP[this.params.name.toUpperCase()], 'EXT_DEF', [])
      WITH.forEach(key => {
        const def = EXT_DEF.find(e => e.key == key)
        if (def && def.showlist && def.type == 'list' && def.format) {
          const candidates = []
          def.format.split('|').forEach(val => {
            const label = this.$i18n.tnl('label.' + val)
            if (label && label.indexOf(word) != -1) {
              candidates.push(val)
            }
          })
          if (candidates.length > 0) {
            ret.push(key + '=' + candidates.join(','))
          }
        }
      })
      return ret.length > 0? ret.join(';'): null
    },

    // CSVダウンロード
    async exportCsv() {
      const params = this.createListParam()
      BrowserUtil.executeFileDL(
        APP_SERVICE.BASE_URL
        + this.params.appServicePath
        + '/csvdownload'
        + '?charset=' + getCharSet(this.$store.state.loginId)
        + '&params=' + encodeURI(JSON.stringify(params))
      )
    },

    // 一括登録
    async bulkEdit(item, index, target) {
      this.setEmptyMessage()
      this.$router.push(this.params.bulkEditPath)
    },
    async bulkUpload(item, index, target) {
      this.setEmptyMessage()
      this.$router.push(this.params.bulkUploadPath)
    },

    // 更新ボタン押下時処理
    async edit(item, index, target) {
      this.setEmptyMessage()
      let entity = {}
      if(item != null) {
        const masterId = this.compactMode? this.callParentMethodOrDef('getEditKey', item.updateKey, item): item[this.id]
        entity = await AppServiceHelper.fetch(this.appServicePath, masterId)
      }
      entity = this.callParentMethodOrDef('convBeforeEdit', entity, entity)
      this.replaceAS({[this.name]: entity, editPage: this.currentPage})
      this.$router.push(this.editPath)
    },

    //　フィルタ関連処理(compactModeのときは実行されない)
    extraFilterSpec() { // カスタムフィルタ配列を返す
      if (!this.params.extraFilter) {
        return []
      }
      return this.params.extraFilter.map(e => { // オブジェクトを生成（key, options, changeイベント処理, show:表示有無)、文字列で指定された場合デフォルトで設定する
        const ret = (typeof e === 'string')? {key: e}: e
        ret.options = ret.optionFunc? ret.optionFunc(): this[ret.key + 'Options']
        ret.change = ret.change || function() {}
        ret.show = Util.hasValue(ret.options)
        ret.useVueSelect = Object.keys(this.vueSelected).includes(ret.key)
        return ret
      })
    },
    executeFilter(originItem) { // フィルタ実行の起点
      const regBool = this.filterWord(originItem)
      // 追加フィルタ
      const extBool = this.filterExtra(originItem)
      const delBool = this.filterDelFlg(originItem)
      const allShowBool = this.filterAllShow(originItem)
      const parentBool = this.filterParent(originItem)
      const detailBool = this.filterDetail(originItem)
      return regBool && extBool && delBool && allShowBool && parentBool && detailBool
    },
    filterWord(originItem) { // 絞り込み文字列によるフィルタ
      if (originItem.isParent) { // システム設定のフィルタリング
        return this.items.some(item => !item.isParent && item.categoryKey == originItem.categoryKey && this.executeFilter(item)) // 子要素に再帰的に検索
      }
      if (!this.filter.word) {
        return true
      }
      try { // 文字列検索
        const regExp = new RegExp('.*' + this.filter.word + '.*', 'i')
        const param = this.params.fields.filter(field => Util.v(field, 'filterable', true)).concat(this.params.addFilterFields? this.params.addFilterFields.map(field => ({key: field})): []).map(val => Util.v(originItem, val.key, ''))
        return regExp.test(JSON.stringify(param))
      }
      catch(e) {
        return false
      }
    },
    filterExtra(originItem){ // カスタムフィルタによる絞り込み
      if (!this.params.extraFilter) {
        return true
      }
      const extra = this.filter.extra
      for (let item of this.params.extraFilter) {
        const key = (typeof item === 'string')? item: item.key
        if (!Util.hasValue(extra[key])) {
          continue
        }
        switch (key) {
        case 'category':
        case 'group':
        case 'area':
          if (!(extra[key] === originItem[key + 'Id'])) {
            return false
          }
          break
        case 'detectState':
          if (!(extra[key] === originItem[key])) {
            return false
          }
          break
        case 'zone':
        case 'zoneCategory':
          if (originItem[key + 'IdList'] && !originItem[key + 'IdList'].includes(extra[key])) {
            return false
          }
          break
        case 'keyCategory':
          if(originItem.isParent){
            return false
          }
          return originItem.categoryKey == extra[key]
        case 'settingCategory':
          if(originItem.isParent){
            return false
          }
          return originItem.category == extra[key]
        }
      }
      return true
    },
    filterDelFlg(originItem){
      return !this.params.delFilter || !!this.filter.del || originItem.delFlg == 0
    },
    filterAllShow(originItem){
      return !this.params.allShowFilter || this.filter.allShow || originItem.isParent || originItem[this.id]
    },
    filterParent(originItem) {
      const zoneCategory = Util.getValue(this.params, 'parentFilter.zoneCategory')
      const categoryId = Util.getValue(originItem, 'categoryId')
      if (zoneCategory && zoneCategory != categoryId ) {
        return false
      }
      return true
    },
    filterDetail(originItem){
      return this.filter.detail == null || this.filter.detail.some(id => id == originItem.txId)
    },
    onFiltered(filteredItems) {
      if(this.compactMode) {
        return {}
      }
      this.totalRows = filteredItems.length
      this.currentPage = 1
    },
    onDetailFilter(list){
      this.filter.detail = list
    },

    // 削除関連処理
    deleteConfirm(item, index, button) { // 削除確認
      this.setEmptyMessage()
      const masterId = this.compactMode? item.updateKey: item[this.id]
      this.modalInfo.title = this.$i18n.tnl('label.confirm')
      const confirmName = this.params.confirmName? this.params.confirmName: Util.getValue(this.params, 'name', '') + 'Name'
      this.modalInfo.content = this.$i18n.tnl(this.params.delFilter && item.delFlg != 0? 'message.completeDeleteConfirm': 'message.deleteConfirm', {target: `${this.$i18n.tnl('label.' + confirmName)}:${item[confirmName]}`})
      this.modalInfo.id = masterId
      this.$root.$emit('bv::show::modal', 'modalInfo', button)
    },
    async execDelete(id) { // 削除処理実行
      this.replace({showInfo: false})
      const pageName = this.params.dispName? this.params.dispName: this.params.name
      try {
        await AppServiceHelper.deleteEntity(this.appServicePath, id)
        await MasterHelper.loadMaster()
        this.message = this.$i18n.tnl('message.deleteCompleted', {target: this.$i18n.tnl('label.' + this.params.name)})
        this.callParentMethod('onSaved', {message: this.message})
        this.replace({showInfo: true})
        if(this.compactMode) {
          await this.fetchCompactList()
        } else {
          await this.callParentMethod('fetchData')
        }
      } catch (e) {
        this.message = null
        if(e && e.response && e.response.data && ArrayUtil.isArray(e.response.data.errorList)){
          const errorList = e.response.data.errorList
          this.error = []
          errorList.forEach((error) => {
            if(error.type == 'Use'){
              this.error.push(this.$i18n.tnl('message.used', {
                key: this.$i18n.tnl(`label.${error.col}`),
                val: error.value,
                num: error.num,
                unit: this.$i18n.tnl(`label.${error.unit}Unit`),
                target: this.$i18n.tnl(`label.${error.target}`)
              }))
            }
          })
          this.replace({showAlert: true})
        }
        else if(ArrayUtil.isArray(e.bulkError)){
          this.error = e.bulkError.map(error => {
            return this.$i18n.tnl('message.bulk' + error.type + 'Failed', {
              col: this.$i18n.tnl(`label.${error.col}`),
              value: error.value,
              num: error.num,
              unit: this.$i18n.tnl(`label.${error.unit}Unit`),
              target: this.$i18n.tnl(`label.${error.target}`)
            })
          })
          this.replace({showAlert: true})
        }
        else{
          this.error = this.$i18n.terror('message.deleteFailed', {target: this.$i18n.tnl('label.' + pageName), code: e.response.status})
        }
      }
    },
    resetModal () {
      this.modalInfo.title = ''
      this.modalInfo.content = ''
      this.modalInfo.id = ''
    },

    // 別画面遷移
    getAnotherPageParam(name, item) {
      const pageParam = this.anotherPageParams.find(val => val.name == name)
      return pageParam && item[pageParam.id]? pageParam: null
    },
    async jumpAnotherPage(name, item) {
      const pageParam = this.getAnotherPageParam(name, item)
      const pageSendParam = {}
      pageParam.sendParamNames.forEach(val => pageSendParam[val] = item[val])
      this.replaceAS({pageSendParam: pageSendParam})
      this.$router.push(pageParam.jumpPath)
    },
    async mapDisplay(item, filterReset) { // 位置把握(一覧)から在席表示に遷移する
      if(item.absent){
        return
      }
      const selectedTx = {
        btxId: item.btxId,
      }
      const selectedAreaId = Util.getValue(item, 'exb.location.areaId')
      const txOk = await this.callParentMethod('checkDetectedTx', item.txId)
      if (txOk) {
        this.replaceMain({selectedTx})
      }
      if(filterReset) {
        this.filterSelectedList.forEach(selected => this[StringUtil.concatCamel('selected', selected, 'id')] = null)
        this.replaceMain({ initDetailFilter: true })
      }
      this.replaceMain({selectedAreaId})
      this.replaceMain({usePositionsCache: true})
      this.$router.push('/main/position')
    },

    // TX詳細ポップアップ関連処理 TODO: ex-map.vueと重複。
    selectedSensor() {
      if (!Util.getValue(this.selectedTx, 'btxId')) {
        return []
      }
      if (!this.positionedTxMap) return []
      const ret = SensorHelper.getSensorFromBtxId('meditag', this.positionedTxMap.meditag, this.selectedTx.btxId)
      return ret? [ret]: []
    },
    setupSelectedTx (tx, x, y, isDispThumbnail) { // Txアイコンを選択した場合のポップアップ
      const menuGroup = DomUtil.getRect('.menu-groups')  //  ナビの情報取得：x位置調整
      const navbar = DomUtil.getRect('.navbar')  // ナビの情報取得：y位置調整
      const containerRect = DomUtil.getRect('#bd-page')
      const selectedTx = TxDetailHelper.createTxDetailInfo(x, y, null, null, tx, 1.0, {x: menuGroup.width, y: navbar.height} , containerRect, isDispThumbnail? this.preloadThumbnail: {}, true)
      this.replaceMain({ selectedTx })
      this.$nextTick(() => this.showReady = true)
      if (this.isShowModal()) {
        this.$root.$emit('bv::show::modal', 'detailModal')
      }
    },
    isShowModal() { // pir, position
      return BrowserUtil.isResponsiveMode()
    },
    showDetail(tx, x, y) {
      // アラート表示でずれるので遅延実行を行う
      this.$nextTick(() => this.showDetailImp(tx, x, y))
    },
    showDetailImp(tx, x, y) { // (p,) position
      if(!Util.hasValue(this.pShowDetail)){
        return
      }
      // サムネイル非表示設定確認
      const isNoThumbnail = APP.TXDETAIL.NO_UNREGIST_THUMB && !Util.v(tx, 'pot.existThumbnail')
      if (isNoThumbnail) {
        this.setupSelectedTx(tx, x, y, false)
      } else {
        this.preloadThumbnail.onload = () => this.setupSelectedTx(tx, x, y, true)
        this.preloadThumbnail.src = null // iOSでonloadが一度しか呼ばれないので対策

        this.preloadThumbnail.src = PotHelper.getThumbnailUrl(tx, this.thumbnailUrl)
      }
    },
    txOnClick(evt,tx){
      evt.stopPropagation()
      this.showReady = false
      this.showDetail(tx, evt.pageX - evt.offsetX, evt.pageY - evt.offsetY)
    },
    // ポップアップの自動非表示
    resetDetail() { // p, pir, position
      const selectedTx = {}
      this.replaceMain({ selectedTx })
    },
  }
}

</script>

<style>
  @import "../../sub/constant/vue.scss";
  td {
    line-height: normal !important;
  }

  td.thumb-rowdata {
    padding: 5px;
    line-height: 70px;
  }

  td.action-rowdata {
    padding: 5px;
    line-height: 35px;
  }

  select.extra-filter {
    max-width: 10em;
  }

  td {
    word-break: break-all;
  }
  @media (min-width: 769px) {
    td {
      max-width: 200px;
    }
  }

  div.empty-icon {
    width: 0px;
    height: 60px;
    vertical-align: top;
    float: left;
  }

  .page-link {
    color: #376495;
  }
  .page-item.active .page-link {
    background-color: #376495;
    border-color: #265384;
  }
  .blinking{
    color: #ff0000;
	-webkit-animation:blink 1.5s ease-in-out infinite alternate;
    -moz-animation:blink 1.5s ease-in-out infinite alternate;
    animation:blink 1.5s ease-in-out infinite alternate;
  }
  @-webkit-keyframes blink{
      0% {opacity:0;}
      100% {opacity:1;}
  }
  @-moz-keyframes blink{
      0% {opacity:0;}
      100% {opacity:1;}
  }
  @keyframes blink{
      0% {opacity:0;}
      100% {opacity:1;}
  }

</style>
