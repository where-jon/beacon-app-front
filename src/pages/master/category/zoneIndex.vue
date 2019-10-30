<template>
  <div class="container-fluid">
    <category-index :p-type="categoryType" :p-path="indexPath" />
  </div>
</template>

<script>
import { CATEGORY } from '../../../sub/constant/Constants'
import categoryIndex from './index.vue'

export default {
  components: {
    categoryIndex,
  },
  computed: {
    categoryType() {
      return CATEGORY.ZONE
    },
    indexPath() {
      return '/master/category/zoneIndex'
    },
  },
}
</script>

<style scoped lang="scss">

</style>
