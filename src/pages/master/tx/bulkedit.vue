<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkedit :id="id" ref="bulkEdit" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as Util from '../../../sub/util/Util'
import * as ArrayUtil from '../../../sub/util/ArrayUtil'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkedit from '../../../components/page/bulkedit.vue'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as BulkHelper from '../../../sub/helper/BulkHelper'
import * as MasterHelper from '../../../sub/helper/MasterHelper'
import { APP } from '../../../sub/constant/config.js'
import { IGNORE, CATEGORY } from '../../../sub/constant/Constants'

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
      items: ViewHelper.createBreadCrumbItems('master', {text: 'tx', href: '/master/tx'}, 'bulkRegister'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'tx', 'txs', 'categories', 'groups', 'pots', 'potImages'
    ]),
  },
  async mounted() {
    await StateHelper.load('tx')
  },
  methods: {
    async onSaving() {
      await StateHelper.load('category')
      await StateHelper.load('group')
      await StateHelper.load('pot')
      await this.$refs.bulkEdit.bulkSave({numberList: ['btxId', 'major', 'minor', 'disp', 'x', 'y'], nullableList: ['x', 'y']})
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
          potCd: Util.getValue(pot, 'potCd', MasterHelper.createDefaultName(dummyKey)),
          potName: Util.getValue(pot, 'potName', MasterHelper.createDefaultName(dummyKey--)),
          potType: Util.getValue(pot, 'potType', CATEGORY.getTypes()[0].value),
          extValue: Util.getValue(pot, 'extValue', null),
        }
      }])
      Util.setValue(entity, 'potTxList.0.pot.displayName', Util.getValue(entity, 'displayName', Util.getValue(pot, 'displayName', null)))
      Util.setValue(entity, 'potTxList.0.pot.description', Util.getValue(entity, 'description', Util.getValue(pot, 'description', null)))
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
        if(!Util.hasValue(Util.getValue(pot, 'categoryName', null))){
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
        if(!Util.hasValue(Util.getValue(pot, 'groupName', null))){
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
    restructLocation(entity, dummyKey){
      if(!ArrayUtil.includesIgnoreCase(APP.TX.WITH, 'location')){
        return dummyKey
      }
      const param = BulkHelper.createParamLocation(
        {...entity, posId: entity.btxId * -1, locationName: 'Loc' + (entity.btxId * -1)},
        dummyKey
      )
      entity.location = param.location
      return param.dummyKey
    },
    onRestruct(entity, dummyKey){
      dummyKey = this.restructTx(entity, dummyKey)
      dummyKey = this.restructPot(entity, dummyKey)
      if(Util.hasValue(entity.sensor)){
        const param = BulkHelper.createParamSensor('tx', entity.sensor, dummyKey)
        if(param.sensorList.length != 0){
          entity.txSensorList = param.sensorList
        }
        dummyKey = param.dummyKey
      }
      dummyKey = this.restructLocation(entity, dummyKey)
      return dummyKey
    },
    onSaved(){
      StateHelper.setForceFetch('pot', true)
    },
  }
}
</script>

<style scoped lang="scss">

</style>