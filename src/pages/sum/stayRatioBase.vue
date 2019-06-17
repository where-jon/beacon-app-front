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
        <b-form-checkbox-group id="checkbox-group-2" v-model="displayCheckList.group" name="flavour-2">
          <b-form-checkbox :value="'groupName'">
            {{ $t('label.groupName') }}
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
              {{ category.systemUse? $t('label.' + category.systemCategoryName): category.categoryName }} <span class="bgSquare" :style="`background-color: #${category.bgColor};`" />
            </b-form-checkbox><br>
          </div>
          <b-form-checkbox :value="0">
            {{ $t('label.other') }} <span class="bgSquare" :style="`background-color: ${otherColor};`" />
          </b-form-checkbox><br>
        </b-form-checkbox-group>
        <b-form-checkbox-group v-if="!isCategorySelected" id="checkbox-group-2" v-model="displayCheckList.area" name="flavour-2">
          <div v-for="(area, index) in areas" :key="`area-${index}`">
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
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <alert :message="message" />

      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row class="mr-3">
            <label v-t="'label.date'" class="mr-2 mb-2 d-flex align-items-center" />
            <date-picker v-model="form.date" type="date" value-format="yyyyMMdd" class="mr-2 mb-2 inputdatefrom" @change="pickerChanged" />
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
              </v-select>
            </span>
          </b-form-row>
        </b-form-group>
        <b-form-group>
          <b-form-row v-if="isCategoryEnabled" class="mb-3 mr-2">
            <label v-t="'label.category'" class="mr-2" />
            <span :title="vueSelectTitle(vueSelected.category)">
              <v-select v-model="vueSelected.category" :options="getCategoryOptions(categoryTypes)" class="inputSelect vue-options">
                <template slot="selected-option" slot-scope="option">
                  {{ vueSelectCutOn(option) }}
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
            <b-dropdown v-if="!isIosOrAndroid" :variant="theme" :text="$t('label.download')" class="ml-2">
              <b-dropdown-item @click="downloadDay('sum')">
                {{ $t('label.sum') + $t('label.download') }}
              </b-dropdown-item>
              <b-dropdown-item @click="downloadMonth('sum')">
                {{ $t('label.sum') + $t('label.downloadMonth') }}
              </b-dropdown-item>
              <b-dropdown-item @click="downloadDay('detail')">
                {{ $t('label.detail') + $t('label.download') }}
              </b-dropdown-item>
              <b-dropdown-item @click="downloadMonth('detail')">
                {{ $t('label.detail') + $t('label.downloadMonth') }}
              </b-dropdown-item>
            </b-dropdown>
            <b-button v-if="!isIosOrAndroid" v-t="'label.displaySpecified'" :variant="theme" class="ml-2" @click="showModal=true" />
          </b-form-row>
        </b-form-group>
      </b-form>
      <slot />
      <b-row class="mt-3" />
      <b-table :items="viewList" :fields="fields" :current-page="currentPage" :per-page="perPage" :sort-by.sync="sortBy" stacked="md" striped hover outlined>
        <template slot="graph" slot-scope="row">
          <div style="position: relative;">
            <div v-for="(bar, index) in row.item.graph" :key="index" :class="bar.isStay || bar.isAbsentZone? 'stay-bar': 'lost-bar'" :style="`${bar.isStay || bar.isAbsentZone? `background: `+ (historyType == 'category'? bar.categoryBgColor: bar.areaBgColor)+`;`: `` } width:${bar.percent}% !important;`">
              <span class="graph-arrow-box">
                {{ $i18n.tnl(bar.isStay || bar.isAbsentZone? 'label.stay': 'label.lost') }}: {{ bar.time }} <br>
                {{ bar.startTime }} ～ {{ bar.endTime }}
              </span>&nbsp;
            </div>
            <br>
            <div style="width: 100%">
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
        <b-col md="6" class="my-1">
          <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" class="my-0" />
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import { getTheme } from '../../sub/helper/ThemeHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as ViewHelper from '../../sub/helper/ViewHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import alert from '../../components/parts/alert.vue'
import { getCharSet } from '../../sub/helper/CharSetHelper'
import { APP, DISP } from '../../sub/constant/config'
import moment from 'moment'
import commonmixinVue from '../../components/mixin/commonmixin.vue'
import controlmixinVue from '../../components/mixin/controlmixin.vue'
import * as HttpHelper from '../../sub/helper/HttpHelper'
import { SYSTEM_ZONE_CATEGORY_NAME } from '../../sub/constant/Constants'
import { CATEGORY } from '../../sub/constant/Constants'

