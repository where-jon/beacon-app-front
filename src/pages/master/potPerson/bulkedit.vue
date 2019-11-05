<template>
  <div class="container-fluid">
    <pot-bulk-edit :p-name="name" :p-type-list="typeList" :p-path="indexPath" />
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
  },
}
</script>

<style scoped lang="scss">

</style>
