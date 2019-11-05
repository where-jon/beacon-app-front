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
      return 'thing'
    },
    typeList() {
      return [CATEGORY.THING]
    },
    indexPath() {
      return '/master/potThing'
    },
  },
}
</script>

<style scoped lang="scss">

</style>
