<template>
  <div>
    <m-list :params="params" :list="getDataList()" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as StringUtil from '../../sub/util/StringUtil'
import * as Util from '../../sub/util/Util'
import * as PositionHelper from '../../sub/helper/domain/PositionHelper'
import * as ProhibitHelper from '../../sub/helper/domain/ProhibitHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import { addLabelByKey } from '../../sub/helper/ui/ViewHelper'
import commonmixin from '../mixin/commonmixin.vue'
import reloadmixin from '../mixin/reloadmixin.vue'
import mList from './list.vue'

export default {
  components: {
    mList,
  },
  mixins: [commonmixin, reloadmixin],
  props: {
    masterName: {
      type: String,
      required: true,
    },
    alertData: {
      type: Object,
      default:() => {},
      required: true,
    },
  },
  data() {
    return {
      params: {
        name: 'position-stack',
        id: 'position-stackId',
        fields: addLabelByKey(this.$i18n, [
          {key: 'label', label: this.masterName, tdClass: 'icon-rowdata'},
          {key: 'icons', label: 'tx', tdClass: 'icon-rowdata align-top'},
        ]),
        hideSearchBox: true,
        initTotalRows: this.$store.state.main[StringUtil.concatCamel('each', StringUtil.single2multi(this.masterName))].length,
        disableTableButtons: true,
        bordered: true,
      },
      name: this.masterName + 'Name',
      id: this.masterName + 'Id',
      message: '',
      listName: StringUtil.single2multi(this.masterName),
      eachListName: StringUtil.concatCamel('each', StringUtil.single2multi(this.masterName)),
      prohibitDetectList : null,
      loadStates: ['area', 'zone', 'tx', 'exb', 'lostZones','prohibit'],
      showDismissibleAlert: false,
    }
  },
  computed: {
    ...mapState('app_service', [
      'txs',
      'areas',
      'zones',
      'exbs',
      'positions',
      'prohibits',
      'lostZones',
    ]),
    ...mapState('main', [
      'eachAreas',
      'eachZones',
    ]),
  },
  beforeDestroy() {
    this.replaceAS({positions: []})
  },
  methods: {
    getDataList() {
      return this[this.eachListName]
    },
    splitMaster(positions,prohibitDetectList){
      const tempMasterMap = {}
      this[this.listName].forEach(obj => tempMasterMap[obj[this.id]] = {[this.id]: obj[this.id], label: obj[this.name], positions: []})
      const tempMasterExt = {[this.id]: -1, label: this.$i18n.tnl('label.other'), positions: []}
      const exbMap = {}
      this.exbs.forEach(exb => exbMap[exb.posId] = exb)

      _.forEach(positions, pos => {
        const exb = exbMap[pos.pos_id]
        prohibitDetectList? prohibitDetectList.some(data => {
          if(data.minor == pos.minor){
            pos.blinking = 'blinking'
            return true
          }
        }): false
        pos.isDisableArea = exb? exb.isAbsentZone: false
        const posMasterId = Util.getValue(pos, 'exb.' + this.id, null)
        const obj = posMasterId? tempMasterMap[posMasterId]: tempMasterExt
        if(!pos.noSelectedTx && !Util.getValue(exb, 'isAbsentZone', false)){
          obj.positions.push(pos)
        }
      })
      const ret = _.sortBy(tempMasterMap, tmm => tmm.label)
      if(Util.hasValue(tempMasterExt.positions)){
        ret.push(tempMasterExt)
      }
      return ret
    },
    async fetchData(payload) {
      try {
        this.showProgress()
        await Promise.all(this.loadStates.map(StateHelper.load))
        // positionデータ取得
        await PositionHelper.storePositionHistory(null, true, true)
        this.replaceAS({positions: PositionHelper.getPositions()})
        ProhibitHelper.setProhibitDetect('display', this)
        this.alertData.message = this.message
        this.alertData.isAlert = this.showDismissibleAlert ? true: false
        // 分類checkProhibitZone
        const tempMaster = this.splitMaster(this.positions, this.prohibitDetectList)
        this.replaceMain({[this.eachListName]: tempMaster})
        if (payload && payload.done) {
          payload.done()
        }
      } catch(e) {
        console.error(e)
      }
      this.hideProgress()
    },
    async checkDetectedTx(tx) {
      //await this.fetchData()
      return _.some(this.positions, pos => pos.tx.txId == tx.txId)
    }
  }
}
</script>

<style scoped lang="scss">

  div.canvas canvas {
    width: 100%;
    height: 50px;
  }
</style>
