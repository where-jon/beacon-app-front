<template>
  <div class="container-fluid">
    <category-bulk-edit :p-name="name" :p-type-list="typeList" :p-path="indexPath" />
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
      return 'zone'
    },
    typeList() {
      return [CATEGORY.ZONE]
    },
    indexPath() {
      return '/master/categoryZone'
    },
  },
}
</script>

<style scoped lang="scss">

</style>
