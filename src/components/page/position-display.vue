<template>
  <div>
    <m-list :params="params" :list="getDataList()" :alert-force-hide=true />
  </div>
</template>

<script>
import { APP, DISP } from '../../sub/constant/config'
import { SYSTEM_ZONE_CATEGORY_NAME, ALERT_STATE } from '../../sub/constant/Constants'
import { mapState } from 'vuex'
import * as StringUtil from '../../sub/util/StringUtil'
import * as Util from '../../sub/util/Util'
import * as PositionHelper from '../../sub/helper/domain/PositionHelper'
import * as ProhibitHelper from '../../sub/helper/domain/ProhibitHelper'
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
      default: () => {},
      required: true,
    },
    form: {
      type: Object,
      default: () => {},
    }
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
        parentFilter: this.form,
      },
      name: this.masterName + 'Name',
      id: this.masterName + 'Id',
      message: '',
      listName: StringUtil.single2multi(this.masterName),
      eachListName: StringUtil.concatCamel('each', StringUtil.single2multi(this.masterName)),
      prohibitDetectList : null,
      showDismissibleAlert: false,
      positions: [],
    }
  },
  computed: {
    ...mapState('main', [ // TODO: stateには定義されていない。この画面でしか使わないのであればstateに入れない
      'eachAreas',
      'eachZones',
    ]),
    displayZone(){
      return this.masterName == 'zone'
    },
    displayArea(){
      return this.masterName == 'area'
    },
  },
  beforeDestroy() {
    this.replaceAS({positions: []})
  },
  methods: {
    getDataList() {
      return this[this.eachListName]
    },
    splitMaster(positions, prohibitDetectList){
      const tempMasterMap = {}
      this[this.listName].forEach(obj => tempMasterMap[obj[this.id]] = {...obj, [this.id]: obj[this.id], label: obj[this.name], positions: []})
      const tempMasterExt = {[this.id]: -1, label: this.$i18n.tnl('label.other'), positions: []}
      let showExt = false
      this.locations.forEach(location => {
        if(DISP.POS_STACK.ZONE_OTHER && this.displayZone && !Util.hasValue(location.zoneIdList)){
          showExt = true
        }
      })

      const absentZone = _.find(this.zones, zone => zone.categoryName == SYSTEM_ZONE_CATEGORY_NAME.ABSENT_DISPLAY)

      // TODO: 以下の処理要書き直し
      _.forEach(positions, pos => {
        const location = this.locationIdMap[pos.locationId]
        prohibitDetectList? prohibitDetectList.some(data => {
          if(data.minor == pos.minor){
            pos.blinking = 'blinking'
            return true
          }
        }): false
        pos.isDisableArea = Util.getValue(location, 'isAbsentZone', false)
        const posMasterIds = this.displayZone? Util.getValue(pos, 'location.zoneIdList', [null]): [Util.getValue(pos, 'location.areaId')]
        posMasterIds.forEach(posMasterId => {
          const hasMasterId = Util.hasValue(posMasterId)
          const obj = hasMasterId ? tempMasterMap[posMasterId]: tempMasterExt
          if(!pos.noSelectedTx && !Util.getValue(location, 'isAbsentZone', false)){
            obj.positions.push(pos)
          }else if(absentZone){
            // 不在ゾーンへの登録
            const map = tempMasterMap[absentZone.zoneId]
            if (map) {
              if (!map.positions) {
                map.positions = []
              }
              map.positions.push(pos)
            }
          }
        })
      })
      const ret = _.sortBy(tempMasterMap, tmm => this.displayArea? tmm.areaCd : tmm.zoneCd)
      Util.debug('tempMasterMap', tempMasterMap)
      if(showExt){
        ret.push(tempMasterExt)
      }
      return ret
    },
    async loadProhibitDetect() {
      if (Util.hasValueAny(APP.POS.PROHIBIT_GROUP_ZONE, APP.POS.LOST_GROUP_ZONE)) {
        Util.merge(this, await ProhibitHelper.loadProhibitDetect(ALERT_STATE.WHOLE, this.stage, this.icons, this.zones))
      }
    },
    async fetchData(payload) {
      try {
        this.replace({showAlert:false})
        this.showProgress()
        // positionデータ取得
        await PositionHelper.loadPosition(null, true, true)
        this.positions = PositionHelper.filterPositions(undefined, false, true, null, null, null, null).filter(p => p.tx && p.tx.disp==1)

        this.loadProhibitDetect()

        this.alertData.message = this.message
        this.alertData.isAlert = this.showDismissibleAlert ? true: false
        this.replace({showAlert: this.alertData.isAlert})
        // 分類checkProhibitZone
        const tempMaster = this.splitMaster(this.positions, this.prohibitDetectList)
        this.replaceMain({[this.eachListName]: tempMaster}) // TODO: 意味不明、Stateに入れる必要ある？
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
