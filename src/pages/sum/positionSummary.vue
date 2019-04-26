<template>
  <div>
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <alert :message="message" />

      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row class="mr-3">
            <label v-t="'label.date'" class="mr-2 mb-2 d-flex align-items-center" />
            <date-picker v-model="form.date" type="date" value-format="yyyyMMdd" class="mr-2 mb-2 inputdatefrom" @change="pickerChanged" />
          </b-form-row>
        </b-form-group>
      </b-form>
      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row class="mb-3">
            <b-button v-if="!iosOrAndroid" v-t="'label.download'" :variant="theme" class="ml-2" @click="download" />
          </b-form-row>
        </b-form-group>
      </b-form>
      <slot />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import { getTheme } from '../../sub/helper/ThemeHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as ViewHelper from '../../sub/helper/ViewHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import alert from '../../components/parts/alert.vue'
import { getCharSet } from '../../sub/helper/CharSetHelper'
import moment from 'moment'
import validatemixin from '../../components/mixin/validatemixin.vue'
import commonmixinVue from '../../components/mixin/commonmixin.vue'
import * as HttpHelper from '../../sub/helper/HttpHelper'
import { APP } from '../../sub/constant/config'

export default {
  components: {
    breadcrumb,
    alert,
    DatePicker,
  },
  mixins: [validatemixin, commonmixinVue],
  data () {
    return {
      form: {
        date: '',
      },
      items: ViewHelper.createBreadCrumbItems('sumTitle', 'positionSummary'),
      message: '',
    }
  },
  computed: {
    theme () {
      return 'outline-' + getTheme()
    },
    ...mapState('app_service', [
      'txs',
      'exbs',
    ]),
    iosOrAndroid() {
      return Util.isAndroidOrIOS()
    },
  },
  async created() {
    await StateHelper.load('txs')
    await StateHelper.load('exbs')
    this.form.date = moment().add(-1, 'days').format('YYYYMMDD')
  },
  async mounted() {
    HtmlUtil.importElementUI()
    window.addEventListener('resize', () => {
      this.$forceUpdate()
    })
  },
  methods: {
    validate() {
      const errors = this.validateCheck([
        {type: 'require', names: ['date'], values: [this.form.date]},
      ].filter((val) => val && val.names.length >= 1))
      return this.formatValidateMessage(errors)
    },
    async download(){
      const param = _.cloneDeep(this.form)
      
      if (!param.date || param.date == '') {
        this.message = this.$i18n.tnl('message.pleaseEnterSearchCriteria')
        this.replace({showAlert: true})
        return
      }

      param.date = moment(param.date).format('YYYYMMDD')
      const url = '/core/positionHistory/summary/' + param.date + '/' + APP.POSITION_SUMMARY_INTERVAL
      const posData = await HttpHelper.getAppService(url)
      if (_.isEmpty(posData)) {
        this.message = this.$i18n.t('message.listEmpty')
        this.replace({showAlert: true})
        return
      }

      const txList = this.txs.map(tx => tx.txId).sort()
      const header = 'Time,' + txList.join(',')
      const searchDate = moment(param.date).format('YYYY-MM-DD')

      let csvList = []
      for(let h = APP.POSITION_SUMMARY_START; h <= APP.POSITION_SUMMARY_END; h++){
        for(let m = 0; m < 60; m += APP.POSITION_SUMMARY_INTERVAL){
          let csv = []
          csv.push(h + ':' + Util.zeroPad(m, 2) )
          txList.forEach(tx => {
            const timestamp = '' + (h >= 10 ? h :  h + '0') + (m >= 10 ? m : m + '0')
            const pos = _.find(posData, (data) => data.tx_id == tx && data.timestamp == timestamp)
            const exb = _.find(this.exbs, exb => pos && pos.exb_id == exb.exbId)
            csv.push(exb ? exb.locationName : '')
          })
          csvList.push(csv.join(','))
          if(h == APP.POSITION_SUMMARY_END){
            break
          }
        }
      }
      const csv = header + '\n' + csvList.join('\n')

      HtmlUtil.fileDL(
        'PositionSummary_' + searchDate + '.csv',
        csv,
        getCharSet(this.$store.state.loginId)
      )
    },
    pickerChanged() {
      const param = _.cloneDeep(this.form)
      const isError = param.date == '' ? true: moment(param.date).isAfter(moment().endOf('months'))? true: false
      if (isError) {
        this.message = this.$i18n.terror('message.invalid', {target: this.$i18n.tnl('label.date')})
        this.replace({showAlert: true})
        return
      } else {
        this.replace({showAlert: false})
      }
    }
  }
}
</script>

<style scoped lang="scss">
.inputSelect {
  min-width: 160px;
}
.inputdatefrom {
  width: 210px;
}
</style>
