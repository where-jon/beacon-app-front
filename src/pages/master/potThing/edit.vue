<template>
  <div class="container-fluid">
    <pot-edit :p-name="name" :p-type-list="typeList" :p-path="indexPath" :p-app-service-path="appServicePath" />
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
      return 'thing'
    },
    typeList() {
      return [CATEGORY.THING]
    },
    indexPath() {
      return '/master/potThing'
    },
    appServicePath() {
      return '/basic/thingPot'
    },
  },
}
</script>

<style scoped lang="scss">

</style>
