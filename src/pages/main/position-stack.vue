<template>
  <div>
    <breadcrumb :items="items" :extraNavSpec="extraNavSpec"
        :reload="reload" />
    <b-table :items="eachAreas" :fields="fields" thead-class="d-none">
      <template slot="icons" slot-scope="row">
          <div v-for="position in row.item.positions" :key="position.areaId"
              class="d-inline-block mx-1"
              v-bind:style="getStyleDisplay1(position.display)">A</div>
      </template>
    </b-table>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as mock from '../../assets/mock/mock'
import breadcrumb from '../../components/breadcrumb.vue'
import commonmixinVue from '../../components/commonmixin.vue'
import listmixinVue from '../../components/listmixin.vue'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as PositionHelper from '../../sub/helper/PositionHelper'
import { DISP, DEV } from '../../sub/constant/config'
import { SHAPE } from '../../sub/constant/Constants'
import * as Util from '../../sub/util/Util'

let that

export default {
  components: {
    breadcrumb,
  },
  mixins: [
    commonmixinVue,
    listmixinVue,
   ],
  data() {
    return {
      name: 'position-stack',
      id: 'positionStackId',
      fields: [
        {key: 'label'},
        {key: 'icons'},
      ],
      eachAreas: [],
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
      reload: false,
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
          path: '/main/position-stack',
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
    ]),
    ...mapState('main', [
      'orgPositions',
    ])
  },
  mounted() {
    that = this
    this.fetchData()
  },
  methods: {
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
        let orgPositions = _.clone(this.orgPositions)
        if (orgPositions.length >= DISP.MOVING_AVERAGE) {
          orgPositions.shift()
        }
        orgPositions.push(positions)
        this.replaceMain({orgPositions})

        // 在席表示と同じ、表示txを取得する。
        let now = !DEV.USE_MOCK_EXC ? new Date().getTime()
            : mock.positions_conf.start + this.count++ * mock.positions_conf.interval
        const correctPositions = PositionHelper.correctPosId(this.orgPositions, now)

        positions = _.filter(positions, (pos) => 
          _.some(correctPositions, (cPos) => pos.btx_id == cPos.btx_id)
        )

        // スタイルをセット
        positions = _.map(positions, pos => {
          // 設定により、カテゴリとグループのどちらの設定で表示するかが変わる。
          let display
          if (pos.tx) {
            const styleSrc = pos.tx[DISP.DISPLAY_PRIORITY[0]] || pos.tx[DISP.DISPLAY_PRIORITY[1]]
            display = styleSrc && styleSrc.display
          }
          display = display || this.defaultDisplay          
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
        this.eachAreas = tempArea
      } catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
      console.log('fetchData End.')
    },
  }
}
</script>

<style scoped lang="scss">

  div.canvas canvas {
    width: 100%;
    height: 50px;
  }
</style>
