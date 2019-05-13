<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkedit :id="id" ref="bulkEdit" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkedit from '../../../components/page/bulkedit.vue'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as BulkHelper from '../../../sub/helper/BulkHelper'
import { APP } from '../../../sub/constant/config.js'
import { IGNORE, CATEGORY, BULK } from '../../../sub/constant/Constants'

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
    sensorOptionsTx() {
      const options = this.$refs.bulkEdit.sensorOptions('tx')
      return options
    },
  },
  async mounted() {
    await StateHelper.load('tx')
  },
  methods: {
    afterCrud(){
      StateHelper.setForceFetch('pot', true)
      StateHelper.setForceFetch('tx', true)
    },
    setParamCategory(entity, headerName, val, dummyKey){
      if (!entity.potTxList) {
        entity.potTxList = [{potTxPK: {potId: dummyKey--, txId: dummyKey--}, pot: {}}]
      }
      const category = this.categories.find(category => category.categoryName == val)
      if(category){
        entity.potTxList[0].pot.potType = category.categoryType
        entity.potTxList[0].pot.potCategoryList = [{potCategoryPK: {potId: dummyKey--, categoryId: category.categoryId}}]
      }
      else{
        entity.potTxList[0].pot.categoryName = val
      }
      return dummyKey
    },
    setParamGroup(entity, headerName, val, dummyKey){
      if (!entity.potTxList) {
        entity.potTxList = [{potTxPK: {potId: dummyKey--, txId: dummyKey--}, pot: {}}]
      }
      const group = this.groups.find(group => group.groupName == val)
      if(group){
        entity.potTxList[0].pot.potGroupList = [{potGroupPK: {potId: dummyKey--, groupId: group.groupId}}]
      }
      else{
        entity.potTxList[0].pot.groupName = val
      }
      return dummyKey
    },
    setParamTxSensor(entity, headerName, val, dummyKey){
      const sensor = this.sensorOptionsTx.find(sensor => sensor.text == val)
      if(sensor && sensor.value != null){
        entity.txSensorList = [{txSensorPK: {sensorId: sensor.value}, sensorName: val}]
      }
      else if(!sensor){
        entity.txSensorList = [{txSensorPK: {sensorId: dummyKey--}, sensorName: val}]
      }
      return dummyKey
    },
    setParamLocation(entity, headerName, val, dummyKey){
      if(!APP.TX_WITH_LOCATION){
        return dummyKey
      }
      if(!entity.location){
        entity.location = {}
      }
      if(Util.equalsAny(headerName, ['x', 'y'])){
        BulkHelper.setNumberKey(entity.location, headerName, val, {isNullable: true, errorName: 'loc'+ headerName.toUpperCase() + 'Name'})
        return dummyKey
      }
      entity.location[headerName] = val
      return dummyKey
    },
    addLocation(entity, dummyKey){
      if(!Util.includesIgnoreCase(APP.TX.WITH, 'location')){
        return dummyKey
      }
      if(!entity.location){
        entity.location = {}
      }
      entity.location.locationId = dummyKey--
      entity.location.posId = entity.btxId * -1
      entity.location.locationName = 'Loc' + (entity.btxId * -1)
      return dummyKey
    },
    resetId(entity, dummyKey){
      if(APP.TX_BTX_MINOR == 'minor'){
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
      if (entity.locationId == 0) {
        entity.locationId = null
      }
      if (entity.potTxList && entity.potTxList[0]) {
        entity.potTxList[0].pot.potId = dummyKey--,
        entity.potTxList[0].pot.potCd = entity.potTxList[0].pot.potId + '_' + (new Date().getTime() % 10000)
        entity.potTxList[0].pot.potName = entity.potTxList[0].pot.potId + '_' + (new Date().getTime() % 10000)
        if(entity.potTxList[0].pot.potType == null){
          entity.potTxList[0].pot.potType = CATEGORY.getTypes()[0].value
        }
        const pot = this.pots.find(val => Util.hasValue(val.potTxList) && val.potTxList.find(potTx => potTx.tx.txId == entity.txId))
        if(pot){
          const potImage = this.potImages.find(val => val.id == pot.potId)
          entity.potTxList[0].pot.potType = pot.potType
          entity.potTxList[0].pot.thumbnail = potImage? potImage.thumbnail: null
          entity.potTxList[0].pot.extValue = pot.extValue
        }
        entity.potTxList[0].potTxPK.potId = dummyKey--
        entity.potTxList[0].potTxPK.txId = entity.txId
      }
      dummyKey = this.addLocation(entity, dummyKey)
      return dummyKey
    },
    async save(bulkSaveFunc) {
      const POT = ['displayName', 'description']
      const LOCATION = ['areaName', 'x', 'y']

      const NUMBER_TYPE_LIST = ['btxId', 'major', 'minor', 'disp']
      await StateHelper.load('category')
      await StateHelper.load('group')
      await StateHelper.load('pot')

      await bulkSaveFunc(BULK.PRIMARY_KEY, null, null, (entity, headerName, val, dummyKey) => {
        if (BulkHelper.isPrimaryKeyHeader(headerName)){
          BulkHelper.setPrimaryKey(entity, this.id, val, dummyKey--)
          return dummyKey
        }
        if(Util.equalsAny(headerName, NUMBER_TYPE_LIST)){
          BulkHelper.setNumberKey(entity, headerName, val, {isNullable: !APP.TX_MAJOR_REQUIRED && headerName == 'major'})
          return dummyKey
        }

        if (Util.equalsAny(headerName, POT)) {
          if (!entity.potTxList) {
            entity.potTxList = [{potTxPK: {potId: dummyKey--, txId: dummyKey--}, pot: {}}]
          }
          entity.potTxList[0].pot[headerName] = val
          return dummyKey
        }
        if (headerName == 'categoryName' && Util.hasValue(val)) {
          dummyKey = this.setParamCategory(entity, headerName, val, dummyKey)
          return dummyKey
        }
        if (headerName == 'groupName' && Util.hasValue(val)) {
          dummyKey = this.setParamGroup(entity, headerName, val, dummyKey)
          return dummyKey
        }
        if (headerName == 'sensor' && Util.hasValue(val)) {
          dummyKey = this.setParamTxSensor(entity, headerName, val, dummyKey)
          return dummyKey
        }
        if (Util.equalsAny(headerName, LOCATION)) {
          dummyKey = this.setParamLocation(entity, headerName, val, dummyKey)
          return dummyKey
        }
        entity[headerName] = val
        return dummyKey
      },
      (entity, dummyKey) => this.resetId(entity, dummyKey)
      )},
  }
}
</script>

<style scoped lang="scss">

</style>