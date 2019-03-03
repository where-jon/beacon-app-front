<template>
  <div>
    <breadcrumb :items="items" :extra-nav-spec="extraNavSpec"
                :reload="reload" :short-name="shortName"
    />
    <position-class position-name="stack" class-name="area" />
  </div>
</template>

<script>
import breadcrumb from '../../components/layout/breadcrumb.vue'
import positionClass from '../../components/page/position-class.vue'
import * as ViewHelper from '../../sub/helper/ViewHelper'
import { EXTRA_NAV } from '../../sub/constant/Constants'

export default {
  components: {
    breadcrumb,
    positionClass,
  },
  data() {
    return {
      reload: true,
      styles: [],
      items: ViewHelper.createBreadCrumbItems('main', 'positionStack'),
      shortName: this.$i18n.t('label.positionStackShort'),
      extraNavSpec: EXTRA_NAV,
    }
  },
}
</script>

<style scoped lang="scss">
</style>
