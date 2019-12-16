
<template>
  <div class="container-fluid">
    <system-setting :p-breadcrumb-items="breadcrumbItems" :filter-func="settingFilter" />
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
      return ['setting', 'system']
    },
  },
  methods: {
    settingFilter(setting) {
      return APP.MANAGE.SETTING_CATEGORY.map(val => val.toUpperCase()).includes(setting.categoryKey)
    }
  },
}
</script>

<style scoped lang="scss">
</style>
