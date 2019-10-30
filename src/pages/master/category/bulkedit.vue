<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkedit :id="id" ref="bulkEdit" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { LOCAL_STORAGE, CATEGORY } from '../../../sub/constant/Constants'
import * as Util from '../../../sub/util/Util'
import * as LocalStorageHelper from '../../../sub/helper/base/LocalStorageHelper'
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
      appServicePath: '/basic/category',
    }
  },
  computed: {
    ...mapState('app_service', [
      'category', 'categories'
    ]),
    indexProp() {
      return LocalStorageHelper.getLocalStorage(LOCAL_STORAGE.KEY.MASTER_INDEX)
    },
    backPath() {
      return this.indexProp.path
    },
    items() {
      return ViewHelper.createBreadCrumbItems('master', {text: 'category', href: this.backPath}, 'bulkRegister')
    },
    categoryTypes(){
      return CATEGORY.getTypes()
    },
  },
  async created() {
    await StateHelper.load('category')
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