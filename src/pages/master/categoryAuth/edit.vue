<template>
  <div class="container-fluid">
    <category-edit :p-name="name" :p-type-list="typeList" :p-path="indexPath" :p-show-icon="false" :p-show-description="false" p-show-auth />
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
      return 'auth'
    },
    typeList() {
      return [CATEGORY.AUTH]
    },
    indexPath() {
      return '/master/categoryAuth'
    },
  },
}
</script>

<style scoped lang="scss">

</style>
