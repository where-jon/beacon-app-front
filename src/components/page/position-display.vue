<template>
  <div @click="resetDetail">
    <m-list ref="positionList" :params="params" :list="getDataList()" :alert-force-hide=true />
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
      message: '',
      prohibitDetectList : null,
      showDismissibleAlert: false,
      positions: [],
      lasteFetched: 0,
      eachZones: [],
      eachAreas: [],
    }
  },
  computed: {
    params() {
      return {
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
      }
    },
    name() {
      return this.masterName + 'Name'
    },
    id() {
      return this.masterName + 'Id'
    },
    listName() {
      return StringUtil.single2multi(this.masterName)
    },
    eachListName() { // TODO: ゾーンかエリアかなのになんでeachListなんて名前つけるんだ！
      return StringUtil.concatCamel('each', StringUtil.single2multi(this.masterName))
    },
    // ...mapState('main', [ // TODO: stateには定義されていない。この画面でしか使わないのであればstateに入れない
    //   'eachAreas',
    //   'eachZones',
    // ]),
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
    resetDetail() {
      this.$refs.positionList.resetDetail()
    },
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
      // TODO: 以下の処理要書き直し（この糞ソース書いたの誰だ！[激怒]）
      _.forEach(positions, orgPos => {
        const pos = this.convertPos(orgPos)
        const location = this.locationIdMap[orgPos.locationId]
        prohibitDetectList? prohibitDetectList.some(data => {
          if(data.minor == orgPos.minor){
            pos.blinking = 'blinking'
            return true
          }
        }): false
        pos.isDisableArea = Util.v(location, 'isAbsentZone', false)
        const posMasterIds = this.displayZone? Util.v(orgPos, 'exb.location.zoneIdList', [null]): [Util.v(orgPos, 'exb.location.areaId')]
        posMasterIds.forEach(posMasterId => {
          const hasMasterId = Util.hasValue(posMasterId)
          const obj = hasMasterId ? tempMasterMap[posMasterId]: tempMasterExt
          if(!orgPos.noSelectedTx && !Util.v(location, 'isAbsentZone', false)){
            obj.positions.push(pos)
          }else if(absentZone){
            // 不在ゾーンへの登録
            const map = tempMasterMap[absentZone.zoneId]
            if (map) {
              if (!map.positions) {
                map.positions = []
              }
              if( !map.positions.find(p => p.minor == orgPos.minor) ){
                pos.absent = true
                map.positions.push(pos)
              }
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
    convertPos(pos) {
      return { // b-tableに使うデータに巨大なオブジェクトを渡すとIEが固まるので必要なものだけ抽出
        display: pos.display,
        label: pos.label,
        areaId: Util.v(pos, 'exb.location.areaId'),
        txId: pos.txId,
        minor: pos.minor,
        btxId: pos.btxId,
        tx: {
          txId: pos.tx.txId,
          minor: pos.tx.minor,
          btxId: pos.tx.btxId,
          display: pos.tx.display,
          pot: {
            potId:  Util.v(pos, 'tx.pot.potId'),
            potName: Util.v(pos, 'tx.pot.potName'),
            thumbnailUpdateDt:  Util.v(pos, 'tx.pot.thumbnailUpdateDt'),
            existThumbnail: Util.v(pos, 'tx.pot.existThumbnail'),
            extValue: Util.v(pos, 'tx.pot.extValue'),
            group: {
              groupId: Util.v(pos, 'tx.pot.group.groupId'), 
              groupName:  Util.v(pos, 'tx.pot.group.groupName'), 
              display:  Util.v(pos, 'tx.pot.group.display'),
            },
            category: {
              categoryId: Util.v(pos, 'tx.pot.category.categoryId'),
              categoryName: Util.v(pos, 'tx.pot.category.categoryName'),
              display: Util.v(pos, 'tx.pot.category.display'),
            },
          }
        },
        exb: {
          location: {
            areaId: Util.v(pos, 'exb.location.areaId')
          }
        }
      }
    },
    async loadProhibitDetect() {
      if (Util.hasValueAny(APP.POS.PROHIBIT_GROUP_ZONE, APP.POS.LOST_GROUP_ZONE)) {
        clearInterval(this.prohibitInterval)  // 点滅クリア
        Util.merge(this, await ProhibitHelper.loadProhibitDetect(ALERT_STATE.WHOLE, this.stage, this.icons, this.zones))
        this.alertData.message = this.message
        this.alertData.isAlert = this.showDismissibleAlert ? true: false
        this.replace({showAlert: this.alertData.isAlert})
      }
    },
    async fetchData(payload) {
      try {
        let now = new Date().getTime()
        if (now - this.lasteFetched < 100) { // IEで2回リクエストを送ってしまう問題への対応
          return
        }
        this.lasteFetched = now
        this.replace({showAlert:false})
        this.showProgress()
        // positionデータ取得
        PositionHelper.loadPosition(null, true, true).then(e => {
          this.positions = PositionHelper.filterPositions(undefined, false, true, null, null, null, null).filter(p => p.tx && p.tx.disp==1)
          return this.loadProhibitDetect()
        }).then(e => {
          // 分類checkProhibitZone
          const tempMaster = this.splitMaster(this.positions, this.prohibitDetectList)
          // this.replaceMain({[this.eachListName]: tempMaster}) // TODO: 意味不明、Stateに入れる必要ある？
          this[this.eachListName] = tempMaster
          if (payload && payload.done) {
            payload.done()
          }
          this.hideProgress()
        })
      } catch(e) {
        console.error(e)
        this.hideProgress()
      }
    },
    async checkDetectedTx(txId) {
      //await this.fetchData()
      return _.some(this.positions, pos => pos.txId == txId)
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
