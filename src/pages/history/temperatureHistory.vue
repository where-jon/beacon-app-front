<template>
  <div>
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <b-row>
        <b-col md="8" offset-md="2">
          <b-form>
            <b-form-group>
              <label v-t="'label.zoneCategoryName'" />
              <v-select v-model="vModelCategory" :options="categoryOptions" :on-change="categoryChange" required class="ml-2"></v-select>
            </b-form-group>
            <b-form-group>
              <label v-t="'label.zoneName'" />
              <v-select v-model="vModelZone" :options="zoneOptions" :on-change="zoneChange" required class="ml-2"></v-select>
            </b-form-group>
            <b-form-group>
              <label v-t="'label.historyDateFrom'" />
              <b-form-input type="date" required v-on:change="dateFromChange" />
              <label v-t="'label.historyDateTo'" />
              <b-form-input type="date" required v-on:change="dateToChange" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.temperatureHistoryType'" />
              <v-select :options="typeOptions" required class="ml-2" :on-change="typeChange"></v-select>
            </b-form-group>
            <b-button size="sm" variant="info" v-t="'label.download'" @click="download()"></b-button> 
          </b-form>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import { EventBus } from '../../sub/helper/EventHelper'
import { EXB, DISP, APP } from '../../sub/constant/config'
import breadcrumb from '../../components/breadcrumb.vue'
import { getTheme } from '../../sub/helper/ThemeHelper'
import reloadmixinVue from '../../components/reloadmixin.vue'
import { getCharSet } from '../../sub/helper/CharSetHelper'

export default {
  mixins: [reloadmixinVue],
  components: {
    breadcrumb,
  },
  data () {
    return {
      items: [
        {
          text: this.$i18n.t('label.historyTitle'),
          active: true
        },
        {
          text: this.$i18n.t('label.temperatureHistory'),
          active: true
        }
      ],
      vModelCategory: null,
      vModelZone: null,
      vModelYearMonth: null,
      vModelDay: null,
      categoryOptionList: [{label:"", value:null}],
      zoneOptionList: [],
      //
      zoneCategorys: [],
      categoryId: null,
      zoneId: null,
      dateFrom: 0,
      dateTo: 0,
      historyType: 0,
      temperatureHistoryData: null,
    }
    
  },
  computed: {
    categoryOptions() {
      return this.categoryOptionList
    },
    zoneOptions() {
      return this.zoneOptionList
    },
    typeOptions() {
      return [
        {label:this.$i18n.t('label.temperatureHistoryType0'), value:0},
        {label:this.$i18n.t('label.temperatureHistoryType1'), value:1},
      ]
    },
    getTheme () {
      const theme = getTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    ...mapState('monitor', [
      'temperatureHistory',
    ])
  },
  mounted() {
    this.fetchPrev()
    this.replace({title: this.$i18n.t('label.temperatureHistory')})
  },
  methods: {
    async fetchZoneCategoryList() {
      try {
        this.zoneCategorys = await AppServiceHelper.fetchList2(
          '/core/zone/categoryList',
          '/core/zone/categoryList',
          'categoryId'
        )
        console.log(this.zoneCategorys)
        var categorys = {}
        this.zoneCategorys.forEach(elm => {
          if (elm.categoryId >= 0) {
            categorys[elm.categoryId] = elm.categoryName
          }
        })
        this.categoryOptionList = []
        for (var catId in categorys) {
          this.categoryOptionList.push({
            label: categorys[catId],
            value: catId
          })
        }
      } catch(e) {
        console.error(e)
      }
    },
    async fetchPrev() {
      await this.fetchZoneCategoryList()
      this.categoryChange(null)
    },
    categoryChange(val) {
      var zoneUniqs = {}
      if (val == null) {
        this.zoneCategorys.forEach(elm => {
          zoneUniqs[elm.zoneId] = elm.zoneName
        })
      } else {
        this.zoneCategorys.forEach(elm => {
          if (elm.categoryId == val.value) {
            zoneUniqs[elm.zoneId] = elm.zoneName
          }
        })
      }
      this.zoneOptionList = []
      for (var zId in zoneUniqs) {
        this.zoneOptionList.push({
          label: zoneUniqs[zId],
          value: zId
        })
      }
      if (val == null) {
        this.categoryId = null
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
    dateFromChange(val) {
      if (val == null) {
        this.dateFrom = 0
      } else {
        this.dateFrom = (val.substr(0, 4) + val.substr(5, 2) + val.substr(8, 2))/1
      }
    },
    dateToChange(val) {
      if (val == null) {
        this.dateTo = 0
      } else {
        this.dateTo = (val.substr(0, 4) + val.substr(5, 2) + val.substr(8, 2))/1
      }
    },
    typeChange(val) {
      if (val == null) {
        this.historyType = 0
      } else {
        this.historyType = val.value
      }
    },
    async dataDownload() {
      let paramCategoryId = (this.categoryId != null)?this.categoryId:-1
      let paramZoneId = (this.zoneId != null)?this.zoneId:-1
      let paramExbId = -1
      let paramDyFrom = this.dateFrom
      let paramDyTo = this.dateTo
      let paramHistoryType = this.historyType
      var list = await AppServiceHelper.fetchList2(
        '/basic/sensorHistory',
        '/basic/sensorHistory/' + paramCategoryId + "/" +
          paramZoneId + "/" +
          paramExbId + "/" +
          paramDyFrom + "/" +
          paramDyTo + "/" +
          paramHistoryType,
        ''
      )
      if (list == null || list.length == 0) {
        return []
      }
      list.forEach(data => {
        delete data['sensorHistoryId']
      })
      return list
    },
    async download() {
      this.temperatureHistoryData = await this.dataDownload()
      if (this.temperatureHistoryData == null || this.temperatureHistoryData.length == 0) {
        return
      }
      HtmlUtil.fileDL(
        "temperatureHistory.csv",
        Util.converToCsv(this.temperatureHistoryData),
        getCharSet(this.$store.state.loginId)
      )
    },
    ...mapMutations([
      'replace', 
    ]),
    ...mapMutations('monitor', [
      'replaceMonitor', 
    ]),
  }
}
</script>

<style scoped lang="scss">
</style>
