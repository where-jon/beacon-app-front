<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkedit :id="id" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'lodash'
import { BULK, CATEGORY } from '../../../sub/constant/Constants'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkedit from '../../../components/page/bulkedit.vue'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as BulkHelper from '../../../sub/helper/BulkHelper'

export default {
  components: {
    breadcrumb,
    bulkedit,
  },
  data() {
    return {
      name: 'category',
      id: 'categoryId',
      backPath: '/master/category',
      appServicePath: '/basic/category',
      items: ViewHelper.createBreadCrumbItems('master', {text: 'category', href: '/master/category'}, 'bulkRegister'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'category', 'categories'
    ]),
    categoryTypes(){
      return CATEGORY.getTypes()
    },
  },
  methods: {
    resetStyle(entity, dummyKey){
      const updateData = this.categories.find((val) => val.categoryId == entity.categoryId)
      if(updateData && updateData.display){
        if (!entity.display) {
          entity.display = {}
        }
        if(entity.display.color == null){
          entity.display.color = updateData.display.color
        }
        if(entity.display.bgColor == null){
          entity.display.bgColor = updateData.display.bgColor
        }
        if(entity.display.shape == null){
          entity.display.shape = updateData.display.shape
        }
      }
      return dummyKey
    },
    afterCrud(){
      StateHelper.setForceFetch('pot', true)
      StateHelper.setForceFetch('tx', true)
      StateHelper.setForceFetch('zone', true)
    },
    async save(bulkSaveFunc) {
      const DISPLAY_COL = ['shape', 'color', 'bgColor']
      await bulkSaveFunc(BULK.PRIMARY_KEY, null, null, (entity, headerName, val, dummyKey) => {
        if (BulkHelper.isPrimaryKeyHeader(headerName)){
          BulkHelper.setPrimaryKey(entity, this.id, val, dummyKey--)
          return dummyKey
        }
        if (_.includes(DISPLAY_COL, headerName)) {
          if (!entity.display) {
            entity.display = {}
          }
          entity.display[headerName] = val
          return dummyKey
        }
        if(headerName == 'categoryTypeName'){
          const categoryType = this.categoryTypes.find(type => type.text == val)
          entity.categoryType = categoryType? categoryType.value: 0
          entity.categoryTypeName = val
          return dummyKey
        }
        entity[headerName] = val
        return dummyKey
      }, (entity, dummyKey) => this.resetStyle(entity, dummyKey))
    },
  }
}
</script>

<style scoped lang="scss">

</style>