<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" />
    <bulkedit :id="id" ref="bulkEdit" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import { IGNORE, CATEGORY, POT_TYPE } from '../../../sub/constant/Constants'
import * as ArrayUtil from '../../../sub/util/ArrayUtil'
import * as Util from '../../../sub/util/Util'
import * as BulkHelper from '../../../sub/helper/dataproc/BulkHelper'
import * as SensorHelper from '../../../sub/helper/domain/SensorHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as MasterHelper from '../../../sub/helper/domain/MasterHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkedit from '../../../components/page/bulkedit.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'

export default {
  components: {
    breadcrumb,
    bulkedit,
  },
  mixins: [commonmixin],
  data() {
    return {
      name: 'tx',
      id: 'txId',
      backPath: '/master/tx',
      appServicePath: '/core/tx',
      breadCrumbs: ViewHelper.createBreadCrumbItems('master', {text: 'masterTx', href: '/master/tx'}, 'bulkRegister'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'tx', 'potImages'
      // , 'txs', 'categories', 'groups', 'pots'
    ]),
  },
  async mounted() {
  },
  methods: {
    createDefaultName(prefix){
      return prefix + '_' + (new Date().getTime() % 10000)
    },
    async onSaving() {
      await this.$refs.bulkEdit.bulkSave2()
    },
    getConf() {
      return {nullLabel: this.$i18n.tnl('label.null'), normalLabel: this.$i18n.tnl('label.normal')}
    },
    restructTx(entity, dummyKey){
      if(APP.TX.BTX_MINOR == 'minor'){
        entity.btxId = entity.minor
        if(Util.hasValue(entity.minorName) || 65535 < entity.minor){
          entity.ignoreBtxId = IGNORE.ON
        }
      }
      else if(APP.TX.BTX_MINOR == 'btxId'){
        entity.minor = entity.btxId
        if(Util.hasValue(entity.btxIdName) || 65535 < entity.btxId){
          entity.ignoreMinor = IGNORE.ON
        }
      }
      if(!APP.TX.MAJOR_REQUIRED && !Util.hasValue(BulkHelper.getInvalid(entity, 'major'))){
        BulkHelper.removeInvalid(entity, 'major')
      }
      if (entity.locationId == 0) {
        entity.locationId = null
      }
      return dummyKey
    },
    restructPot(entity, dummyKey){
      const pot = this.pots.find(val => val.txId == entity.txId)
      if(pot == null && !Util.hasValueAny(entity.categoryName, entity.groupName, entity.displayName, entity.description)){
        return dummyKey
      }
      Util.setValue(entity, 'potTxList', [{
        potTxPK: { potId: pot? pot.potId: dummyKey--, txId: entity.txId },
        pot: {
          potId: Util.getValue(pot, 'potId', dummyKey),
          potCd: Util.getValue(pot, 'potCd', this.createDefaultName(dummyKey)),
          potName: Util.getValue(pot, 'potName', this.createDefaultName(dummyKey--)),
          potType: Util.getValue(pot, 'potType', POT_TYPE.getTypes()[0].value),
          extValue: Util.getValue(pot, 'extValue'),
        }
      }])
      Util.setValue(entity, 'potTxList.0.pot.displayName', Util.getValue(entity, 'displayName', Util.getValue(pot, 'displayName')))
      Util.setValue(entity, 'potTxList.0.pot.description', Util.getValue(entity, 'description', Util.getValue(pot, 'description')))
      if(pot){
        const potImage = this.potImages.find(val => val.id == pot.potId)
        Util.setValue(entity, 'potTxList.0.pot.thumbnail', potImage? potImage.thumbnail: null)
      }

      dummyKey = this.restructCategory(entity, dummyKey, pot)
      dummyKey = this.restructGroup(entity, dummyKey, pot)
      return dummyKey
    },
    restructCategory(entity, dummyKey, pot){
      if(entity.categoryName == null){
        if(!Util.hasValue(Util.getValue(pot, 'categoryName'))){
          return dummyKey
        }
        entity.categoryName = pot.categoryName
      }
      const category = this.categories.find(category => category.categoryName == entity.categoryName)
      if(category){
        Util.setValue(entity, 'potTxList.0.pot.potType', category.categoryType)
        Util.setValue(entity, 'potTxList.0.pot.potCategoryList', [{
          potCategoryPK: {potId: dummyKey--, categoryId: category.categoryId}
        }])
      }
      else{
        Util.setValue(entity, 'potTxList.0.pot.categoryName', entity.categoryName)
      }
      return dummyKey
    },
    restructGroup(entity, dummyKey, pot){
      if(entity.groupName == null){
        if(!Util.hasValue(Util.getValue(pot, 'groupName'))){
          return dummyKey
        }
        entity.groupName = pot.groupName
      }
      const group = this.groups.find(group => group.groupName == entity.groupName)
      if(group){
        Util.setValue(entity, 'potTxList.0.pot.potGroupList', [{
          potGroupPK: {potId: dummyKey--, groupId: group.groupId}
        }])
      }
      else{
        Util.setValue(entity, 'potTxList.0.pot.groupName', entity.groupName)
      }
      return dummyKey
    },
    onRestruct(entity, dummyKey){
      dummyKey = this.restructTx(entity, dummyKey)
      dummyKey = this.restructPot(entity, dummyKey)
      if(Util.hasValue(entity.sensorNames)){
        const param = BulkHelper.createParamSensor('tx', entity.sensorNames, dummyKey)
        if(param.sensorList.length != 0){
          entity.txSensorList = param.sensorList
        }
        dummyKey = param.dummyKey
      }
      return dummyKey
    },
    async onSaved(){
    },
  }
}
</script>

<style scoped lang="scss">

</style>