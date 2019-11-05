<template>
  <div class="container-fluid">
    <category-edit :p-name="name" :p-type-list="typeList" :p-path="indexPath" />
  </div>
</template>

<script>
import { CATEGORY } from '../../../sub/constant/Constants'
import categoryEdit from '../category/edit.vue'

export default {
  components: {
    categoryEdit,
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
