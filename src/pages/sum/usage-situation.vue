<template>
  <div class="container-fluid">
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <alert :message="message" />
      <b-form class="form-horizontal">
        <b-form-group>
          <label v-t="'label.mode'" class="control-label col-md-2 text-right" />
          <b-form-select v-model="form.mode" :options="modeOptions" class="col-md-2" />
          <label v-t="'label.sumYearMonth'" class="control-label col-md-1 text-right" />
          <b-form-select v-model="vModelYearMonth" class="col-md-2" :options="yearMonthOptions" @change="yearMonthChange" />
          <label v-t="'label.sumDay'" class="control-label col-md-1 text-right" />
          <b-form-select v-model="vModelDay" class="col-md-1" :options="dayOptions" @change="dayChange" />
        </b-form-group>
        <b-form-group>
          <b-form-row>
            <b-form-row>
              <label v-t="'label.zoneCategoryName'" class="control-label md-2 text-right" />
              <span :title="vueSelectTitle(vueSelected.category)">
                <v-select v-model="vueSelected.category" :options="categoryOptionList" class="md-3 ml-2 vue-options" :style="getVueSelectStyle()">
                  <template slot="selected-option" slot-scope="option">
                    {{ vueSelectCutOn(option) }}
                  </template>
                </v-select>
              </span>
            </b-form-row>
            <b-form-row>
              <label v-t="'label.zone'" class="control-label md-1 text-right" />
              <span :title="vueSelectTitle(vueSelected.zone)">
                <v-select v-model="vueSelected.zone" :options="zoneOptions" class="md-3 ml-2 vue-options" :style="getVueSelectStyle()">
                  <template slot="selected-option" slot-scope="option">
                    {{ vueSelectCutOn(option) }}
                  </template>
                </v-select>
              </span>
            </b-form-row>
          </b-form-row>
        </b-form-group>
        <b-form-group>
          <b-button v-t="'label.display'" :variant="theme" class="col-md-1" @click="display" />
          <b-button v-if="!iosOrAndroid" v-t="'label.download'" :variant="theme" :disabled="!viewList || viewList.length == 0" class="mx-1" @click="exportCsv" />
        </b-form-group>
      </b-form>

      <b-table :items="viewList" :fields="fields" :current-page="currentPage" :per-page="perPage" :sort-by.sync="sortBy" stacked="md" striped hover outlined />
      <b-row>
        <b-col md="6" class="my-1">
          <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" class="my-0" />
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import 'element-ui/lib/theme-chalk/index.css'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import alert from '../../components/parts/alert.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import commonmixinVue from '../../components/mixin/commonmixin.vue'
import controlmixinVue from '../../components/mixin/controlmixin.vue'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as ViewHelper from '../../sub/helper/ViewHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import { getTheme } from '../../sub/helper/ThemeHelper'
import { getCharSet } from '../../sub/helper/CharSetHelper'
import { CATEGORY } from '../../sub/constant/Constants'

