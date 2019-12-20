<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkedit :id="id" ref="bulkEdit" :name="name" :bulk-disp-name="dispName" :back-path="backPath" :app-service-path="pAppServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import { CATEGORY, BULK, ZONE } from '../../../sub/constant/Constants'
import * as StringUtil from '../../../sub/util/StringUtil'
import * as Util from '../../../sub/util/Util'
import * as ExtValueHelper from '../../../sub/helper/domain/ExtValueHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
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
      default: '/master/category',
    },
    pAppServicePath: {
      type: String,
      default: '/basic/category',
    },
    pTypeList: {
      type: Array,
      default: () => [CATEGORY.PERSON, CATEGORY.THING, CATEGORY.ZONE],
    },
  },
  components: {
    breadcrumb,
    bulkedit,
  },
  data() {
    return {
      name: 'category',
      id: 'categoryId',
    }
  },
  computed: {
    ...mapState('app_service', [
      'category', 'categories'
    ]),
    backPath() {
      return this.pPath
    },
    items() {
      return ViewHelper.createBreadCrumbItems('master', {text: StringUtil.concatCamel('category', this.pName), href: this.backPath}, 'bulkRegister')
    },
    categoryTypes(){
      return CATEGORY.getTypes(true).filter(c => this.pTypeList.includes(c.value))
    },
    dispName() {
      return StringUtil.concatCamel('category', this.pName)
    }
  },
  async created() {
    await StateHelper.load('category')
  },
  methods: {
    restructZone(entity, dummyKey){
      const zoneCategoryList = []
      if(Util.hasValue(entity.guardNames)){
        const guardList = entity.guardNames.split(BULK.SPLITTER).map(zoneName => ({
          zoneCategoryPK: {zoneId: dummyKey--, categoryId: dummyKey--},
          zoneName: zoneName,
          zoneType: ZONE.GUARD,
        }))
        zoneCategoryList.push(...guardList)
      }
      if(Util.hasValue(entity.doorNames)){
        const guardList = entity.doorNames.split(BULK.SPLITTER).map(zoneName => ({
          zoneCategoryPK: {zoneId: dummyKey--, categoryId: dummyKey--},
          zoneName: zoneName,
          zoneType: ZONE.DOOR,
        }))
        zoneCategoryList.push(...guardList)
      }
      entity.zoneCategoryList = zoneCategoryList
      return dummyKey
    },
    onRestruct(entity, dummyKey){
      if(Util.hasValueAny(entity.shape, entity.color, entity.bgColor)){
        Util.setValue(entity, 'display.shape', entity.shape)
        Util.setValue(entity, 'display.color', entity.color)
        Util.setValue(entity, 'display.bgColor', entity.bgColor)
      }
      if(Util.hasValue(entity.categoryTypeName)){
        const categoryType = this.categoryTypes.find(type => type.text == entity.categoryTypeName)
        entity.categoryType = categoryType? categoryType.value: 0
      }
      ExtValueHelper.copyToChild(entity, APP.CATEGORY)
      dummyKey = this.restructZone(entity, dummyKey)
      entity.categoryCd = entity.ID
      return dummyKey
    },
    onSaved(){
      StateHelper.setForceFetch('pot', true)
      StateHelper.setForceFetch('tx', true)
      StateHelper.setForceFetch('zone', true)
    },
  }
}
</script>

<style scoped lang="scss">

</style>