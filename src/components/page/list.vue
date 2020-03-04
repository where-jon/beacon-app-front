<template>
  <b-form inline @submit.prevent>
    <b-container :fluid="isFluid" @click="resetDetail">
      <alert :message="showMessage? message: error" :force-hide="alertForceHide" />

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
            <b-form-row v-for="item of extraFilterSpec" :key="item.key" class="mr-4 mb-2">
              <b-form-row v-if="item.show">
                <label v-t="'label.' + item.key" for="item.key" class="mr-2" />
                <b-input-group v-if="useVueSelect(item.key)">
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
        :filter="compactMode? () => true: filterGrid" :bordered="params.bordered"
        :sort-by.sync="sortBy" :sort-compare="compactMode? () => 0: sortCompare" :sort-desc.sync="sortDesc" :empty-filtered-text="emptyMessage"
        show-empty stacked="md" striped hover outlined caption-top
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
              <div v-for="position in row.item.positions" :key="position.areaId"
                   :style="position.display" :class="'d-inline-flex m-1 '+ position.blinking" @click="txOnClick($event,position.tx)"
              >
                {{ position.label }}
              </div>
            </span>
            <span v-else>
              <div v-for="position in row.item.positions" :key="position.areaId"
                   :style="position.display" :class="'d-inline-flex m-1 '+ position.blinking" @click.stop="mapDisplay(position, true)"
              >
                {{ position.label }}
              </div>
            </span>
          </div>
        </template>
        <!-- 設定用 -->
        <template slot="key" slot-scope="row">
          <div v-b-tooltip="getTooltipInfo(row.item)">
            <span>
              {{ row.item.key }}
            </span>
          </div>
        </template>
        <template slot="keyName" slot-scope="row">
          <div v-b-tooltip="getTooltipInfo(row.item)">
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
        <txdetail :selected-tx="selectedTx" :selected-sensor="selectedSensor" :is-show-modal="isShowModal()" @resetDetail="resetDetail" />
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
import { CATEGORY, SENSOR, KEY } from '../../sub/constant/Constants'
import * as ArrayUtil from '../../sub/util/ArrayUtil'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as StringUtil from '../../sub/util/StringUtil'
import * as Util from '../../sub/util/Util'
import * as DomUtil from '../../sub/util/DomUtil'
import * as AppServiceHelper from '../../sub/helper/dataproc/AppServiceHelper'
import * as AuthHelper from '../../sub/helper/base/AuthHelper'
import { getCharSet } from '../../sub/helper/base/CharSetHelper'
import * as DetectStateHelper from '../../sub/helper/domain/DetectStateHelper'
import * as LocalStorageHelper from '../../sub/helper/base/LocalStorageHelper'
import * as MenuHelper from '../../sub/helper/dataproc/MenuHelper'
import * as MasterHelper from '../../sub/helper/domain/MasterHelper'
import * as VueSelectHelper from '../../sub/helper/ui/VueSelectHelper'
import * as PositionHelper from '../../sub/helper/domain/PositionHelper'
import * as SensorHelper from '../../sub/helper/domain/SensorHelper'
import commonmixin from '../mixin/commonmixin.vue'
import detailFilter from '../../components/parts/detailFilter.vue'
import alert from '../parts/alert.vue'
import settinginput from '../parts/settinginput.vue'
import txdetail from '../../components/parts/txdetail.vue'


