<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkedit :id="id" ref="bulkEdit" :name="name" :bulk-name="bulkName" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import { ZONE, PATTERN, BULK } from '../../../sub/constant/Constants'
import * as NumberUtil from '../../../sub/util/NumberUtil'
import * as Util from '../../../sub/util/Util'
import * as BulkHelper from '../../../sub/helper/dataproc/BulkHelper'
import * as OptionHelper from '../../../sub/helper/dataproc/OptionHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkedit from '../../../components/page/bulkedit.vue'

export default {
  components: {
    breadcrumb,
    bulkedit,
  },
  data() {
    return {
      name: 'location',
      id: 'locationId',
      backPath: '/master/location',
      appServicePath: '/core/location',
      bulkName: 'locationList',
      items: ViewHelper.createBreadCrumbItems('master', {text: 'locationList', href: '/master/location'}, 'bulkRegister'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'location', 'locations', 'zones'
    ]),
    zoneMap(){
      const ret = {}
      this.zones.forEach(zone => ret[zone.zoneName] = zone)
      return ret
    }
  },
  async created() {
    await StateHelper.load('zone')
  },
  methods: {
    async onSaving() {
      await this.$refs.bulkEdit.bulkSave({numberList: ['posId', 'x', 'y'], booleanList: ['visible'], nullableList: ['posId', 'x', 'y']})
    },
    restructExb(entity, dummyKey){
      ['deviceId', 'deviceIdX'].forEach(key => {
        if(!Util.hasValue(entity[key])){
          return
        }
        const isHex = key == 'deviceIdX'

        const deviceIdList = entity[key].split(BULK.SPLITTER)
        if(deviceIdList.some(val => isHex? !NumberUtil.isHex(val): isNaN(val))){
          entity[key + 'Name'] = entity[key]
        }
        else{
          entity[key + 'List'] = deviceIdList.map(val => isHex? val: Number(val))
        }
      })
      return dummyKey
    },
    restructZone(entity, dummyKey){
      if(!Util.hasValue(entity.zoneClass)){
        return dummyKey
      }
      const nameList = entity.zoneClass.split(';').map(name => name.trim())
      const locationZoneList = []
      nameList.forEach((name, idx) => {
        const zone = this.zoneMap[name]
        const locationZone = {
          locationZonePK: {
            locationId: dummyKey--,
            zoneId: Util.getValue(zone, 'zoneId', dummyKey--),
          },
          zone: {
            zoneId: Util.getValue(zone, 'zoneId', dummyKey--),
            zoneName: name,
            zoneType: ZONE.NON_COORDINATE,
          }
        }
        locationZoneList.push(locationZone)
      })
      entity.locationZoneList = locationZoneList
      return dummyKey
    },
    onRestruct(entity, dummyKey){
      if(Util.hasValue(entity.ID)){
        BulkHelper.setStringKey(entity, 'locationCd', entity.ID, PATTERN.REGEXP.LOCATION_CD)
      }
      entity.locXName = entity.xName
      entity.locYName = entity.yName
      const locationTypeTarget = OptionHelper.getLocationTypeOptions().find(val => val.text == entity.locationTypeName)
      if(locationTypeTarget){
        entity.locationType = locationTypeTarget.value
        delete entity.locationTypeName
      }
      try{
        entity.txViewType = Util.hasValue(entity.txViewType)? JSON.parse(entity.txViewType): null
      }
      catch(e){
        entity.txViewTypeName = entity.txViewType
        entity.txViewType = null
      }
      dummyKey = this.restructZone(entity, dummyKey)
      dummyKey = this.restructExb(entity, dummyKey)
      return dummyKey
    },
  }
}
</script>

<style scoped lang="scss">

</style>