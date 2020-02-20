<template>
  <div id="mapContainer" class="container-fluid">
    <stay-ratio-stack
      page="stayRatioMeeting"
    />
  </div>
</template>

<script>
import stayRatioStack from '../../components/page/stayRatioStack.vue'

export default {
  components: {
    stayRatioStack,
  },
  computed: {
  },
}
</script>

<style scoped lang="scss">
</style>
