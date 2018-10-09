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
      return pullDowns
    },
    analyzeDayOptions() {
      var pullDowns = []
      for (var idx = 0; idx <= 31; idx++) {
        pullDowns.push({
          label: "" + idx, value: idx
        })
      }
      return pullDowns
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
