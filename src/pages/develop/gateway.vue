<template>
  <gateway :is-dev="true" />
</template>

<script>
import gateway from '../monitor/gateway.vue'

export default {
  components: { gateway },
  data () {
    return {}
  }
}
</script>