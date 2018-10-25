<template>
  <div>
    <breadcrumb :items="items" :extraNavSpec="extraNavSpec"
        :reload="reload" :isLoad="isLoad"/>
    <m-list :params="params" :list="positions" />
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import breadcrumb from '../../components/breadcrumb.vue'
import mList from '../../components/list.vue'
import listmixinVue from '../../components/listmixin.vue'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import { addLabelByKey } from '../../sub/helper/ViewHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import { DETECT_STATE, BATTERY_STATE, BATTERY_BOUNDARY } from '../../sub/constant/Constants'
import * as Util from '../../sub/util/Util'
import { APP } from '../../sub/constant/config.js'

let that

export default {
  components: {
    mList,
    breadcrumb,
  },
  mixins: [listmixinVue],
  data() {
    return {
      params: {
        name: 'positionList',
        id: 'positionListId',
        appServicePath: '/core/tx',
        extraFilter: _(['detectState',
          APP.POSITION_WITH_GROUP ? 'group' : null,
          APP.POSITION_WITH_AREA ? 'area' : null]).compact().value(),
        disableTableButtons: true,
        fields: addLabelByKey(this.$i18n, [ 
          {key: "tx.txId", label: 'tx', sortable: true},
          APP.POSITION_WITH_CODE ? {key: "tx.pot.potCd", label: 'potCd', sortable: true} : null,
          {key: "tx.pot.potName", label: 'name', sortable: true},
          {key: "state", sortable: true},
          APP.POSITION_WITH_GROUP ? {key: "tx.group.groupName", label: 'group', sortable: true} : null,
          APP.POSITION_WITH_AREA ? {key: "exb.areaName", label: 'area', sortable: true} : null,
          {key: "exb.locationName", label: 'final-receive-location', sortable: true},
          {key: "updatetime", label: 'final-receive-timestamp', sortable: true},
          {key: "powerLevelText", label: 'power-level'},
        ]),
        initTotalRows: this.$store.state.app_service.positions.length,
      },
      items: [
        {
          text: this.$i18n.t('label.main'),
          active: true
        },
        {
          text: this.$i18n.t('label.positionList'),
          active: true
        }
      ],
      reload: false,
      isLoad: false,
      extraNavSpec: [
        {
          key: 'showPosition',
          path: '/main/position',
          icon: 'fas fa-map-marker-alt',
        },
        {
          key: 'positionList',
          path: '/main/positionList',
          icon: 'fas fa-list',
        },
        {
          key: 'positionStack',
          path: '/main/positionStack',
          icon: 'far fa-building',
        },
      ],
    }
  },
  computed: {
    ...mapState('app_service', [
      'replaceAs',
      'txs',
      'areas',
      'exbs',
      'positions',
    ]),
  },
  methods: {
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        await StateHelper.load('area')
        await StateHelper.load('tx')
        await StateHelper.load('exb')
        let positions = await EXCloudHelper.fetchPositionList(this.exbs, this.txs)
        positions = positions.map((pos) => {
          const stateOpt = DETECT_STATE.getTypes().find((val) => pos.phase === val.value)
          return {
            ...pos,
            state: stateOpt ? stateOpt.text : null,
            powerLevelText: this.getPowerLevel(pos),
            // 追加フィルタ用
            detectState: pos.phase,
            groupId: Util.getValue(pos, 'tx.group.groupId').val,
            areaId: Util.getValue(pos, 'exb.location.areaId').val,
          }
        })
        console.log(positions)
        this.replaceAS({positions})
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    },
    getPowerLevel(position){
      const batteryOpts = BATTERY_STATE.getTypes()
      const powerLevel = position.power_level
      if (!powerLevel) {
        return batteryOpts.find((val) => val.value === 4).text
      } else if (powerLevel >= BATTERY_BOUNDARY.GOOD) {
        return batteryOpts.find((val) => val.value === 1).text
      } else if (powerLevel >= BATTERY_BOUNDARY.WARNING) {
        return batteryOpts.find((val) => val.value === 2).text
      } else {
        return batteryOpts.find((val) => val.value === 3).text
      }
    }
  }
}
</script>

<style scoped lang="scss">

</style>
