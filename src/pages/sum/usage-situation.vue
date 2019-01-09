<template>
  <div>
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <alert :message="message" />

      <div class="mapContainer mb-5">
        <b-form inline>
          <b-form-group class="mr-5">
            <b-form-row>
              <b-form-row class="mb-3 mr-2">
                <label v-t="'label.mode'" class="mr-2" />
                <b-form-select v-model="form.mode" :options="modeOptions" class="mr-2" />
              </b-form-row>
            </b-form-row>
          </b-form-group>
        </b-form>
        <b-form inline>
          <b-form-group class="mr-5">
            <b-form-row class="mb-3 mr-2">
              <label v-t="'label.sumYearMonth'" />
              <v-select v-model="vModelYearMonth" :options="yearMonthOptions" :on-change="yearMonthChange" class="vselectMonth">
                <div slot="no-options">
                  {{ $i18n.tnl('label.vSelectNoOptions') }}
                </div>
              </v-select>
              <label v-t="'label.sumDay'" />
              <v-select v-model="vModelDay" :options="dayOptions" :on-change="dayChange" class="vselectDay">
                <div slot="no-options">
                  {{ $i18n.tnl('label.vSelectNoOptions') }}
                </div>
              </v-select>
            </b-form-row>
          </b-form-group>
        </b-form>
        <b-form inline>
          <b-form-group class="mr-5">
            <b-form-row class="mb-3 mr-2">
              <label v-t="'label.zoneCategoryName'" />
              <v-select v-model="vModelCategory" :options="categoryOptions" :on-change="categoryChange" class="vselectCategory">
                <div slot="no-options">
                  {{ $i18n.tnl('label.vSelectNoOptions') }}
                </div>
              </v-select>
              <label v-t="'label.zone'" />
              <v-select v-model="vModelZone" :options="zoneOptions" :on-change="zoneChange" class="vselectZone">
                <div slot="no-options">
                  {{ $i18n.tnl('label.vSelectNoOptions') }}
                </div>
              </v-select>
            </b-form-row>
          </b-form-group>
        </b-form>
        <b-form inline>
          <b-form-group>
            <b-form-row class="mb-3 mr-2">
              <b-button v-t="'label.display'" :variant="theme" class="mx-1" @click="display" />
              <b-button v-if="!iosOrAndroid" v-t="'label.download'" :variant="theme" class="mx-1" @click="exportCsv" />
            </b-form-row>
          </b-form-group>
        </b-form>
        <slot />
        <b-row class="mt-3" />
        <b-table :items="viewList" :fields="fields" :current-page="currentPage" :per-page="perPage" :sort-by.sync="sortBy" stacked="md" striped hover outlined />
        <b-row>
          <b-col md="6" class="my-1">
            <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" class="my-0" />
          </b-col>
        </b-row>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import alert from '../../components/parts/alert.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import commonmixinVue from '../../components/mixin/commonmixin.vue'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import { addLabelByKey } from '../../sub/helper/ViewHelper'
import { getTheme } from '../../sub/helper/ThemeHelper'
import { getCharSet } from '../../sub/helper/CharSetHelper'

