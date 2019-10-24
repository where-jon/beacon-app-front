<template>
  <div />
</template>

<script>
import { APP, MSTEAMS_APP } from '../sub/constant/config'

export default {
  mounted() {
    if (!MSTEAMS_APP.IS_COOPERATION) {
      this.$router.push(APP.MENU.TOP_PAGE)  // redirect
    } else {
      this.$router.push('/azlogin')  // redirect
    }
  }
}

</script>

<style>
</style>
