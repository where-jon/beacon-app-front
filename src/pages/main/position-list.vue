<template>
  <div>
    <breadcrumb :items="items" :extraNavSpec="extraNavSpec"
        :reload="reload" />
    <m-list :params="params" :list="positions" :isFluid="true" />
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import breadcrumb from '../../components/breadcrumb.vue'
import mList from '../../components/list.vue'
import listmixinVue from '../../components/listmixin.vue'
import * as mock from '../../assets/mock/mock'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as PositionHelper from '../../sub/helper/PositionHelper'
import { addLabelByKey } from '../../sub/helper/ViewHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import { DETECT_STATE, BATTERY_STATE, BATTERY_BOUNDARY } from '../../sub/constant/Constants'
import * as Util from '../../sub/util/Util'
import { APP, DISP, DEV } from '../../sub/constant/config.js'

let that

export default {
  components: {
    mList,
    breadcrumb,
  },
  mixins: [listmixinVue],
  data() {
    return {
      params: {
        name: 'position-list',
        id: 'positionListId',
        extraFilter: _(['detectState',
          APP.POT_WITH_GROUP ? 'group' : null,
          APP.POSITION_WITH_AREA ? 'area' : null]).compact().value(),
        disableTableButtons: true,
        fields: addLabelByKey(this.$i18n, [ 
          !APP.TX_WITH_TXID && APP.TX_BTX_MINOR == 'minor' ? 
              {key: "tx.minor", label: 'minor', sortable: true, tdClass: "action-rowdata" }: null,
          APP.TX_WITH_TXID ? {key: "tx.txId", label: 'txId', sortable: true, tdClass: "action-rowdata" }: null,
          APP.TX_BTX_MINOR != 'minor' ? {key: "tx.btxId", label: 'btxId', sortable: true, tdClass: "action-rowdata" }: null,
          APP.TX_WITH_TXID || APP.TX_BTX_MINOR != 'btxId' ?
              {key: "tx.minor", label:'minor', sortable: true, tdClass: "action-rowdata" }: null,
          APP.POT_WITH_POTCD ? {key: "tx.pot.potCd", label: 'potCd', sortable: true, tdClass: "action-rowdata"} : null,
          {key: "tx.pot.potName", label: 'name', sortable: true, tdClass: "action-rowdata"},
          APP.POT_WITH_GROUP ? {key: "tx.group.groupName", label: 'group', sortable: true, tdClass: "action-rowdata"} : null,
          {key: "state", sortable: true, tdClass: "action-rowdata"},
          APP.POSITION_WITH_AREA ? {key: "exb.areaName", label: 'area', sortable: true, tdClass: "action-rowdata"} : null,
          {key: "exb.locationName", label: 'final-receive-location', sortable: true, tdClass: "action-rowdata"},
          {key: "updatetime", label: 'final-receive-timestamp', sortable: true, tdClass: "action-rowdata"},
          {key: "powerLevel", label: 'power-level', tdClass: "action-rowdata", 'class': "text-md-center"},
          {key: "mapDisplay", tdClass: "action-rowdata"},
        ]),
        initTotalRows: this.$store.state.app_service.positions.length,
      },
      count: 0, // mockテスト用
      items: [
        {
          text: this.$i18n.t('label.main'),
          active: true
        },
        {
          text: this.$i18n.t('label.position-list'),
          active: true
        }
      ],
      reload: true,
      extraNavSpec: [
        {
          key: 'showPosition',
          path: '/main/position',
          icon: 'fas fa-map-marker-alt',
        },
        {
          key: 'position-list',
          path: '/main/position-list',
          icon: 'fas fa-list',
        },
        {
          key: 'positionStack',
          path: '/main/positionStack',
          icon: 'far fa-building',
        },
      ],
    }
  },
  computed: {
    ...mapState('app_service', [
      'txs',
      'areas',
      'exbs',
      'positions',
    ]),
    ...mapState('main', [
      'orgPositions',
    ]),
  },
  methods: {
    ...mapMutations('main', [
      'replaceMain',
    ]),
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        await StateHelper.load('area')
        await StateHelper.load('tx')
        await StateHelper.load('exb')
        let positions = await EXCloudHelper.fetchPositionList(this.exbs, this.txs)

        // 移動平均数分のポジションデータを保持する
        let orgPositions = _.clone(this.orgPositions)
        if (orgPositions.length >= DISP.MOVING_AVERAGE) {
          orgPositions.shift()
        }
        orgPositions.push(positions)
        this.replaceMain({orgPositions})

        // 在席表示画面と同じ検知状態の取得
        let now = !DEV.USE_MOCK_EXC? new Date().getTime(): mock.positions_conf.start + this.count++ * mock.positions_conf.interval  // for mock
        let correctPositions = PositionHelper.correctPosId(this.orgPositions, now)
        positions = positions.map((pos) => {
          const correctPos = _.find(correctPositions, (val) => {
            return pos.btx_id == val.btx_id && pos.pos_id == val.pos_id
          })
          if (!correctPos) { // 未検知
            return {...pos, phase: 3, noSelectedTx: true}
          } else if (correctPos.transparent) { // 検知後未検知
            return {...pos, phase: 2}
          } else { // 検知中
            return {...pos, phase: 1}
          }
        }),

        positions = positions.map((pos) => {
          const stateOpt = DETECT_STATE.getTypes().find((val) => pos.phase === val.value)
          return {
            ...pos,
            state: stateOpt ? stateOpt.text : null,
            powerLevel: this.getPowerLevel(pos),
            // 追加フィルタ用
            detectState: pos.phase,
            groupId: Util.getValue(pos, 'tx.group.groupId').val,
            areaId: Util.getValue(pos, 'exb.location.areaId').val,
          }
        })
        console.log(positions)
        this.replaceAS({positions})
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    },
    getPowerLevel(position){
      const batteryOpts = BATTERY_STATE.getTypes()
      const powerLevel = position.power_level
      if (!powerLevel) {
        return batteryOpts.find((val) => val.value === 4)
      } else if (powerLevel >= BATTERY_BOUNDARY.GOOD) {
        return batteryOpts.find((val) => val.value === 1)
      } else if (powerLevel >= BATTERY_BOUNDARY.WARNING) {
        return batteryOpts.find((val) => val.value === 2)
      } else {
        return batteryOpts.find((val) => val.value === 3)
      }
    },
  }
}
</script>

<style scoped lang="scss">

</style>
