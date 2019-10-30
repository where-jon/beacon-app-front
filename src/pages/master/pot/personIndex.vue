<template>
  <div class="container-fluid">
    <pot-index :p-type="potType" :p-path="indexPath" />
  </div>
</template>

<script>
import { CATEGORY } from '../../../sub/constant/Constants'
import potIndex from './index.vue'

export default {
  components: {
    potIndex,
  },
  computed: {
    potType() {
      return CATEGORY.PERSON
    },
    indexPath() {
      return '/master/pot/personIndex'
    },
  },
}
</script>

<style scoped lang="scss">

</style>
