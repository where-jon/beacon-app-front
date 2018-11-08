<template>
  <div>
    <breadcrumb :items="items" />
    <bulkedit :name="name" :id="id" :backPath="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/breadcrumb.vue'
import bulkedit from '../../../components/bulkedit.vue'
import * as StateHelper from '../../../sub/helper/StateHelper'
import { APP } from '../../../sub/constant/config.js'

export default {
  components: {
    breadcrumb,
    bulkedit,
  },
  data() {
    return {
      name: 'tx',
      id: 'txId',
      backPath: '/master/tx',
      appServicePath: '/core/tx',
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.tx'),
          href: '/master/tx',
        },
        {
          text: this.$i18n.tnl('label.tx') + this.$i18n.tnl('label.bulkRegister'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'tx', 'txs', 'categories', 'pots', 'potImages'
    ]),
  },
  methods: {
    afterCrud(){
      StateHelper.setForceFetch('pot', true)
    },
    resetId(entity, dummyKey){
      const targetEntity = Util.getEntityFromIds(this.txs, entity, ["txId", "btxId", "minor"])
      entity.txId = targetEntity? targetEntity.txId: dummyKey--
      if(APP.TX_BTX_MINOR == "minor"){
        entity.btxId = entity.minor
      }
      else if(APP.TX_BTX_MINOR == "btxId"){
        entity.minor = entity.btxId
      }
      if (entity.pot) {
        entity.pot.potId = dummyKey--,
        entity.pot.potCd = entity.pot.potId + "_" + (new Date().getTime() % 10000)
        entity.pot.potName = entity.pot.potId + "_" + (new Date().getTime() % 10000)
        const pot = this.pots.find((val) => val.txId == entity.txId)
        if(pot){
          const potImage = this.potImages.find((val) => val.txId == entity.txId)
          entity.pot.potType = pot.potType
          entity.pot.thumbnail = potImage? potImage.thumbnail: null
          entity.pot.extValue = pot.extValue
        }
      }
      return dummyKey
    },
    async save(bulkSaveFunc) {
      const MAIN_COL = "txId"
      const POT = ["displayName","description","potCategoryList"]
      const POT_CATEGORY = ["categoryId", "categoryName"]
      const TX_SENSOR = ["sensorId"]

      const NUMBER_TYPE_LIST = ["deviceId", "exbId", "areaId", "locationId", "posId", "x", "y", "z", "txViewType", "zoneName"]
      const BOOL_TYPE_LIST = ["visible", "enabled"]
      await StateHelper.load('category')

      await bulkSaveFunc(MAIN_COL, NUMBER_TYPE_LIST, BOOL_TYPE_LIST, (entity, headerName, val, dummyKey) => {
        if (Util.equalsAny(headerName, POT)) {
          if(Util.hasValue(val)){
            if (!entity.pot) {
              entity.pot = {}
            }
            entity.pot[headerName] = val
          }
        }
        else if (Util.equalsAny(headerName, POT_CATEGORY) && Util.hasValue(val)) {
          if (!entity.pot) {
            entity.pot = {}
          }
          if(headerName == "categoryName"){
            const category = this.categories.find((category) => category.categoryName == val)
            if(category){
              entity.pot.potType = category.categoryType
              entity.pot.potCategoryList = [{potCategoryPK: {potId: dummyKey--, categoryId: category.categoryId}}]
            }
          }
          else{
            entity.pot.potCategoryList = [{potCategoryPK: {potId: dummyKey--, categoryId: val}}]
          }
        }
        else if (Util.equalsAny(headerName, TX_SENSOR) && !val) {
          entity.txSensorlist = [{sensorId: val}]
        }
        else {
          if (headerName == MAIN_COL){
            if(!val) {
              val = dummyKey--
            }
          }
          entity[headerName] = val
        }
        return dummyKey
      },
      (entity, dummyKey) => this.resetId(entity, dummyKey)
    )},
  }
}
</script>

<style scoped lang="scss">

</style>