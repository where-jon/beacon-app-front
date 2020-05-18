<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" :extra-nav-spec="extraNavSpec"
                :reload="reload" :short-name="shortName"
    />
    <alert v-model="showDismissibleAlert" :message="message" :fix="fixHeight" :prohibit="showDismissibleAlert" :prohibit-view="isProhibitView" :alert-style="alertStyle" />
    <m-list :params="params" :total-rows="totalRows" :list="positionList" :alert-force-hide="true" :use-detail-filter="useDetailFilter" />
  </div>
</template>

<script>
import { APP, DISP } from '../../sub/constant/config'
import { EXTRA_NAV, ALERT_STATE } from '../../sub/constant/Constants'
import * as ArrayUtil from '../../sub/util/ArrayUtil'
import * as Util from '../../sub/util/Util'
import * as MenuHelper from '../../sub/helper/dataproc/MenuHelper'
import * as PositionHelper from '../../sub/helper/domain/PositionHelper'
import * as TxDetailHelper from '../../sub/helper/domain/TxDetailHelper'
import * as ProhibitHelper from '../../sub/helper/domain/ProhibitHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import reloadmixin from '../../components/mixin/reloadmixin.vue'
import mList from '../../components/page/list.vue'
import alert from '../../components/parts/alert.vue'

