<template>
  <stayRatioBase :p-presence="true" />
</template>

<script>
import stayRatioBase from './stayRatioBase.vue'

// 日単位滞在分析のロジックを大幅に流用し、if文でパラメータによる分岐
export default {
  components: {
    stayRatioBase,
  }
}
</script>


