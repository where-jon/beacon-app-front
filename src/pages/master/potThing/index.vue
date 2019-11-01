<template>
  <div class="container-fluid">
    <pot-index :p-name="name" :p-type-list="typeList" :p-path="indexPath" />
  </div>
</template>

<script>
import { CATEGORY } from '../../../sub/constant/Constants'
import potIndex from '../pot/index.vue'

export default {
  components: {
    potIndex,
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