export default {
  components: {
    breadcrumb,
    mList,
    alert,
  },
  mixins: [reloadmixin],
  data() {
    return {
      fixHeight: DISP.THERMOH.ALERT_FIX_HEIGHT,
      isProhibitView:true,
      alertForceHide:true,
      params: {
        name: 'position-list',
        id: 'positionListId',
        fields: ViewHelper.addLabelByKey(this.$i18n, [
          APP.TX.BTX_MINOR == 'minor' ? {key: 'minor', label: 'minor', sortable: true, tdClass: 'action-rowdata' }: null,
          APP.TX.BTX_MINOR != 'minor' ? {key: 'btxId', label: 'btxId', sortable: true, tdClass: 'action-rowdata' }: null,
          APP.TX.BTX_MINOR == 'both' ? {key: 'minor', label:'minor', sortable: true, tdClass: 'action-rowdata' }: null,
          ArrayUtil.includesIgnoreCase(APP.POT.WITH, 'potCd') ? {key: 'potCd', label: 'potCd', sortable: true, tdClass: 'action-rowdata'} : null,
          {key: 'potName', label: 'name', sortable: true, tdClass: 'action-rowdata'},
          ArrayUtil.includesIgnoreCase(APP.POS_LIST.WITH, 'tel')? {key: 'tel', sortable: true, tdClass: 'action-rowdata' }: null,
          ArrayUtil.includesIgnoreCase(APP.POS_LIST.WITH, 'presenceStatus')? {key: 'presenceStatus', sortable: true, tdClass: 'action-rowdata' }: null,
          MenuHelper.useMaster('category') && APP.POS.WITH.CATEGORY ? {key: 'categoryName', label: 'category', sortable: true, tdClass: 'action-rowdata'} : null,
          MenuHelper.useMaster('group') && APP.POS.WITH.GROUP ? {key: 'groupName', label: 'group', sortable: true, tdClass: 'action-rowdata'} : null,
          {key: 'state', sortable: true, tdClass: 'action-rowdata'},
          APP.POSITION_WITH_AREA ? {key: 'areaName', label: 'area', sortable: true, tdClass: 'action-rowdata'} : null,
          {key: 'locationName', label: 'finalReceiveLocation', sortable: true, tdClass: 'action-rowdata'},
          {key: 'updatetime', label: 'finalReceiveTimestamp', sortable: true, filterable: false, tdClass: 'action-rowdata'},
          // {key: 'powerLevel', label: 'powerLevel', tdClass: 'action-rowdata', 'class': 'text-md-center'},
          ArrayUtil.includesIgnoreCase(APP.POS_LIST.WITH, 'mapDisplay')? {key: 'mapDisplay', tdClass: 'action-rowdata'}: null,
        ]),
        extraFilter: _(['detectState',
          MenuHelper.useMaster('group') && APP.POS.WITH.GROUP? 'group' : null,
          MenuHelper.useMaster('category') && APP.POS.WITH.CATEGORY? 'category' : null,
          APP.POSITION_WITH_AREA? 'area' : null]).compact().value(),
        disableTableButtons: true,
      },
      totalRows: 0,
      breadCrumbs: ViewHelper.createBreadCrumbItems('main', 'positionList'),
      message: '',
      extraNavSpec: EXTRA_NAV,
      shortName: this.$i18n.t('label.positionListShort'),
      reload: true,
      prohibitDetectList : null,
      showDismissibleAlert: false,
      count: 0, // mockテスト用
      positionList: [],
      lasteFetched: 0,
    }
  },
  computed: {
    alertStyle(){
      return {
        'font-weight': DISP.THERMOH.ALERT_WEIGHT,
      }
    },
    useDetailFilter(){
      return APP.POS.PLUGIN.FILTER
    },
  },
  methods: {
    async fetchData(payload) {
      try {
        let now = new Date().getTime()
        if (now - this.lasteFetched < 100) { // IEで2回リクエストを送ってしまう問題への対応
          return
        }
        this.lasteFetched = now
        this.replace({showAlert: false})
        this.showProgress()
        await PositionHelper.loadPosition(0, true)
        let positions = PositionHelper.filterPositions(undefined, true)
        Util.debug('after filter', positions)

        const minorMap = {}
        await this.loadProhibitDetect(minorMap) // 非同期が望ましいが、一覧のblinkingのため、同期で取得（持出検知に閾値を設定している場合性能劣化）

        positions = positions.map(pos => {
          let prohibitCheck = minorMap[pos.minor] != null
          let presenceStatus
          if (APP.POS.WITH.PRESENCE) {
            presenceStatus = this.$i18n.tnl('label.' + TxDetailHelper.getPresenceKey(pos))
          }

          return { // データが多くオブジェクトの階層が深く・循環しているとIEが固まるため、最小限のデータにする
            minor: pos.minor,
            btxId: pos.btxId,
            state:  pos.state,
            detectState:  pos.detectState,
            updatetime: pos.updatetime,
            noSelectedTx: pos.noSelectedTx,
            // powerLevel: this.getPowerLevel(pos),
            txId: Util.v(pos, 'tx.txId'),
            potCd: Util.v(pos, 'tx.pot.potCd'),
            tel: Util.v(pos, 'tx.pot.extValue.tel'),
            locationName: Util.v(pos, 'exb.location.locationName'),
            potName: Util.v(pos, 'tx.pot.potName'),
            areaName: Util.v(pos, 'exb.location.area.areaName'),
            groupName: Util.v(pos, 'tx.pot.group.groupName'),
            categoryName: Util.v(pos, 'tx.pot.category.categoryName'),
            presenceStatus,
            // 追加フィルタ用
            groupId: Util.v(pos, 'tx.pot.group.groupId'),
            categoryId: Util.v(pos, 'tx.pot.category.categoryId'),
            areaId: Util.v(pos, 'exb.location.areaId'),
            blinking : prohibitCheck? 'blinking' : null,
            isDisableArea: Util.v(pos, 'exb.location.isAbsentZone', false),
            exb: {
              location: {
                areaId: Util.v(pos, 'exb.location.areaId')
              }
            }
          }
        })
        this.totalRows = positions.length
        this.positionList = positions
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.hideProgress()
    },
    async loadProhibitDetect(minorMap) {
      if (Util.hasValueAny(APP.POS.PROHIBIT_GROUP_ZONE, APP.POS.LOST_GROUP_ZONE)) {
        clearInterval(this.prohibitInterval)  // 点滅クリア
        Util.merge(this, await ProhibitHelper.loadProhibitDetect(ALERT_STATE.LIST, this.stage, this.icons, this.zones))
        this.replace({showAlert: this.showDismissibleAlert})
        this.prohibitDetectList? this.prohibitDetectList.forEach((p) => minorMap[p.minor] = p) : null
      }
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
    async checkDetectedTx(txId) {
      //await this.fetchData()
      return _.some(this.positionList, (pos) => {
        return pos.txId == txId
            && !pos.noSelectedTx // TODO: 
      })
    }
  }
}
</script>

<style scoped lang="scss">

</style>
