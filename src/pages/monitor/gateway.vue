<template>
  <div class="container">
    <breadcrumb :items="items" />
    <p></p>
    <b-row align-h="end">
      <b-col md="2" class="mb-3 mr-3">
        <b-button variant='outline-primary' @click="download()" v-t="'label.download'" />
      </b-col>
    </b-row>
    <table class="table table-hover table-bordered">
      <thead>
        <tr>
          <th scope="col" v-for="(val, key) in gateways[0]" :key="key" >{{ key }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(gateway, index) in gateways" :key="index" :class="{undetect: isUndetect(gateway.updated)}">
          <td scope="row" v-for="(val, key) in gateway" :key="key" >{{ val }}</td>
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
import breadcrumb from '../../components/breadcrumb.vue'

export default {
  components: {
    breadcrumb,
  },
  data () {
    return {
      items: [
        {
          text: this.$i18n.t('label.monitor'),
          active: true
        },
        {
          text: this.$i18n.t('label.gateway'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('monitor', [
      'gateways',
    ])
  },
  mounted() {
    this.fetchData()
    this.replace({title: this.$i18n.t('label.gateway')})
  },
  created(){
    EventBus.$on('reload', (payload)=>{
       this.fetchData(payload)
    })
  },
  methods: {
    async fetchData(payload) {
      try {
        let gateways = await EXCloudHelper.fetchGateway()
        console.log({gateways})
        if (payload && payload.done) {
          payload.done()
        }
        this.replaceMonitor({gateways})
      }
      catch(e) {
        console.error(e)
      }
    },
    isUndetect(updated) {
      return updated == "" || new Date() - new Date(updated) > APP.UNDETECT_TIME
    },
    download() {
      HtmlUtil.fileDL("gateway.csv", Util.converToCsv(this.gateways))
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