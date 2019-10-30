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
      return CATEGORY.PERSON
    },
    indexPath() {
      return '/master/category/personIndex'
    },
  },
}
</script>

<style scoped lang="scss">

</style>
