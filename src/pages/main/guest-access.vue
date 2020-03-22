<template>
  <div id="mapContainer" class="container-fluid">
    <ex-map
      :p-caption-list="captionList"
      :p-show-tx-sensor-ids="[null]"
      p-show-detail
      :p-show-prohibit="true"
      :p-show-lost="false"
      p-split-auto-reload
      :p-show-zone="true"
    />
  </div>
</template>

<script>
import commonmixin from '../../components/mixin/commonmixin.vue'
import exMap from '../../components/page/ex-map.vue'

export default {
  components: {
    exMap,
  },
  mixins: [commonmixin],
  computed: {
    captionList(){
      return ['main', 'guestAccess']
    },
  },
  methods: {
  },
}
</script>

<style scoped lang="scss">
</style>
