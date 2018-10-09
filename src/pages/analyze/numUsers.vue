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
