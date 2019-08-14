<template>
  <div class="container-fluid">
    <breadcrumb :items="items" :extra-nav-spec="extraNavSpec"
                :reload="reload" :short-name="shortName"
    />
    <b-alert v-model="showDismissibleAlert" variant="danger" :style="alertStyle()" dismissible>
      {{ message }}
    </b-alert>
    <m-list :params="params" :list="positionList" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP, DISP } from '../../sub/constant/config'
import { EXTRA_NAV } from '../../sub/constant/Constants'
import * as ArrayUtil from '../../sub/util/ArrayUtil'
import * as Util from '../../sub/util/Util'
import * as MenuHelper from '../../sub/helper/dataproc/MenuHelper'
import * as PositionHelper from '../../sub/helper/domain/PositionHelper'
import * as ProhibitHelper from '../../sub/helper/domain/ProhibitHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import reloadmixin from '../../components/mixin/reloadmixin.vue'
import mList from '../../components/page/list.vue'

export default {
  components: {
    breadcrumb,
    mList,
  },
  mixins: [reloadmixin],
  data() {
    return {
      fix: DISP.THERMOH.ALERT_FIX_HEIGHT,
      params: {
        name: 'position-list',
        id: 'positionListId',
        fields: ViewHelper.addLabelByKey(this.$i18n, [
          APP.TX.BTX_MINOR == 'minor' ? {key: 'minor', label: 'minor', sortable: true, tdClass: 'action-rowdata' }: null,
          APP.TX.BTX_MINOR != 'minor' ? {key: 'btx_id', label: 'btxId', sortable: true, tdClass: 'action-rowdata' }: null,
          APP.TX.BTX_MINOR == 'both' ? {key: 'minor', label:'minor', sortable: true, tdClass: 'action-rowdata' }: null,
          ArrayUtil.includesIgnoreCase(APP.POT.WITH, 'potCd') ? {key: 'potCd', label: 'potCd', sortable: true, tdClass: 'action-rowdata'} : null,
          {key: 'potName', label: 'name', sortable: true, tdClass: 'action-rowdata'},
          ArrayUtil.includesIgnoreCase(APP.POS_LIST.WITH, 'tel')? {key: 'tel', sortable: true, tdClass: 'action-rowdata' }: null,
          MenuHelper.useMaster('category') && APP.POS.WITH.CATEGORY ? {key: 'categoryName', label: 'category', sortable: true, tdClass: 'action-rowdata'} : null,
          MenuHelper.useMaster('group') && APP.POS.WITH.GROUP ? {key: 'groupName', label: 'group', sortable: true, tdClass: 'action-rowdata'} : null,
          {key: 'state', sortable: true, tdClass: 'action-rowdata'},
          APP.POSITION_WITH_AREA ? {key: 'areaName', label: 'area', sortable: true, tdClass: 'action-rowdata'} : null,
          {key: 'locationName', label: 'finalReceiveLocation', sortable: true, tdClass: 'action-rowdata'},
          {key: 'updatetime', label: 'finalReceiveTimestamp', sortable: true, tdClass: 'action-rowdata'},
          // {key: 'powerLevel', label: 'powerLevel', tdClass: 'action-rowdata', 'class': 'text-md-center'},
          {key: 'mapDisplay', tdClass: 'action-rowdata'},
        ]),
        extraFilter: _(['detectState',
          MenuHelper.useMaster('group') && APP.POS.WITH.GROUP? 'group' : null,
          MenuHelper.useMaster('category') && APP.POS.WITH.CATEGORY? 'category' : null,
          APP.POSITION_WITH_AREA? 'area' : null]).compact().value(),
        initTotalRows: this.$store.state.app_service.positionList.length,
        disableTableButtons: true,
      },
      items: ViewHelper.createBreadCrumbItems('main', 'positionList'),
      message: '',
      extraNavSpec: EXTRA_NAV,
      shortName: this.$i18n.t('label.positionListShort'),
      reload: true,
      prohibitDetectList : null,
      showDismissibleAlert: false,
      count: 0, // mockテスト用
      loadStates: ['tx', 'exb', 'area'],
    }
  },
  computed: {
    ...mapState('app_service', [
      'txs',
      'areas',
      'exbs',
      'positionList',
      'prohibits',
      'lostZones',
    ]),
    fixAlert(){
      return this.fix > 0
    },
  },
  methods: {
    alertStyle(){
      return  this.fixAlert ? {height: `${25 * (this.fix + 1)}px`, 'overflow-y': 'auto','font-weight': DISP.THERMOH.ALERT_WEIGHT}:{}
    },
    async fetchData(payload) {
      try {
        this.showProgress()
        if (APP.POS.PROHIBIT_ALERT) {
          this.loadStates.push('prohibit')
        }
        if (APP.POS.LOST_ALERT) {
          this.loadStates.push('lostZones')
        }
        await Promise.all(this.loadStates.map(StateHelper.load))
        await PositionHelper.storePositionHistory(0, true)
        let positions = PositionHelper.getPositions(true)
        ProhibitHelper.setProhibitDetect('list', this)
        Util.debug(positions)

        let prohibitCheck = false
        const minorMap = {}

        this.prohibitDetectList? this.prohibitDetectList.forEach((p) => minorMap[p.minor] = p) : null

        const exbMap = {}
        this.exbs.forEach((e) => exbMap[e.posId] = e)

        positions = positions.map((pos) => {
          prohibitCheck = minorMap[pos.minor] != null

          const exb = exbMap[pos.pos_id]
          return {
            ...pos,
            // powerLevel: this.getPowerLevel(pos),
            txId: Util.getValue(pos, 'tx.txId' , null),
            potCd: Util.getValue(pos, 'tx.potCd', null),
            potName: Util.getValue(pos, 'tx.potName', null),
            tel: Util.getValue(pos, 'tx.extValue.tel', null),
            categoryName: Util.getValue(pos, 'tx.categoryName', null),
            groupName: Util.getValue(pos, 'tx.groupName', null),
            areaName: Util.getValue(pos, 'exb.areaName', null),
            locationName: Util.getValue(pos, 'exb.locationName', null),
            // 追加フィルタ用
            groupId: Util.getValue(pos, 'tx.groupId').val,
            categoryId: Util.getValue(pos, 'tx.categoryId').val,
            areaId: Util.getValue(pos, 'exb.areaId').val,
            blinking : prohibitCheck? 'blinking' : null,
            isDisableArea: exb? exb.isAbsentZone: false,
          }
        })
        Util.debug(positions)
        this.replaceAS({positionList: positions})
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.hideProgress()
    },
    // getPowerLevel(position){
    //   const batteryOpts = BATTERY_STATE.getTypes()
    //   const powerLevel = position.power_level
    //   if (!powerLevel) {
    //     return batteryOpts.find((val) => val.value === 4)
    //   } else if (powerLevel >= BATTERY_BOUNDARY.GOOD) {
    //     return batteryOpts.find((val) => val.value === 1)
    //   } else if (powerLevel >= BATTERY_BOUNDARY.WARNING) {
    //     return batteryOpts.find((val) => val.value === 2)
    //   } else {
    //     return batteryOpts.find((val) => val.value === 3)
    //   }
    // },
    async checkDetectedTx(tx) {
      //await this.fetchData()
      return _.some(this.positionList, (pos) => {
        return pos.tx && pos.tx.txId == tx.txId
            && !pos.noSelectedTx
      })
    }
  }
}
</script>

<style scoped lang="scss">

</style>
