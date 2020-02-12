<template>
  <div class="container-fluid">
    <category-bulk-edit :p-name="name" :p-type-list="typeList" :p-path="indexPath" :p-app-service-path="appServicePath" />
  </div>
</template>

<script>
import { CATEGORY } from '../../../sub/constant/Constants'
import categoryBulkEdit from '../category/bulkedit.vue'

export default {
  components: {
    categoryBulkEdit,
  },
  computed: {
    name() {
      return 'thing'
    },
    typeList() {
      return [CATEGORY.THING]
    },
    indexPath() {
      return '/master/categoryThing'
    },
    appServicePath() {
      return '/basic/personCategory'
    },
  },
}
</script>

<style scoped lang="scss">

</style>
