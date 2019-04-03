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
      if(headerName == 'categoryName'){
        const category = this.categories.find((category) => category.categoryName == val)
        if(category){
          entity.potTxList[0].pot.potType = category.categoryType
          entity.potTxList[0].pot.potCategoryList = [{potCategoryPK: {potId: dummyKey--, categoryId: category.categoryId}}]
        }
        else{
          entity.potTxList[0].pot.categoryName = val
        }
      }
      else{
        entity.potTxList[0].pot.potCategoryList = [{potCategoryPK: {potId: dummyKey--, categoryId: val}}]
      }
      return dummyKey
    },
    setParamGroup(entity, headerName, val, dummyKey){
      if (!entity.potTxList) {
        entity.potTxList = [{potTxPK: {potId: dummyKey--, txId: dummyKey--}, pot: {}}]
      }
      if(headerName == 'groupName'){
        const group = this.groups.find((group) => group.groupName == val)
        if(group){
          entity.potTxList[0].pot.potGroupList = [{potGroupPK: {potId: dummyKey--, groupId: group.groupId}}]
        }
        else{
          entity.potTxList[0].pot.groupName = val
        }
      }
      else{
        entity.potTxList[0].pot.potGroupList = [{potGroupPK: {potId: dummyKey--, groupId: val}}]
      }
      return dummyKey
    },
    setParamTxSensor(entity, headerName, val, dummyKey){
      if(headerName == 'sensor'){
        const sensor = this.sensorOptionsTx.find((sensor) => sensor.text == val)
        if(sensor && sensor.value != null){
          entity.txSensorList = [{txSensorPK: {sensorId: sensor.value}, sensorName: val}]
        }
        else if(!sensor){
          entity.txSensorList = [{txSensorPK: {sensorId: dummyKey--}, sensorName: val}]
        }
      }
      else{
        entity.txSensorList = [{txSensorPK: {txId: dummyKey--, sensorId: val}}]
      }
      return dummyKey
    },
    setParamOther(entity, headerName, val, dummyKey, mainCol, numberTypeList){
      if(Util.equalsAny(headerName, numberTypeList)){
        if(Util.hasValue(val)){
          const num = Number(val)
          if(isNaN(num)){
            entity[`${headerName}Name`] = val
          }
          val = num
        }
      }
      if (headerName == mainCol){
        if(!val) {
          val = dummyKey--
        }
      }
      entity[headerName] = val
      return dummyKey
    },
    addLocation(entity, targetEntity, dummyKey){
      if(!APP.TX_WITH_LOCATION){
        return dummyKey
      }
      entity.location = {}
      entity.location.locationId = Util.getValue(targetEntity, 'locationId', dummyKey--)
      entity.location.posId = entity.btxId * -1
      entity.location.locationName = 'Loc' + (entity.btxId * -1)
      entity.location.areaName = Util.getValue(entity, 'areaName', null)
      const x = Util.hasValue(entity.x)? entity.x: null
      const y = Util.hasValue(entity.y)? entity.y: null
      if(x){
        entity.location[isNaN(x)? 'locXName': 'x'] = x
      }
      if(y){
        entity.location[isNaN(y)? 'locYName': 'y'] = y
      }
      return dummyKey
    },
    resetId(entity, dummyKey){
      const targetEntity = Util.getEntityFromIds(this.txs, entity, ['txId', 'btxId', 'minor'])
      if(!entity.txId){
        entity.txId = targetEntity? targetEntity.txId: dummyKey--
      }
      if(APP.TX_BTX_MINOR == 'minor'){
        entity.btxId = entity.minor
        if(Util.hasValue(entity.minorName) || 65535 < entity.minor){
          entity.ignoreBtxId = IGNORE.ON
        }
      }
      else if(APP.TX_BTX_MINOR == 'btxId'){
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
          const potImage = this.potImages.find((val) => val.id == pot.potId)
          entity.potTxList[0].pot.potType = pot.potType
          entity.potTxList[0].pot.thumbnail = potImage? potImage.thumbnail: null
          entity.potTxList[0].pot.extValue = pot.extValue
        }
        entity.potTxList[0].potTxPK.potId = dummyKey--
        entity.potTxList[0].potTxPK.txId = entity.txId
      }
      dummyKey = this.addLocation(entity, targetEntity, dummyKey)
      return dummyKey
    },
    async save(bulkSaveFunc) {
      const MAIN_COL = APP.TX_WITH_TXID? 'txId': APP.TX_BTX_MINOR == 'minor'? 'minor': 'btxId'
      const POT = ['displayName','description','potCategoryList']
      const POT_CATEGORY = ['categoryId', 'categoryName']
      const POT_GROUP = ['groupId', 'groupName']
      const TX_SENSOR = ['sensorId', 'sensor']

      const NUMBER_TYPE_LIST = ['deviceId', 'txId', 'btxId', 'major', 'minor', 'exbId', 'areaId', 'locationId', 'posId', 'z', 'disp', 'txViewType', 'zoneName']
      const BOOL_TYPE_LIST = ['visible', 'enabled']
      await StateHelper.load('category')
      await StateHelper.load('group')
      await StateHelper.load('pot')

      await bulkSaveFunc(MAIN_COL, null, BOOL_TYPE_LIST, (entity, headerName, val, dummyKey) => {
        if (Util.equalsAny(headerName, POT)) {
          if(Util.hasValue(val)){
            if (!entity.potTxList) {
              entity.potTxList = [{potTxPK: {potId: dummyKey--, txId: dummyKey--}, pot: {}}]
            }
            entity.potTxList[0].pot[headerName] = val
          }
        }
        else if (Util.equalsAny(headerName, POT_CATEGORY) && Util.hasValue(val)) {
          dummyKey = this.setParamCategory(entity, headerName, val, dummyKey)
        }
        else if (Util.equalsAny(headerName, POT_GROUP) && Util.hasValue(val)) {
          dummyKey = this.setParamGroup(entity, headerName, val, dummyKey)
        }
        else if (Util.equalsAny(headerName, TX_SENSOR) && val) {
          dummyKey = this.setParamTxSensor(entity, headerName, val, dummyKey)
        }
        else {
          dummyKey = this.setParamOther(entity, headerName, val, dummyKey, MAIN_COL, NUMBER_TYPE_LIST)
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