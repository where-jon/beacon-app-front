<template>
  <div />
</template>

<script>
import * as AADHelper from '../../sub/helper/base/AADHelper'

export default {
  async mounted() {
    AADHelper.tokenEnd()
  }
}

</script>

<style>
</style>
