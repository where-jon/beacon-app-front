<template>
  <div class="container">
    <h2 class="display-5" v-t="'label.telemetry'"></h2>
    <p></p>
    <b-row align-h="end">
      <b-col md="2" class="mb-2 mr-3">
        <b-button variant='outline-primary' @click="download()" v-t="'label.download'" />
      </b-col>
    </b-row>
    <table class="table table-hover table-responsive">
      <thead>
        <tr>
          <th scope="col" v-for="(val, key) in telemetrys[0]" :key="key" >{{ key }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(telemetry, index) in telemetrys" :key="index" :class="{undetect: isUndetect(telemetry.timestamp)}">
          <td scope="row" v-for="(val, key) in telemetry" :key="key" >{{ val }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import { EventBus } from '../../sub/helper/EventHelper'
import { EXB, DISP, APP } from '../../sub/constant/config'

export default {
  computed: {
    ...mapState('monitor', [
      'telemetrys',
    ])
  },
  mounted() {
    this.fetchData()
  },
  created(){
    EventBus.$on('reload', (payload)=>{
       this.fetchData(payload)
    })
  },
  methods: {
    async fetchData(payload) {
      try {
        let telemetrys = await EXCloudHelper.fetchTelemetry()
        if (payload && payload.done) {
          payload.done()
        }
        this.replaceMonitor({telemetrys})
      }
      catch(e) {
        console.error(e)
      }
    },
    isUndetect(updated) {
      return updated == "" || new Date() - new Date(updated) > APP.UNDETECT_TIME
    },
    download() {
      HtmlUtil.fileDL("telemetry.csv", Util.converToCsv(this.telemetrys))
    },
    ...mapMutations('monitor', [
      'replaceMonitor', 
    ]),
  }
}
</script>

<style scoped lang="scss">

</style>