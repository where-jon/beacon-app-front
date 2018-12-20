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
import * as mock from '../../assets/mock/mock'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import mList from '../../components/page/list.vue'
import commonmixinVue from '../../components/mixin/commonmixin.vue'
import listmixinVue from '../../components/mixin/listmixin.vue'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as PositionHelper from '../../sub/helper/PositionHelper'
import { addLabelByKey } from '../../sub/helper/ViewHelper'
import { DISP, DEV } from '../../sub/constant/config'
import { SHAPE, EXTRA_NAV } from '../../sub/constant/Constants'
import * as Util from '../../sub/util/Util'

export default {
  components: {
    mList,
    breadcrumb,
  },
  mixins: [
    commonmixinVue,
    listmixinVue,
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
      defaultDisplay: {
        color: DISP.TX_COLOR,
        bgColor: DISP.TX_BGCOLOR,
        shape: SHAPE.CIRCLE,
      },
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
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        console.log('fetchData Started.')
        await StateHelper.load('area')
        await StateHelper.load('tx')
        await StateHelper.load('exb')

        // positionデータ取得
        let positions = await EXCloudHelper.fetchPosition(this.exbs, this.txs)

        // 移動平均数分のポジションデータを保持する
        this.pushOrgPositions(positions)

        // 在席表示と同じ、表示txを取得する。
        let now = !DEV.USE_MOCK_EXC ? new Date().getTime()
          : mock.positions_conf.start + this.count++ * mock.positions_conf.interval
        const correctPositions = PositionHelper.correctPosId(this.orgPositions, now)
        positions = _(positions).map((pos) => {
          let cPos = _.find(correctPositions, (cPos) => pos.btx_id == cPos.btx_id)
          if (cPos) {
            return {...pos, transparent: cPos.transparent}
          }
          return null
        })
          .compact().value()
        
        this.replaceAS({positions})

        // スタイルをセット
        positions = _.map(positions, pos => {
          // 設定により、カテゴリとグループのどちらの設定で表示するかが変わる。
          let display
          if (pos.tx) {
            const styleSrc = pos.tx[DISP.DISPLAY_PRIORITY[0]] || pos.tx[DISP.DISPLAY_PRIORITY[1]]
            display = styleSrc && styleSrc.display
          }
          display = display || this.defaultDisplay
          display = this.getStyleDisplay1(display)        
          if (pos.transparent) {
            display.opacity = 0.6
          }
          return {
            ...pos,
            display,
          }
        })

        // エリアごとに分類
        const tempArea = _.map(this.areas, (area) => ({
          areaId: area.areaId,
          label: area.areaName,
          positions: []}))

        _.forEach(positions, (pos) => {
          const posAreaId = Util.getValue(pos, 'exb.location.areaId', null)
          _.forEach(tempArea, (area) => {
            if (posAreaId == area.areaId) {
              area.positions.push(pos)
            }
          })
        })
        this.replaceMain({eachAreas: tempArea})
        if (payload && payload.done) {
          payload.done()
        }
      } catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
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
