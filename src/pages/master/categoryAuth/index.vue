<template>
  <div class="container-fluid">
    <category-index :p-name="name" :p-type-list="typeList" :p-path="indexPath" :p-app-service-path="appServicePath" :p-show-icon="false" :p-show-description="false" p-show-auth />
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
      return 'auth'
    },
    typeList() {
      return [CATEGORY.AUTH]
    },
    indexPath() {
      return '/master/categoryAuth'
    },
    appServicePath() {
      return '/basic/authCategory'
    },
  },
}
</script>

<style scoped lang="scss">

</style>
