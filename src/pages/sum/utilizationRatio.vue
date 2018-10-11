<template>
  <div>
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <p></p>
      <b-row>
        <b-form inline>
          <label v-t="'label.zoneType'" />
          <v-select :options="categoryOptions" :on-change="categoryChange" class="vselectCategory"></v-select>
          <label v-t="'label.zoneName'" />
          <v-select v-model="zone" :options="zoneOptions" class="vselectZone"></v-select>
          <label v-t="'label.sumYearMonth'" />
          <v-select v-model="sumYearMonth" :options="sumYearMonthOptions" :on-change="sumYearMonthChange" class="vselectMonth"></v-select>
          <label v-t="'label.sumDay'" />
          <v-select v-model="sumDay" :options="sumDayOptions" class="vselectDay"></v-select>
          <b-button size="sm" variant="info" v-t="'label.search'" @click="search()"></b-button> 
        </b-form>
      </b-row>
      <b-row align-h="end">
        <b-col md="2" class="mb-3 mr-3">
          <b-button variant='outline-primary' @click="download()" v-t="'label.download'" />
        </b-col>
      </b-row>
      <table class="table table-hover table-bordered">
        <thead>
          <tr>
            <th scope="col">{{ $i18n.t('label.zoneCategoryName') }}</th>
            <th scope="col">{{ $i18n.t('label.zoneName') }}</th>
            <th scope="col">{{ $i18n.t('label.utilizationRatioP') }}</th>
            <th scope="col">{{ $i18n.t('label.utilizationTime') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(utilizationRatio, index) in utilizationRatios" :key="index" :class="{undetect: isUndetect(utilizationRatio.updated)}">
            <td>{{ utilizationRatio.zoneCategoryName }}</td>
            <td>{{ utilizationRatio.zoneName }}</td>
            <td>
              <div class="graph">
                <span class="bar" v-bind:style="{ width:utilizationRatio.rate + '%' }">
                  {{ utilizationRatio.rate }}%
                </span>
              </div>
            </td>
            <td>{{ utilizationRatio.cnt }}</td>
          </tr>
        </tbody>
      </table>
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
          text: this.$i18n.t('label.sumTitle'),
          active: true
        },
        {
          text: this.$i18n.t('label.utilizationRatio'),
          active: true
        }
      ],
      categoryId: null,
      categoryList: [{label:"", value:null}],
      zone: null,
      zones: null,
      zoneList: [{label:"", value:null}],
      sumYearMonth: null,
      sumDays: [{label:"", value:null}],
      sumDay: null,
      selectedYearMonth: null,
      dataList: null
    }
  },
  computed: {
    categoryOptions() {
      return this.categoryList
    },
    zoneOptions() {
      return this.zoneList
    },
    sumYearMonthOptions() {
      var today = new Date()
      var yyyy = today.getFullYear()
      var mm = today.getMonth() + 1
      var pullDowns = []
      for (var idx = 0; idx < 6; idx++) {
        pullDowns.push({
          label: yyyy + "/" + ("00" + mm).substr(-2),
          value: yyyy*100 + mm
        })
        mm--
        if (mm < 1) {
          mm = 12
          yyyy--;
        }
      }
      this.sumDays = []
      return pullDowns
    },
    sumDayOptions() {
      return this.sumDays
    },
    getTheme () {
      const theme = getTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    ...mapState('monitor', [
      'utilizationRatios',
    ])
  },
  mounted() {
    this.fetchPrev()
    this.replace({title: this.$i18n.t('label.utilizationRatio')})
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
    sumYearMonthChange(val) {
      if (val == null) {
        this.sumDays = []
        this.sumDay = null
        return
      }
      var year = val.value/100
      var month = val.value%100
      var lastDay = new Date(year, month, 0).getDate()
      var pullDowns = []
      for (var idx = 1; idx <= lastDay; idx++) {
        pullDowns.push({
          label: "" + idx, value: idx
        })
      }
      this.selectedYearMonth = val.value
      this.sumDays = pullDowns
    },
    isUndetect(updated) {
      return false
    },
    download() {
      if (this.dataList == null) return
      if (this.dataList.length == 0) return
      HtmlUtil.fileDL(
        "utilizationRatio.csv",
        Util.converToCsv(this.dataList)
      )
    },
    ...mapMutations([
      'replace', 
    ]),
    ...mapMutations('monitor', [
      'replaceMonitor', 
    ]),
    async search() {
      if (this.selectedYearMonth == null) return
      let utilizationRatios = await AppServiceHelper.fetchList2(
        'utilizationRatio',
        '/office/utilizationRatio/' + this.selectedYearMonth,
        'utilizationRatio'
      )
      this.dataList = utilizationRatios
      this.replaceMonitor({utilizationRatios})
    },
  }
}

</script>

<style scoped lang="scss">
.vselectCategory {
  width:200px;
  margin-left: 5px;
  margin-right: 20px;
}
.vselectZone {
  width:120px;
  margin-left: 5px;
  margin-right: 20px;
}
.vselectMonth {
  width:120px;
  margin-left: 5px;
  margin-right: 20px;
}
.vselectDay {
  width: 120px;
  margin-left: 5px;
  margin-right: 20px;
}
.graph {
    position: relative;
    width: 150px;
    border: 0px solid #000;
    padding: 3px;
}
.graph .bar {
    display: block;
    position: relative;
    background: #60A9A9;
    text-align: center;
    color: #0f0000;
    height: 1.5em;
    line-height: 1.4em;
}
.graph .bar span { position: absolute; left: 1em; }
</style>
