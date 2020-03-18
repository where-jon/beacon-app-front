
<template>
  <div class="container-fluid">
    <system-setting :p-breadcrumb-items="breadcrumbItems" :page-path="authPath" use-setting-category-filter/>
  </div>
</template>

<script>
import systemSetting from '../../components/page/systemSetting.vue'

export default {
  components: {
    systemSetting,
  },
  computed: {
    breadcrumbItems() {
      return ['setting', 'systemChild']
    },
    authPath() {
      return '/setting/systemChild'
    },
  },
}
</script>

<style scoped lang="scss">
</style>