export default {
  components: {
    breadcrumb,
    alert,
  },
  mixins: [showmapmixin, commonmixinVue, controlmixinVue],
  data () {
    return {
      name: 'usageSituation',
      items: ViewHelper.createBreadCrumbItems('sumTitle', 'usageSituation'),
      form: {
        mode: null,
        selectedYearMonth: 0,
        selectedDay: 0,
      },
      vueSelected: {
        category: null,
        zone: null,
      },
      viewList: [],
      fields: [],
      fields1: ViewHelper.addLabelByKey(this.$i18n, [
        {key: 'zoneCategoryName', sortable: true},
        {key: 'zoneName', sortable: true },
        {key: 'rate', label:'utilizationRatioP', sortable: true,},
        {key: 'cnt', label:'utilizationTime', sortable: true,},
      ]),
      fields2: ViewHelper.addLabelByKey(this.$i18n, [
        {key: 'zoneCategoryName', sortable: true},
        {key: 'zoneName', sortable: true },
        {key: 'numUse', label: 'numOfUsers', sortable: true,},
      ]),
      currentPage: 1,
      perPage: 20,
      totalRows: 0,
      sortBy: null,
      //
      message: '',
      //
      dayOptionList: [],
      categoryOptionList: [],
      zoneOptionList: [],
      zoneCategorys: [],
      vModelCategory: null,
      vModelZone: null,
      vModelYearMonth: null,
      vModelDay: null,
      MONTHS: 6,
    }
  },
  computed: {
    theme () {
      const theme = getTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'categories',
      'zones',
    ]),
    modeOptions() {
      const modeOp = []
      modeOp.push({text: this.$i18n.tnl('label.utilizationRatio'), value: 1})
      modeOp.push({text: this.$i18n.tnl('label.numUsers'), value: 2})
      return modeOp
    },
    yearMonthOptions() {
      const date = new Date()
      const months = []
      let year = 0
      let month = 0
      for (let i = 0 ; i < this.MONTHS ; i++) {
        date.setDate(1)
        date.setTime(date.getTime() - (i > 0 ? 86400000 : 0))
        year = date.getFullYear()
        month = date.getMonth() + 1
        months.push({
          text: `${year}/${('00' + month).substr(-2)}`,
          value: year * 100 + month
        })
      }
      return months
    },
    dayOptions() {
      return this.dayOptionList
    },
    zoneOptions() {
      return this.zoneOptionList
    },
  } /* computed end */ ,
  watch: {
    'vueSelected.category': {
      handler: function(newVal, oldVal){
        this.vModelCategory = Util.getValue(newVal, 'value', null)
        this.categoryChange(this.vModelCategory)
      },
      deep: true,
    },
    'vueSelected.zone': {
      handler: function(newVal, oldVal){
        this.vModelZone = Util.getValue(newVal, 'value', null)
        this.zoneChange(this.vModelZone)
      },
      deep: true,
    },
  },
  async created() {
    this.form.mode = 1
    this.fields = this.fields1
  },
  async mounted() {
    HtmlUtil.importElementUI()
    this.vModelYearMonth = this.yearMonthOptions[0].value
    this.yearMonthChange(this.vModelYearMonth)
    await StateHelper.load('category')
    if (this.categories.length < 1) {
      return
    }
    this.categoryOptionList = this.categories.filter((c) => c.categoryType === CATEGORY.ZONE)
      .sort((a, b) => a.categoryId < b.categoryId ? -1 : 1)
      .map((c) => { return {label: c.categoryName, value: c.categoryId}})
    this.vModelCategory = this.categoryOptionList[0].value
    await StateHelper.load('zone')
  },
  methods: {
    yearMonthChange(val) {
      if (val == null) {
        this.form.selectedYearMonth = 0
        this.vModelDay = null
        this.dayOptionList = []
        return
      }
      const year = val / 100
      const month = val % 100
      const lastDay = new Date(year, month, 0).getDate()
      const pullDowns = []
      for (let idx = 1; idx <= lastDay; idx++) {
        pullDowns.push({ text: idx, value: idx })
      }
      this.form.selectedYearMonth = val
      this.dayOptionList = pullDowns
    },
    dayChange(val) {
      this.selectedDay = val ? val : 0
      this.vModelDay = val ? val : null
    },
    categoryChange(val) {
      this.zoneOptionList =this.zones.filter((zone) => zone.categoryId && zone.categoryId === val)
        .map((zone) => {return {label: zone.zoneName, value: zone.zoneId}})
    },
    zoneChange(val) {
      this.zoneId = val
      this.vModelZone = val
    },
    async display() {
      this.container ? this.container.removeAllChildren() : null
      await this.displayImpl()
      this.stage ? this.stage.update() : null
    },
    createViewList(aModeId, fetchList){
      const viewList = []
      for (let line of fetchList) {
        const thisLine = []
        if (aModeId == 1) {
          thisLine.zoneCategoryName = line.zoneCategoryName
          thisLine.zoneName = line.zoneName
          thisLine.rate = line.rate
          thisLine.cnt = (line.cnt / 60).toFixed(2)
        }
        if (aModeId == 2) {
          thisLine.zoneCategoryName = line.zoneCategoryName
          thisLine.zoneName = line.zoneName
          thisLine.numUse = line.numUse
        }
        viewList.push(thisLine)
      }
      return viewList
    },
    getParamDate(){
      const paramDate = this.form.selectedYearMonth
      if (this.selectedDay > 0) {
        return paramDate * 100 + this.selectedDay
      }
      return paramDate
    },
    async displayImpl(){
      this.replace({showAlert: false})
      this.viewList = []
      this.totalRows = 0
      try {
        if (this.form.selectedYearMonth == null || this.form.selectedYearMonth == 0) {
          this.message = this.$i18n.tnl('message.pleaseEnterSearchCriteria')
          this.replace({showAlert: true})
          return
        }
        const paramCategoryId = this.vModelCategory ? this.vModelCategory : -1
        const paramZoneId = this.vModelZone ? this.vModelZone : -1
        const paramDate = this.getParamDate()
        const aModeId = (this.form.mode != null)? this.form.mode: 1
        let fetchList = null
        if (aModeId == 1) {
          this.fields = this.fields1
          fetchList = await AppServiceHelper.fetch('/office/utilizationRatio/' + paramCategoryId + '/' + paramZoneId + '/' + paramDate, '')
        }
        if (aModeId == 2) {
          this.fields = this.fields2
          fetchList = await AppServiceHelper.fetch('/office/numUsers/' + paramCategoryId + '/' + paramZoneId + '/' + paramDate, '')
        }
        if (fetchList == null || !fetchList.length) {
          this.message = this.$i18n.tnl('message.notFoundData', {target: this.$i18n.tnl('label.usageSituation')})
          this.replace({showAlert: true})
          return
        }
        this.viewList = this.createViewList(aModeId, fetchList)
        this.totalRows = this.viewList.length
      } catch(e) {
        console.error(e)
      }
    },
    reset() {
      this.isShownMapImage = false
    },
    async fetchData(payload) {
    },
    async exportCsv() {
      if (this.viewList == null || this.viewList.length == 0) {
        this.message = this.$i18n.tnl('message.notFound')
        this.replace({showAlert: true})
        return
      }
      HtmlUtil.fileDL(
        'usage-situation.csv',
        Util.converToCsv(this.viewList),
        getCharSet(this.$store.state.loginId)
      )
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/vue.scss";
</style>