export default {
  components: {
    breadcrumb,
    alert,
  },
  mixins: [showmapmixin, commonmixinVue ],
  data () {
    return {
      name: 'usageSituation',
      items: [
        {
          text: this.$i18n.tnl('label.sumTitle'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.usageSituation'),
          active: true
        }
      ],
      form: {
        mode: null,
        selectedYearMonth: 0,
        selectedDay: 0,
      },
      viewList: [],
      fields: [],
      fields1: addLabelByKey(this.$i18n, [
        {key: 'zoneCategoryName', sortable: true},
        {key: 'zoneName', sortable: true },
        {key: 'rate', label:'utilizationRatioP', sortable: true,},
        {key: 'cnt', label:'utilizationTime', sortable: true,},
      ]),
      fields2: addLabelByKey(this.$i18n, [
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
    }
  },
  computed: {
    theme () {
      const theme = getTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      ''
    ]),
    modeOptions() {
      var modeOp = []
      modeOp.push({text: this.$i18n.tnl('label.utilizationRatio'), value: 1})
      modeOp.push({text: this.$i18n.tnl('label.numUsers'), value: 2})
      return modeOp
    },
    yearMonthOptions() {
      var today = new Date()
      var yyyy = today.getFullYear()
      var mm = today.getMonth() + 1
      var pullDowns = []
      for (var idx = 0; idx < 6; idx++) {
        pullDowns.push({
          label: yyyy + '/' + ('00' + mm).substr(-2),
          value: yyyy*100 + mm
        })
        mm--
        if (mm < 1) {
          mm = 12
          yyyy--
        }
      }
      return pullDowns
    },
    dayOptions() {
      return this.dayOptionList
    },
    categoryOptions() {
      return this.categoryOptionList
    },
    zoneOptions() {
      return this.zoneOptionList
    },
  } /* computed end */ ,
  async created() {
    this.form.mode = 1
    this.fields = this.fields1
  },
  async mounted() {
    import(`element-ui/lib/locale/lang/${this.$i18n.locale}`).then( (mojule) =>{
      locale.use(mojule.default)
    })
    await StateHelper.load('category')
    this.fetchPrev()
    this.vModelYearMonth = this.yearMonthOptions[0]
  },
  methods: {
    async fetchPrev() {
      await this.fetchZoneCategoryList()
      this.categoryChange(null)
    },
    async fetchZoneCategoryList() {
      try {
        this.zoneCategorys = await AppServiceHelper.fetch(
          '/core/zone/categoryList',
          ''
        )
        this.categoryOptionList = await this.getZoneCategoryOptions(this.zoneCategorys)
      } catch(e) {
        console.error(e)
      }
    },
    yearMonthChange(val) {
      if (val == null) {
        this.form.selectedYearMonth = 0
        this.vModelDay = null
        this.dayOptionList = []
        return
      }
      var year = val.value/100
      var month = val.value%100
      var lastDay = new Date(year, month, 0).getDate()
      var pullDowns = []
      for (var idx = 1; idx <= lastDay; idx++) {
        pullDowns.push({
          label: '' + idx, value: idx
        })
      }
      this.form.selectedYearMonth = val.value
      this.vModelDay = null
      this.dayOptionList = pullDowns
    },
    dayChange(val) {
      if (val == null) {
        this.selectedDay = 0
        this.vModelDay = null
      } else {
        this.selectedDay = val.value
        this.vModelDay = val
      }
    },
    categoryChange(val) {
      this.zoneOptionList = this.getZoneOptions(this.zoneCategorys, val)
      if (val == null) {
        this.categoryId = -1
        this.vModelCategory = null
      } else {
        this.categoryId = val.value
        this.vModelCategory = val
      }
      this.vModelZone = null
    },
    zoneChange(val) {
      if (val == null) {
        this.zoneId = null
        this.vModelZone = null
      } else {
        this.zoneId = val.value
        this.vModelZone = val
      }
    },
    async display() {
      this.container ? this.container.removeAllChildren() : null
      await this.displayImpl()
      this.stage ? this.stage.update() : null
    },
    async displayImpl(){
      this.replace({showAlert: false})
      this.viewList = []
      try {
        if (this.form.selectedYearMonth == null || this.form.selectedYearMonth == 0) {
          this.message = this.$i18n.tnl('message.pleaseEnterSearchCriteria')
          this.replace({showAlert: true})
          return
        }
        var paramCategoryId = (this.categoryId != null)?this.categoryId:-1
        var paramZoneId = (this.zoneId != null)?this.zoneId:-1
        var paramDate = this.form.selectedYearMonth
        if (this.selectedDay > 0) {
          paramDate = paramDate*100 + this.selectedDay
        }
        const aModeId = (this.form.mode != null)?this.form.mode:1
        var fetchList = null
        if (aModeId == 1) {
          this.fields = this.fields1
          fetchList = await AppServiceHelper.fetch(
            '/office/utilizationRatio/' + paramCategoryId + '/' + paramZoneId + '/' + paramDate,
            ''
          )
        }
        if (aModeId == 2) {
          this.fields = this.fields2
          fetchList = await AppServiceHelper.fetch(
            '/office/numUsers/' + paramCategoryId + '/' + paramZoneId + '/' + paramDate,
            ''
          )
        }
        if (fetchList == null || !fetchList.length) {
          this.message = this.$i18n.tnl('message.notFoundData', {target: this.$i18n.tnl('label.usageSituation')})
          this.replace({showAlert: true})
          return
        }
        for (var line of fetchList) {
          var thisLine = []
          if (aModeId == 1) {
            thisLine.zoneCategoryName = line.zoneCategoryName
            thisLine.zoneName = line.zoneName
            thisLine.rate = line.rate
            thisLine.cnt = (line.cnt/60).toFixed(2)
          }
          if (aModeId == 2) {
            thisLine.zoneCategoryName = line.zoneCategoryName
            thisLine.zoneName = line.zoneName
            thisLine.numUse = line.numUse
          }
          this.viewList.push(thisLine)
        }
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
      await this.display()
      if (this.viewList.length > 0) {
        HtmlUtil.fileDL(
          'usage-situation.csv',
          Util.converToCsv(this.viewList),
          getCharSet(this.$store.state.loginId)
        )
      }
    },
  }
}
</script>
