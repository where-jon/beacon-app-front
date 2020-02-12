<template>
  <div class="container-fluid">
    <pot-bulk-edit :p-name="name" :p-type-list="typeList" :p-path="indexPath" :p-app-service-path="appServicePath" />
  </div>
</template>

<script>
import { CATEGORY } from '../../../sub/constant/Constants'
import potBulkEdit from '../pot/bulkedit.vue'

export default {
  components: {
    potBulkEdit,
  },
  computed: {
    name() {
      return 'person'
    },
    typeList() {
      return [CATEGORY.PERSON]
    },
    indexPath() {
      return '/master/potPerson'
    },
    appServicePath() {
      return '/basic/personPot'
    },
  },
}
</script>

<style scoped lang="scss">

</style>
