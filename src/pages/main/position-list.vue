<template>
  <div class="container-fluid">
    <breadcrumb :items="items" :extra-nav-spec="extraNavSpec"
                :reload="reload" :short-name="shortName"
    />
    <b-alert v-model="showDismissibleAlert" variant="danger" dismissible>
      {{ message }}
    </b-alert>
    <m-list :params="params" :list="positionList" />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import mList from '../../components/page/list.vue'
import listmixinVue from '../../components/mixin/listmixin.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as MenuHelper from '../../sub/helper/MenuHelper'
import * as ViewHelper from '../../sub/helper/ViewHelper'
import { EXTRA_NAV } from '../../sub/constant/Constants'
import * as Util from '../../sub/util/Util'
import * as ArrayUtil from '../../sub/util/ArrayUtil'
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
      message: '',
      prohibitDetectList : null,
      showDismissibleAlert: false,
      params: {
        name: 'position-list',
        id: 'positionListId',
        extraFilter: _(['detectState',
          MenuHelper.useMaster('group') && APP.POS.WITH.GROUP? 'group' : null,
          MenuHelper.useMaster('category') && APP.POS.WITH.CATEGORY? 'category' : null,
          APP.POSITION_WITH_AREA? 'area' : null]).compact().value(),
        disableTableButtons: true,
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
        initTotalRows: this.$store.state.app_service.positionList.length,
      },
      count: 0, // mockテスト用
      items: ViewHelper.createBreadCrumbItems('main', 'positionList'),
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
      'prohibits',
      'lostZones',
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
        await StateHelper.load('prohibit')
        await StateHelper.load('lostZones')
        await this.storePositionHistory(0, true)
        let positions = this.getPositions(true)
        this.setProhibitDetect('list') // listmixin呼び出し
        Util.debug(positions)
        positions = positions.map((pos) => {
          const prohibitCheck = this.prohibitDetectList? this.prohibitDetectList.some((data) => data.minor == pos.minor) : false
          const exb = this.exbs.find((exb) => exb.posId == pos.pos_id)
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
