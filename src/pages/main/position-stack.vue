<template>
  <div>
    <breadcrumb :items="items" :extraNavSpec="extraNavSpec"
        :reload="reload" />
    <b-table :items="eachAreas" :fields="fields" thead-class="d-none">

    </b-table>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as mock from '../../assets/mock/mock'
import breadcrumb from '../../components/breadcrumb.vue'
import commonmixinVue from '../../components/commonmixin.vue'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as PositionHelper from '../../sub/helper/PositionHelper'
import { DISP, DEV } from '../../sub/constant/config'
import * as Util from '../../sub/util/Util'

let that

export default {
  components: {
    breadcrumb,
  },
  mixins: [
    commonmixinVue,
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

        let orgPositions = _.clone(this.orgPositions)
        if (orgPositions.length >= DISP.MOVING_AVERAGE) { // 移動平均数分のポジションデータを保持する
          orgPositions.shift()
        }
        orgPositions.push(positions)
        this.replaceMain({orgPositions})

        let now = !DEV.USE_MOCK_EXC ? new Date().getTime()
            : mock.positions_conf.start + this.count++ * mock.positions_conf.interval
        const correctPositions = PositionHelper.correctPosId(this.orgPositions, now)

        positions = _.filter(positions, (pos) => 
          _.some(correctPositions, (cPos) => pos.btx_id == cPos.btx_id)
        )

        let tempArea = _.map(this.areas, (area) => ({
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
