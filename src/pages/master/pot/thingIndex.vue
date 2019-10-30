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
      return CATEGORY.THING
    },
    indexPath() {
      return '/master/pot/thingIndex'
    },
  },
}
</script>

<style scoped lang="scss">

</style>
