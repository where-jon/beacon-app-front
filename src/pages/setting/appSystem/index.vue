
<template>
  <div class="container-fluid">
    <system-setting :p-breadcrumb-items="breadcrumbItems" use-setting-category-filter/>
  </div>
</template>

<script>
import { APP } from '../../../sub/constant/config'
import systemSetting from '../../../components/page/systemSetting.vue'

export default {
  components: {
    systemSetting,
  },
  computed: {
    breadcrumbItems() {
      return ['setting', 'systemChild']
    },
  },
}
</script>

<style scoped lang="scss">
</style>
