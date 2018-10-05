<template>
  <div>
    <breadcrumb :items="items" :reload="true" />
    <div class="container">
      <p></p>
      <b-row>
        <b-form inline class="mt-2">
          <label class="mr-2">{{ $t('label.analyzeMonth') }}</label>
          <v-select v-model="analyzeMonth" :options="analyzeMonthOptions" required class="ml-2"></v-select>
          <label class="mr-2">{{ $t('label.analyzeDay') }}</label>
          <v-select :options="analyzeDayOptions" required class="ml-2"></v-select>
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

export default {
  components: {
    breadcrumb,
  },
  data () {
    return {
      items: [
        {
          text: this.$i18n.t('label.analyze'),
          active: true
        },
        {
          text: this.$i18n.t('label.utilizationRatio'),
          active: true
        }
      ],
      analyzeMonth: null
    }
  },
  computed: {
    analyzeMonthOptions() {
      return [
        {label: "2018年10月", value: 201810 },
        {label: "2018年09月", value: 201809 },
        {label: "2018年08月", value: 201808 },
        {label: "2018年07月", value: 201807 },
        {label: "2018年06月", value: 201806 },
        {label: "2018年05月", value: 201805 },
        {label: "2018年04月", value: 201804 },
      ]
    },
    analyzeDayOptions() {
      return [
        {label: " ", value: 0 },
        {label: "1日", value: 1 },
        {label: "2日", value: 2 },
        {label: "3日", value: 3 },
        {label: "4日", value: 4 },
        {label: "5日", value: 5 },
        {label: "6日", value: 6 },
        {label: "7日", value: 7 },
        {label: "8日", value: 8 },
        {label: "9日", value: 9 },
        {label: "10日", value: 10 },
        {label: "11日", value: 11 },
        {label: "12日", value: 12 },
        {label: "13日", value: 13 },
        {label: "14日", value: 14 },
        {label: "15日", value: 15 },
        {label: "16日", value: 16 },
        {label: "17日", value: 17 },
        {label: "18日", value: 18 },
        {label: "19日", value: 19 },
        {label: "20日", value: 20 },
        {label: "21日", value: 21 },
        {label: "22日", value: 22 },
        {label: "23日", value: 23 },
        {label: "24日", value: 24 },
        {label: "25日", value: 25 },
        {label: "26日", value: 26 },
        {label: "27日", value: 27 },
        {label: "28日", value: 28 },
        {label: "29日", value: 29 },
        {label: "30日", value: 30 },
        {label: "31日", value: 31 },
      ]
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
    this.fetchData()
    this.replace({title: this.$i18n.t('label.utilizationRatio')})
  },
  created(){
    EventBus.$on('reload', (payload)=>{
       this.fetchData(payload)
    })
  },
  methods: {
    async fetchData(payload) {
      try {
        let utilizationRatios = await AppServiceHelper.fetchList2('utilizationRatio', '/office/utilizationRatio', 'utilizationRatio')
        if (payload && payload.done) {
          payload.done()
        }
        this.replaceMonitor({utilizationRatios})
      }
      catch(e) {
        console.error(e)
      }
    },
    isUndetect(updated) {
      return false
    },
    download() {
      HtmlUtil.fileDL("utilizationRatio.csv", Util.converToCsv(this.utilizationRatios))
    },
    ...mapMutations([
      'replace', 
    ]),
    ...mapMutations('monitor', [
      'replaceMonitor', 
    ]),
    async search() {
      let anaMonth = this.analyzeMonth.value
      let utilizationRatios = await AppServiceHelper.fetchList2(
        'utilizationRatio',
        '/office/utilizationRatio/' + anaMonth,
        'utilizationRatio'
      )
      this.replaceMonitor({utilizationRatios})
    },
  }
}
</script>

<style scoped lang="scss">
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
