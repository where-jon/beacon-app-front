<template>
  <div>
    <breadcrumb :items="breadCrumbs" :reload="false" />
    <div>
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
            <b-button v-if="!iosOrAndroid && bulkReferenceable" v-t="'label.download'" :variant="theme" class="ml-2" @click="download" />
          </b-form-row>
        </b-form-group>
      </b-form>
      <slot />
    </div>
  </div>
</template>

<script>
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import moment from 'moment'
import { APP, DEV } from '../../sub/constant/config'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as StringUtil from '../../sub/util/StringUtil'
import { getCharSet } from '../../sub/helper/base/CharSetHelper'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import * as ValidateHelper from '../../sub/helper/dataproc/ValidateHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../../components/mixin/commonmixin.vue'
import alert from '../../components/parts/alert.vue'

export default {
  components: {
    DatePicker,
    breadcrumb,
    alert,
  },
  mixins: [commonmixin],
  data () {
    return {
      breadCrumbs: ViewHelper.createBreadCrumbItems('sumTitle', 'positionSummary'),
      form: {
        date: '',
      },
      message: '',
    }
  },
  async created() {
    this.form.date = DEV.DEFAULT_DATE != '' ? new Date(DEV.DEFAULT_DATE) : moment().add(-1, 'days').format('YYYYMMDD')
  },
  async mounted() {
    ViewHelper.importElementUI()
    window.addEventListener('resize', () => {
      this.$forceUpdate()
    })
  },
  methods: {
    validate() {
      const errors = ValidateHelper.validateCheck([
        {type: 'require', names: ['date'], values: [this.form.date]},
      ].filter((val) => val && val.names.length >= 1))
      return ValidateHelper.formatValidateMessage(errors)
    },
    async download(){
      const param = _.cloneDeep(this.form)
      
      if (!param.date || param.date == '') {
        this.message = this.$i18n.tnl('message.pleaseEnterSearchCriteria')
        this.replace({showAlert: true})
        return
      }

      this.showProgress()

      param.date = moment(param.date).format('YYYYMMDD')
      const url = '/core/positionHistory/summary/' + param.date + '/' + APP.POSITION_SUMMARY_INTERVAL + '/' + APP.POSITION_SUMMARY_RECEIVE_COUNT
      const posData = await HttpHelper.getAppService(url)
      if (_.isEmpty(posData)) {
        this.message = this.$i18n.t('message.listEmpty')
        this.replace({showAlert: true})
        this.hideProgress()
        return
      }

      let posMap = {}
      posData.forEach((pos) => posMap[pos.tx_id + ':' + pos.timestamp] = pos)

      let txsMap = {}
      const txsFiltered = this.txs.filter(tx => tx.minor != null)
      txsFiltered.forEach((t) => txsMap[parseInt(t.minor)] = t)

      const minorList = txsFiltered.map(tx => parseInt(tx.minor)).sort(tx => tx)
      const header = this.$i18n.tnl('label.time') + ',' + minorList.join(',')
      const searchDate = moment(param.date).format('YYYY-MM-DD')

      let csvList = []
      for(let h = APP.POSITION_SUMMARY_START; h <= APP.POSITION_SUMMARY_END; h++){
        for(let m = 0; m < 60; m += APP.POSITION_SUMMARY_INTERVAL){
          let csv = []
          csv.push(h + ':' + StringUtil.zeroPad(m, 2) )
          minorList.forEach(minor => {
            const timestamp = '' + h + (m >= 10 ? m : m + '0')
            const tx = txsMap[minor]
            const pos = posMap[tx.txId + ':' + timestamp]
            if(pos){
              const exb = this.exbIdMap[pos.exb_id]
              csv.push(exb ? exb.locationName : '')
            }else{
              csv.push('')
            }
          })
          csvList.push(csv.join(','))
          if(h == APP.POSITION_SUMMARY_END){
            break
          }
        }
      }
      const csv = header + '\n' + csvList.join('\n')

      this.hideProgress()

      BrowserUtil.fileDL(
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
@import "../../sub/constant/input.scss";
</style>
