<template>
  <div class="iframeWrap">
    <iframe v-if="viewUrl" width="100%" height="100%" :src="viewUrl" @load="loadCompleteFunc" allowfullscreen></iframe>
  </div>
</template>

<script>
import * as Util from '../../sub/util/Util'
import { APP_SERVICE } from '../../sub/constant/config'
import { PLUGIN_CONSTANTS } from '../../sub/constant/Constants'
import * as LocalStorageHelper from '../../sub/helper/base/LocalStorageHelper'
import commonmixin from '../../components/mixin/commonmixin.vue'

export default {
  mixins: [commonmixin],
  data() {
    return {
      url: null,
      VIEW_URL_PREFIX: '/plugin/'
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
      this.url = LocalStorageHelper.getLocalStorage(PLUGIN_CONSTANTS.PLUGIN_KEY_PREFIX + '-' + to.fullPath.split('=')[1])
      this.$nextTick(() => this.showProgress())
    }
  },
  mounted() {
    const query = PLUGIN_CONSTANTS.PLUGIN_KEY_PREFIX + '='
    LocalStorageHelper.setLocalStorage('api-base-url', APP_SERVICE.BASE_URL)
    this.url = this.getPluginIndex()
    this.$nextTick(() => this.showProgress())
  },
  methods: {
    getPluginIndex() {
      const query = PLUGIN_CONSTANTS.PLUGIN_KEY_PREFIX + '='
      if (!Util.hasValue(window.location.search) || window.location.search.indexOf(query) < 0) {
        return null
      }
      const index = window.location.search.split('=')[1]
      return Util.hasValue(index) ? LocalStorageHelper.getLocalStorage(PLUGIN_CONSTANTS.PLUGIN_KEY_PREFIX + '-' + index) : null
    },
    loadCompleteFunc() {
      this.$nextTick(() => this.hideProgress())
    },
  }
}
</script>

<style scoped lang="scss">
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