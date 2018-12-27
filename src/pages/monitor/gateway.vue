<template>
  <div>
    <breadcrumb :items="items" :reload="true" :is-load="isLoad" @reload="fetchData" />
    <div v-show="!isLoad" class="container">
      <b-row align-h="end">
        <all-count :count="allCount" />
        <b-col md="2" class="mb-3 mr-3">
          <b-button v-t="'label.download'" v-if="!iosOrAndroid" :variant="getButtonTheme()" @click="download()" />
        </b-col>
      </b-row>
      <table class="table table-hover">
        <thead>
          <tr>
            <th v-for="(val, key) in getTableHeaders()" :key="key" scope="col">
              {{ val }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(gateway, index) in gateways" :key="index" :class="{undetect: isUndetect('gw', gateway.updated)}">
            <td>{{ gateway.num }}</td>
            <td>{{ gateway.deviceid }}</td>
            <td>{{ gateway.updated }}</td>
            <td>
              <span :class="getStateClass('gw', gateway.updated)">
                {{ getStateLabel('gw', gateway.updated) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixinVue from '../../components/mixin/commonmixin.vue'
import reloadmixinVue from '../../components/mixin/reloadmixin.vue'
import moment from 'moment'
import { getCharSet } from '../../sub/helper/CharSetHelper'
import allCount from '../../components/parts/allcount.vue'
import statusmixinVue from '../../components/mixin/statusmixin.vue'

export default {
  components: {
    breadcrumb,
    allCount,
  },
  mixins: [reloadmixinVue, commonmixinVue, statusmixinVue],
  props: {
    isDev: {
      type: Boolean,
      default: false
    }
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
      gateways: [],
      isLoad: false,
      labelNo: this.$i18n.t('label.no'),
      labelDeviceId: this.$i18n.t('label.deviceId'),
      labelTimestamp: this.$i18n.t('label.finalReceiveTimestamp'),
      labelState: this.$i18n.t('label.state'),
    }
  },
  computed: {
    allCount() {
      return this.gateways.length
    },
  },
  mounted() {
    this.fetchData()
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
      this.showProgress()
      this.isLoad = true
      try {
        let gateways = await EXCloudHelper.fetchGateway()
        if (payload && payload.done) {
          payload.done()
        }
        gateways = gateways.map((e) => {
          const state = this.getStateLabel('gw', e.timestamp)
          return { ...e, state: state }
        })
        this.gateways = gateways
      }
      catch(e) {
        console.error(e)
      }
      this.hideProgress()
      this.isLoad = false
    },
    getTableHeaders() {
      return !this.isDev ? [this.labelNo,this.labelDeviceId,this.labelTimestamp,this.labelState]
        : [this.labelNo,'deviceid','updated','state']
    },
    download() {
      let dldata = this.gateways.map((gw) => {
        const {updated, ...rest} = gw // updatedを除く
        Util.debug(updated)
        return rest
      })
      HtmlUtil.fileDL('gateway.csv', Util.converToCsv(dldata), getCharSet(this.$store.state.loginId))
    },
  }
}

export const formattedDateToDatetime = (formatted) => {
  return moment(formatted.replace('/', '-').replace('/','-').replace(' ', 'T'))
    .toDate().getTime()
}
</script>

<style scoped lang="scss">

td {
  word-break: break-all;
}

</style>