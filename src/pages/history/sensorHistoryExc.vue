<template>
  <positionHistoryExc :pitems="items" :pname="name" :ptype="type" />
</template>

<script>
import positionHistoryExc from './positionHistoryExc.vue'

export default {
  components: {
    positionHistoryExc,
  },
  data () {
    return {
      name: 'sensorHistory',
      items: [
        {
          text: this.$i18n.tnl('label.historyTitle'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.sensorHistory'),
          active: true
        }
      ],
      type: 'sensor',
    }
  }
}
</script>

