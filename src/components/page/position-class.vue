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
    className: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      params: {
        name: 'position-stack',
        id: 'position-stackId',
        fields: addLabelByKey(this.$i18n, [
          {key: 'label', label: `${this.className}`, tdClass: 'icon-rowdata'},
          {key: 'icons', label: 'tx', tdClass: 'icon-rowdata align-top'},
        ]),
        initTotalRows: this.$store.state.main[Util.concatCamel('each', Util.single2multi(this.className))].length,
        disableTableButtons: true,
        hideSearchBox: true,
        bordered: true,
      },
      listName: Util.single2multi(this.className),
      eachListName: Util.concatCamel('each', Util.single2multi(this.className)),
      id: `${this.className}Id`,
      name: `${this.className}Name`,
    }
  },
  computed: {
    ...mapState('app_service', [
      'txs',
      'areas',
      'zones',
      'exbs',
      'positions'
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
      return this[`${this.eachListName}`]
    },
    splitClass(positions){
      const tempClass = _.map(this[`${this.listName}`], (cls) => ({[`${this.id}`]: cls[`${this.id}`], label: cls[`${this.name}`], positions: []}))

      _.forEach(positions, (pos) => {
        const posClassId = Util.getValue(pos, `exb.${this.id}`, null)
        _.forEach(tempClass, (cls) => {
          if (posClassId == cls[`${this.id}`] && !pos.noSelectedTx) {
            cls.positions.push(pos)
          }
        })
      })
      return tempClass
    },
    async fetchData(payload) {
      try {
        this.showProgress()
        console.log('fetchData Started.')
        await StateHelper.load(`${this.className}`)
        await StateHelper.load('tx')
        await StateHelper.load('exb')

        // positionデータ取得
        await this.storePositionHistory()
        this.replaceAS({positions: this.getPositions()})

        // 分類
        const tempClass = this.splitClass(this.positions)
        this.replaceMain({[`${this.eachListName}`]: tempClass})
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
      await this.fetchData()
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
