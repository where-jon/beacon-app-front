<template>
  <div>
    <b-modal
      id="stayRatioDisplayModal"
      size="lg"
      :title="$t('label.displaySpecified')"
      ok-only
      @ok="updateColumn"
    >
      {{ $t('message.selectDisplayColumn') }}
      <hr>
      {{ $t('label.list') }}
      <b-form-group>
        <b-form-checkbox-group id="checkbox-group-2" v-model="displayCheckList.stay" name="flavour-2">
          <b-form-checkbox :value="'stay'">
            {{ $t('label.stayTimeSumColumn') }}
          </b-form-checkbox><br>
          <b-form-checkbox :value="'lost'">
            {{ $t('label.lostTimeSumColumn') }}
          </b-form-checkbox><br>
        </b-form-checkbox-group>
        <b-form-checkbox-group id="checkbox-group-2" v-model="displayCheckList.category" name="flavour-2">
          {{ $t('label.category') }}
          <div v-for="(category, index) in categoryDisplayList" :key="`category-${index}`">
            <b-form-checkbox :value="category.categoryId" :disabled="enableCategorySelect">
              {{ category.systemUse? $t('label.' + category.systemCategoryName): category.categoryName }} <span class="bgSquare" :style="`background-color: #${category.bgColor};`" />
            </b-form-checkbox><br>
          </div>
          <b-form-checkbox :value="0" :disabled="enableCategorySelect">
            {{ $t('label.other') }} <span class="bgSquare" :style="`background-color: ${getRandomColor(0)};`" />
          </b-form-checkbox><br>
        </b-form-checkbox-group>
        <b-form-checkbox-group id="checkbox-group-2" v-model="displayCheckList.area" name="flavour-2">
          {{ $t('label.area') }}
          <div v-for="(area, index) in areas" :key="`area-${index}`">
            <b-form-checkbox :value="area.areaId" :disabled="!enableCategorySelect">
              {{ area.areaName }} <span class="bgSquare" :style="`background-color: ${getRandomColor(area.areaId)};`" />
            </b-form-checkbox><br>
            <div v-if="index == (areas.length - 1)">
              <b-form-checkbox :value="0" :disabled="!enableCategorySelect">
                {{ $t('label.other') }} <span class="bgSquare" :style="`background-color: ${getRandomColor(0)};`" />
              </b-form-checkbox><br>
            </div>
          </div>
        </b-form-checkbox-group>
        <hr>
        {{ $t('label.graph') }}
        <b-form-radio-group v-model="historyType">
          <b-form-radio :value="'category'" @change="setSelectedGraphCategory(false)">
            {{ $t('label.zoneCategory') }}
          </b-form-radio>
          <br>
          <b-form-radio :value="'area'" @change="setSelectedGraphCategory(true)">
            {{ $t('label.area') }}
          </b-form-radio>
        </b-form-radio-group>
      </b-form-group>
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
          <b-form-row v-if="enableGroup" class="mb-3 mr-5">
            <label v-t="'label.group'" class="mr-2" />
            <b-form-select v-model="form.groupId" :options="groupOptions" class="mr-2 inputSelect" />
          </b-form-row>
        </b-form-group>
        <b-form-group>
          <b-form-row v-if="enableCategory" class="mb-3 mr-5">
            <label v-t="'label.category'" class="mr-2" />
            <b-form-select v-model="form.categoryId" :options="categoryOptionList" class="mr-2 inputSelect" />
          </b-form-row>
        </b-form-group>
      </b-form>
      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row class="mb-3">
            <b-button v-t="'label.display'" type="submit" :variant="theme" @click="display" />
            <b-dropdown v-if="!iosOrAndroid" :variant="theme" :text="$t('label.download')" class="ml-2">
              <b-dropdown-item @click="sumDownload">
                {{ $t('label.sum') + $t('label.download') }}
              </b-dropdown-item>
              <b-dropdown-item @click="sumDownloadMonth">
                {{ $t('label.sum') + $t('label.downloadMonth') }}
              </b-dropdown-item>
              <b-dropdown-item @click="detailDownload">
                {{ $t('label.detail') + $t('label.download') }}
              </b-dropdown-item>
              <b-dropdown-item @click="detailDownloadMonth">
                {{ $t('label.detail') + $t('label.downloadMonth') }}
              </b-dropdown-item>
            </b-dropdown>
            <b-button v-if="!iosOrAndroid" v-t="'label.displaySpecified'" v-b-modal.stayRatioDisplayModal :variant="theme" class="ml-2" />
          </b-form-row>
        </b-form-group>
      </b-form>
      <slot />
      <b-row class="mt-3" />
      <b-table :items="viewList" :fields="fields" :current-page="currentPage" :per-page="perPage" :sort-by.sync="sortBy" stacked="md" striped hover outlined>
        <template slot="graph" slot-scope="row">
          <div style="position: relative;">
            <div v-for="(bar, index) in row.item.graph" :key="index" :class="bar.isStay? 'stay-bar': 'lost-bar'" :style="`${bar.isStay? `background: `+ (historyType == 'category'? bar.categoryBgColor: bar.areaBgColor)+`;`: `` } width:${bar.percent}% !important;`">
              <span class="graph-arrow-box">
                {{ $i18n.tnl(bar.isStay?'label.stay': 'label.lost') }}: {{ bar.time }}
              </span>&nbsp;
            </div>
            <br>
            <div style="width: 100%">
              <div v-for="(timeData, index) in row.item.timeRatio" :key="`graph-${index}`" class="time-area" :style="`width: ${timeData.ratio}% !important;`">
                <span v-if="index == 0" style="float: left;">
                  {{ row.item.baseTimeFrom }}
                </span>
                <span v-if="index == row.item.timeRatio.length - 1" style="float: right;">
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
import validatemixin from '../../components/mixin/validatemixin.vue'
import commonmixinVue from '../../components/mixin/commonmixin.vue'
import * as HttpHelper from '../../sub/helper/HttpHelper'
import { SYSTEM_ZONE_CATEGORY_NAME } from '../../sub/constant/Constants'
import { CATEGORY } from '../../sub/constant/Constants'

