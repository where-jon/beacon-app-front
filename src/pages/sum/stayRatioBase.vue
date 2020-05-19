<template>
  <div>
    <b-modal
      v-model="showModal"
      size="sm"
      :title="$t('label.displaySpecified')"
      no-close-on-backdrop
      no-close-on-esc
      hide-header-close
    >
      <b-alert variant="danger" :show="modalErrorMessage!=''">
        {{ modalErrorMessage }}
      </b-alert>
      {{ $t('message.selectDisplayColumn') }}
      <span class="text-danger">
        {{ $i18n.tnl('message.selectLimitDescription', {max: checkboxLimit}) }}
      </span>
      <hr>
      <b-form-group ref="form">
        <b-form-checkbox-group id="checkbox-group-2" v-model="displayCheckList.filter" name="flavour-2">
          <b-form-checkbox :value="'groupName'">
            {{ $t('label.groupName') }}
          </b-form-checkbox>
        </b-form-checkbox-group>
        <b-form-checkbox-group id="checkbox-group-2" v-model="displayCheckList.filter" name="flavour-2">
          <b-form-checkbox :value="'categoryName'">
            {{ $t('label.categoryName') }}
          </b-form-checkbox>
        </b-form-checkbox-group>
        <hr>
        <p class="itemTitle">
          {{ $t('label.graph') }}
        </p>
        <b-form-radio-group v-model="historyType">
          <b-form-radio :value="'category'" @change="setSelectedGraphCategory(true)">
            {{ $t('label.zoneCategory') }}
          </b-form-radio>
          <br>
          <b-form-radio :value="'area'" @change="setSelectedGraphCategory(false)">
            {{ $t('label.area') }}
          </b-form-radio>
        </b-form-radio-group>
        <hr>
        <p class="itemTitle">
          {{ $t('label.displayColumnCommon') }}
        </p>
        <b-form-checkbox-group id="checkbox-group-2" v-model="displayCheckList.stay" name="flavour-2">
          <b-form-checkbox :value="'stay'">
            {{ $t('label.stayTimeSumColumn') }}
          </b-form-checkbox><br>
          <b-form-checkbox :value="'lost'">
            {{ $t('label.lostTimeSumColumn') }}
          </b-form-checkbox><br>
        </b-form-checkbox-group><br>
        <p class="itemTitle">
          {{ $t('label.displayColumnIndividual') }}
        </p>
        <b-form-checkbox-group v-if="isCategorySelected" id="checkbox-group-2" v-model="displayCheckList.category" name="flavour-2">
          <div v-for="(category, index) in categoryDisplayList" :key="`category-${index}`">
            <b-form-checkbox :value="category.categoryId">
              {{ getDispCategoryName(category) }} <span class="bgSquare" :style="`background-color: #${category.bgColor};`" />
            </b-form-checkbox><br>
          </div>
          <b-form-checkbox :value="0">
            {{ $t('label.other') }} <span class="bgSquare" :style="`background-color: ${otherColor};`" />
          </b-form-checkbox><br>
        </b-form-checkbox-group>
        <b-form-checkbox-group v-if="!isCategorySelected" id="checkbox-group-2" v-model="displayCheckList.area" name="flavour-2">
          <div v-for="(area, index) in getAreaArray()" :key="`area-${index}`">
            <b-form-checkbox :value="area.areaId">
              {{ area.areaName }} <span class="bgSquare" :style="`background-color: ${getStackColor(index)};`" />
            </b-form-checkbox><br>
            <div v-if="index == (areas.length - 1)">
              <b-form-checkbox :value="0">
                {{ $t('label.other') }} <span class="bgSquare" :style="`background-color: ${otherColor};`" />
              </b-form-checkbox><br>
            </div>
          </div>
        </b-form-checkbox-group>
      </b-form-group>
      <div slot="modal-footer" class="w-100">
        <b-button
          variant="primary"
          size="sm"
          class="float-right"
          @click="handleSubmit"
        >
          {{ $t('label.ok') }}
        </b-button>
      </div>
    </b-modal>
    <breadcrumb :items="breadCrumbs" :legend-items="legendItems" :reload="false" />
    <div class="container">
      <alert :message="message" />

      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row class="mr-3">
            <label v-t="'label.date'" class="mr-2 mb-2 d-flex align-items-center" />
            <date-picker v-model="form.date" type="date" value-format="yyyyMMdd" class="mr-2 mb-2 inputdatefrom" @change="pickerChanged" />
          </b-form-row>
        </b-form-group>
        <b-form-group v-if="!pPresence" class="mr-4">
          <b-form-row class="mb-3 mr-3">
            <b-form-row class="mr-3">
              <span v-t="'label.filter'" class="d-flex align-items-center" />
            </b-form-row>
            <b-form-row>
              <b-form-select v-model="form.filterKind" :options="filterKindOptions" class="ml-2 inputSelect" @change="changefilterKind" />
            </b-form-row>
            <b-form-row v-if="useVueSelect(form.filterKind)" class="ml-1">
              <span :title="vueSelectTitle(vueSelected.filter)">
                <v-select v-model="vueSelected.filter" :options="filterIdOptions" class="ml-2 inputSelect vue-options" :style="vueSelectStyle">
                  <template slot="selected-option" slot-scope="option">
                    {{ vueSelectCutOn(option) }}
                  </template>
                  <template slot="no-options">
                    {{ vueSelectNoMatchingOptions }}
                  </template>
                </v-select>
              </span>
            </b-form-row>
            <b-form-row v-else class="ml-1">
              <b-form-select v-model="vueSelected.filter" :options="filterIdOptions" class="ml-2 inputSelect" />
            </b-form-row>
          </b-form-row>
        </b-form-group>
        <b-form-group>
          <b-form-row v-if="isGroupEnabled" class="mb-3 mr-5">
            <label v-t="'label.group'" class="mr-2" />
            <span :title="vueSelectTitle(vueSelected.group)">
              <v-select v-model="vueSelected.group" :options="groupOptions" class="mr-2 inputSelect vue-options">
                <template slot="selected-option" slot-scope="option">
                  {{ vueSelectCutOn(option) }}
                </template>
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </span>
          </b-form-row>
        </b-form-group>
        <b-form-group>
          <b-form-row v-if="isCategoryEnabled && !pPresence" class="mb-3 mr-2">
            <label v-t="'label.category'" class="mr-2" />
            <span :title="vueSelectTitle(vueSelected.category)">
              <v-select v-model="vueSelected.category" :options="categoryOptions" class="inputSelect vue-options">
                <template slot="selected-option" slot-scope="option">
                  {{ vueSelectCutOn(option) }}
                </template>
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </span>
          </b-form-row>
        </b-form-group>
      </b-form>
      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row class="mb-3">
            <b-button v-t="'label.display'" type="submit" :variant="theme" @click="display" />
            <b-dropdown v-if="!iosOrAndroid && bulkReferenceable" :variant="theme" :text="$t('label.download')" class="ml-2">
              <b-dropdown-item @click="downloadDay('sum')">
                {{ $t('label.sum') + $t('label.download') }}
              </b-dropdown-item>
              <b-dropdown-item v-if="!pPresence" @click="downloadMonth('sum')">
                {{ $t('label.sum') + $t('label.downloadMonth') }}
              </b-dropdown-item>
              <b-dropdown-item @click="downloadDay('detail')">
                {{ $t('label.detail') + $t('label.download') }}
              </b-dropdown-item>
              <b-dropdown-item v-if="!pPresence" @click="downloadMonth('detail')">
                {{ $t('label.detail') + $t('label.downloadMonth') }}
              </b-dropdown-item>
            </b-dropdown>
            <b-button v-if="isDisplaySpecifiedBtn && !pPresence" v-t="'label.displaySpecified'" :variant="theme" class="ml-2" @click="showModal=true" />
          </b-form-row>
        </b-form-group>
      </b-form>
      <slot />
      <b-row class="mt-3" />
      <b-table :items="viewList" :fields="fields" :current-page="currentPage" :per-page="perPage" :sort-by.sync="sortBy" :sort-compare="defaultSortCompare" stacked="md" striped hover outlined>
        <template v-for="(field, index) in fields" :slot="`HEAD_${field.key}`" slot-scope="data">
          <span :key="`field-${index}`" v-html="data.label" /><span v-if="field.bgColor" :key="`fieldbg-${index}`" :style="`color: ${field.bgColor};`">■</span>
        </template>
        <template slot="graph" slot-scope="row">
          <div style="position: relative;">
            <div v-for="(bar, index) in row.item.graph" :key="index" :class="bar.isStay || bar.isAbsentZone? 'stay-bar': 'lost-bar'" :style="`${bar.isStay || bar.isAbsentZone? `background: `+ (historyType == 'category'? bar.categoryBgColor: bar.areaBgColor)+`;`: `` } width:${bar.percent}% !important;`">
              <span class="graph-arrow-box">
                {{ bar.isStay || bar.isAbsentZone? (historyType == 'category'? bar.categoryName: bar.areaName): $i18n.tnl('label.absence') }} <br>
                {{ bar.time }} <br>
                {{ bar.startTime }} ～ {{ bar.endTime }}
              </span>&nbsp;
            </div>
            <br>
            <div class="timeDisplay" style="width: 100%">
              <div v-for="(timeData, index) in row.item.graphTimeRatio" :key="`graph-${index}`" class="time-area" :style="`width: ${timeData.ratio}% !important;`">
                <span v-if="index == 0" style="float: left;">
                  {{ row.item.baseTimeFrom }}
                </span>
                <span v-if="index == row.item.graphTimeRatio.length - 1" style="float: right;">
                  {{ row.item.baseTimeTo }}
                </span>
                <span v-if="isScaleTime(timeData.time)" style="float: left;">
                  <span style="position: relative; left: -50%;">
                    {{ timeData.time + ':00' }}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </template>
      </b-table>
      <b-row>
        <b-col md="6" class="mt-1 mb-3">
          <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" class="my-0" />
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import moment from 'moment'
import { APP, DISP, DEV } from '../../sub/constant/config'
import { SHAPE, CATEGORY, SYSTEM_ZONE_CATEGORY_NAME, STAY_RATIO_BASE_FILTER_KIND, PRESENCE } from '../../sub/constant/Constants'
import * as ArrayUtil from '../../sub/util/ArrayUtil'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as ColorUtil from '../../sub/util/ColorUtil'
import * as CsvUtil from '../../sub/util/CsvUtil'
import * as DateUtil from '../../sub/util/DateUtil'
import * as Util from '../../sub/util/Util'
import * as VueUtil from '../../sub/util/VueUtil'
import * as StyleHelper from '../../sub/helper/ui/StyleHelper'
import { getCharSet } from '../../sub/helper/base/CharSetHelper'
import * as MenuHelper from '../../sub/helper/dataproc/MenuHelper'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import * as MasterHelper from '../../sub/helper/domain/MasterHelper'
import * as StayTimeHelper from '../../sub/helper/domain/StayTimeHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../../components/mixin/commonmixin.vue'
import alert from '../../components/parts/alert.vue'

