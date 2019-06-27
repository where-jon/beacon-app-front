<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkedit :id="id" ref="bulkEdit" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
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
      category: _.slice(CATEGORY.getTypes(), 0, 2).filter((val) => APP.CATEGORY.TYPES.includes(val.value)),
      items: ViewHelper.createBreadCrumbItems('master', {text: 'pot', href: '/master/pot'}, 'bulkRegister'),
      masterCd: null,
    }
  },
  computed: {
    ...mapState('app_service', [
      'pot', 'pots', 'potImages', 'categories', 'groups', 'txs'
    ]),
  },
  async created() {
    await StateHelper.load('pot')
    this.masterCd = StateHelper.createMasterCd('pot', this.pots, null)
  },
  methods: {
    async onSaving() {
      await StateHelper.load('pot')
      await StateHelper.load('category')
      await StateHelper.load('group')
      await StateHelper.load('tx')

      await this.$refs.bulkEdit.bulkSave({numberList: 'potType'})
    },
    restructTx(entity, dummyKey){
      const headerName = Util.hasValue(entity.btxId)? 'btxId': Util.hasValue(entity.minor)? 'minor': 'btxId'
      if(!Util.hasValue(entity[headerName])){
        return dummyKey
      }
      const targetIdList = entity[headerName].split(';').map(targetId => targetId.trim())
      entity.potTxList = []
      targetIdList.forEach((targetId, idx) => {
        const tx = this.txs.find(tx => tx[headerName] == targetId)
        const potTx = {
          potTxPK: {
            potId: entity.potId? entity.potId: dummyKey--,
            txId: tx? tx.txId: dummyKey--
          }
        }
        potTx[tx? headerName: `${headerName}Error`] = targetId
        entity.potTxList.push(potTx)
      })
      return dummyKey
    },
    restructUser(entity, dummyKey){
      if(!Util.hasValueAny(entity.loginId, entity.roleName, entity.pass, entity.email)){
        return dummyKey
      }
      const oldPot = this.pots.find(pot => pot.potId == entity.potId)
      Util.setValue(entity, 'potUserList', [{
        potUserPK: { potId: dummyKey--, userId: dummyKey--},
        user: {
          userId: Util.getValue(oldPot, 'userId', dummyKey--),
          loginId: entity.loginId,
          roleName: entity.roleName,
          pass: entity.pass,
          email: entity.email,
          name: entity.potName,
        }
      }])
      return dummyKey
    },
    onRestruct(entity, dummyKey){
      if(Util.hasValueAny(entity.post, entity.tel, entity.ruby)){
        Util.setValue(entity, 'extValue.post', entity.post)
        Util.setValue(entity, 'extValue.tel', entity.tel)
        Util.setValue(entity, 'extValue.ruby', entity.ruby)
      }

      if(!isNaN(entity.potType) && !this.category.find(cat => cat.value == entity.potType)){
        entity['potTypeOneOf'] = this.category.map(cat => cat.value)
      }
      if(!Util.hasValue(entity.potType) && !Util.hasValue(entity.categoryName)){
        entity.potType = CATEGORY.PERSON
      }
      if(!Util.hasValue(entity.potCd)){
        entity.potCd = this.masterCd
        this.masterCd = StateHelper.createMasterCd('pot', [{potCd: this.masterCd}], null)
      }

      dummyKey = this.restructTx(entity, dummyKey)
      dummyKey = this.restructUser(entity, dummyKey)
      return dummyKey
    },
    onSaved(){
      StateHelper.setForceFetch('tx', true)
      StateHelper.setForceFetch('user', true)
    },
  }
}
</script>

<style scoped lang="scss">

</style>