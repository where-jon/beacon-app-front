<template>
  <div class="container-fluid">
    <category-index :p-name="name" :p-type-list="typeList" :p-path="indexPath" :p-app-service-path="appServicePath" />
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
      return 'person'
    },
    typeList() {
      return [CATEGORY.PERSON]
    },
    indexPath() {
      return '/master/categoryPerson'
    },
    appServicePath() {
      return '/basic/personCategory'
    },
  },
}
</script>

<style scoped lang="scss">

</style>
