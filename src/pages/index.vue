<template>
  <div />
</template>

<script>
import { APP } from '../sub/constant/config'

export default {
  mounted() {
    if (!APP.AUTH.USE_AD) {
      this.$router.push(APP.MENU.TOP_PAGE)  // redirect
    } else {
      this.$router.push('/azlogin/')  // redirect
    }
  }
}

</script>

<style>
</style>
