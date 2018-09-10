<template>
  <b-breadcrumb :items="items" :style="{ marginTop: '20px'}"/>
</template>

<script>

  import bBreadcrumb from 'bootstrap-vue/es/components/breadcrumb/breadcrumb';

  export default {
    data () {
      return {
      }
   },
   props: ['items'],
  }

</script>

<style>
</style>