export default {
  components: {
    DatePicker,
    breadcrumb,
    alert,
  },
  mixins: [commonmixin],
  props: {
    pPresence: { // プレゼンス表示として使う場合
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      breadCrumbs: ViewHelper.createBreadCrumbItems('sumTitle', this.pPresence? 'presenceSum': 'stayRatioBase'),
      legendItems: [],
      fields: this.getFields(true),
      form: {
        date: '',
        filterKind: null,
        filterId: null,
      },
      vueSelected: {
        group: null,
        category: null,
        filter: null,
      },
      displayCheckList: {
        stay: ['stay', 'lost'],
        category: [],
        area: [],
        filter: ['groupName'],
      },
      message: '',
      modalMessage: '',
      viewList: [],
      areaArray: [],
      categoryDisplayList: [],
      name: '',
      currentPage: 1,
      perPage: 20,
      sortBy: 'name',
      totalRows: 0,
      historyType: this.pPresence? 'category': 'area',
      isCategorySelected: false,
      checkboxLimit: 6,
      showModal: false,
      filterKindOptions: STAY_RATIO_BASE_FILTER_KIND.getOptions(),
      filterIdOptions: [],
      vueSelectedKeys: ['pot'],
    }
  },
  computed: {
    isCategoryEnabled () {
      return MenuHelper.isEnabledMenu('category') && ArrayUtil.includesIgnoreCase(APP.POT.WITH, 'category')
    },
    isGroupEnabled () {
      return MenuHelper.isEnabledMenu('group') && ArrayUtil.includesIgnoreCase(APP.POT.WITH, 'group')
    },
    modalErrorMessage() {
      return this.modalMessage
    },
    otherColor() {
      return APP.STAY_SUM.OTHER_COLOR
    },
    isDisplaySpecifiedBtn() {
      return APP.STAY_SUM.ENABLE_DISPLAY_SPECIFIED
    },
  },
  watch: {
    'vueSelected.filter': {
      handler: function(newVal, oldVal){
        this.form.filterId = Util.getValue(newVal, 'value')
      },
      deep: true,
    },
    'vueSelected.group': {
      handler: function(newVal, oldVal){
        this.form.groupId = Util.getValue(newVal, 'value')
      },
      deep: true,
    },
    'vueSelected.category': {
      handler: function(newVal, oldVal){
        this.form.categoryId = Util.getValue(newVal, 'value')
      },
      deep: true,
    },
  },
  async created() {
    this.form.date = DEV.DEFAULT_DATE != '' ? new Date(DEV.DEFAULT_DATE) : moment().add(this.pPresence? 0: -1, 'days').format('YYYYMMDD')
    let sortedArea = Object.assign([], this.areas)
    ArrayUtil.sortIgnoreCase(sortedArea, 'areaName')
    this.areaArray = sortedArea
  },
  async mounted() {
    ViewHelper.importElementUI()
    window.addEventListener('resize', () => {
      this.updateColumnName()
      this.$forceUpdate()
      this.setGraphTimeDisplay()
    })
    this.updateColumnName()
    if (this.categories.length < 1) {
      return
    }

    this.categoryDisplayList = this.categories.filter((c) => c.categoryType === CATEGORY.ZONE)
      .sort((a, b) => a.categoryId < b.categoryId ? -1 : 1)
    VueUtil.nextTickEx(this, () => this.loadLegends())
  },
  methods: {
    useVueSelect(key){
      return this.vueSelectedKeys.includes(key)
    },
    changefilterKind(newVal = this.form.filterKind){
      this.form.filterKind = newVal
      this.vueSelected.filter = null
      switch (newVal) {
      case 'pot':
        this.filterIdOptions = this.pots.map(e => ({value: e.potId, label: e.potName}))
        break
      default:
        this.filterIdOptions = []
        break
      }
    },
    loadLegends() {
      let lastIndex = 0
      this.legendItems = []

      if (this.pPresence) { // プレゼンスの場合
        _.forEach(PRESENCE.STATUS, (value, key) => {
          this.legendItems.push({id: value, items: [
            { id: 1, text: '', style: StyleHelper.getStyleDisplay1(
              { shape:SHAPE.SQUARE, bgColor: DISP.PRESENCE.BG[value - 1], color: '#000000', fixSize: true }
            ) },
            { id: 2, text: this.$i18n.tnl('label.' + key), style: null },
          ]})
        })
        return
      }

      if (this.isCategorySelected) {
        _.filter(this.categories, category => { return category.systemUse != 1 })
          .forEach((category, index) => {
            this.legendItems.push({id:index, items:[
              { id: 1, text: '', style: StyleHelper.getStyleDisplay1(
                { shape:SHAPE.SQUARE, bgColor: category.bgColor, color: '#000000', fixSize: true }
              ) },
              { id: 2, text: category.categoryName, style: null },
            ]})
            lastIndex = index
          })
      } else {
        _.forEach(this.areas, (area, index) => {
          this.legendItems.push({id:index, items:[
            { id: 1, text: '', style: StyleHelper.getStyleDisplay1(
              { shape:SHAPE.SQUARE, bgColor: DISP.SUM_STACK_COLOR[index], color: '#000000', fixSize: true }
            ) },
            { id: 2, text: area.areaName, style: null },
          ]})
          lastIndex = index
        })
      }

      const otherStyle = { shape:SHAPE.SQUARE, bgColor: this.otherColor, color: '#000000' }
      this.legendItems.push({id:++lastIndex, items:[
        { id: 1, text: '', style: StyleHelper.getStyleDisplay1(otherStyle) },
        { id: 2, text: this.$i18n.tnl('label.other'), style: null },
      ]})
    },
    getThClassName() {
      return 'tableHeader'
    },
    getAreaArray() {
      return this.areaArray
    },
    isScaleTime(scaleTime) {
      return _.some(APP.STAY_SUM.SCALE_TIMES, (time) => { return time === scaleTime })
    },
    setSelectedGraphCategory(isSelected) {
      // 表示を切り替える前に、前カテゴリ/エリアの選択データを初期化する
      if (this.isCategorySelected) {
        this.displayCheckList.category = []
      } else {
        this.displayCheckList.area = []
      }
      this.isCategorySelected = isSelected
      this.loadLegends()
    },
    getDispCategoryName(category) {
      return MasterHelper.getDispCategoryName(category)
    },
    getStackColor(index) {
      // 設定が6色以上ある事が前提
      return DISP.SUM_STACK_COLOR[index % DISP.SUM_STACK_COLOR.length]
    },
    updateColumn() {
      Vue.set(this, 'fields', this.getFields(false))
    },
    handleSubmit() {
      if (this.isTooManyCheck()) {
        this.modalMessage = this.$i18n.tnl('message.tooManyCheck', {max: this.checkboxLimit})
        return
      }
      this.modalMessage = ''
      this.$nextTick(() => {
        this.showModal = false
        this.updateColumn()
        this.updateColumnName()
      })
    },
    isTooManyCheck() {
      if (!Util.hasValue(this.displayCheckList)) {
        return false
      }
      return _.sumBy(Object.keys(this.displayCheckList), (key) => this.displayCheckList[key].length) > this.checkboxLimit
    },
    getFields(isInit) {
      const disableClassName = 'd-none'
      const groupClassName = isInit || !this.isDisplayFilterColumn('groupName')? disableClassName: ''
      const categoryClassName = isInit || !this.isDisplayFilterColumn('categoryName')? disableClassName: ''
      let fields = [
        {key: 'date', sortable: false, label: this.$i18n.tnl('label.date'), thClass: this.getThClassName() + ' ' + disableClassName, tdClass: disableClassName},
        {key: 'name', sortable: true, label: this.$i18n.tnl('label.potName')},
        {key: 'groupName', sortable: true, label: this.$i18n.tnl('label.groupName'), thClass: this.getThClassName() + ' ' + groupClassName, tdClass: groupClassName},
        {key: 'categoryName', sortable: true, label: this.$i18n.tnl('label.categoryName'), thClass: this.getThClassName() + ' ' + categoryClassName, tdClass: categoryClassName},
        {key: 'graph', sortable: false, label: this.$i18n.tnl('label.graph'), thStyle: {height: '50px !important', width:'400px !important'} },
      ]

      // 選択されている総合時間を追加する
      const stayClassName = isInit || this.isDisplayStayColumn('stay')? '': disableClassName
      const lostClassName = isInit || this.isDisplayStayColumn('lost')? '': disableClassName
      fields.push({key: 'stayTime', sortable: true, label: this.$i18n.tnl('label.stayTime'), thStyle: {width:'100px !important'}
        , thClass: this.getThClassName() + ' ' + stayClassName, tdClass: stayClassName})
      fields.push({key: 'lostTime', sortable: true, label: this.$i18n.tnl('label.lostTime'), thStyle: {width:'100px !important'}
        , thClass: this.getThClassName() + ' ' + lostClassName, tdClass: lostClassName})

      if (this.pPresence) {
        return fields.map(val => ({ ...val, originLabel: val.label}))
      }

      // カテゴリを追加する
      let selectedCategories = _.filter(this.categories, (category) => {
        return _.some(this.displayCheckList.category, (id) => { return id == category.categoryId })
      })

      const i18n = this.$i18n
      _.filter(this.categories,(c) => { return c.categoryType === CATEGORY.ZONE })
        .forEach((category) => {
          const categoryClassName = _.some(selectedCategories, (data) => { return data.categoryId == category.categoryId})? '': disableClassName
          let categoryName = MasterHelper.getDispCategoryName(category)
          fields.push({key: categoryName, sortable: true, label: categoryName, bgColor: '#' + category.bgColor
            , thStyle: {width:'100px !important'}, thClass: this.getThClassName() + ' ' + categoryClassName, tdClass: categoryClassName})
        })
      
      // カテゴリその他を追加する
      let isSelectedCategoryOther = false
      if (this.displayCheckList) {
        isSelectedCategoryOther = _.find(this.displayCheckList.category, (id) => { return id == 0 }) == 0
      }
      const categoryOtherClassName = isSelectedCategoryOther? '': disableClassName
      fields.push({key: 'categoryOther', sortable: true, label: i18n.tnl('label.other')+i18n.tnl('label.category'), bgColor: this.otherColor
        , thStyle: {width:'100px !important'}, thClass: this.getThClassName() + ' ' + categoryOtherClassName, tdClass: categoryOtherClassName})

      // エリアを追加する
      let selectedAreas = _.filter(this.areaArray, (area) => {
        return _.some(this.displayCheckList.area, (id) => { return id == area.areaId })
      })
      
      _.filter(this.areaArray, (a) => { return true })
        .forEach((area, index) => {
          const areaClassName = _.some(selectedAreas, (data, index) => { return data.areaId == area.areaId})? '': disableClassName
          let bgColor = DISP.SUM_STACK_COLOR[index % DISP.SUM_STACK_COLOR.length]
          fields.push({key: area.areaName, sortable: true, label: area.areaName, bgColor: bgColor, thStyle: {width:'100px !important'}
            , thClass: this.getThClassName() + ' ' + areaClassName, tdClass: areaClassName})
        })

      // エリアその他が選択されている場合は追加
      let isSelectedAreaOther = false
      if (this.displayCheckList) {
        isSelectedAreaOther = _.find(this.displayCheckList.area, (id) => { return id == 0 }) == 0
      }
      const areaOtherClassName = isSelectedAreaOther? '': disableClassName
      fields.push({key: 'areaOther', sortable: true, label: i18n.tnl('label.other')+i18n.tnl('label.area'), bgColor: this.otherColor
        , thStyle: {width:'100px !important'}, thClass: this.getThClassName() + ' ' + areaOtherClassName, tdClass: areaOtherClassName})

      return fields.map(val => ({ ...val, originLabel: val.label}))
    },
    isDisplayStayColumn(key) {
      if (!this.displayCheckList || !this.displayCheckList.stay) {
        return false
      }
      return _.some(this.displayCheckList.stay, (stay) => { return stay === key })
    },
    isDisplayFilterColumn(key) {
      if (!this.displayCheckList || !this.displayCheckList.filter) {
        return false
      }
      return _.some(this.displayCheckList.filter, (specified) => { return specified === key })
    },
    async fetchData(payload) {
      // 何もしない
    },
    async display() {
      this.updateColumn()
      this.updateColumnName()
      this.container ? this.container.removeAllChildren() : null
      await this.displayImpl()
      this.stage ? this.stage.update() : null
    },
    async displayImpl(){
      this.replace({showAlert: false})
      this.showProgress()
      try {
        if (!this.form.date || this.form.date.length == 0) {
          this.message = this.$i18n.tnl('message.pleaseEnterSearchCriteria')
          this.replace({showAlert: true})
          this.hideProgress()
          return
        }

        const sumData = await HttpHelper.getAppService(this.getApiUrl(this.form))
        if (_.isEmpty(sumData)) {
          this.message = this.$i18n.t('message.listEmpty')
          this.replace({showAlert: true})
          this.hideProgress()
          return
        }

        this.viewList = this.getStayDataList(moment(this.form.date).format('YYYY-MM-DD'), sumData, APP.STAY_SUM.ABSENT_LIMIT, APP.STAY_SUM.LOST_LIMIT)

        this.totalRows = this.viewList.length
      }
      catch(e) {
        console.error(e)
      }
      finally {
        this.hideProgress()
      }
    },
    isAbsentZoneData(categoryId) {
      let category = !this.isLostData(categoryId)? this.categoryIdMap[categoryId]: null
      return category? category.categoryName == SYSTEM_ZONE_CATEGORY_NAME.ABSENT: false
    },
    isLostData(byId) {
      return byId == -1
    },
    getStayDataList(date, stayData, absentLimit = 0, lostLimit = APP.LOST_TIME) {
      const fromSecond = (Math.floor(APP.SVC.STAY_SUM.START / 100) * 60 + APP.SVC.STAY_SUM.START % 100) * 60
      const toSecond = (Math.floor(APP.SVC.STAY_SUM.END / 100) * 60 + APP.SVC.STAY_SUM.END % 100) * 60
      const graphTimeRatio = this.getTimeRatioData()
      const fromToSettingDiff = toSecond - fromSecond

      return stayData.map((data) => {
        let stayTime = 0, lostTime = 0
        let categoryData = []
        let areaData = []
        let stayPercentSum = 0
        let graphListId = 0

        // カテゴリ用データ保持変数を初期化
        if (this.pPresence) {
          _.forEach(PRESENCE.STATUS, (value, key) => {
            categoryData[value] = {name: key, value: 0}
          })
        }
        else {
          categoryData[0] = {name: 'categoryOther', value: 0}
          this.categories.forEach((category) => {
            let categoryName = MasterHelper.getDispCategoryName(category)
            if (category.categoryType == CATEGORY.ZONE) categoryData[category.categoryId] = {name: categoryName, value: 0}
          })

          // エリア用データ保持変数を初期化
          areaData[0] = {name: 'areaOther', value: 0}
          this.areaArray.forEach((area) => {
            areaData[area.areaId] = {name: area.areaName, value: 0}
          })
        }

        // 各時間の集計
        let graphList = data.stayList.map((stay, index) => {
          let isExistStayData = false
          let time = ''
          let findCategory
          let findArea
          let areaIndex = 0
          if (this.pPresence && stay.byId == -1) { // プレゼンスの場合、-1はUnknown扱い
            stay.byId = PRESENCE.STATUS.PresenceUnknown
            stay.byName = 'PresenceUnknown'
          }
          const isAbsentZone = this.pPresence? ArrayUtil.equalsAny(stay.byId, [PRESENCE.STATUS.Offline, PRESENCE.STATUS.PresenceUnknown]): this.isAbsentZoneData(stay.byId)
          if (this.isLostData(stay.byId) || isAbsentZone) {
            lostTime += stay.period
            time = moment().startOf('days').add(stay.period, 's').format('HH:mm')
          } else {
            stayTime += stay.period
            time = moment().startOf('days').add(stay.period, 's').format('HH:mm')
            isExistStayData = true
          }
          // カテゴリ毎の滞在時間を加算
          if (this.pPresence) { // プレゼンスの場合、プレゼンス情報をカテゴリとして設定する。
            if (!categoryData[stay.byId]) {
              categoryData[stay.byId] = {name:stay.byName, value:stay.byId}
            }
            categoryData[stay.byId].value += stay.period
          }
          else {
            findCategory = _.find(this.categories, (category) => {
              return category.categoryType == CATEGORY.ZONE && category.categoryId == stay.byId
            })
            if (findCategory) {
              categoryData[findCategory.categoryId].value += stay.period
            } else if (stay.byId == 0) {
              categoryData[0].value += stay.period
            }

            // エリア毎の滞在時間を加算
            let zone = findCategory? _.find(this.zones, (zone) => { return zone.categoryId == findCategory.categoryId}): null
            findArea = _.find(this.areaArray, (area, index) => {
              if (zone) {
                if (area.areaId == zone.areaId) {
                  areaIndex = index
                  return true
                }
              } else {
                if (area.areaId == stay.areaId) {
                  areaIndex = index
                  return true
                }
              }
              return false
            })
            if (findArea) {
              areaData[findArea.areaId].value += stay.period
            } else {
              if (isExistStayData) areaData[0].value += stay.period
            }
          }
          //グラフ表示欠け対応のため、小数点1桁まで固定
          const parcentDigit = 10
          let percent = Math.round((stay.period / fromToSettingDiff) * 100 * parcentDigit) / parcentDigit
          if (APP.STAY_SUM.GRAPH_LIMIT > percent) {
            percent = 0
          }
          stayPercentSum += percent

          return {
            index: graphListId++,
            isStay: isExistStayData,
            isAbsentZone,
            period: stay.period,
            start: stay.start,
            startTime: percent == 100? moment().startOf('days').add(fromSecond, 's').format('HH:mm'): moment(stay.start).format('HH:mm'),
            end: stay.end,
            endTime: percent == 100? moment().startOf('days').add(toSecond, 's').format('HH:mm'): moment(stay.end).format('HH:mm'),
            time,
            percent,
            categoryName: this.pPresence? this.$i18n.tnl('label.' + stay.byName): findCategory? this.getDispCategoryName(findCategory): this.$i18n.tnl('label.other'),
            categoryBgColor: this.pPresence? DISP.PRESENCE.BG[stay.byId - 1]: findCategory? ColorUtil.colorCd4display(findCategory.bgColor): ColorUtil.colorCd4display(this.otherColor),
            areaBgColor: findArea? ColorUtil.getStackColor(areaIndex): this.otherColor,
            areaName: findArea? findArea.areaName: this.$i18n.tnl('label.other'),
            zoneCategory: stay.byName,
          }

        }).filter(data => { return data.percent != 0})

        const pot = this.pots.find((val) => val.potId == data.potId)
        const result = {
          date: date,
          name: data.potName, 
          groupName: Util.v(pot, 'group.groupName', ''),
          categoryName: Util.v(pot, 'category.categoryName', ''),
          graph: graphList,
          stayTime: moment().startOf('days').add(stayTime, 's').format('HH:mm') + ' (' + StayTimeHelper.getRatio(stayTime) + '%)', 
          lostTime: moment().startOf('days').add(lostTime, 's').format('HH:mm') + ' (' + StayTimeHelper.getRatio(lostTime) + '%)', 
          baseTimeFrom: this.getDateStrFromSetting(APP.SVC.STAY_SUM.START),
          baseTimeTo: this.getDateStrFromSetting(APP.SVC.STAY_SUM.END),
          graphTimeRatio: graphTimeRatio,
        }

        categoryData.forEach((cData) => {
          result[cData.name] = moment().startOf('days').add(cData.value, 's').format('HH:mm') + ' (' + StayTimeHelper.getRatio(cData.value) + '%)'
        })
        areaData.forEach((aData) => {
          result[aData.name] = moment().startOf('days').add(aData.value, 's').format('HH:mm') + ' (' + StayTimeHelper.getRatio(aData.value) + '%)'
        })

        // グラフのズレ対応。100%と実際のpercentとの差分を全体に分配する
        const perDiff = 100 - stayPercentSum
        var graphTemp = result.graph.slice()
        graphTemp.sort((a, b) => {
          if (a.percent < b.percent) {
            return 1
          } else {
            return -1
          }
        })
        const baseCount = 10 //配分するグラフデータ数制限
        if (result.graph.length > baseCount) {
          const diffs = perDiff / baseCount
          graphTemp.slice(0, baseCount).forEach((val, num) => {
            const addGraph = _.find(result.graph, (graphVal) => {
              return val.index == graphVal.index
            })
            if (addGraph) {
              addGraph.percent = addGraph.percent + diffs
            }
          })
        } else {
          const diffs = perDiff / result.graph.length
          result.graph.forEach((val) => {
            val.percent = val.percent + diffs
          })
        }
        return result
      })
    },
    getDateStrFromSetting(timeNum) {
      return DateUtil.convertToTime((Math.floor(timeNum / 100) * 60 + timeNum % 100) * 60).slice(0, -3)
    },
    getTimeRatioData() {
      // 開始から終了までの配列を作る
      const fromHour = Math.floor(APP.SVC.STAY_SUM.START / 100) // 分は切る
      const toHour = Math.floor(APP.SVC.STAY_SUM.END / 100)
      const toHourMinute = toHour * 60 + APP.SVC.STAY_SUM.END % 100
      const total = toHourMinute - fromHour * 60
      let times = []
      let timesMinute = []
      for (let i = fromHour; i <= toHour; i++) {
        times.push(i)
        timesMinute.push(i * 60)
      }
      toHourMinute > 0? timesMinute.push(toHourMinute): null

      // トータル時間から導き出す
      let result = []
      for (let i = 0; i < timesMinute.length - 1; i++){
        var ratio = (timesMinute[i+1] - timesMinute[i])/total
        result.push({time: times[i], ratio: Math.floor(ratio * 10000)/100})
      }
      return result
    },
    async downloadDay(key){
      this.replace({showAlert: false})
      this.updateColumn()
      let viewList
      if (!this.form.date || this.form.date.length == 0) {
        this.message = this.$i18n.tnl('message.pleaseEnterSearchCriteria')
        this.replace({showAlert: true})
        this.hideProgress()
        return
      }

      const dataList = await HttpHelper.getAppService(this.getApiUrl(this.form))
      if (_.isEmpty(dataList)) {
        this.message = this.$i18n.t('message.listEmpty')
        this.replace({showAlert: true})
        this.hideProgress()
        return
      }
      viewList = this.getStayDataList(moment(this.form.date).format('YYYY-MM-DD'), dataList, APP.STAY_SUM.ABSENT_LIMIT, APP.STAY_SUM.LOST_LIMIT)

      ArrayUtil.sortIgnoreCase(viewList, 'name')
      const csvList = this.getCsvList(key, viewList)

      const searchDate = moment(this.form.date).format('YYYY-MM-DD')
      const group = this.form.groupId? this.groupIdMap[this.form.groupId]: null
      const groupName =  group? '_' + group.groupName: ''
      const category = this.form.categoryId? this.categoryIdMap[this.form.categoryId]: null
      const categoryName =  !category? '': category.systemUse == 1? category.categoryName.toLowerCase(): '_' + category.categoryName

      const convertedCsvData = this.convertCsvData(key, csvList)
      BrowserUtil.fileDL(
        searchDate + groupName + categoryName + (this.pPresence? '_presence_': '_stayRatio_') + key + '.csv',
        convertedCsvData,
        getCharSet(this.$store.state.loginId)
      )
    },
    getApiUrl(param) {
      const targetDate = moment(param.date).format('YYYYMMDD')
      const groupBy = param.groupId? '&groupId=' + param.groupId: ''
      const categoryBy = param.categoryId? '&categoryId=' + param.categoryId: ''
      if (this.pPresence) { // プレゼンスの場合
        return '/office/presence/sumByDay/' + targetDate + '?from=' + APP.SVC.STAY_SUM.START + '&to=' + APP.SVC.STAY_SUM.END + groupBy + categoryBy
      }
      const potBy = param.filterId? '&filterKind=' + param.filterKind + '&filterId=' + param.filterId : ''
      return '/office/stayTime/sumByDay/' + targetDate + '/zoneCategory?from=' + APP.SVC.STAY_SUM.START + '&to=' + APP.SVC.STAY_SUM.END + groupBy + categoryBy + potBy
    },
    getCsvSumList(viewList) {
      const keys = []

      // フィールド設定に合わせ、出力するデータのキーリストを生成する
      _.filter(this.fields, (field) => {
        return _.some(Object.keys(viewList[0]), (key) => { 
          return key!= 'graph' && key === field.key 
          && (key != 'categoryName' || !this.pPresence) // プレゼンスではカテゴリを出力しない。
        })
      }).forEach((field) => { keys.push(field) })

      if (this.pPresence) {
        _.forEach(PRESENCE.STATUS, (value, key) => {
          keys.push({key, label: this.$i18n.tnl('label.' + key), bgColor: '#' + DISP.PRESENCE.BG[value - 1]})
        })
      }

      // キーの一致するデータのみのリストを作成。その際、％データがある場合は分ける
      return viewList.map((viewData) => {
        let objectData = {}
        const ratio = this.$i18n.tnl('label.bracketStayRate')
        keys.forEach((data) => {
          const hasRatio = viewData[data.key] && viewData[data.key].search('%') > 0
          if (hasRatio) {
            let splitData = viewData[data.key].split(' ')
            objectData[data.label] = splitData[0]
            objectData[data.label + ratio] = splitData[1].slice(1,-1)
          } else {
            objectData[data.label] = viewData[data.key]
          }
        })
        return objectData
      })
    },
    getCsvDetailList(detailList) {
      // キーの一致するデータのみのリストを作成。その際、％データがある場合は分ける
      const result = detailList.map((viewData) => {
        return viewData.graph.map((graph) => {
          const add = this.pPresence?
            {state: this.$i18n.tnl('label.' + graph.zoneCategory)}:
            {
              state: graph.isStay? this.$i18n.tnl('label.detected'): this.$i18n.tnl('label.undetect'),
              areaName: graph.areaName,
              zoneCategory: graph.zoneCategory,
            }
          return {
            date: viewData.date,
            name: viewData.name,
            groupName: viewData.groupName,
            categoryName: viewData.categoryName,
            start: graph.startTime,
            end: graph.endTime,
            stayTime: graph.period,
            ...add
          }
        })
      })
      return result.flatMap((data) => data)
    },
    getCsvDetailHeaderList() {
      const common = [
        this.$i18n.tnl('label.date'),
        this.$i18n.tnl('label.name'),
        this.$i18n.tnl('label.groupName'),
        this.$i18n.tnl('label.categoryName'),
        this.$i18n.tnl('label.start'),
        this.$i18n.tnl('label.end'),
        this.$i18n.tnl('label.stayTime'),
      ]
      if (this.pPresence) {
        return [...common, this.$i18n.tnl('label.state') + '\n']
      }
      else {
        return [...common, 
          this.$i18n.tnl('label.state'),
          this.$i18n.tnl('label.areaName'),
          this.$i18n.tnl('label.zoneCategory') + '\n'
        ]
      }
    },
    updateColumnName(){
      if(Util.hasValue(this.fields)){
        this.fields.forEach(field => {
          field.label = BrowserUtil.isResponsiveMode(true)? field.originLabel.replace(/<br>/g, ''): field.originLabel
        })
      }
    },
    async downloadMonth(key){
      this.replace({showAlert: false})
      this.showProgress()
      try {
        if (!this.form.date || this.form.date.length == 0) {
          this.message = this.$i18n.tnl('message.pleaseEnterSearchCriteria')
          this.replace({showAlert: true})
          this.hideProgress()
          return
        }

        this.form.date = moment(this.form.date).format('YYYYMMDD')
        const diff = moment().startOf('months').diff(moment(this.form.date).startOf('months'), 'months')
        let startDate, endDate

        // 取得する日付開始、終了日を設定する
        if (diff == 0) {
          endDate = moment().subtract(1, 'd')
        } else if (diff >= 0) {
          endDate = moment(this.form.date).endOf('months')
        } else {
          // 未来月の場合はエラーとする
          this.message = this.$i18n.terror('message.invalid', {target: this.$i18n.tnl('label.date')})
          this.replace({showAlert: true})
          this.hideProgress()
          return
        }
        startDate = moment(this.form.date).startOf('months')

        let csvList = []
        const groupBy = this.form.groupId? '&groupId=' + this.form.groupId: ''
        const categoryBy = this.form.categoryId? '&categoryId=' + this.form.categoryId: ''
        while (startDate.diff(endDate) <= 0) {
          const searchDate = startDate.format('YYYYMMDD')
          const url = '/office/stayTime/sumByDay/' + searchDate + '/zoneCategory?from=' + APP.SVC.STAY_SUM.START + '&to=' + APP.SVC.STAY_SUM.END + groupBy + categoryBy
          const sumData = await HttpHelper.getAppService(url)
          if (_.isEmpty(sumData)) {
            Util.debug('searchDate: ' + searchDate)
            this.message = this.$i18n.t('message.listEmpty')
            this.replace({showAlert: true})
            this.hideProgress()
            return
          }

          let list = this.getStayDataList(moment(searchDate).format('YYYY-MM-DD'), sumData, APP.STAY_SUM.ABSENT_LIMIT, APP.STAY_SUM.LOST_LIMIT)
          ArrayUtil.sortIgnoreCase(list, 'name')
          const dateList = this.getCsvList(key, list)
          csvList = csvList.isEmpty? dateList: csvList.concat(dateList)
          startDate.add(1, 'days')
        }

        const group = this.form.groupId? this.groupIdMap[this.form.groupId]: null
        const groupName =  group? '_' + group.groupName: ''
        const category = this.form.categoryId? this.categoryIdMap[this.form.categoryId]: null
        const categoryName =  !category? '': category.systemUse == 1? category.categoryName.toLowerCase(): '_' + category.categoryName

        const convertedCsvData = this.convertCsvData(key, csvList)
        BrowserUtil.fileDL(
          moment(this.form.date).format('YYYY-MM') + groupName + categoryName + '_stayRatio.csv',
          convertedCsvData,
          getCharSet(this.$store.state.loginId)
        )
      }
      catch(e) {
        console.error(e)
      }
      finally {
        this.hideProgress()
      }
    },
    pickerChanged() {
      if (!Util.hasValue(this.form.date) || DateUtil.isAfterNextMonth(this.form.date)) {
        this.message = this.$i18n.terror('message.invalid', {target: this.$i18n.tnl('label.date')})
        this.replace({showAlert: true})
      } else {
        this.replace({showAlert: false})
      }
    },
    getCsvList(key, list) {
      switch(key) {
      case 'sum':
        return this.getCsvSumList(list)
      case 'detail':
        return this.getCsvDetailList(list)
      default:
        // 何もしない
      }
    },
    convertCsvData(key, list) {
      switch(key) {
      case 'sum':
        return CsvUtil.converToCsv(list)
      case 'detail':
        return CsvUtil.converToCsv(list, null, this.getCsvDetailHeaderList())
      default:
        // 何もしない
      }
    },
    setGraphTimeDisplay() {
      const timeDisplay = document.getElementsByClassName('timeDisplay')
      _.forEach(timeDisplay, (td) => {
        if (td.offsetWidth <= 100) {
          td.style.visibility = 'hidden'
        } else {
          td.style.visibility = ''
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/input.scss";
.tableHeader {
  word-break:break-all;
}

.bgSquare {
  display: inline-block;
  _display: inline;
  width: 15px;
  height: 15px;
}
.stay-bar {
  position: relative;
  display: inline-block;
  cursor: default;
  box-sizing:border-box;
}
.lost-bar {
  position: relative;
  display: inline-block;
  background: #ccc;
  cursor: default;
  box-sizing:border-box;
}
.graph-arrow-box {
  display: none;
  position: absolute;
  top: 100%;
  padding: 8px;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;  
  border-radius: 5px;
  background: #333;
  color: #fff;
  white-space: nowrap;
  z-index: 5;
}
.stay-bar:hover .graph-arrow-box, .lost-bar:hover .graph-arrow-box {
  display: block;
}
.time-area {
  overflow: visible;
  white-space: nowrap;
  position: relative;
  display: inline-block;
  box-sizing:border-box;
}
.itemTitle {
  font-weight: bold;
  font-size: 14px;
}
</style>
