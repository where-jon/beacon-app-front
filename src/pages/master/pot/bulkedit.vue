<template>
  <div class="container-fluid">
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
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as BulkHelper from '../../../sub/helper/BulkHelper'
import { APP } from '../../../sub/constant/config'
import { CATEGORY, BULK } from '../../../sub/constant/Constants'

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
      category: _.slice(CATEGORY.getTypes(), 0, 2).filter((val) => APP.CATEGORY.TYPES.includes(val.value)),
      items: ViewHelper.createBreadCrumbItems('master', {text: 'pot', href: '/master/pot'}, 'bulkRegister'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'pot', 'pots', 'potImages', 'categories', 'groups', 'txs'
    ]),
  },
  methods: {
    resetData(entity, dummyKey){
      if(!Util.hasValue(entity.potType) && !Util.hasValue(entity.categoryName)){
        entity.potType = CATEGORY.PERSON
      }
      if(Util.hasValue(entity.potTxList)){
        entity.potTxList.forEach((potTx) => potTx.potTxPK.potId = entity.potId)
      }
      if(Util.hasValue(entity.potUserList)){
        const oldPot = this.pots.find(pot => pot.potId == entity.potId)
        entity.potUserList[0].user.userId = Util.getValue(oldPot, 'userId', dummyKey--)
        entity.potUserList[0].user.name = entity.potName
        if(entity.potUserList[0].user.roleName == null){
          entity.potUserList[0].user.roleName = ''
        }
      }
      return dummyKey
    },
    afterCrud(){
      StateHelper.setForceFetch('pot', true)
      StateHelper.setForceFetch('tx', true)
      StateHelper.setForceFetch('user', true)
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
      if(!Util.hasValue(val)){
        return dummyKey
      }
      const valList = val.split(';').map((val) => val.trim())
      if(!entity.potTxList){
        entity.potTxList = []
        valList.forEach((v, idx) => {
          const tx = this.txs.find((tx) => tx[headerName] == v)
          const potTx = {potTxPK: {potId: dummyKey--, txId: tx? tx.txId: dummyKey--}}
          potTx[tx? headerName: `${headerName}Error`] = v
          entity.potTxList.push(potTx)
        })
      }
      else{
        valList.forEach((v, idx) => {
          const tx = this.txs.find((tx) => tx[headerName] == v)
          const potTxList = entity.potTxList
          if(idx < potTxList.length){
            potTxList[idx][tx? headerName: `${headerName}Error`] = v
          }
        })
      }
      return dummyKey
    },
    setUser(entity, headerName, val, dummyKey){
      if(!Util.hasValue(val)){
        return dummyKey
      }
      if(!entity.potUserList){
        entity.potUserList = [{potUserPK: {potId: dummyKey--, userId: dummyKey--}, user: {userId: dummyKey--}}]
      }
      entity.potUserList[0].user[headerName] = val
      return dummyKey
    },
    setOther(entity, headerName, val, dummyKey){
      const NULLABLE_NUMBER_COL = ['txId', 'exbId', 'zoneId', 'areaId']
      if(NULLABLE_NUMBER_COL.includes(headerName)){
        BulkHelper.setNumberKey(entity, headerName, val, {isNullable: true})
        return dummyKey
      }
      if(headerName == 'potType'){
        BulkHelper.setNumberKey(entity, headerName, val)
        const newVal = Number(val)
        if(!isNaN(newVal) && !this.category.find(cat => cat.value == newVal)){
          entity[`${headerName}OneOf`] = this.category.map(cat => cat.value)
        }
        return dummyKey
      }
      entity[headerName] = val
      return dummyKey
    },
    async save(bulkSaveFunc) {
      const MANY_TO_MANY = ['groupId', 'categoryId']
      const extValueHeaders = ['ruby', 'post', 'tel']
      const txHeaders = ['txId', 'btxId', 'minor']
      const userHeaders = ['loginId', 'roleName', 'pass', 'email']
      await StateHelper.load('pot')
      await StateHelper.load('category')
      await StateHelper.load('group')
      await StateHelper.load('tx')

      await bulkSaveFunc(BULK.PRIMARY_KEY, null, null, (entity, headerName, val, dummyKey) => {
        if (BulkHelper.isPrimaryKeyHeader(headerName)){
          BulkHelper.setPrimaryKey(entity, this.id, val, dummyKey--)
          return dummyKey
        }
        // relation
        if (MANY_TO_MANY.includes(headerName) && Util.hasValue(val)) {
          return this.setParamRelation(entity, headerName, val, dummyKey)
        }
        // minor, btxId, txId
        if(_.includes(txHeaders, headerName)){
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
        // user
        if (_.includes(userHeaders, headerName)) {
          this.setUser(entity, headerName, val, dummyKey)
          return dummyKey
        }

        // other
        return this.setOther(entity, headerName, val, dummyKey)
      }, (entity, dummyKey) => this.resetData(entity, dummyKey))
    },
  }
}
</script>

<style scoped lang="scss">

</style>