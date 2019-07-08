<template>
  <div>
    <breadcrumb :items="items" :reload="true" @reload="fetchData" />
    <div class="container">
      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row class="mb-3 mr-5">
            <label v-t="'label.category'" class="mr-2" />
            <b-form-select v-model="form.categoryType" :options="categoryTypeOptions" class="ml-2 inputSelect" />
          </b-form-row>
        </b-form-group>
      </b-form>
      <b-row class="mt-3" />
      <b-table :items="viewList" :fields="fields" :filter="filterGrid" stacked="md" striped hover outlined>
        <template slot="state" slot-scope="row">
          <div v-for="(state, index) in row.item.stateList" :key="index">
            {{ $i18n.tnl('label.' + state) }}
          </div>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../sub/constant/config'
import { CATEGORY, PROCESS_SUM } from '../../sub/constant/Constants'
import * as DateUtil from '../../sub/util/DateUtil'
import * as Util from '../../sub/util/Util'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import * as StateHelper from '../../sub/helper/dataprocess/StateHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import reloadmixin from '../../components/mixin/reloadmixin.vue'

export default {
  components: {
    breadcrumb,
  },
  mixins: [reloadmixin],
  data () {
    return {
      items: ViewHelper.createBreadCrumbItems('sumTitle', 'processSum'),
      fields: [],
      form: {
        categoryType: CATEGORY.THING,
      },
      viewList: [],
    }
  },
  computed: {
    ...mapState('app_service', [
      'pots',
    ]),
    ...mapState([
      'reload',
    ]),
    categoryTypeOptions(){
      return PROCESS_SUM.getTypes()
    },
  },
  async created() {
    await StateHelper.load('pots')
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    filterGrid(originItem){
      const potId = Util.getValue(originItem, 'potId', null)
      if(potId == null){
        return false
      }
      const target = this.pots.find(pot => potId == pot.potId)
      return target? target.potType == this.form.categoryType: false
    },
    isSuccessComplete(processPeriods){
      return Util.hasValue(processPeriods) && processPeriods[processPeriods.length - 1] >= APP.PROCESS_SUM.TIME.SUCCESS_COMPLETE
    },
    isNotSmooth(processPeriods){
      const notSmoothPeriods = processPeriods.find((processPeriod, index, ary) => {
        if(ary[index]){
          return false
        }
        for(let idx = index + 1; idx < ary.length; idx++){
          if(ary[idx]){
            return true
          }
        }
        return false
      })
      return Util.hasValue(notSmoothPeriods)
    },
    isLate(processPeriods){
      const lateData = processPeriods.find((processPeriod, index, ary) => {
        if(index == ary.length - 1){
          return false
        }
        return processPeriod > APP.PROCESS_SUM.TIME.LATE
      })
      return Util.hasValue(lateData)
    },
    getState(processSum){
      const processPeriods = Util.getValue(processSum, 'processPeriods', [])
      const successComplete = this.isSuccessComplete(processPeriods)
      const ret = []
      if(!successComplete){
        ret.push(PROCESS_SUM.PROCESSING)
      }
      if(this.isNotSmooth(processPeriods)){
        ret.push(PROCESS_SUM.NOT_SMOOTH)
      }
      if(this.isLate(processPeriods)){
        ret.push(PROCESS_SUM.LATE)
      }
      if(Util.hasValue(ret)){
        return ret
      }
      if(successComplete){
        ret.push(PROCESS_SUM.SUCCESS_COMPLETE)
      }
      return ret
    },
    getFields(response){
      const fields = [
        {key: 'minor', sortable: false, label: 'minor'},
        {key: 'potName', sortable: false, label: 'potName'},
      ]

      const zoneIds = Util.getValue(response, 'zoneIds', [])
      const zoneNames = Util.getValue(response, 'zoneNames', [])
      zoneIds.forEach((zoneId, idx) => fields.push(
        {key: idx.toString(), sortable: false, label: Util.getValue(zoneNames, idx.toString(), '')}
      ))

      return ViewHelper.addLabelByKey(this.$i18n, fields.concat([
        {key: 'totalTime', sortable: false, label: 'totalTime'},
        {key: 'state', sortable: false, label: 'state'},
        {key: 'dt', sortable: false, label: 'finalUpdateDate'},
      ]))
    },
    getData(response){
      return Util.getValue(response, 'processSumList', []).map(processSum => {
        const periods = {}
        Util.getValue(processSum, 'processPeriods', []).forEach((period, idx) => {
          periods[idx.toString()] = period? DateUtil.formatTime(period): '-'
        })
        const period = Util.getValue(processSum, 'period', 0)
        const stateList = this.getState(processSum)
        return {
          ...processSum,
          ...periods,
          totalTime: period? DateUtil.formatTime(period): '-',
          stateList: stateList.map(state => state.label),
          dt: DateUtil.formatDate(processSum.dt + period * 1000),
          _rowVariant: stateList.find(state => state.error)? 'danger': '',
        }
      })
    },
    async fetchData(payload){
      this.showProgress()
      const response = await HttpHelper.getAppService('/office/stayTime/processSum')
      this.fields = this.getFields(response)
      this.viewList = this.getData(response)
      this.replace({reload: false})
      if (payload && payload.done) {
        payload.done()
      }
      this.hideProgress()
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/input.scss";
</style>
