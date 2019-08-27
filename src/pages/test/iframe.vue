<template>
  <div class="movieWraper">
    <div class="iframeWrap">
      <iframe v-if="viewUrl" width="100%" height="100%" :src="viewUrl" allowfullscreen></iframe>
    </div>
  </div>
</template>

<script>
import * as Util from '../../sub/util/Util'

const VIEW_URL_PREFIX = '/plugin/'

export default {
  data() {
    return {
      url: null,
    }
  },
  computed: {
    viewUrl: {
      get: function() {
        return this.url
      },
      set: function(newVal) {
        return newVal
      }
    }
  },
  watch: {
    '$route' (to, from) {
      this.url = VIEW_URL_PREFIX + decodeURI(to.fullPath.split('=')[1])
    }
  },
  mounted() {
    if (Util.hasValue(window.location.search)) {
      const path = window.location.search.split('=')[1]
      if (Util.hasValue(path)) {
        this.url = VIEW_URL_PREFIX + path
      }
    }
  },
}
</script>

<style scoped lang="scss">
.movieWraper {
    position: relative;
    width: calc(100% - 10px);
    margin: 0 auto;
}

.iframeWrap{
    height: 0;
    padding-bottom: 62.5%;
}

iframe {
    position: absolute;
    top: 0;
    left: 0;
    margin-left: 0;
    border: none;
}
</style>