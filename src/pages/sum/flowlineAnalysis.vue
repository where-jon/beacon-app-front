<template>
  <div id="mapContainer" class="container-fluid">
    <ex-map
      :p-caption-list="captionList"
      :p-filter-list="filterList"
      :p-extra-filter-list="extraFilterList"
      p-analysis
      p-analysis-individual
    />
  </div>
</template>

<script>
import exMap from '../../components/page/ex-map.vue'

export default {
  components: {
    exMap,
  },
  computed: {
    captionList(){
      return ['sumTitle', 'flowlineAnalysis']
    },
    filterList(){
      return ['category', 'group']
    },
    extraFilterList(){
      return ['individual', 'datetime']
    },
  },
}
</script>

<style scoped lang="scss">
</style>
