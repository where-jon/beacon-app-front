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
import breadcrumb from '../../components/breadcrumb.vue'
import commonmixinVue from '../../components/commonmixin.vue'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
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
        {key: 'area'},
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

        let positions = await EXCloudHelper.fetchPositionList(this.exbs, this.txs)

        this.eachAreas = this.areas.map((val) => {
          return {
            area: val.areaName,
          }
        })
      } catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
      console.log('fetchData End.')
      // try {
        // positions = positions.map((pos) => {
      //     const stateOpt = DETECT_STATE.getTypes().find((val) => pos.phase === val.value)
      //     return {
      //       ...pos,
      //       state: stateOpt ? stateOpt.text : null,
      //       powerLevel: this.getPowerLevel(pos),
      //       // 追加フィルタ用
      //       detectState: pos.phase,
      //       groupId: Util.getValue(pos, 'tx.group.groupId').val,
      //       areaId: Util.getValue(pos, 'exb.location.areaId').val,
      //     }
      //   })
      //   console.log(positions)
      //   this.replaceAS({positions})
      //   if (payload && payload.done) {
      //     payload.done()
      //   }
      // }
      // catch(e) {
      //   console.error(e)
      // }
      // this.replace({showProgress: false})
    },
    // getPowerLevel(position){
    //   const batteryOpts = BATTERY_STATE.getTypes()
    //   const powerLevel = position.power_level
    //   if (!powerLevel) {
    //     return batteryOpts.find((val) => val.value === 4)
    //   } else if (powerLevel >= BATTERY_BOUNDARY.GOOD) {
    //     return batteryOpts.find((val) => val.value === 1)
    //   } else if (powerLevel >= BATTERY_BOUNDARY.WARNING) {
    //     return batteryOpts.find((val) => val.value === 2)
    //   } else {
    //     return batteryOpts.find((val) => val.value === 3)
    //   }
    // },
  }
}
</script>

<style scoped lang="scss">

  div.canvas canvas {
    width: 100%;
    height: 50px;
  }
</style>
