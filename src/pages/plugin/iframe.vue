<template>
  <div class="iframeWrap">
    <iframe v-if="viewUrl" ref="parentFrame" width="100%" :style="iframeStyle" @load="loadCompleteFunc" allowfullscreen></iframe>
  </div>
</template>

<script>
import { APP_SERVICE } from '../../sub/constant/config'
import { PLUGIN_CONSTANTS } from '../../sub/constant/Constants'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as Util from '../../sub/util/Util'
import { EventBus } from '../../sub/helper/base/EventHelper'
import * as LocalStorageHelper from '../../sub/helper/base/LocalStorageHelper'
import commonmixin from '../../components/mixin/commonmixin.vue'

export default {
  mixins: [commonmixin],
  data() {
    return {
      url: null,
      VIEW_URL_PREFIX: '/plugin/',
      scrollHeight: '100%',
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
    },
    iframeStyle() {
      return {
        height: typeof this.scrollHeight == 'number'? (this.scrollHeight) + 'px': this.scrollHeight,
        overflow: 'hidden',
        'overflow-x': 'hidden',
        'overflow-y': 'hidden',
      }
    },
  },
  watch: {
    '$route' (to, from) {
      this.url = LocalStorageHelper.getLocalStorage(PLUGIN_CONSTANTS.PLUGIN_KEY_PREFIX + '-' + to.fullPath.split('=')[1])
      this.$nextTick(() => {
        this.refreshIframeSrc()
        this.showProgress()
      })
    }
  },
  created() {
    EventBus.$off('pluginUpdate')
    EventBus.$on('pluginUpdate', () => {
      try {
        const pageHeight = document.getElementById('bd-page').clientHeight
        const childFrame = this.$refs.parentFrame.contentWindow.document.body
        const childHeight = childFrame.scrollHeight + 64
        this.scrollHeight = pageHeight > childHeight? pageHeight: childHeight
        EventBus.$emit('pluginUpdateDefault', this.scrollHeight)
      } catch(e) {}
    })
    EventBus.$off('pluginDownload')
    EventBus.$on('pluginDownload', url => BrowserUtil.executeFileDL(url))
  },
  mounted() {
    const query = PLUGIN_CONSTANTS.PLUGIN_KEY_PREFIX + '='
    LocalStorageHelper.setLocalStorage('api-base-url', APP_SERVICE.BASE_URL)
    this.url = this.getPluginIndex()
    this.$nextTick(() => {
      this.refreshIframeSrc()
      this.showProgress()
    })
  },
  beforeDestroy() {
    EventBus.$emit('pluginUpdateDefault')
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
    refreshIframeSrc() {
      if(this.$refs.parentFrame) {
        this.$refs.parentFrame.contentWindow.location.replace(this.url)
      }
    },
  }
}
</script>

<style scoped lang="scss">
.iframeWrap{
    height: 0;
}

iframe {
    position: absolute;
    top: 0;
    left: 0;
    margin-left: 0;
    border: none;
}
</style>