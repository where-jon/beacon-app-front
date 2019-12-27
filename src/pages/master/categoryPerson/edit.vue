<template>
  <div class="container-fluid">
    <category-edit :p-name="name" :p-type-list="typeList" :p-path="indexPath" :p-app-service-path="appServicePath" />
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
