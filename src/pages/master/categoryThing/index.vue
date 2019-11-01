<template>
  <div class="container-fluid">
    <category-index :p-name="name" :p-type-list="typeList" :p-path="indexPath" />
  </div>
</template>

<script>
import { CATEGORY } from '../../../sub/constant/Constants'
import categoryIndex from '../category/index.vue'

export default {
  components: {
    categoryIndex,
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
  },
}
</script>

<style scoped lang="scss">

</style>
