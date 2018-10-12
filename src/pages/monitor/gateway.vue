<template>
  <div>
    <breadcrumb :items="items" :reload="true" :isLoad="isLoad" @reload="fetchData" />
    <div class="container" v-show="!isLoad">
      <b-row align-h="end">
        <b-col md="2" class="mb-3 mr-3">
          <b-button :variant="theme" @click="download()" v-t="'label.download'" />
        </b-col>
      </b-row>
      <table class="table table-hover table-bordered">
        <thead>
          <tr>
            <th scope="col" v-for="(val, key) in getTableHeaders()" :key="key" >{{ val }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(gateway, index) in gateways" :key="index" :class="{undetect: isUndetect(gateway.updated)}">
            <td scope="row" v-for="(val, key) in gateway" :key="key" >{{ val }}</td>
          </tr>
        </tbody>
      </table>
    </div>
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
          text: this.$i18n.t('label.monitor'),
          active: true
        },
        {
          text: this.$i18n.t('label.gateway'),
          active: true
        }
      ],
      isLoad: false,
      labelNo: this.$i18n.t('label.no'),
      labelDeviceId: this.$i18n.t('label.deviceId'),
      labelTimestamp: this.$i18n.t('label.final-receive-timestamp'),
    }
  },
  props: {
    isDev: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    theme () {
      const theme = getTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    ...mapState('monitor', [
      'gateways',
    ])
  },
  mounted() {
    this.fetchData()
    this.replace({title: this.$i18n.t('label.gateway')})
    if (!this.isDev) {
      return
    }
    this.items = [
      {
        text: this.$i18n.t('label.develop'),
        active: true
      },
      {
        text: this.$i18n.t('label.gateway'),
        active: true
      }
    ]
  },
  methods: {
    async fetchData(payload) {
      this.replace({showProgress: true})
      this.isLoad = true
      try {
        let gateways = await EXCloudHelper.fetchGateway()
        if (payload && payload.done) {
          payload.done()
        }
        console.log(gateways[0])
        this.replaceMonitor({gateways})
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
      this.isLoad = false
    },
    isUndetect(updated) {
      if ((typeof updated) === 'undefined') {
        return false
      }
      return updated == "" || new Date() - new Date(updated) > APP.UNDETECT_TIME
    },
    getTableHeaders() {
      return !this.isDev ? [this.labelNo,this.labelDeviceId,this.labelTimestamp] : [this.labelNo,'deviceid','updated']
    },
    download() {
      HtmlUtil.fileDL("gateway.csv", Util.converToCsv(this.gateways), getCharSet(this.$store.state.loginId))
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