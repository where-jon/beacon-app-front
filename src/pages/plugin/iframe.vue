<template>
  <div class="movieWraper">
    <div class="iframeWrap">
      <iframe v-if="viewUrl" width="100%" height="100%" :src="viewUrl" allowfullscreen></iframe>
    </div>
  </div>
</template>

<script>
import * as Util from '../../sub/util/Util'
import { APP_SERVICE } from '../../sub/constant/config'
import { PLUGIN_CONSTANTS } from '../../sub/constant/Constants'
import * as LocalStorageHelper from '../../sub/helper/base/LocalStorageHelper'

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
      this.url = this.VIEW_URL_PREFIX + decodeURI(to.fullPath.split('=')[1])
    }
  },
  mounted() {
    LocalStorageHelper.setLocalStorage('api-base-url', APP_SERVICE.BASE_URL)
    if (Util.hasValue(window.location.search)) {
      const index = window.location.search.split('=')[1]
      if (Util.hasValue(index)) {
        const path = LocalStorageHelper.getLocalStorage(PLUGIN_CONSTANTS.PLUGIN_KEY_PREFIX + '-' + index)
        this.url = path
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
    padding-bottom: 65%;
}

iframe {
    position: absolute;
    top: 0;
    left: 0;
    margin-left: 0;
    border: none;
}
</style>