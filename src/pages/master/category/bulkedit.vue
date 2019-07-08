<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkedit :id="id" ref="bulkEdit" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { CATEGORY } from '../../../sub/constant/Constants'
import * as Util from '../../../sub/util/Util'
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