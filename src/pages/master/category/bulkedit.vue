<template>
  <div>
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
import { CATEGORY } from '../../../sub/constant/Constants'
import * as StateHelper from '../../../sub/helper/StateHelper'

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
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.category'),
          href: '/master/category',
        },
        {
          text: this.$i18n.tnl('label.bulkRegister'),
          active: true
        }
      ]
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
    },
    async save(bulkSaveFunc) {
      const MAIN_COL = 'categoryId'
      const NUMBER_TYPE_LIST = ['categoryType', 'shape']
      const DISPLAY_COL = ['shape', 'color', 'bgColor']
      await bulkSaveFunc(MAIN_COL, NUMBER_TYPE_LIST, null, (entity, headerName, val, dummyKey) => {
        if(headerName == MAIN_COL){
          entity.categoryId = Util.hasValue(val)? Number(val): --dummyKey  
        }
        else if (_.includes(DISPLAY_COL, headerName)) {
          if (!entity.display) {
            entity.display = {}
          }
          entity.display[headerName] = val
        }
        else if(headerName == 'categoryTypeName'){
          const categoryType = this.categoryTypes.find((type) => type.text == val)
          entity.categoryType = categoryType? categoryType.value: 0
          entity.categoryTypeName = val
        }
        else{
          entity[headerName] = val
        }
        return dummyKey
      }, (entity, dummyKey) => this.resetStyle(entity, dummyKey))
    },
  }
}
</script>

<style scoped lang="scss">

</style>