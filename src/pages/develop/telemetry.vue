<template>
  <telemetry :is-dev="true" />
</template>

<script>
import telemetry from '../monitor/telemetry.vue'

export default {
  components: {
    telemetry
  },
  data () {
    return {}
  }
}
</script>