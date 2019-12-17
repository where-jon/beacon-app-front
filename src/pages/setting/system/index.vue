
<template>
  <div class="container-fluid">
    <system-setting :p-breadcrumb-items="breadcrumbItems" use-regist-form use-key-category-filter />
  </div>
</template>

<script>
import systemSetting from '../../../components/page/systemSetting.vue'

export default {
  components: {
    systemSetting,
  },
  computed: {
    breadcrumbItems() {
      return ['setting', 'system']
    },
  },
}
</script>

<style scoped lang="scss">
</style>
