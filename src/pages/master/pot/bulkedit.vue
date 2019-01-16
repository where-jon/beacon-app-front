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
import { CATEGORY } from '../../../sub/constant/Constants'

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
      category: _.slice(CATEGORY.getTypes(), 0, 2).filter((val) => APP.CATEGORY_TYPES.includes(val.value)),
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
    afterCrud(){
      StateHelper.setForceFetch('tx', true)
    },
    setParamRelation(entity, headerName, val, dummyKey){
      if('groupId' === headerName) {
        entity.potGroupList = [{potGroupPK: {groupId: Number(val)}}]
      }
      else if('categoryId' === headerName) {
        entity.potCategoryList = [{potCategoryPK: {categoryId: Number(val)}}]
      }
      return dummyKey
    },
    setMinorBtxId(entity, headerName, val, dummyKey){
      const tx = this.txs.find((tx) => tx[headerName] == val)
      if(tx){
        entity.txId = tx.txId
      }
      return dummyKey
    },
    setOther(entity, headerName, val, dummyKey, mainCol){
      const NULLABLE_NUMBER_COL = ['txId', 'exbId', 'zoneId', 'areaId', 'potType']
      let newVal
      if (mainCol === headerName && !val) {
        newVal = dummyKey--
      } else if (NULLABLE_NUMBER_COL.includes(headerName)) {
        if(!Util.hasValue(val)){
          newVal = null
        }
        else{
          newVal = Number(val)
          if(headerName == 'potType' && !isNaN(newVal) && !this.category.find((val) => val.value == newVal)){
            entity[`${headerName}OneOf`] = this.category.map((val) => val.value)
          }
        }
      } else {
        newVal = val
      }
      if(isNaN(newVal)){
        entity[`${headerName}Name`] = val
      }
      entity[headerName] = newVal
      return dummyKey
    },
    async save(bulkSaveFunc) {
      const MAIN_COL = 'potId'
      const MANY_TO_MANY = ['groupId', 'categoryId']
      const extValueHeaders = ['ruby', 'post', 'tel']
      const txIdHeaders = ['btxId', 'minor']
      await StateHelper.load('category')
      await StateHelper.load('group')
      await StateHelper.load('tx')

      await bulkSaveFunc(MAIN_COL, null, null, (entity, headerName, val, dummyKey) => {
        // relation
        if (MANY_TO_MANY.includes(headerName) && Util.hasValue(val)) {
          return this.setParamRelation(entity, headerName, val, dummyKey)
        }
        // minor, btxId
        if(_.includes(txIdHeaders, headerName)){
          return this.setMinorBtxId(entity, headerName, val, dummyKey)
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
        return this.setOther(entity, headerName, val, dummyKey, MAIN_COL)
      }, (entity, dummyKey) => this.resetData(entity, dummyKey))
    },
  }
}
</script>

<style scoped lang="scss">

</style>