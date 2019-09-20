<template>
  <div id="mapContainer" class="container-fluid">
    <virtual
      :p-caption-list="captionList"
      :p-filter-list="filterList"
      :p-extra-filter-list="extraFilterList"
      p-analysis
      :p-analysis-individual="useIndividual"
      p-show-heatmap
      p-default-heatmap
    />
  </div>
</template>

<script>
import { APP } from '../../sub/constant/config'
import virtual from '../../components/page/virtual.vue'

export default {
  components: {
    virtual,
  },
  computed: {
    captionList(){
      return ['sumTitle', 'heatmapPosition']
    },
    filterList(){
      return ['category', 'group']
    },
    extraFilterList(){
      return [APP.HEATMAP.USE_INDIVIDUAL? 'individual': null, 'datetime'].filter(val => val)
    },
    useIndividual(){
      return APP.HEATMAP.USE_INDIVIDUAL
    },
  },
}
</script>

<style scoped lang="scss">
</style>
