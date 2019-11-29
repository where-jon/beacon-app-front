<template>
  <div class="container-fluid">
    <pot-index :p-name="name" :p-type-list="typeList" :p-path="indexPath" :p-app-service-path="appServicePath" />
  </div>
</template>

<script>
import { POT_TYPE } from '../../../sub/constant/Constants'
import potIndex from '../pot/index.vue'

export default {
  components: {
    potIndex,
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