// TODO: Filterの実装は異常。要作り直し。
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
      login: LocalStorageHelper.getLogin(),
      sortCompare: (aData, bData, key) => this.sortCompareCustom(aData, bData, key),
      ...this.params
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
    isDetailReferenceable() { // TODO: 以下同じパターンの繰り返し。パラメータに変えて一つにまとめる。
      if(this.$parent.$options.computed.isDetailReferenceable){
        return this.$parent.$options.computed.isDetailReferenceable.call(this.$parent)
      }
      return MenuHelper.isDetailReferenceable(this.indexPath)
    },
    isUpdatable() {
      if(this.$parent.$options.computed.isUpdatable){
        return this.$parent.$options.computed.isUpdatable.call(this.$parent)
      }
      return MenuHelper.isUpdatable(this.indexPath)
    },
    isDeleteable() {
      if(this.$parent.$options.computed.isDeleteable){
        return this.$parent.$options.computed.isDeleteable.call(this.$parent)
      }
      return MenuHelper.isDeleteable(this.indexPath)
    },
    isRegistable() {
      if(this.$parent.$options.computed.isRegistable){
        return this.$parent.$options.computed.isRegistable.call(this.$parent)
      }
      return MenuHelper.isRegistable(this.indexPath)
    },
    isBulkRegistable() {
      if(this.$parent.$options.computed.isBulkRegistable){
        return this.$parent.$options.computed.isBulkRegistable.call(this.$parent)
      }
      return MenuHelper.isBulkRegistable(this.indexPath)
    },
    isBulkReferenceable() {
      if(this.$parent.$options.computed.isBulkReferenceable){
        return this.$parent.$options.computed.isBulkReferenceable.call(this.$parent)
      }
      return MenuHelper.isBulkReferenceable(this.indexPath)
    },
    isEditable() {
      if(this.$parent.$options.computed.isEditable){
        return this.$parent.$options.computed.isEditable.call(this.$parent)
      }
      return MenuHelper.isEditable(this.indexPath)
    },
    extraFilterSpec() {
      if (!this.params.extraFilter) {
        return {}
      }
      return this.params.extraFilter.map(key => {
        const optionFilter = this.params.extraFilterFunc && this.params.extraFilterFunc[key]? this.params.extraFilterFunc[key]: options => options
        return {
          key: key,
          options: optionFilter(this[key + 'Options']),
          change: this.params[key + 'Change']? this.params[key + 'Change']: () => {},
          show: this.params.showOnlyHas && this.params.showOnlyHas.includes(key)? Util.hasValue(this[key + 'Options'].filter((val) => val.value != null)): true,
        }
      })
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
    categoryOptions() { // TODO: 以下commonmixinと重複しているのは削除
      return MasterHelper.getOptionsFromState('category', false, true, 
        category => CATEGORY.POT_AVAILABLE.includes(category.categoryType)
      )
    },
    zoneOptions() {
      return MasterHelper.getOptionsFromState('zone', false, true)
    },
    zoneCategoryOptions() {
      return MasterHelper.getOptionsFromState('category',
        category => MasterHelper.getDispCategoryName(category),
        true, 
        category => CATEGORY.ZONE_AVAILABLE.includes(category.categoryType)
      )
    },
    groupOptions() {
      return MasterHelper.getOptionsFromState('group', false, true)
    },
    areaOptions() {
      return MasterHelper.getOptionsFromState('area', false, true)
    },
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
    isTenantAdmin() {
      return this.login.tenantAdmin
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
    selectedSensor() {
      if (!Util.getValue(this.selectedTx, 'btxId')) {
        return []
      }
      if (!this.positionedTxMap) return []
      const ret = SensorHelper.getSensorFromBtxId('meditag', this.positionedTxMap.meditag, this.selectedTx.btxId)
      return ret? [ret]: []
    },
  },
  watch: {
    'vueSelected': {
      handler: function(newVal, oldVal){
        Object.keys(this.vueSelected).forEach(key => {
          const oVal = Util.getValue(oldVal[key], 'value')
          const nVal = Util.getValue(newVal[key], 'value')
          this.filter.extra[key] = nVal // このfilterの値の変更をトリガーに、b-tableのfilterが処理される
          if(this.useCommonFilter(key)){
            this[this.getCommonFilterKey(key)] = nVal
          }
          if(oVal != nVal){
            this.extraFilterSpec[key].change()
          }
          if(['category', 'group'].some(k => k == key)) {
            this[StringUtil.concatCamel('selected', key, 'id')] = nVal
          }
        })
        this.compactMode? this.fetchCompactListOnNext(): () => {} // コンパクトモードの場合、ここで一覧データ取得
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
    const strageMessage = LocalStorageHelper.popLocalStorage('listMessage')
    this.message = Util.hasValue(strageMessage)? strageMessage: this.listMessage
    this.replaceAS({listMessage: null})
    if(this.compactMode) {
      await this.fetchCompactList()
    } else {
      this.$parent.$options.methods.fetchData.apply(this.$parent)
    }
    if (this.params.extraFilter) {
      const filterColumnList = this.params.extraFilter.filter(str => str != 'detectState')
      filterColumnList.filter(state => ['category', 'group', 'area'].some(s => s == state)).forEach(state => {
        const selectedKey = StringUtil.concatCamel('selected', state)
        this.vueSelected[state] = VueSelectHelper.getVueSelectData(this[state + 'Options'], this[selectedKey])
      })
    }
    this.sortBy = this.params.sortBy? this.params.sortBy: null
    this.replace({showWarn: false, showAlert: this.showError, showInfo: this.showMessage})

    this.$nextTick(() => {
      if(this.moveEditPage && this.editPage){
        this.currentPage = this.editPage
      }
      this.replaceAS({editPage: null, moveEditPage: false})
    })
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
    useVueSelect(key){
      return Object.keys(this.vueSelected).includes(key)
    },
    thumbnail(row) {
      return this.$parent.$options.methods.thumbnail.call(this.$parent, row)
    },
    useCommonFilter(key){
      return Util.getValue(this.params, 'commonFilter', []).some(v => v == key)
    },
    getCommonFilterKey(key){
      return StringUtil.concatCamel('selected', key)
    },
    setEmptyMessage(){
      this.message = null
      this.error = null
      this.replace({showWarn: false, showAlert: false, showInfo: false})
      this.$forceUpdate()
    },
    isCurrentTenant(item){
      return item.tenantId == this.login.currentTenant.tenantId
    },
    disabledTenantButton(item){
      if(item.tenantId == null){
        return false
      }
      return item.delFlg != 0
    },
    sortCompareCustom(aData, bData, key){
      if(key == 'txIdName'){
        return ArrayUtil.sortByArray(aData.txIdNames, bData.txIdNames)
      }
      return this.defaultSortCompare(aData, bData, key)
    },
    async switchTenant(item){
      await AuthHelper.switchTenant(item.tenantId)
      location.reload()
    },
    getItem(key){
      if(this.$parent.$options.methods && this.$parent.$options.methods.getItem){
        return this.$parent.$options.methods.getItem.call(this.$parent, key)
      }
      return {}
    },
    getTooltipInfo(item){
      const ret = {
        placement: 'bottom',
        trigger: 'hover',
        html: true,
        delay: {
          show: 500,
          hide: 0,
        },
      }
      if(Util.hasValue(item.title)){
        ret.title = item.title
      }
      return ret
    },
    clearAction(key){
      if(this.$parent.$options.methods && this.$parent.$options.methods.clearAction){
        this.$parent.$options.methods.clearAction.call(this.$parent, key)
      }
    },
    createListParam(word) {
      return this.$parent.$options.methods && this.$parent.$options.methods.createListParams? this.$parent.$options.methods.createListParams.call(this.$parent): {}
    },
    async fetchCompactList() {
      if(!Util.hasValue(this.sortBy)) {
        this.sortBy = this.old.sortBy
        this.sortDesc = this.old.sortDesc
        return
      }
      this.showProgress()
      try {
        const params = {...this.createListParam()}
        params.word = this.filter.word
        params.category = this.selectedCategoryId
        params.group = this.selectedGroupId
        const response = await AppServiceHelper.fetchCompactList(`${this.appServicePath}/listdownload/${this.perPage}/${this.currentPage}/${this.sortBy}/${this.sortDesc? 'desc': 'asc'}` , params)
        if( this.$parent.$options.methods && this.$parent.$options.methods.editResponse && response.data) {
          await this.$parent.$options.methods.editResponse.call(this.$parent, response.data)
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
    fetchCompactListOnNext() {
      this.$nextTick(() => this.fetchCompactList())
    },
    style(index) {
      return this.$parent.$options.methods.style.call(this.$parent, index)
    },
    async edit(item, index, target) {
      this.setEmptyMessage()
      let entity = {}
      if(item != null) {
        const masterId = this.compactMode? this.$parent.$options.methods && this.$parent.$options.methods.getEditKey? this.$parent.$options.methods.getEditKey.call(this.$parent, item): item.updateKey: item[this.id]
        entity = await AppServiceHelper.fetch(this.appServicePath, masterId)
      }
      if (this.$parent.$options.methods && this.$parent.$options.methods.convBeforeEdit) {
        entity = this.$parent.$options.methods.convBeforeEdit.call(this.$parent, entity)
      }
      this.replaceAS({[this.name]: entity, editPage: this.currentPage})
      this.$router.push(this.editPath)
    },
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
    async bulkEdit(item, index, target) {
      this.setEmptyMessage()
      this.$router.push(this.params.bulkEditPath)
    },
    async bulkUpload(item, index, target) {
      this.setEmptyMessage()
      this.$router.push(this.params.bulkUploadPath)
    },
    deleteConfirm(item, index, button) {
      this.setEmptyMessage()
      const masterId = this.compactMode? item.updateKey: item[this.id]
      this.modalInfo.title = this.$i18n.tnl('label.confirm')
      const confirmName = this.params.confirmName? this.params.confirmName: Util.getValue(this.params, 'name', '') + 'Name'
      this.modalInfo.content = this.$i18n.tnl(this.params.delFilter && item.delFlg != 0? 'message.completeDeleteConfirm': 'message.deleteConfirm', {target: `${this.$i18n.tnl('label.' + confirmName)}:${item[confirmName]}`})
      this.modalInfo.id = masterId
      this.$root.$emit('bv::show::modal', 'modalInfo', button)
    },
    resetModal () {
      this.modalInfo.title = ''
      this.modalInfo.content = ''
      this.modalInfo.id = ''
    },
    filterGridGeneral(originItem){
      if(originItem.isParent){
        return this.items.find(item => !item.isParent && item.categoryKey == originItem.categoryKey && this.filterGrid(item))? true: false
      }
      if(!this.filter.word){
        return true
      }
      try{
        const regExp = new RegExp('.*' + this.filter.word + '.*', 'i')
        const param = this.params.fields.filter(field => Util.getValue(field, 'filterable', true)).concat(this.params.addFilterFields? this.params.addFilterFields.map(field => ({key: field})): []).map(val => Util.getValue(originItem, val.key, ''))
        return regExp.test(JSON.stringify(param))
      }
      catch(e){
        return false
      }
    },
    filterGridExt(originItem){
      if (!this.params.extraFilter) {
        return true
      }
      const extra = this.filter.extra
      for (let item of this.params.extraFilter) {
        switch (item) {
        case 'category':
          if (extra.category && !(extra.category === originItem.categoryId)) {
            return false
          }
          break
        case 'group':
          if (extra.group && !(extra.group === originItem.groupId)) {
            return false
          }
          break
        case 'area':
          if (extra.area && !(extra.area === originItem.areaId)) {
            return false
          }
          break
        case 'detectState':
          if (extra.detectState != null && !(extra.detectState === originItem.detectState)) {
            return false
          }
          break
        case 'zone':
          if (extra.zone && originItem.zoneIdList && !originItem.zoneIdList.includes(extra.zone)) {
            return false
          }
          break
        case 'zoneCategory':
          if (extra.zoneCategory && originItem.zoneCategoryIdList && !originItem.zoneCategoryIdList.includes(extra.zoneCategory)) {
            return false
          }
          break
        case 'keyCategory':
          if (extra.keyCategory){
            if(originItem.isParent){
              return false
            }
            return originItem.categoryKey == extra.keyCategory
          }
          break
        case 'settingCategory':
          if (extra.settingCategory){
            if(originItem.isParent){
              return false
            }
            return originItem.category == extra.settingCategory
          }
          break
        }
      }
      return true
    },
    filterGridDel(originItem){
      if(!this.params.delFilter){
        return true
      }
      if(this.filter.del){
        return true
      }
      return originItem.delFlg == 0
    },
    filterAllShow(originItem){
      if(!this.params.allShowFilter){
        return true
      }
      if(this.filter.allShow){
        return true
      }
      if(originItem.isParent){
        return true
      }
      return originItem[this.id]
    },
    filterParent(originItem) {
      const parentFilter = Util.getValue(this.params, 'parentFilter', {})
      if(parentFilter.zoneCategory){
        if (originItem.zoneCategoryIdList && !originItem.zoneCategoryIdList.includes(parentFilter.zoneCategory)) {
          return false
        }
      }
      return true
    },
    filterDetail(originItem){
      if(this.filter.detail == null){
        return true
      }
      return this.filter.detail.some(id => id == originItem.txId)
    },
    filterGrid(originItem) {
      const regBool = this.filterGridGeneral(originItem)
      // 追加フィルタ
      const extBool = this.filterGridExt(originItem)
      const delBool = this.filterGridDel(originItem)
      const allShowBool = this.filterAllShow(originItem)
      const parentBool = this.filterParent(originItem)
      const detailBool = this.filterDetail(originItem)
      return regBool && extBool && delBool && allShowBool && parentBool && detailBool
    },
    onFiltered(filteredItems) {
      if(this.compactMode) {
        return {}
      }
      this.totalRows = filteredItems.length
      this.currentPage = 1
    },
    async execDelete(id) {
      this.replace({showInfo: false})
      const pageName = this.params.dispName? this.params.dispName: this.params.name
      try {
        await AppServiceHelper.deleteEntity(this.appServicePath, id)
        await MasterHelper.loadMaster()
        this.message = this.$i18n.tnl('message.deleteCompleted', {target: this.$i18n.tnl('label.' + this.params.name)})
        if(this.$parent.$options.methods && this.$parent.$options.methods.onSaved){
          this.$parent.$options.methods.onSaved.call(this.$parent, {message: this.message})
        }
        this.replace({showInfo: true})
        if(this.compactMode) {
          await this.fetchCompactList()
        } else {
          await this.$parent.$options.methods.fetchData.apply(this.$parent)
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
    // 位置把握(一覧)から在席表示に遷移する
    async mapDisplay(item, filterReset) {
      const tx = item.tx
      const selectedTx = {
        btxId: tx.btxId,
        thumbnail: tx.thumbnail,
      }
      const selectedAreaId = Util.getValue(item, 'exb.location.areaId')
      const txOk = await this.$parent.$options.methods.checkDetectedTx.call(this.$parent, tx)
      if (txOk) {
        this.replaceMain({selectedTx})
      }
      if(filterReset) {
        this.filterSelectedList.forEach(selected => this[StringUtil.concatCamel('selected', selected, 'id')] = null)
        this.replaceMain({ initDetailFilter: true })
      }
      this.replaceMain({selectedAreaId})
      this.$router.push('/main/position')
    },
    onDetailFilter(list){
      this.filter.detail = list
    },
    // Txアイコンを選択した場合のポップアップ
    setupSelectedTx (tx, x, y, isDispThumbnail) {
      const menuGroup = DomUtil.getRect('.menu-groups')  //  ナビの情報取得：x位置調整
      const navbar = DomUtil.getRect('.navbar')  // ナビの情報取得：y位置調整
      const selectedTx = PositionHelper.createTxDetailInfoOnStack(x, y, tx,{x: menuGroup.width, y: navbar.height} , isDispThumbnail? this.preloadThumbnail: {})
      this.replaceMain({ selectedTx })
      this.$nextTick(() => this.showReady = true)
      if (this.isShowModal()) {
        this.$root.$emit('bv::show::modal', 'detailModal')
      }
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
      const isNoThumbnail = APP.TXDETAIL.NO_UNREGIST_THUMB? !tx.existThumbnail: false
      if (isNoThumbnail) {
        this.setupSelectedTx(tx, x, y, false)
      } else {
        this.preloadThumbnail.onload = () => this.setupSelectedTx(tx, x, y, true)
        this.preloadThumbnail.src = null // iOSでonloadが一度しか呼ばれないので対策

        this.preloadThumbnail.src = tx.existThumbnail? this.thumbnailUrl.replace('{id}', tx.potId): '/default.png'
      }
    },
    txOnClick(evt,tx){
      evt.stopPropagation()
      this.showReady = false
      this.showDetail(tx, evt.pageX - evt.offsetX, evt.pageY - evt.offsetY)
    },
    isShowModal() { // pir, position
      return BrowserUtil.isResponsiveMode()
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
