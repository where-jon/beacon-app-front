<template>
  <div class="container-fluid">
    <pot-bulk-edit :p-name="name" :p-type-list="typeList" :p-path="indexPath" :p-app-service-path="appServicePath" />
  </div>
</template>

<script>
import { POT_TYPE } from '../../../sub/constant/Constants'
import potBulkEdit from '../pot/bulkedit.vue'

export default {
  components: {
    potBulkEdit,
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
      return '/basic/potThingOther'
    },
  },
}
</script>

<style scoped lang="scss">

</style>
