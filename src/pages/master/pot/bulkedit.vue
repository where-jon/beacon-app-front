<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkedit :id="id" ref="bulkEdit" :name="name" :back-path="backPath" :app-service-path="pAppServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'lodash'
import { APP } from '../../../sub/constant/config'
import { CATEGORY, POT_TYPE, BULK } from '../../../sub/constant/Constants'
import * as StringUtil from '../../../sub/util/StringUtil'
import * as Util from '../../../sub/util/Util'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import * as PotHelper from '../../../sub/helper/domain/PotHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkedit from '../../../components/page/bulkedit.vue'

export default {
  props: {
    pName: {
      type: String,
      default: '',
    },
    pPath: {
      type: String,
      default: '/master/pot',
    },
    pAppServicePath: {
      type: String,
      default: '/basic/pot',
    },
    pTypeList: {
      type: Array,
      default: () => [POT_TYPE.PERSON, POT_TYPE.THING, POT_TYPE.OTHER],
    },
  },
  components: {
    breadcrumb,
    bulkedit,
  },
  data() {
    return {
      name: 'pot',
      id: 'potId',
    }
  },
  computed: {
    ...mapState('app_service', [
      'pot', 'pots', 'potImages', 'categories', 'groups', 'txs'
    ]),
    backPath() {
      return this.pPath
    },
    items() {
      return ViewHelper.createBreadCrumbItems('master', {text: StringUtil.concatCamel('pot', this.pName), href: this.backPath}, 'bulkRegister')
    },
  },
  async created() {
    await StateHelper.load('pot')
  },
  methods: {
    async onSaving() {
      await Promise.all(['pot', 'category', 'group', 'tx'].map(StateHelper.load))
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
      entity.extValue = {}
      if(Util.hasValue(entity.ruby)){
        Util.setValue(entity, 'extValue.ruby', entity.ruby)
      }
      PotHelper.getPotExtKeys(this.pName).forEach(ext => {
        Util.setValue(entity, 'extValue.' + ext, entity[ext])
      })

      if(!isNaN(entity.potType) && !APP.POT.TYPES.includes(entity.potType)){
        entity['potTypeOneOf'] = APP.POT.TYPES
      }

      if(!Util.hasValue(entity.potType) && !Util.hasValue(entity.categoryName)){
        entity.potType = this.pTypeList[0]
      }
      entity.potCd = entity.ID

      if(Util.hasValue(entity.auth)){
        entity.potCategoryList = entity.auth.split(BULK.SPLITTER).map(val => ({
          potCategoryPK: { potId: dummyKey--, categoryId: dummyKey-- },
          categoryName: val,
          categoryType: CATEGORY.AUTH
        }))
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