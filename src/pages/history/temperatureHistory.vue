<template>
  <div>
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <b-row>
        <b-col md="8" offset-md="2">
          <b-form>
            <b-form-group>
              <label v-t="'label.zoneCategoryName'" />
              <v-select :options="categoryOptions" :on-change="categoryChange" required class="ml-2"></v-select>
            </b-form-group>
            <b-form-group>
              <label v-t="'label.zoneName'" />
              <v-select v-model="zone" :options="zoneOptions" required class="ml-2"></v-select>
            </b-form-group>
            <b-form-group>
              <label v-t="'label.historyDateFrom'" />
              <b-form-input type="date" required v-on:change="dateFromChange" />
              <label v-t="'label.historyDateTo'" />
              <b-form-input type="date" required v-on:change="dateToChange" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.temperatureHistoryType'" />
              <v-select :options="typeOptions" required class="ml-2"></v-select>
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
      categoryId: null,
      categoryList: [{label:"", value:null}],
      zone: null,
      zones: null,
      zoneList: [{label:"", value:null}],
      temperatureHistoryData: null,
      dateFrom: 0,
      dateTo: 0
    }
    
  },
  computed: {
    categoryOptions() {
      return this.categoryList
    },
    zoneOptions() {
      return this.zoneList
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
    async fetchCategory() {
      try {
        let categorys = await AppServiceHelper.fetchList2(
          '/basic/category',
          '/basic/category/',
          'categoryId'
        )
        this.categoryList = []
        categorys.forEach(elm => {
          if (elm.categoryType == 2) {
            this.categoryList.push({
              label: elm.categoryName,
              value: elm.categoryId/1
            })
          }
        })
      } catch(e) {
        console.error(e)
      }
    },
    async fetchZone() {
      try {
        this.zones = await AppServiceHelper.fetchList2(
          '/core/zone',
          '/core/zone',
          'zoneId'
        )
        this.zoneList = []
        this.zones.forEach(elm => {
          this.zoneList.push({
            label: elm.zoneName,
            value: elm.zoneId
          })          
        })
      } catch(e) {
        console.error(e)
      }
    },
    async fetchPrev() {
      await this.fetchCategory()
      await this.fetchZone()
    },
    categoryChange(val) {
      if (this.zones == null) return
      this.zoneList = []
      this.zones.forEach(elm => {
        this.zoneList.push({
          label: elm.zoneName,
          value: elm.zoneId
        })
      })
      this.categoryId = null
      this.zone = ""
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
    async dataDownload() {
      let paramCategoryId = (this.categoryId != null)?this.categoryId:0
      let paramZoneId = 0
      let paramExbId = 0
      let paramDyFrom = this.dateFrom
      let paramDyTo = this.dateTo
      let paramHistoryType = 0
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
        Util.converToCsv(this.temperatureHistoryData)
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
