<template>
  <div>
    <breadcrumb :items="items" :reload="true" :isLoad="isLoad" @reload="fetchData" />
    <div class="container" v-show="!isLoad">
      <b-row align-h="end">
        <all-count :count="allCount" />
        <b-col md="2" class="mb-3 mr-3">
          <b-button v-if="!iosOrAndroid" :variant="getButtonTheme()" @click="download()" v-t="'label.download'" />
        </b-col>
      </b-row>
      <table class="table table-hover">
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
            <td>
              <span class="badge badge-pill" :style="{backgroundColor: getGatewayStateColor(gateway.timestamp)}">{{ $i18n.t('label.' + getGatewayState(gateway.timestamp)) }}</span>
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
import { EXB, DISP, APP } from '../../sub/constant/config'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import { getTheme } from '../../sub/helper/ThemeHelper'
import commonmixinVue from '../../components/mixin/commonmixin.vue'
import reloadmixinVue from '../../components/mixin/reloadmixin.vue'
import moment from 'moment'
import { getCharSet } from '../../sub/helper/CharSetHelper'
import allCount from '../../components/parts/allcount.vue'

export default {
  mixins: [reloadmixinVue, commonmixinVue ],
  components: {
    breadcrumb,
    allCount,
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
      gatewayState: DISP.GATEWAY.STATE_COLOR
    }
  },
  props: {
    isDev: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState('monitor', [
      'gateways',
    ]),
    allCount() {
      return this.gateways.length
    },
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
        const currentTime = new Date().getTime()
        gateways = gateways.map((e) => {
          const state = this.$i18n.t('label.' + this.getGatewayState(e.timestamp))
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
      return updated == "" || new Date().getTime() - updated > APP.GATEWAY.UNDETECT
    },
    getTableHeaders() {
      return !this.isDev ? [this.labelNo,this.labelDeviceId,this.labelTimestamp,this.labelState]
      : [this.labelNo,'deviceid','updated','state']
    },
    getGatewayStateColor(updated) {
      return DISP.GATEWAY.STATE_COLOR[this.getGatewayState(updated)]
    },
    getGatewayState(updated) {
      // 未検知
      if (this.isUndetect(updated)) {
        return 'undetect'
      }
      const time = new Date().getTime() - new Date(updated).getTime()
      if (time > APP.GATEWAY.NOTRECEIVE) {
        return 'notReceive'
      }
      if (time > APP.GATEWAY.MALFUNCTION) {
        return 'malfunction'
      }
      else {
        return 'receiveNormal'
      }
    },
    download() {
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