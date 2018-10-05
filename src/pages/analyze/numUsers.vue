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
            <th scope="col">{{ $i18n.t('label.numOfUsers') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(numUser, index) in numUsers" :key="index" :class="{undetect: isUndetect(numUser.updated)}">
            <td scope="row">{{ numUser.zoneCategoryName }}</td>
            <td>{{ numUser.zoneName }}</td>
            <td>{{ numUser.numUse }}</td>
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
          text: this.$i18n.t('label.numUsers'),
          active: true
        }
      ]
    }
  },
  computed: {
    analyzeMonthOptions() {
      return [
        {label: "2018/10", value: 201810 },
        {label: "2018/09", value: 201809 },
        {label: "2018/08", value: 201808 },
        {label: "2018/07", value: 201807 },
        {label: "2018/06", value: 201806 },
        {label: "2018/05", value: 201805 },
        {label: "2018/04", value: 201804 },
      ]
    },
    analyzeDayOptions() {
      return [
        {label: " ", value: 0 },
        {label: "1", value: 1 },
        {label: "2", value: 2 },
        {label: "3", value: 3 },
        {label: "4", value: 4 },
        {label: "5", value: 5 },
        {label: "6", value: 6 },
        {label: "7", value: 7 },
        {label: "8", value: 8 },
        {label: "9", value: 9 },
        {label: "10", value: 10 },
        {label: "11", value: 11 },
        {label: "12", value: 12 },
        {label: "13", value: 13 },
        {label: "14", value: 14 },
        {label: "15", value: 15 },
        {label: "16", value: 16 },
        {label: "17", value: 17 },
        {label: "18", value: 18 },
        {label: "19", value: 19 },
        {label: "20", value: 20 },
        {label: "21", value: 21 },
        {label: "22", value: 22 },
        {label: "23", value: 23 },
        {label: "24", value: 24 },
        {label: "25", value: 25 },
        {label: "26", value: 26 },
        {label: "27", value: 27 },
        {label: "28", value: 28 },
        {label: "29", value: 29 },
        {label: "30", value: 30 },
        {label: "31", value: 31 },
      ]
    },
    getTheme () {
      const theme = getTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    ...mapState('monitor', [
      'numUsers',
    ])
  },
  mounted() {
    this.fetchData()
    this.replace({title: this.$i18n.t('label.numUsers')})
  },
  created(){
    EventBus.$on('reload', (payload)=>{
       this.fetchData(payload)
    })
  },
  methods: {
    async fetchData(payload) {
      try {
        let numUsers = await AppServiceHelper.fetchList2(
          'numUsers', '/office/numUsers', 'numOfUsers'
        )
        if (payload && payload.done) {
          payload.done()
        }
        this.replaceMonitor({numUsers})
      }
      catch(e) {
        console.error(e)
      }
    },
    isUndetect(updated) {
      return false
    },
    download() {
      HtmlUtil.fileDL("numUsers.csv", Util.converToCsv(this.numUsers))
    },
    ...mapMutations([
      'replace', 
    ]),
    ...mapMutations('monitor', [
      'replaceMonitor', 
    ]),
    async search() {
      let anaMonth = this.analyzeMonth.value
      let numUsers = await AppServiceHelper.fetchList2(
        'numUsers',
        '/office/numUsers/' + anaMonth,
        'numOfUsers'
      )
      this.replaceMonitor({numUsers})
    },
  }
}
</script>

<style scoped lang="scss">
</style>