export default {
  components: {
    breadcrumb,
    alert,
    DatePicker,
  },
  mixins: [commonmixinVue, controlmixinVue],
  data () {
    return {
      form: {
        date: '',
      },
      vueSelected: {
        group: null,
        category: null,
      },
      displayCheckList: {
        stay: ['stay', 'lost'],
        category: [],
        area: [],
        group: [],
      },
      name: '',
      viewList: [],
      items: ViewHelper.createBreadCrumbItems('sumTitle', 'stayRatioBase'),
      message: '',
      modalMessage: '',
      currentPage: 1,
      perPage: 20,
      sortBy: 'name',
      totalRows: 0,
      categoryDisplayList: [],
      fields: this.getFields(true),
      historyType: 'category',
      isCategorySelected: true,
      checkboxLimit: 6,
      showModal: false,
    }
  },
  computed: {
    theme () {
      return 'outline-' + getTheme()
    },
    ...mapState('app_service', [
      'groups',
      'pots',
      'categories',
      'zones',
      'areas',
    ]),
    isIosOrAndroid() {
      return Util.isAndroidOrIOS()
    },
    isCategoryEnabled () {
      return this.isEnabledMenu('category') && Util.includesIgnoreCase(APP.POT.WITH, 'category')
    },
    isGroupEnabled () {
      return this.isEnabledMenu('group') && Util.includesIgnoreCase(APP.POT.WITH, 'group')
    },
    categoryTypes () {
      return CATEGORY.POT_AVAILABLE
    },
    modalErrorMessage() {
      return this.modalMessage
    },
    otherColor() {
      return APP.STAY_SUM.OTHER_COLOR
    },
  },
  watch: {
    'vueSelected.group': {
      handler: function(newVal, oldVal){
        this.form.groupId = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
    'vueSelected.category': {
      handler: function(newVal, oldVal){
        this.form.categoryId = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
  },
  async created() {
    await StateHelper.load('groups')
    await StateHelper.load('pots')
    await StateHelper.load('categories')
    await StateHelper.load('areas')
    this.form.date = moment().add(-1, 'days').format('YYYYMMDD')
  },
  async mounted() {
    HtmlUtil.importElementUI()
    window.addEventListener('resize', () => {
      this.updateColumnName()
      this.$forceUpdate()
    })
    this.updateColumnName()
    await StateHelper.load('category')
    if (this.categories.length < 1) {
      return
    }

    this.categoryDisplayList = this.categories.filter((c) => c.categoryType === CATEGORY.ZONE)
      .sort((a, b) => a.categoryId < b.categoryId ? -1 : 1)
  },
  methods: {
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
      let count = 0
      _.forEach(this.displayCheckList, (list) => { count += list.length })
      return count > this.checkboxLimit
    },
    getFields(isInit) {
      const disableClassName = 'd-none'
      const groupClassName = isInit || !this.isDisplayGroupColumn('groupName')? disableClassName: ''
      let fields = [
        {key: 'date', sortable: false, label: this.$i18n.tnl('label.date'), thClass: disableClassName, tdClass: disableClassName},
        {key: 'name', sortable: true, label: this.$i18n.tnl('label.potName')},
        {key: 'groupName', sortable: true, label: this.$i18n.tnl('label.groupName'), thClass: groupClassName, tdClass: groupClassName},
        {key: 'graph', sortable: false, label: this.$i18n.tnl('label.graph'), thStyle: {height: '50px !important', width:'400px !important'} },
      ]

      // カテゴリを追加する
      let selectedCategories = _.filter(this.categories, (category) => {
        return _.some(this.displayCheckList.category, (id) => { return id == category.categoryId })
      })

      const i18n = this.$i18n
      _.filter(this.categories,(c) => { return c.categoryType === CATEGORY.ZONE })
        .forEach((category) => {
          const categoryClassName = _.some(selectedCategories, (data) => { return data.categoryId == category.categoryId})? '': disableClassName
          let colorStyle = '<span style="color: #' + category.bgColor + ';">■</span>' // TODO: リファクタリング対象。出来る人がいたらHeaderへ移動する
          let categoryName = (category.systemUse? i18n.tnl('label.' + category.systemCategoryName): category.categoryName)
          fields.push({key: categoryName, sortable: true, label: categoryName + colorStyle
            , thStyle: {width:'100px !important'}, thClass: categoryClassName, tdClass: categoryClassName})
        })
      
      // カテゴリその他を追加する
      let isSelectedCategoryOther = false
      if (this.displayCheckList) {
        isSelectedCategoryOther = _.find(this.displayCheckList.category, (id) => { return id == 0 }) == 0
      }
      let colorOtherStyle = '<span style="color: ' + this.OtherColor + ';">■</span>' // TODO: リファクタリング対象。出来る人がいたらHeaderへ移動する
      const categoryOtherClassName = isSelectedCategoryOther? '': disableClassName
      fields.push({key: 'categoryOther', sortable: true, label: i18n.tnl('label.other')+i18n.tnl('label.category') + colorOtherStyle
        , thStyle: {width:'100px !important'}, thClass: categoryOtherClassName, tdClass: categoryOtherClassName})

      // エリアを追加する
      let selectedAreas = _.filter(this.areas, (area) => {
        return _.find(this.displayCheckList.area, (id) => { return id == area.areaId })
      })
      
      _.filter(this.areas, (a) => { return true })
        .forEach((area, index) => {
          const areaClassName = _.some(selectedAreas, (data, index) => { return data.areaId == area.areaId})? '': disableClassName
          let colorStyle = '<span style="color: ' + DISP.SUM_STACK_COLOR[index] + ';">■</span>' // TODO: リファクタリング対象。出来る人がいたらHeaderへ移動する
          fields.push({key: area.areaName, sortable: true, label: area.areaName + colorStyle, thStyle: {width:'100px !important'}
            , thClass: areaClassName, tdClass: areaClassName})
        })

      // エリアその他が選択されている場合は追加
      let isSelectedAreaOther = false
      if (this.displayCheckList) {
        isSelectedAreaOther = _.find(this.displayCheckList.area, (id) => { return id == 0 }) == 0
      }
      colorOtherStyle = '<span style="color: ' + this.otherColor + ';">■</span>' // TODO: リファクタリング対象。出来る人がいたらHeaderへ移動する
      const areaOtherClassName = isSelectedAreaOther? '': disableClassName
      fields.push({key: 'areaOther', sortable: true, label: i18n.tnl('label.other')+i18n.tnl('label.area') + colorOtherStyle
        , thStyle: {width:'100px !important'}, thClass: areaOtherClassName, tdClass: areaOtherClassName})

      // 選択されている総合時間を追加する
      const stayClassName = isInit || this.isDisplayStayColumn('stay')? '': disableClassName
      const lostClassName = isInit || this.isDisplayStayColumn('lost')? '': disableClassName
      fields.push({key: 'stayTime', sortable: true, label: this.$i18n.tnl('label.stayTime'), thStyle: {width:'100px !important'}
        , thClass: stayClassName, tdClass: stayClassName})
      fields.push({key: 'lostTime', sortable: true, label: this.$i18n.tnl('label.lostTime'), thStyle: {width:'100px !important'}
        , thClass: lostClassName, tdClass: lostClassName})

      return fields.map(val => ({ ...val, originLabel: val.label}))
    },
    isDisplayStayColumn(key) {
      if (!this.displayCheckList || !this.displayCheckList.stay) {
        return false
      }
      return _.some(this.displayCheckList.stay, (stay) => { return stay === key })
    },
    isDisplayGroupColumn(key) {
      if (!this.displayCheckList || !this.displayCheckList.group) {
        return false
      }
      return _.some(this.displayCheckList.group, (group) => { return group === key })
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
      await StateHelper.load('zones')
      await StateHelper.load('pots')
      await StateHelper.load('groups')
      
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

      this.viewList = this.getStayDataList(moment(this.form.date).format('YYYY-MM-DD'), sumData, APP.SUM_ABSENT_LIMIT, APP.SUM_LOST_LIMIT)

      this.totalRows = this.viewList.length
      this.hideProgress()
    },
    isAbsentZoneData(categoryId) {
      let category = !this.isLostData(categoryId)? this.categories.find((e) => e.categoryId == categoryId): null
      return category? category.categoryName == SYSTEM_ZONE_CATEGORY_NAME.ABSENT: false
    },
    isLostData(byId) {
      return byId == -1
    },
    getStayDataList(date, stayData, absentLimit = 0, lostLimit = APP.LOST_TIME) {
      const fromSeconds = (Math.floor(APP.STAY_SUM.FROM / 100) * 60 + APP.STAY_SUM.FROM % 100) * 60
      const toSeconds = (Math.floor(APP.STAY_SUM.TO / 100) * 60 + APP.STAY_SUM.TO % 100) * 60
      const graphTimeRatio = this.getTimeRatioData()
      const fromToSettingDiff = toSeconds - fromSeconds

      return stayData.map((data) => {
        let stayTime = 0, lostTime = 0
        let categoryData = []
        let areaData = []

        // カテゴリ用データ保持変数を初期化
        categoryData[0] = {name: 'categoryOther', value: 0}
        this.categories.forEach((category) => {
          let categoryName = (category.systemUse? this.$i18n.tnl('label.' + category.systemCategoryName): category.categoryName)
          if (category.categoryType == CATEGORY.ZONE) categoryData[category.categoryId] = {name: categoryName, value: 0}
        })

        // エリア用データ保持変数を初期化
        areaData[0] = {name: 'areaOther', value: 0}
        this.areas.forEach((area) => {
          areaData[area.areaId] = {name: area.areaName, value: 0}
        })

        // 各時間の集計
        let graphList = data.stayList.map((stay, index) => {
          let isExistStayData = false
          let time = ''
          let findCategory
          let findArea
          let areaIndex = 0
          const isAbsentZone = this.isAbsentZoneData(stay.byId)
          if (this.isLostData(stay.byId) || isAbsentZone) {
            lostTime += stay.period
            time = Util.convertToTime(stay.period)
          } else {
            stayTime += stay.period
            time = Util.convertToTime(stay.period)
            isExistStayData = true
          }
          // カテゴリ毎の滞在時間を加算
          findCategory = _.find(this.categories, (category) => {
            return category.categoryType == CATEGORY.ZONE && category.categoryId == stay.byId
          })
          if (findCategory) {
            categoryData[findCategory.categoryId].value += stay.period
          } else if (stay.byId == 0) {
            categoryData[0].value += stay.period
          }

          // エリア毎の滞在時間を加算（一致するカテゴリが存在する場合しかエリアを引けない）
          if (findCategory) {
            let zone = _.find(this.zones, (zone) => { return zone.categoryId == findCategory.categoryId})
            findArea = _.find(this.areas, (area, index) => {
              if (zone) {
                if (area.areaId == zone.areaId) {
                  areaIndex = index
                  return true
                }
              }
              return false
            })
            if (findArea) {
              areaData[findArea.areaId].value += stay.period
            } else {
              areaData[0].value += stay.period
            }
          } else {
            // カテゴリ一致しない＆その他の場合
            stay.byId == 0? areaData[0].value += stay.period: null
          }

          const percent = Math.floor((stay.period / fromToSettingDiff) * 100 * APP.STAY_SUM.PARSENT_DIGIT) / APP.STAY_SUM.PARSENT_DIGIT
          return {
            isStay: isExistStayData,
            isAbsentZone: isAbsentZone,
            period: stay.period,
            start: stay.start,
            startTime: percent == 100? Util.convertToTime(fromSeconds): moment(stay.start).format('HH:mm:ss'),
            end: stay.end,
            endTime: percent == 100? Util.convertToTime(toSeconds): moment(stay.end).format('HH:mm:ss'),
            time: time,
            percent: percent,
            categoryBgColor: findCategory? Util.colorCd4display(findCategory.bgColor): Util.colorCd4display(this.otherColor),
            areaBgColor: findArea? this.getStackColor(areaIndex): this.otherColor,
            areaName: findArea? findArea.areaName: '',
            zoneCategory: stay.byName,
          }

        })

        const pot = this.pots.find((val) => val.potId == data.potId)
        const result = {
          date: date,
          name: data.potName, 
          groupName: pot? pot.groupName: '',
          categoryName: pot? pot.categoryName: '',
          graph: graphList,
          stayTime: Util.convertToTime(stayTime) + ' (' + Util.getRatio(stayTime) + '%)', 
          lostTime: Util.convertToTime(lostTime) + ' (' + Util.getRatio(lostTime) + '%)', 
          baseTimeFrom: this.getDateStrFromSetting(APP.STAY_SUM.FROM),
          baseTimeTo: this.getDateStrFromSetting(APP.STAY_SUM.TO),
          graphTimeRatio: graphTimeRatio,
        }

        categoryData.forEach((cData) => {
          result[cData.name] = Util.convertToTime(cData.value) + ' (' + Util.getRatio(cData.value) + '%)'
        })
        areaData.forEach((aData) => {
          result[aData.name] = Util.convertToTime(aData.value) + ' (' + Util.getRatio(aData.value) + '%)'
        })

        return result
      })
    },
    getDateStrFromSetting(timeNum) {
      return Util.convertToTime((Math.floor(timeNum / 100) * 60 + timeNum % 100) * 60).slice(0, -3)
    },
    getTimeRatioData() {
      // 開始から終了までの配列を作る
      const fromHour = Math.floor(APP.STAY_SUM.FROM / 100) // 分は切る
      const toHour = Math.floor(APP.STAY_SUM.TO / 100)
      const toHourMinute = toHour * 60 + APP.STAY_SUM.TO % 100
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
      viewList = this.getStayDataList(moment(this.form.date).format('YYYY-MM-DD'), dataList, APP.SUM_ABSENT_LIMIT, APP.SUM_LOST_LIMIT)

      Util.sortIgnoreCase(viewList, 'name')
      const csvList = (key == 'sum')? this.getCsvSumList(viewList): this.getCsvDetailList(viewList)

      const searchDate = moment(this.form.date).format('YYYY-MM-DD')
      const group = this.form.groupId? this.groups.find((val) => val.groupId == this.form.groupId): null
      const groupName =  group? '_' + group.groupName: ''
      const category = this.form.categoryId? this.categories.find((val) => val.categoryId == this.form.categoryId): null
      const categoryName =  !category? '': category.systemUse == 1? category.systemCategoryName: '_' + category.categoryName

      HtmlUtil.fileDL(
        searchDate + groupName + categoryName + '_stayRatio.csv',
        key == 'sum'? Util.converToCsv(csvList) :Util.converToCsv(csvList, null, this.getCsvDetailHeaderList()),
        getCharSet(this.$store.state.loginId)
      )
    },
    getApiUrl(param) {
      const targetDate = moment(param.date).format('YYYYMMDD')
      const groupBy = param.groupId? '&groupId=' + param.groupId: ''
      const categoryBy = param.categoryId? '&categoryId=' + param.categoryId: ''
      return '/office/stayTime/sumByDay/' + targetDate + '/zoneCategory?from=' + APP.STAY_SUM.FROM + '&to=' + APP.STAY_SUM.TO + groupBy + categoryBy
    },
    getCsvSumList(viewList) {
      const keys = []

      // フィールド設定に合わせ、出力するデータのキーリストを生成する
      _.filter(this.fields, (field) => {
        return _.some(Object.keys(viewList[0]), (key) => { 
          return key!= 'graph' && key === field.key
        })
      }).forEach((field) => { keys.push(field) })

      // キーの一致するデータのみのリストを作成。その際、％データがある場合は分ける
      return viewList.map((viewData) => {
        let objectData = {}
        const ratio = this.$i18n.tnl('label.bracketStayRate')
        keys.forEach((data) => {
          const keyName = data.label.replace(/<span.*?span>/g, '')
          const hasRatio = viewData[data.key] && viewData[data.key].search('%') > 0
          if (hasRatio) {
            let splitData = viewData[data.key].split(' ')
            objectData[keyName] = splitData[0]
            objectData[keyName + ratio] = splitData[1].slice(1,-1)
          } else {
            objectData[keyName] = viewData[data.key]
          }
        })
        return objectData
      })
    },
    getCsvDetailList(detailList) {
      // キーの一致するデータのみのリストを作成。その際、％データがある場合は分ける
      const result = detailList.map((viewData) => {
        return viewData.graph.map((graph) => {
          return {
            date: viewData.date,
            name: viewData.name,
            groupName: viewData.groupName,
            categoryName: viewData.categoryName,
            start: graph.startTime,
            end: graph.endTime,
            stayTime: graph.period,
            state: graph.isStay? this.$i18n.tnl('label.detected'): this.$i18n.tnl('label.undetect'),
            areaName: graph.areaName,
            zoneCategory: graph.zoneCategory,
          }
        })
      })
      return result.flatMap((data) => data)
    },
    getCsvDetailHeaderList() {
      return [
        this.$i18n.tnl('label.date'),
        this.$i18n.tnl('label.name'),
        this.$i18n.tnl('label.groupName'),
        this.$i18n.tnl('label.categoryName'),
        this.$i18n.tnl('label.start'),
        this.$i18n.tnl('label.end'),
        this.$i18n.tnl('label.stayTime'),
        this.$i18n.tnl('label.state'),
        this.$i18n.tnl('label.areaName'),
        this.$i18n.tnl('label.zoneCategory') + '\n'
      ]
    },
    updateColumnName(){
      if(Util.hasValue(this.fields)){
        this.fields.forEach(field => {
          field.label = Util.isResponsiveMode(true)? field.originLabel.replace(/<br>/g, ''): field.originLabel
          field.label = Util.isResponsiveMode(true)? field.originLabel.replace(/<span.*?span>/g, ''): field.originLabel
        })
      }
    },
    async downloadMonth(key){
      this.replace({showAlert: false})
      this.showProgress()

      await StateHelper.load('zones')
      await StateHelper.load('pots')
      await StateHelper.load('groups')

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
        const url = '/office/stayTime/sumByDay/' + searchDate + '/zoneCategory?from=' + APP.STAY_SUM.FROM + '&to=' + APP.STAY_SUM.TO + groupBy + categoryBy
        const sumData = await HttpHelper.getAppService(url)
        if (_.isEmpty(sumData)) {
          console.log('searchDate: ' + searchDate)
          this.message = this.$i18n.t('message.listEmpty')
          this.replace({showAlert: true})
          this.hideProgress()
          return
        }

        let list = this.getStayDataList(moment(searchDate).format('YYYY-MM-DD'), sumData, APP.SUM_ABSENT_LIMIT, APP.SUM_LOST_LIMIT)
        Util.sortIgnoreCase(list, 'name')
        const dateList = (key == 'sum')? this.getCsvSumList(list): this.getCsvDetailList(list)
        csvList = csvList.isEmpty? dateList: csvList.concat(dateList)
        startDate.add(1, 'days')
      }

      const group = this.form.groupId? this.groups.find((val) => val.groupId == this.form.groupId): null
      const groupName =  group? '_' + group.groupName: ''
      const category = this.form.categoryId? this.categories.find((val) => val.categoryId == this.form.categoryId): null
      const categoryName =  !category? '': category.systemUse == 1? category.systemCategoryName: '_' + category.categoryName

      HtmlUtil.fileDL(
        moment(this.form.date).format('YYYY-MM') + groupName + categoryName + '_stayRatio.csv',
        key == 'sum'? Util.converToCsv(csvList) :Util.converToCsv(csvList, null, this.getCsvDetailHeaderList()),
        getCharSet(this.$store.state.loginId)
      )

      this.hideProgress()
    },
    pickerChanged() {
      if (!Util.hasValue(this.form.date) || Util.isAfterNextMonth(this.form.date)) {
        this.message = this.$i18n.terror('message.invalid', {target: this.$i18n.tnl('label.date')})
        this.replace({showAlert: true})
      } else {
        this.replace({showAlert: false})
      }
    },
  }
}
</script>

<style scoped lang="scss">
.inputSelect {
  min-width: 160px;
}
.inputdatefrom {
  width: 210px;
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