export default {
  components: {
    breadcrumb,
    alert,
    DatePicker,
  },
  mixins: [validatemixin, commonmixinVue],
  data () {
    return {
      form: {
        date: '',
      },
      displayCheckList: {
        stay: [],
        category: [],
        area: [],
      },
      name: '',
      viewList: [],
      items: ViewHelper.createBreadCrumbItems('sumTitle', 'stayRatio'),
      message: '',
      showChart: true,
      currentPage: 1,
      perPage: 20,
      sortBy: 'name',
      totalRows: 0,
      searchedGroupName: '',
      categoryOptionList: [],
      categoryDisplayList: [],
      fromToSettingDiff: 0,
      fields: this.getFields(),
      initTotalRows: 0,
      historyType: 'category',
      selected: [],
      isCategorySelected: false
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
    iosOrAndroid() {
      return Util.isAndroidOrIOS()
    },
    enableCategory () {
      return this.isEnabledMenu('category') && Util.includesIgnoreCase(APP.POT.WITH, 'category')
    },
    enableGroup () {
      return this.isEnabledMenu('group') && Util.includesIgnoreCase(APP.POT.WITH, 'group')
    },
    enableCategorySelect() {
      return this.isCategorySelected
    },
  },
  async created() {
    await StateHelper.load('group')
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
    this.categoryOptionList = this.categories.filter((c) => c.categoryType != CATEGORY.ZONE)
      .sort((a, b) => a.categoryId < b.categoryId ? -1 : 1)
      .map((c) => { return {text: c.categoryName, value: c.categoryId}})
    this.categoryOptionList.unshift({text: '', value: null})

    this.categoryDisplayList = this.categories.filter((c) => c.categoryType === CATEGORY.ZONE)
      .sort((a, b) => a.categoryId < b.categoryId ? -1 : 1)
  },
  methods: {
    isScaleTime(scaleTime) {
      return _.find(APP.STAY_SUM.SCALE_TIME, (time) => { return time == scaleTime})? true: false
    },
    setSelectedGraphCategory(isSelected) {
      this.isCategorySelected? this.displayCheckList.area = []: this.displayCheckList.category = []
      this.isCategorySelected = isSelected
    },
    getRandomColor(index) {
      return DISP.SUM_STACK_COLOR[index % DISP.SUM_STACK_COLOR.length]
    },
    updateColumn() {
      Vue.set(this, 'fields', this.getFields())
    },
    getFields() {
      let fields = [
        {key: 'date', sortable: false, label: this.$i18n.tnl('label.date')},
        {key: 'name', sortable: true, label: this.$i18n.tnl('label.potName')},
        {key: 'groupName', sortable: true, label: this.$i18n.tnl('label.groupName')},
        {key: 'graph', sortable: false, label: this.$i18n.tnl('label.graph'), thStyle: {height: '50px !important', width:'400px !important'} },
      ]

      // 選択されているカテゴリを追加する
      let selectedCategories = _.filter(this.categories, (category) => {
        return _.find(this.displayCheckList.category, (id) => {
          return id == category.categoryId
        })? true: false
      })

      const i18n = this.$i18n
      selectedCategories.forEach(function(category) {
        let colorStyle = '<span style="color: #' + category.bgColor + ';">■</span>'
        fields.push({key: category.categoryName, sortable: true, label: (category.systemUse? i18n.tnl('label.' + category.systemCategoryName): category.categoryName) + colorStyle, thStyle: {width:'100px !important'}})
      })
      
      // カテゴリその他が選択されている場合は追加
      let isSelectedCategoryOther = false
      if (this.displayCheckList) {
        isSelectedCategoryOther = _.find(this.displayCheckList.category, (id) => { return id == 0 }) == 0? true: false
      }

      let colorOtherStyle = '<span style="color: ' + DISP.SUM_STACK_COLOR[0] + ';">■</span>'
      isSelectedCategoryOther? fields.push({key: 'categoryOther', sortable: true, label: i18n.tnl('label.other')+i18n.tnl('label.category') + colorOtherStyle, thStyle: {width:'100px !important'}}): null

      // 選択されているエリアを追加する
      let selectedAreas = _.filter(this.areas, (area) => {
        return _.find(this.displayCheckList.area, (id) => {
          return id == area.areaId
        })? true: false
      })
      selectedAreas.forEach(function(area, index) {
        let colorStyle = '<span style="color: ' + DISP.SUM_STACK_COLOR[area.areaId % DISP.SUM_STACK_COLOR.length] + ';">■</span>'
        fields.push({key: area.areaName, sortable: true, label: area.areaName + colorStyle, thStyle: {width:'100px !important'}})
      })

      // エリアその他が選択されている場合は追加
      let isSelectedAreaOther = false
      if (this.displayCheckList) {
        isSelectedAreaOther = _.find(this.displayCheckList.area, (id) => { return id == 0 }) == 0? true: false
      }
      colorOtherStyle = '<span style="color: ' + DISP.SUM_STACK_COLOR[0] + ';">■</span>'
      isSelectedAreaOther? fields.push({key: 'areaOther', sortable: true, label: i18n.tnl('label.other')+i18n.tnl('label.area') + colorOtherStyle, thStyle: {width:'100px !important'}}): null


      // 選択されている総合時間を追加する
      this.isDisplayStayColumn('stay')? fields.push({key: 'stayTime', sortable: true, label: this.$i18n.tnl('label.stayTime'), thStyle: {width:'100px !important'}}): null
      this.isDisplayStayColumn('lost')? fields.push({key: 'lostTime', sortable: true, label: this.$i18n.tnl('label.lostTime'), thStyle: {width:'100px !important'}}): null

      return fields.map(val => ({ ...val, originLabel: val.label}))
    },
    isDisplayStayColumn(key) {
      if (!this.displayCheckList || !this.displayCheckList.stay || this.displayCheckList.stay.length == 0) {
        return false
      }
      return _.find(this.displayCheckList.stay, (stay) => {return stay === key})? true: false
    },
    async fetchData(payload) {
      // 何もしない
    },
    validate() {
      const errors = this.validateCheck([
        {type: 'require', names: ['date'], values: [this.form.date]},
      ].filter((val) => val && val.names.length >= 1))
      return this.formatValidateMessage(errors)
    },
    async display() {
      this.container ? this.container.removeAllChildren() : null
      await this.displayImpl()
      this.stage ? this.stage.update() : null
    },
    async displayImpl(){
      this.replace({showAlert: false})
      this.showProgress()
      const param = _.cloneDeep(this.form)
      await StateHelper.load('zones')
      await StateHelper.load('pots')
      await StateHelper.load('group')
      this.setFromToSettingDiff()
      
      if (!param.date || param.date == '') {
        this.message = this.$i18n.tnl('message.pleaseEnterSearchCriteria')
        this.replace({showAlert: true})
        this.hideProgress()
        return
      }

      param.date = moment(param.date).format('YYYYMMDD')
      const groupBy = param.groupId? '&groupId=' + param.groupId: ''
      const categoryBy = param.categoryId? '&categoryId=' + param.categoryId: ''
      const group = param.groupId? this.groups.find((val) => val.groupId == param.groupId): null
      const url = '/office/stayTime/sumByDay/' + param.date + '/zoneCategory?from=' + APP.SUM_FROM + '&to=' + APP.SUM_TO + groupBy + categoryBy
      const sumData = await HttpHelper.getAppService(url)
      if (_.isEmpty(sumData)) {
        this.message = this.$i18n.t('message.listEmpty')
        this.replace({showAlert: true})
        this.hideProgress()
        return
      }

      this.viewList = this.getStayDataList(moment(param.date).format('YYYY-MM-DD'), sumData, APP.SUM_ABSENT_LIMIT, APP.SUM_LOST_LIMIT)

      this.totalRows = this.viewList.length
      this.searchedGroupName =  group? group.groupName: ''
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
      const graphTimeRatio = this.getTimeRatioData()
      return stayData.map((data) => {
        const potId = data.potId
        const pot = this.pots.find((val) => val.potId == potId)
        const groupName = pot? pot.groupName: ''
        const categoryName = pot? pot.categoryName: ''
        const potName = data.potName
        let stayTime = 0, lostTime = 0, presentRatio = 0
        let graphList = new Array()
        let categoryData = []
        let areaData = []

        // カテゴリ用データ保持変数を初期化
        categoryData[0] = {name: 'categoryOther', value: 0}
        this.categories.forEach((category) => {
          if (category.categoryType == CATEGORY.ZONE) categoryData[category.categoryId] = {name: category.categoryName, value: 0}
        })

        // エリア用データ保持変数を初期化
        areaData[0] = {name: 'areaOther', value: 0}
        this.areas.forEach((area) => {
          areaData[area.areaId] = {name: area.areaName, value: 0}
        })

        // 各時間の集計
        data.stayList.forEach((stay, index) => {
          let isStayData = false
          let time = ''
          let findCategory
          let findArea
          if (this.isLostData(stay.byId) || this.isAbsentZoneData(stay.byId)) {
            lostTime += stay.period
            time = Util.convertToTime(stay.period)
          } else {
            stayTime += stay.period
            time = Util.convertToTime(stay.period)
            isStayData = true

            // カテゴリ毎の滞在時間を加算
            findCategory = _.find(this.categories, (category) => {
              return category.categoryType == CATEGORY.ZONE && category.categoryId == stay.byId
            })
            findCategory? categoryData[findCategory.categoryId].value += stay.period: stay.byId == 0? categoryData[0].value += stay.period: null

            // エリア毎の滞在時間を加算（一致するカテゴリが存在する場合しかエリアを引けない）
            if (findCategory) {
              let zone = _.find(this.zones, (zone) => { return zone.categoryId == findCategory.categoryId})
              findArea = _.find(this.areas, (area) => {
                return zone? area.areaId == zone.areaId: false
              })
              findArea? areaData[findArea.areaId].value += stay.period: areaData[0].value += stay.period
            } else {
              // カテゴリ一致しない＆その他の場合
              stay.byId == 0? areaData[0].value += stay.period: null
            }
          }

          graphList.push({
            state: stay.byId,
            isStay: isStayData,
            period: stay.period,
            start: stay.start,
            end: stay.end,
            time: time,
            percent: Math.floor((stay.period / this.fromToSettingDiff) * 10000) / 100,
            categoryBgColor: findCategory? '#' + findCategory.bgColor: this.getRandomColor(0),
            areaBgColor: findArea? this.getRandomColor(findArea.areaId): this.getRandomColor(0),
            areaName: findArea? findArea.areaName: '',
            zoneCategory: stay.byName,
          })

        })
        presentRatio = Util.getRatio(stayTime)

        let result = {
          date: date,
          name: potName, 
          groupName: groupName,
          categoryName: categoryName,
          graph: graphList,
          stayTime: Util.convertToTime(stayTime) + ' (' + Util.getRatio(stayTime) + '%)', 
          lostTime: Util.convertToTime(lostTime) + ' (' + Util.getRatio(lostTime) + '%)', 
          baseTimeFrom: this.getDateStrFromSetting(APP.SUM_FROM),
          baseTimeTo: this.getDateStrFromSetting(APP.SUM_TO),
          stayRatio: presentRatio + ' %',
          timeRatio: graphTimeRatio,
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
      const fromHour = Math.floor(APP.SUM_FROM / 100) // 分は切る
      const toHour = Math.floor(APP.SUM_TO / 100)
      const toHourMinute = toHour * 60 + APP.SUM_TO % 100
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
    async sumDownload(){
      if (this.viewList == null || this.viewList.length == 0) {
        this.message = this.$i18n.tnl('message.notFound')
        this.replace({showAlert: true})
        return
      }

      const csvList = this.getCsvSumList(this.viewList)

      csvList.sort(function(a, b) {
        var nameA = a.name.toUpperCase() // 大文字、小文字を無視
        var nameB = b.name.toUpperCase() // 大文字、小文字を無視
        if (nameA < nameB) return -1
        if (nameA > nameB) return 1
        return 0
      })

      const param = _.cloneDeep(this.form)
      const searchDate = moment(param.date).format('YYYY-MM-DD')
      const groupName = this.searchedGroupName.length > 0? '_' + this.searchedGroupName: ''

      HtmlUtil.fileDL(
        searchDate + groupName + '_stayRatio.csv',
        Util.converToCsv(csvList),
        getCharSet(this.$store.state.loginId)
      )
    },
    getCsvSumList(sumList) {
      // フィールド設定に合わせ、出力するデータのキーリストを生成する
      const keys = []
      sumList.length > 0? this.fields.forEach((field) => {
        _.find(Object.keys(sumList[0]), (key) => { return key!= 'graph' && key == field.key})? keys.push(field.key): null
      }): null

      // キーの一致するデータのみのリストを作成。その際、％データがある場合は分ける
      return sumList.map((viewData) => {
        let objectData = {}
        keys.forEach((key) => {
          const hasRatio = viewData[key]? viewData[key].search('%') > 0: false
          if (hasRatio) {
            let splitData = viewData[key].split(' ')
            objectData[key] = splitData[0]
            objectData[key + 'Ratio'] = splitData[1].slice(1,-1)
          } else {
            objectData[key] = viewData[key]
          }
        })
        return objectData
      })
    },
    async detailDownload(){
      if (this.viewList == null || this.viewList.length == 0) {
        this.message = this.$i18n.tnl('message.notFound')
        this.replace({showAlert: true})
        return
      }

      const csvList = this.getCsvDetailList(this.viewList)

      if (csvList == null || csvList.length == 0) {
        this.message = this.$i18n.tnl('message.notFound')
        this.replace({showAlert: true})
        return
      }

      csvList.sort(function(a, b) {
        var nameA = a.name.toUpperCase() // 大文字、小文字を無視
        var nameB = b.name.toUpperCase() // 大文字、小文字を無視
        if (nameA < nameB) return -1
        if (nameA > nameB) return 1
        return 0
      })

      const param = _.cloneDeep(this.form)
      const searchDate = moment(param.date).format('YYYY-MM-DD')
      const groupName = this.searchedGroupName.length > 0? '_' + this.searchedGroupName: ''

      HtmlUtil.fileDL(
        searchDate + groupName + '_stayRatio.csv',
        Util.converToCsv(csvList),
        getCharSet(this.$store.state.loginId)
      )
    },
    getCsvDetailList(detailList) {
      const fromSeconds = (Math.floor(APP.SUM_FROM / 100) * 60 + APP.SUM_FROM % 100) * 60
      const toSeconds = (Math.floor(APP.SUM_TO / 100) * 60 + APP.SUM_TO % 100) * 60
      // キーの一致するデータのみのリストを作成。その際、％データがある場合は分ける
      return detailList.map((viewData) => {
        let graphData = []
        this.setFromToSettingDiff()

        viewData.graph.forEach((graph) => {
          if (graph.percent == 100) {
            graph.start = Util.convertToTime(fromSeconds)
            graph.end = Util.convertToTime(toSeconds)
          } else {
            graph.start = moment(graph.end).format('HH:mm:ss')
            graph.end = moment(graph.end).format('HH:mm:ss')
          }
          (graph.isStay || graph.percent == 100)? graphData.push(graph): null
        })

        return graphData.map((graph) => {
          return {
            date: viewData.date,
            name: viewData.name,
            groupName: viewData.groupName,
            categoryName: viewData.categoryName,
            start: graph.start,
            end: graph.end,
            seconds: graph.period,
            state: graph.period == this.fromToSettingDiff? this.$i18n.tnl('label.undetect'): this.$i18n.tnl('label.detected'),
            areaName: graph.areaName,
            zoneCategory: graph.zoneCategory,
          }
        })
      }).flat()
    },
    updateColumnName(){
      if(Util.hasValue(this.fields)){
        this.fields.forEach(field => {
          field.label = Util.isResponsiveMode(true)? field.originLabel.replace(/<br>/g, ''): field.originLabel
        })
      }
    },
    async sumDownloadMonth(){
      this.replace({showAlert: false})
      this.showProgress()

      const param = _.cloneDeep(this.form)
      await StateHelper.load('zones')
      await StateHelper.load('pots')
      await StateHelper.load('group')

      if (!param.date || param.date == '') {
        this.message = this.$i18n.tnl('message.pleaseEnterSearchCriteria')
        this.replace({showAlert: true})
        this.hideProgress()
        return
      }

      param.date = moment(param.date).format('YYYYMMDD')
      const diff = moment().startOf('months').diff(moment(param.date).startOf('months'), 'months')
      let startDate, endDate

      // 取得する日付開始、終了日を設定する
      if (diff == 0) {
        startDate = moment(param.date).startOf('months')
        endDate = moment().subtract(1, 'd')
      } else if (diff >= 0) {
        startDate = moment(param.date).startOf('months')
        endDate = moment(param.date).endOf('months')
      } else {
        // 未来月の場合はエラーとする
        this.message = this.$i18n.terror('message.invalid', {target: this.$i18n.tnl('label.date')})
        this.replace({showAlert: true})
        this.hideProgress()
        return
      }

      let csvList = []
      const csvDays = endDate.diff(startDate, 'days')
      const groupBy = param.groupId? '&groupId=' + param.groupId: ''

      let day = 0
      while (day <= csvDays) {
        const searchDate = moment(param.date).startOf('months').add(day++, 'day').format('YYYYMMDD')
        const url = '/office/stayTime/sumByDay/' + searchDate + '/zoneCategory?from=' + APP.SUM_FROM + '&to=' + APP.SUM_TO + groupBy
        const sumData = await HttpHelper.getAppService(url)
        if (_.isEmpty(sumData)) {
          console.log('searchDate: ' + searchDate)
          this.message = this.$i18n.t('message.listEmpty')
          this.replace({showAlert: true})
          this.hideProgress()
          return
        }

        let list = this.getStayDataList(moment(searchDate).format('YYYY-MM-DD'), sumData, APP.SUM_ABSENT_LIMIT, APP.SUM_LOST_LIMIT)
        
        const dateList = this.getCsvSumList(list)
        dateList.sort(function(a, b) {
          var nameA = a.name.toUpperCase() // 大文字、小文字を無視
          var nameB = b.name.toUpperCase() // 大文字、小文字を無視
          if (nameA < nameB) return -1
          if (nameA > nameB) return 1
          return 0
        })
        csvList = csvList.isEmpty? dateList: csvList.concat(dateList)
      }

      const group = param.groupId? this.groups.find((val) => val.groupId == param.groupId): null
      const groupName =  group? '_' + group.groupName: ''
      HtmlUtil.fileDL(
        moment(param.date).format('YYYY-MM') + groupName + '_stayRatio.csv',
        Util.converToCsv(csvList),
        getCharSet(this.$store.state.loginId)
      )

      this.hideProgress()
    },
    async detailDownloadMonth(){
      // FIXME: 実装
    },
    pickerChanged() {
      const param = _.cloneDeep(this.form)
      const isError = param.date == '' ? true: moment(param.date).isAfter(moment().endOf('months'))? true: false
      if (isError) {
        this.message = this.$i18n.terror('message.invalid', {target: this.$i18n.tnl('label.date')})
        this.replace({showAlert: true})
        return
      } else {
        this.replace({showAlert: false})
      }
    },
    setFromToSettingDiff() {
      const fromMinute = Math.floor(APP.SUM_FROM / 100) * 60 + APP.SUM_FROM % 100
      const toMinute = Math.floor(APP.SUM_TO / 100) * 60 + APP.SUM_TO % 100
      this.fromToSettingDiff = (toMinute - fromMinute) * 60
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
</style>
