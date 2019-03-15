<template>
  <div>
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <alert :message="message" />

      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row class="mr-3">
            <label v-t="'label.date'" class="mr-2 mb-2 d-flex align-items-center" />
            <date-picker v-model="form.date" type="date" value-format="yyyyMMdd" class="mr-2 mb-2 inputdatefrom" />
          </b-form-row>
        </b-form-group>
        <b-form-group>
          <b-form-row class="mb-3 mr-5">
            <label v-t="'label.group'" class="mr-2" />
            <b-form-select v-model="form.groupId" :options="groupOptions" class="mr-2 inputSelect" />
          </b-form-row>
        </b-form-group>
      </b-form>
      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row class="mb-3">
            <b-button v-t="'label.display'" type="submit" :variant="theme" @click="display" />
            <b-button v-if="!iosOrAndroid" v-t="'label.download'" :variant="theme" class="ml-2" @click="download" />
          </b-form-row>
        </b-form-group>
      </b-form>
      <slot />
      <b-row class="mt-3" />
      <b-table :items="viewList" :fields="fields" :current-page="currentPage" :per-page="perPage" :sort-by.sync="sortBy" stacked="md" striped hover outlined />
      <b-row>
        <b-col md="6" class="my-1">
          <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" class="my-0" />
        </b-col>
      </b-row>
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
import { APP } from '../../sub/constant/config'
import moment from 'moment'
import validatemixin from '../../components/mixin/validatemixin.vue'
import commonmixinVue from '../../components/mixin/commonmixin.vue'
import * as HttpHelper from '../../sub/helper/HttpHelper'

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
      viewList: [],
      items: ViewHelper.createBreadCrumbItems('sumTitle', 'stayRatio'),
      message: '',
      showChart: true,
      currentPage: 1,
      perPage: 20,
      sortBy: null,
      totalRows: 0,
      fields: ViewHelper.addLabelByKey(this.$i18n, [
        {key: 'name', sortable: true, label: 'potName'},
        {key: 'stayTime', sortable: true, label: 'stayTime'},
        {key: 'under30minLost', sortable: true, label: '30minAbsent'},
        {key: 'over30to90minLost', sortable: true, label: '30to90minAbsent'},
        {key: 'lostTime', sortable: true, label: 'lostTime'},
        {key: 'stayRatio', sortable: true, label: 'stayRatio'},
        {key: 'under30minLostRatio', sortable: true, label: '30minAbsentRatio'},
        {key: 'over30to90minLostRatio', sortable: true, label: '30to90minAbsentRatio'},
        {key: 'lostRatio', sortable: true, label: 'lostRatio'},
      ]),
    }
  },
  computed: {
    theme () {
      return 'outline-' + getTheme()
    },
    ...mapState('app_service', [
      'groups',
      'pots',
    ]),
    iosOrAndroid() {
      return Util.isAndroidOrIOS()
    },
  },
  async created() {
    await StateHelper.load('group')
    await StateHelper.load('pots')
    const nowDate = new Date()
    this.form.date = Util.getDatetime(nowDate, {nowDate: -3})
  },
  async mounted() {
    HtmlUtil.importElementUI()
  },
  methods: {
    validate() {
      const errors = this.validateCheck([
        {type: 'require', names: ['date'], values: [this.form.date]},
      ].filter((val) => val && val.names.length >= 1))
      return this.formatValidateMessage(errors)
    },
    async display() {
      this.container ? this.container.removeAllChildren() : null
      await this.displayImpl()
      this.stage ? this.stage.update() : null
    },
    async displayImpl(){
      this.replace({showAlert: false})
      this.showProgress()
      const param = _.cloneDeep(this.form)
      
      if (!param.date || param.date == '') {
        this.message = this.$i18n.tnl('message.pleaseEnterSearchCriteria')
        this.replace({showAlert: true})
        this.hideProgress()
        return
      }

      param.date = moment(param.date).format('YYYYMMDD')
      const groupBy = param.groupId? '&groupId=' + param.groupId: ''
      const url = '/office/stayTime/sumByDay/' + param.date + '/zoneCategory?from=' + APP.SUM_FROM + '&to=' + APP.SUM_TO + groupBy
      const sumData = await HttpHelper.getAppService(url)
      if (_.isEmpty(sumData)) {
        this.message = this.$i18n.t('message.listEmpty')
        this.replace({showAlert: true})
        this.hideProgress()
        return
      }

      this.viewList = this.getStayDataList(sumData, APP.SUM_ABSENT_LIMIT, APP.SUM_ABSENT_SUB_LIMIT, APP.SUM_LOST_LIMIT)
      
      this.hideProgress()
    },
    getStayDataList(stayData, absentLimit = 0, absentSubLimit = 0, lostLimit = APP.LOST_TIME) {
      return stayData.map((data) => {
        const potId = data.potId
        const potName = this.pots.find((pot) => pot.potId == data.potId).potName
        let stayTime = 0, under30minAbsentTime = 0, over30to90minAbsentTime = 0,
          lostTime = 0, presentRatio = 0, absentRatio = 0, absentRatioSub = 0, lostRatio = 0
        let isLostData = -1

        // 各時間の集計
        data.stayList.forEach((list) => {
          if (list.byId == isLostData) {
            lostTime += (absentLimit == 0 || list.period > lostLimit)? list.period: 0
            over30to90minAbsentTime += absentSubLimit != 0?
              (list.period > absentLimit) && (list.period <= absentSubLimit)? list.period: 0: 0
            under30minAbsentTime += list.period <= absentLimit? list.period: 0
          } else {
            stayTime += list.period
          }
        })
        presentRatio = Util.getRatio(stayTime)
        absentRatio = Util.getRatio(under30minAbsentTime)
        absentRatioSub = Util.getRatio(over30to90minAbsentTime)
        lostRatio = Util.getRatio(lostTime)

        // どこまでの時間を表示するか？（分にすらならない秒とか）決めて、GETメソッド作って流し込む
        return {
          id: potId, 
          name: potName, 
          stayTime: Util.convertToTime(stayTime), 
          under30minLost: Util.convertToTime(under30minAbsentTime), 
          over30to90minLost: Util.convertToTime(over30to90minAbsentTime),
          lostTime: Util.convertToTime(lostTime),
          stayRatio: presentRatio + ' %',
          under30minLostRatio: absentRatio + ' %',
          over30to90minLostRatio: absentRatioSub + ' %',
          lostRatio: lostRatio + ' %',
        }
      })
    },
    async download(){
      if (this.viewList == null || this.viewList.length == 0) {
        this.message = this.$i18n.tnl('message.notFound')
        this.replace({showAlert: true})
        return
      }
      HtmlUtil.fileDL(
        'stayRatio.csv',
        Util.converToCsv(this.viewList),
        getCharSet(this.$store.state.loginId)
      )
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
