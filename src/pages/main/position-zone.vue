<template>
  <div>
    <breadcrumb :items="items" :extra-nav-spec="extraNavSpec"
                :reload="reload" :short-name="shortName"
    />
    <position-class position-name="zone" class-name="zone" />
  </div>
</template>

<script>
import breadcrumb from '../../components/layout/breadcrumb.vue'
import positionClass from '../../components/page/position-class.vue'
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
      items: [
        {
          text: this.$i18n.t('label.main'),
          active: true
        },
        {
          text: this.$i18n.t('label.positionZone'),
          active: true
        }
      ],
      shortName: this.$i18n.t('label.positionZoneShort'),
      extraNavSpec: EXTRA_NAV,
    }
  },
}  
</script>

<style scoped lang="scss">
</style>
