<template>
  <stayRatioBase :p-presence="true" />
</template>

<script>
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import stayRatioBase from './stayRatioBase.vue'

// 日単位滞在分析のロジックを大幅に流用し、if文でパラメータによる分岐
export default {
  components: {
    stayRatioBase,
  },
  data () {
    return {
      name: 'presenceSum',
      items: ViewHelper.createBreadCrumbItems('sumTitle', 'presenceSum'),
    }
  }
}
</script>


