<template>
  <div />
</template>

<script>
import { APP } from '../sub/constant/config'

export default {
  mounted() {
    this.$router.push(APP.MENU.TOP_PAGE)  // redirect
  }
}

</script>

<style>
</style>
