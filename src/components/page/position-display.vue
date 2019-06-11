<template>
  <div>
    <m-list :params="params" :list="getDataList()" />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import mList from './list.vue'
import commonmixinVue from '../mixin/commonmixin.vue'
import listmixinVue from '../mixin/listmixin.vue'
import showmapmixin from '../mixin/showmapmixin.vue'
import { addLabelByKey } from '../../sub/helper/ViewHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as Util from '../../sub/util/Util'
export default {
  components: {
    mList,
  },
  mixins: [
    commonmixinVue,
    listmixinVue,
    showmapmixin,
  ],
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
      prohibitDetectList : null,
      message: '',
      showDismissibleAlert: false,
      params: {
        name: 'position-stack',
        id: 'position-stackId',
        fields: addLabelByKey(this.$i18n, [
          {key: 'label', label: this.masterName, tdClass: 'icon-rowdata'},
          {key: 'icons', label: 'tx', tdClass: 'icon-rowdata align-top'},
        ]),
        initTotalRows: this.$store.state.main[Util.concatCamel('each', Util.single2multi(this.masterName))].length,
        disableTableButtons: true,
        hideSearchBox: true,
        bordered: true,
      },
      listName: Util.single2multi(this.masterName),
      eachListName: Util.concatCamel('each', Util.single2multi(this.masterName)),
      id: this.masterName + 'Id',
      name: this.masterName + 'Name',
    }
  },
  computed: {
    ...mapState('app_service', [
      'txs',
      'areas',
      'zones',
      'exbs',
      'positions',
      'prohibits'
    ]),
    ...mapState('main', [
      'orgPositions',
      'positionHistores',
      'eachAreas',
      'eachZones',
    ]),
  },
  beforeDestroy() {
    this.replaceAS({positions: []})
  },
  methods: {
    ...mapActions('main', [
      'pushOrgPositions',
    ]),
    getDataList() {
      return this[this.eachListName]
    },
    splitMaster(positions,prohibitDetectList){
      const tempMaster = _.map(this[this.listName], (obj) => ({[this.id]: obj[this.id], label: obj[this.name], positions: []}))

      _.forEach(positions, (pos) => {
        const posMasterId = Util.getValue(pos, 'exb.' + this.id, null)
        const exb = this.exbs.find((exb) => exb.posId == pos.pos_id)
        _.forEach(tempMaster, (obj) => {
          if (posMasterId == obj[this.id] && !pos.noSelectedTx) {
            prohibitDetectList? prohibitDetectList.some((data) => {
              if(data.minor == pos.minor){
                pos.blinking = 'blinking'
                return true
              }
            }): false
            pos.isDisableArea = exb? exb.isAbsentZone: false
            exb? exb.isAbsentZone? false: obj.positions.push(pos): obj.positions.push(pos)
          }
          
        })
      })
      return tempMaster
    },
    async fetchData(payload) {
      try {
        this.showProgress()
        console.log('fetchData Started.')
        await StateHelper.load(this.masterName)
        await StateHelper.load('tx')
        await StateHelper.load('exb')
        await StateHelper.load('prohibit')
        // positionデータ取得
        await this.storePositionHistory(null, false, true)
        this.replaceAS({positions: this.getPositions()})
        this.setProhibit('display') // listmixin呼び出し
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
      console.log('fetchData End.')
    },
    async checkDetectedTx(tx) {
      //await this.fetchData()
      return _.some(this.positions, (pos) => {
        return pos.tx.txId == tx.txId
      })
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
