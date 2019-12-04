<template>
  <div class="container-fluid">
    <pot-edit :p-name="name" :p-type-list="typeList" :p-path="indexPath" :p-app-service-path="appServicePath" />
  </div>
</template>

<script>
import { POT_TYPE } from '../../../sub/constant/Constants'
import potEdit from '../pot/edit.vue'

export default {
  components: {
    potEdit,
  },
  computed: {
    name() {
      return 'other'
    },
    typeList() {
      return [POT_TYPE.OTHER]
    },
    indexPath() {
      return '/master/potOther'
    },
    appServicePath() {
      return '/basic/pot'
    },
  },
}
</script>

<style scoped lang="scss">

</style>
