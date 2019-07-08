<template>
  <positionHistoryExc :pitems="items" :pname="name" :ptype="type" />
</template>

<script>
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import positionHistoryExc from './positionHistoryExc.vue'

export default {
  components: {
    positionHistoryExc,
  },
  data () {
    return {
      name: 'sensorHistory',
      items: ViewHelper.createBreadCrumbItems('historyTitle', 'sensorHistory'),
      type: 'sensor',
    }
  }
}
</script>

