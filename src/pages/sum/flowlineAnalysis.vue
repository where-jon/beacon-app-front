<template>
  <div id="mapContainer" class="container-fluid">
    <virtual
      :p-caption-list="captionList"
      :p-filter-list="filterList"
      :p-extra-filter-list="extraFilterList"
      p-analysis
      p-analysis-individual
    />
  </div>
</template>

<script>
import virtual from '../../components/page/virtual.vue'

export default {
  components: {
    virtual,
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
