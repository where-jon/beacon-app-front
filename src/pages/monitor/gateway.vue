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
            <td>{{ gateway.num }}</td>
            <td>{{ gateway.deviceid }}</td>
            <td>{{ gateway.updated }}</td>
            <td v-if="getGatewayState(gateway.timestamp) === gatewayState.NORMAL">
              <span class="badge badge-pill" :style="{backgroundColor: gatewayState.NORMAL}">{{ $i18n.t('label.receiveNormal') }}</span>
            </td>
            <td v-else-if="getGatewayState(gateway.timestamp) === gatewayState.MALFUNCTION">
              <span class="badge badge-pill" :style="{backgroundColor: gatewayState.MALFUNCTION}">{{ $i18n.t('label.malfunction') }}</span>
            </td>
            <td v-else-if="getGatewayState(gateway.timestamp) === gatewayState.NOTRECEIVE">
              <span class="badge badge-pill" :style="{backgroundColor: gatewayState.NOTRECEIVE}">{{ $i18n.t('label.notReceive') }}</span>
            </td>
            <td v-else>
              <span class="badge badge-pill" :style="{backgroundColor: gatewayState.UNDETECT}">{{ $i18n.t('label.undetect') }}</span>
            </td>
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
import { EXB, DISP, APP, GATEWAY } from '../../sub/constant/config'
import breadcrumb from '../../components/breadcrumb.vue'
import { getTheme } from '../../sub/helper/ThemeHelper'
import reloadmixinVue from '../../components/reloadmixin.vue'
import moment from 'moment'
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
      labelState: this.$i18n.t('label.state'),
      labelReceiveNormal: this.$i18n.t('label.receiveNormal'),
      labelMalfunction: this.$i18n.t('label.malfunction'),
      gatewayState: GATEWAY.STATE_COLOR
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
        console.log(gateways)
        if (payload && payload.done) {
          payload.done()
        }
        const currentTime = new Date().getTime()
        gateways = gateways.map((e) => {
          const timestamp = formattedDateToDatetime(e.updated)
          const state = currentTime - timestamp < GATEWAY.MALFUNCTION ? this.labelReceiveNormal: this.labelMalfunction
          return { ...e, state: state }
        })
        this.replaceMonitor({gateways})
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
      this.isLoad = false
    },
    isUndetect(updated) {
      if (updated == null) {
        return false
      }
      return updated == "" || new Date().getTime() - updated > APP.UNDETECT_TIME
    },
    getTableHeaders() {
      return !this.isDev ? [this.labelNo,this.labelDeviceId,this.labelTimestamp,this.labelState]
      : [this.labelNo,'deviceid','updated','state']
    },
    getGatewayState(updated) {
      // 未検知
      if (this.isUndetect(updated)) {
        return this.gatewayState.UNDETECT
      }
      const time = new Date().getTime() - new Date(updated).getTime()
      if (time < GATEWAY.MALFUNCTION) {
        return this.gatewayState.NORMAL
      }
      if (time < GATEWAY.NOTRECEIVE) {
        return this.gatewayState.MALFUNCTION
      }
      if (time < GATEWAY.UNDETECT) {
        return this.gatewayState.NOTRECEIVE
      }
    },
    download() {
      console.log(Util.converToCsv(this.gateways))
      HtmlUtil.fileDL("gateway.csv", Util.converToCsv(this.gateways), getCharSet(this.$store.state.loginId))
    },
  }
}

export const formattedDateToDatetime = (formatted) => {
  return moment(formatted.replace('/', '-').replace('/','-').replace(' ', 'T'))
  .toDate().getTime()
}
</script>

<style scoped lang="scss">
span.badge.badge-pill {
  color: white;
  font-size: 0.9rem;
}
</style>