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
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.tx'),
          href: '/master/tx',
        },
        {
          text: this.$i18n.t('label.tx') + this.$i18n.t('label.bulkRegister'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'tx',
    ]),
  },
  methods: {
    async save(bulkSaveFunc) {
      const MAIN_COL = "txId"
      const POT = ["displayName","description","potId","potCd","potName","potCategoryList"]
      const POT_CATEGORY = ["categoryId"]
      const TX_SENSOR = ["sensorId"]

      const NUMBER_TYPE_LIST = ["deviceId", "exbId", "areaId", "locationId", "posId", "x", "y", "z", "txViewType", "zoneName"]
      const BOOL_TYPE_LIST = ["visible", "enabled"]

      await bulkSaveFunc(MAIN_COL, NUMBER_TYPE_LIST, BOOL_TYPE_LIST, (entity, headerName, val, dummyKey) => {
        if (Util.equalsAny(headerName, POT)) {
          if (!entity.pot) {
            entity.pot = {}
          }
          entity.pot[headerName] = val
        }
        else if (Util.equalsAny(headerName, POT_CATEGORY) && !val) {
          if (!entity.pot) {
            entity.pot = {}
          }
          entity.pot.categoryList = [{potCategoryPK: {categoryId: val}}]
        }
        else if (Util.equalsAny(headerName, TX_SENSOR) && !val) {
          entity.txSensorlist = [{sensorId: val}]
        }
        else {
          if (headerName == MAIN_COL && !val) {
            val = dummyKey--
            if (!entity.pot) {
              entity.pot = {}
              entity.pot.potId = dummyKey--,
              entity.pot.potCd = entity.pot.potId + "_" + (new Date().getTime() % 10000)
              entity.pot.potName = entity.pot.potId + "_" + (new Date().getTime() % 10000)
            }
          }
          entity[headerName] = val
        }
        return dummyKey
      })
    },
  }
}
</script>

<style scoped lang="scss">

</style>