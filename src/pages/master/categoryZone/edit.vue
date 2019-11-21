<template>
  <div class="container-fluid">
    <category-edit :p-name="name" :p-type-list="typeList" :p-path="indexPath" :p-app-service-path="appServicePath" :p-show-icon="false" />
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
      return 'zone'
    },
    typeList() {
      return [CATEGORY.ZONE]
    },
    indexPath() {
      return '/master/categoryZone'
    },
    appServicePath() {
      return '/basic/personCategory'
    },
  },
}
</script>

<style scoped lang="scss">

</style>
