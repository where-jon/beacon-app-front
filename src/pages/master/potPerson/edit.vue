<template>
  <div class="container-fluid">
    <pot-edit :p-name="name" :p-type-list="typeList" :p-path="indexPath" />
  </div>
</template>

<script>
import { CATEGORY } from '../../../sub/constant/Constants'
import potEdit from '../pot/edit.vue'

export default {
  components: {
    potEdit,
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
