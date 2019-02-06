<template>
  <div>
    <breadcrumb :items="items" :extra-nav-spec="extraNavSpec"
                :reload="reload" :short-name="shortName"
    />
    <m-list :params="params" :list="eachAreas" />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import mList from '../../components/page/list.vue'
import commonmixinVue from '../../components/mixin/commonmixin.vue'
import listmixinVue from '../../components/mixin/listmixin.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import * as StateHelper from '../../sub/helper/StateHelper'
import { addLabelByKey } from '../../sub/helper/ViewHelper'
import { EXTRA_NAV } from '../../sub/constant/Constants'
import * as Util from '../../sub/util/Util'

export default {
  components: {
    mList,
    breadcrumb,
  },
  mixins: [
    commonmixinVue,
    listmixinVue,
    showmapmixin,
  ],
  data() {
    return {
      params: {
        name: 'position-stack',
        id: 'positionStackId',
        fields: addLabelByKey(this.$i18n, [
          {key: 'label', label: 'area', tdClass: 'icon-rowdata'},
          {key: 'icons', label: 'tx', tdClass: 'icon-rowdata align-top'},
        ]),
        initTotalRows: this.$store.state.main.eachAreas.length,
        disableTableButtons: true,
        hideSearchBox: true,
        bordered: true,
      },
      reload: true,
      styles: [],
      items: [
        {
          text: this.$i18n.t('label.main'),
          active: true
        },
        {
          text: this.$i18n.t('label.positionStack'),
          active: true
        }
      ],
      shortName: this.$i18n.t('label.positionStackShort'),
      extraNavSpec: EXTRA_NAV,
    }
  },
  computed: {
    ...mapState('app_service', [
      'txs',
      'areas',
      'exbs',
      'positions'
    ]),
    ...mapState('main', [
      'orgPositions',
      'positionHistores',
      'eachAreas',
    ])
  },
  
  beforeDestroy() {
    this.replaceAS({positions: []})
  },
  methods: {
    ...mapActions('main', [
      'pushOrgPositions',
    ]),
    splitArea(positions){
      const tempArea = _.map(this.areas, (area) => ({areaId: area.areaId, label: area.areaName, positions: []}))

      _.forEach(positions, (pos) => {
        const posAreaId = Util.getValue(pos, 'exb.location.areaId', null)
        _.forEach(tempArea, (area) => {
          if (posAreaId == area.areaId && !pos.noSelectedTx) {
            area.positions.push(pos)
          }
        })
      })
      return tempArea
    },
    async fetchData(payload) {
      try {
        this.showProgress()
        console.log('fetchData Started.')
        await StateHelper.load('area')
        await StateHelper.load('tx')
        await StateHelper.load('exb')

        // positionデータ取得
        await this.storePositionHistory()
        this.replaceAS({positions: this.getPositions()})

        // エリアごとに分類
        const tempArea = this.splitArea(this.positions)
        this.replaceMain({eachAreas: tempArea})
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
