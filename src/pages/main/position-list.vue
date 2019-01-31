<template>
  <div>
    <breadcrumb :items="items" :extra-nav-spec="extraNavSpec"
                :reload="reload" :short-name="shortName"
    />
    <m-list :params="params" :list="positionList" />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import mList from '../../components/page/list.vue'
import listmixinVue from '../../components/mixin/listmixin.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import * as PositionHelper from '../../sub/helper/PositionHelper'
import { addLabelByKey } from '../../sub/helper/ViewHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as MenuHelper from '../../sub/helper/MenuHelper'
import { /*BATTERY_STATE, BATTERY_BOUNDARY,*/ EXTRA_NAV } from '../../sub/constant/Constants'
import * as Util from '../../sub/util/Util'
import { APP } from '../../sub/constant/config.js'

export default {
  components: {
    mList,
    breadcrumb,
  },
  mixins: [
    listmixinVue,
    showmapmixin,
  ],
  data() {
    return {
      params: {
        name: 'position-list',
        id: 'positionListId',
        extraFilter: _(['detectState',
          MenuHelper.useMaster('group')? 'group' : null,
          MenuHelper.useMaster('category')? 'category' : null,
          APP.POSITION_WITH_AREA ? 'area' : null]).compact().value(),
        disableTableButtons: true,
        fields: addLabelByKey(this.$i18n, [ 
          !APP.TX_WITH_TXID && APP.TX_BTX_MINOR == 'minor' ? 
            {key: 'minor', label: 'minor', sortable: true, tdClass: 'action-rowdata' }: null,
          APP.TX_WITH_TXID ? {key: 'txId', label: 'txId', sortable: true, tdClass: 'action-rowdata' }: null,
          APP.TX_BTX_MINOR != 'minor' ? {key: 'btx_id', label: 'btxId', sortable: true, tdClass: 'action-rowdata' }: null,
          APP.TX_WITH_TXID || APP.TX_BTX_MINOR != 'btxId' ?
            {key: 'minor', label:'minor', sortable: true, tdClass: 'action-rowdata' }: null,
          APP.POT_WITH_POTCD ? {key: 'potCd', label: 'potCd', sortable: true, tdClass: 'action-rowdata'} : null,
          {key: 'potName', label: 'name', sortable: true, tdClass: 'action-rowdata'},
          MenuHelper.useMaster('group') && APP.POT_WITH_GROUP ? {key: 'groupName', label: 'group', sortable: true, tdClass: 'action-rowdata'} : null,
          {key: 'state', sortable: true, tdClass: 'action-rowdata'},
          APP.POSITION_WITH_AREA ? {key: 'areaName', label: 'area', sortable: true, tdClass: 'action-rowdata'} : null,
          {key: 'locationName', label: 'finalReceiveLocation', sortable: true, tdClass: 'action-rowdata'},
          {key: 'updatetime', label: 'finalReceiveTimestamp', sortable: true, tdClass: 'action-rowdata'},
          // {key: 'powerLevel', label: 'powerLevel', tdClass: 'action-rowdata', 'class': 'text-md-center'},
          {key: 'mapDisplay', tdClass: 'action-rowdata'},
        ]),
        initTotalRows: this.$store.state.app_service.positionList.length,
      },
      count: 0, // mockテスト用
      items: [
        {
          text: this.$i18n.t('label.main'),
          active: true
        },
        {
          text: this.$i18n.t('label.positionList'),
          active: true
        }
      ],
      reload: true,
      shortName: this.$i18n.t('label.positionListShort'),
      extraNavSpec: EXTRA_NAV,
    }
  },
  computed: {
    ...mapState('app_service', [
      'txs',
      'areas',
      'exbs',
      'positionList',
    ]),
  },
  methods: {
    ...mapActions('main', [
      'pushOrgPositions',
    ]),
    async fetchData(payload) {
      try {
        this.showProgress()
        await StateHelper.load('area')
        await StateHelper.load('tx')
        await StateHelper.load('exb')
        let positions = await this.storePositionHistory()

        // 検知状態の取得
        PositionHelper.setDetectState(positions, APP.USE_POSITION_HISTORY)

        positions = positions.map((pos) => {
          return {
            ...pos,
            // powerLevel: this.getPowerLevel(pos),
            txId: Util.getValue(pos, 'tx.txId' , null),
            potCd: Util.getValue(pos, 'tx.pot.potCd', null),
            potName: Util.getValue(pos, 'tx.pot.potName', null),
            groupName: Util.getValue(pos, 'tx.group.groupName', null),
            areaName: Util.getValue(pos, 'exb.areaName', null),
            locationName: Util.getValue(pos, 'exb.locationName', null),
            // 追加フィルタ用
            groupId: Util.getValue(pos, 'tx.group.groupId').val,
            categoryId: Util.getValue(pos, 'tx.category.categoryId').val,
            areaId: Util.getValue(pos, 'exb.location.areaId').val,
          }
        })
        console.log(positions)
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
      await this.fetchData()
      return _.some(this.positionList, (pos) => {
        return pos.tx.txId == tx.txId
            && !pos.noSelectedTx
      })
    }
  }
}
</script>

<style scoped lang="scss">

</style>
