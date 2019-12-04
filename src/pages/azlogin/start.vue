<template>
  <div>
  </div>
</template>

<script>
import * as AADHelper from '../../sub/helper/base/AADHelper'

export default {
  async mounted() {
    AADHelper.getContext()
  }
}

</script>

<style>
</style>
