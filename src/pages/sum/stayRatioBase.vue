<template>
  <div>
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
            <b-form-select v-model="vModelCategory" :options="categoryOptionList" class="mr-2 inputSelect" @change="categoryChange" />
          </b-form-row>
        </b-form-group>
      </b-form>
      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row class="mb-3">
            <b-button v-t="'label.display'" type="submit" :variant="theme" @click="display" />
            <b-button v-if="!iosOrAndroid" v-t="'label.download'" :variant="theme" class="ml-2" @click="download" />
            <b-button v-if="!iosOrAndroid" v-t="'label.downloadMonth'" :variant="theme" class="ml-2" @click="downloadMonth" />
          </b-form-row>
        </b-form-group>
      </b-form>
      <slot />
      <b-row class="mt-3" />
      <m-list :params="params" :list="viewList" :alert-force-hide="true" :per-page="perPage" />
    </div>
  </div>
</template>

<script>
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
import { APP } from '../../sub/constant/config'
import moment from 'moment'
import validatemixin from '../../components/mixin/validatemixin.vue'
import commonmixinVue from '../../components/mixin/commonmixin.vue'
import * as HttpHelper from '../../sub/helper/HttpHelper'
import { SYSTEM_ZONE_CATEGORY_NAME } from '../../sub/constant/Constants'
import { CATEGORY } from '../../sub/constant/Constants'
import mList from '../../components/page/list.vue'

export default {
  components: {
    breadcrumb,
    alert,
    DatePicker,
    mList,
  },
  mixins: [validatemixin, commonmixinVue],
  data () {
    return {
      form: {
        date: '',
      },
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
      vModelCategory: null,
      fromToSettingDiff: 0,
      params: {
        fields: ViewHelper.addLabelByKey(this.$i18n, [
          {key: 'date', sortable: false, label: 'date'},
          {key: 'name', sortable: true, label: 'potName'},
          this.enableCategory? {key: 'groupName', sortable: true, label: 'groupName'}: null,
          this.enableGroup? {key: 'categoryName', sortable: true, label: 'categoryName'}: null,
          {key: 'graph', sortable: false, thStyle: {height: '50px !important', width:'400px !important'} },
          {key: 'stayTime', sortable: true, label: 'stayTime'},
          {key: 'lostTime', sortable: true, label: 'lostTime'},
          {key: 'stayRatio', sortable: true, label: 'stayRatio'},
        ]).map(val => ({ ...val, originLabel: val.label})),
        sortBy: 'name',
        initTotalRows: 0,
        hideSearchBox: true,
        isDisplayGraph: true,
      },
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
    ]),
    iosOrAndroid() {
      return Util.isAndroidOrIOS()
    },
    enableCategory () {
      return this.isEnabledMenu('category') && APP.POT_WITH_CATEGORY
    },
    enableGroup () {
      return this.isEnabledMenu('group') && APP.POT_WITH_GROUP
    },
  },
  async created() {
    await StateHelper.load('group')
    await StateHelper.load('pots')
    await StateHelper.load('categories')
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
    this.categoryOptionList = this.categories.filter((c) => c.categoryType === CATEGORY.ZONE)
      .sort((a, b) => a.categoryId < b.categoryId ? -1 : 1)
      .map((c) => { return {text: c.categoryName, value: c.categoryId}})
    this.categoryOptionList.unshift({text: '', value: null})
    this.vModelCategory = this.categoryOptionList[0].value
    await StateHelper.load('zone')
  },
  methods: {
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
      const group = param.groupId? this.groups.find((val) => val.groupId == param.groupId): null
      const url = '/office/stayTime/sumByDay/' + param.date + '/zoneCategory?from=' + APP.SUM_FROM + '&to=' + APP.SUM_TO + groupBy
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
      return stayData.map((data) => {
        const potId = data.potId
        const pot = this.pots.find((val) => val.potId == potId)
        const groupName = pot? pot.groupName: ''
        const potName = data.potName
        let stayTime = 0, lostTime = 0, presentRatio = 0
        let graphList = new Array()

        // 各時間の集計
        data.stayList.forEach((stay) => {
          let isStayData = false
          let time = ''
          if (this.isLostData(stay.byId) || this.isAbsentZoneData(stay.byId)) {
            lostTime += stay.period
            time = Util.convertToTime(stay.period)
          } else {
            stayTime += stay.period
            time = Util.convertToTime(stay.period)
            isStayData = true
          }
          graphList.push({
            isStay: isStayData,
            period: stay.period,
            time: time,
            baseTimeFrom: APP.SUM_FROM,
            baseTimeTo: APP.SUM_TO,
            percent: Math.floor((stay.period / this.fromToSettingDiff) * 10000) / 100,
          })
        })
        presentRatio = Util.getRatio(stayTime)

        return {
          date: date,
          name: potName, 
          groupName: groupName,
          graph: graphList,
          stayTime: Util.convertToTime(stayTime), 
          lostTime: Util.convertToTime(lostTime),
          stayRatio: presentRatio + ' %',
        }
      })
    },
    async download(){
      if (this.viewList == null || this.viewList.length == 0) {
        this.message = this.$i18n.tnl('message.notFound')
        this.replace({showAlert: true})
        return
      }

      this.viewList.sort(function(a, b) {
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
        Util.converToCsv(this.viewList, null, this.getCsvHeaderNames()),
        getCharSet(this.$store.state.loginId)
      )
    },
    updateColumnName(){
      if(Util.hasValue(this.params.fields)){
        this.params.fields.forEach(field => {
          field.label = Util.isResponsiveMode(true)? field.originLabel.replace(/<br>/g, ''): field.originLabel
        })
      }
    },
    async downloadMonth(){
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
        list.sort(function(a, b) {
          var nameA = a.name.toUpperCase() // 大文字、小文字を無視
          var nameB = b.name.toUpperCase() // 大文字、小文字を無視
          if (nameA < nameB) return -1
          if (nameA > nameB) return 1
          return 0
        })
        csvList = csvList.isEmpty? list: csvList.concat(list)
      }

      const group = param.groupId? this.groups.find((val) => val.groupId == param.groupId): null
      const groupName =  group? '_' + group.groupName: ''
      HtmlUtil.fileDL(
        moment(param.date).format('YYYY-MM') + groupName + '_stayRatio.csv',
        Util.converToCsv(csvList, null, this.getCsvHeaderNames()),
        getCharSet(this.$store.state.loginId)
      )

      this.hideProgress()
    },
    getCsvHeaderNames() {
      return [
        'date',
        'name',
        'groupName',
        'stayGraph', 
        'stayTime', 
        'lostTime',
        'stayRatio' + '\n'
      ]
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
</style>
