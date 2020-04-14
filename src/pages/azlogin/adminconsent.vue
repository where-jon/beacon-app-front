<template>
  <div>
    <!-- <iframe width="350" height="600" :src="url" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen=""></iframe> -->
    test
  </div>
</template>

<script>
import { APP } from '../../sub/constant/config'

export default {
  computed: {
    url() {
      return APP.AUTH.ADMINCONSENT_URL_BASE + '?client_id=' + APP.AUTH.APP_ID + '&redirect_uri=' + APP.AUTH.REDIRECT_URL
    }
  },
}
</script>

<style>
</style>
