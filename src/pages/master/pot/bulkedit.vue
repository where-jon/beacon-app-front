<template>
  <div>
    <breadcrumb :items="items" />
    <bulkedit :id="id" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'lodash'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkedit from '../../../components/page/bulkedit.vue'
import * as StateHelper from '../../../sub/helper/StateHelper'
import { APP } from '../../../sub/constant/config'

export default {
  components: {
    breadcrumb,
    bulkedit,
  },
  data() {
    return {
      name: 'pot',
      id: 'potId',
      backPath: '/master/pot',
      appServicePath: '/basic/pot',
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.pot'),
          href: '/master/pot',
        },
        {
          text: this.$i18n.tnl('label.bulkRegister'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'pot', 'potImages', 'categories', 'groups', 'txs'
    ]),
  },
  methods: {
    resetData(entity, dummyKey){
      if(!APP.POT_WITH_POTCD){
        entity.potCd = entity.potName
      }
      return dummyKey
    },
    async save(bulkSaveFunc) {
      const MAIN_COL = 'potId'
      const NULLABLE_NUMBER_COL = ['txId', 'exbId', 'zoneId', 'areaId', 'potType']
      const MANY_TO_MANY = ['groupId', 'categoryId']
      const extValueHeaders = ['ruby', 'post', 'tel']
      const txIdHeaders = ['btxId', 'minor']
      await StateHelper.load('category')
      await StateHelper.load('group')
      await StateHelper.load('tx')

      await bulkSaveFunc(MAIN_COL, null, null, (entity, headerName, val, dummyKey) => {
        // relation
        if (MANY_TO_MANY.includes(headerName) && Util.hasValue(val)) {
          if('groupId' === headerName) {
            entity.potGroupList = [{potGroupPK: {groupId: Number(val)}}]
          }
          else if('categoryId' === headerName) {
            entity.potCategoryList = [{potCategoryPK: {categoryId: Number(val)}}]
          }
          return dummyKey
        }

        // minor, btxId
        if(_.includes(txIdHeaders, headerName)){
          const tx = this.txs.find((tx) => tx[headerName] == val)
          if(tx){
            entity.txId = tx.txId
          }
          return dummyKey
        }
        // extValue
        if (!entity.extValue) {
          entity.extValue = {}
        }
        if (_.includes(extValueHeaders, headerName)) {
          entity.extValue[headerName] = val
          return dummyKey
        }

        // other
        let newVal
        if (MAIN_COL === headerName && !val) {
          newVal = dummyKey--
        } else if (NULLABLE_NUMBER_COL.includes(headerName)) {
          newVal = Util.hasValue(val)? Number(val): null
        } else {
          newVal = val
        }
        entity[headerName] = newVal
        return dummyKey
      }, (entity, dummyKey) => this.resetData(entity, dummyKey))
    },
  }
}
</script>

<style scoped lang="scss">

</style>