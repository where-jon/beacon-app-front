<template>
  <div>
    <m-nav />
    <b-container fluid>
      <b-row v-if="!isLoginPage" class="flex-xl-nowrap2">
        <b-col v-if="getShowSideBar()" id="bd-sidebar" :class="sidebarClasses" md="2" xl="2" class="d-none d-sm-none d-md-block" :style="sidebarStyle">
          <m-sidebar />
        </b-col>
        <b-col id="bd-page" :md="getShowSideBar()? 10: 12" class="pl-0 pr-0">
          <b-container fluid>
            <b-row>
              <b-col class="pl-md-5 pl-xl-5 pr-xl-5 bd-content">
                <nuxt />
                <div v-if="showProgress" class="spinner-parent">
                  <vue-simple-spinner size="large" line-fg-color="#a09e9e" line-bg-color="#dee2e6" />
                </div>
              </b-col>
            </b-row>
          </b-container>
        </b-col>
      </b-row>
      <nuxt v-else />
      <!-- modal -->
      <b-modal id="modalRootError" :title="$t('label.error')" ok-only>
        {{ errorMessage }}
      </b-modal>
    </b-container>
  </div>
</template>

<script>

import Vue from 'vue'
import { mapState, mapMutations } from 'vuex'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import Spinner from 'vue-simple-spinner'

import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'

import { APP, DISP, DEV, EXCLOUD, MSTEAMS_APP } from '../sub/constant/config'
import { getLangShort } from '../sub/util/BrowserUtil'
import { EventBus } from '../sub/helper/base/EventHelper'
import * as LocaleHelper from '../sub/helper/base/LocaleHelper'
import { getThemeColor, getThemeClasses } from '../sub/helper/ui/ThemeHelper'

import mNav from '../components/layout/nav.vue'
import mSidebar from '../components/layout/sidebar.vue'

Vue.use(BootstrapVue)
Vue.component('vue-simple-spinner', Spinner)
Vue.component('v-select', vSelect)
library.add(fas)

export default {
  components: {
    mNav,
    mSidebar, 
  },
  data() {
    return {
      conf: {
        app: APP,
        disp: DISP,
        dev: DEV,
        excloud: EXCLOUD,
      },
      sidebarStyle: {
        'min-height': null,
      },
    }
  },
  computed: {
    errorMessage() {
      if (this.$store.state.error) {
        return this.$i18n.t('message.' + this.$store.state.error.key)
      }
      return ''
    },
    loginId() {
      return this.$store.state.loginId
    },
    isLoginPage() {
      return this.$route.path == APP.MENU.LOGIN_PAGE || this.$route.path == APP.MENU.LOGIN_PAGE + '/'
    },
    ...mapState([
      'showProgress',
      'title',
      'error',
    ]),
    sidebarClasses () {
      // use for update theme-color
      this.$store.state.setting.theme
      return {
        'bd-sidebar': true,
        ...getThemeClasses()
      }
    },
    eventBus() {
      return EventBus
    },
  },
  watch: {
    sidebarClasses: function(newVal, oldVal) {
      this.setDropdownMenuColor()
    }
  },
  mounted() {
    EventBus.$off('pluginUpdateDefault')
    EventBus.$on('pluginUpdateDefault', height => this.sidebarStyle['min-height'] = height? height + 'px': null)
    this.setDropdownMenuColor()
    this.setLang(LocaleHelper.getLocale(getLangShort()))
  },
  methods: {
    ...mapMutations([
      'setLang',
    ]),
    setColor(className, color) {
      [].forEach.call(document.getElementsByClassName(className), (e) => {
        e.style.backgroundColor = color
      })
    },
    setDropdownMenuColor() {
      const color = getThemeColor()
      this.setColor('dropdown-menu', color)
      this.setColor('dropdown-item', color)
    },
    getShowSideBar(){
      // MS Teams内で実行する場合、サイドバーを表示しない
      return this.conf.disp.MENU.SHOW_SIDEBAR && (!MSTEAMS_APP.IS_COOPERATION)
    },
  },
  head() { // browser tab title
    return {
      title: this.$t('label.title')
    }
  },
}

</script>


<style lang="scss">
@import "../sub/constant/config.scss";
@import "../sub/constant/vue.scss";
@import "~bootstrap/scss/bootstrap"; 

html {
  font-family: "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

*, *:before, *:after {
  box-sizing: border-box;
  margin: 0;
}

.dropdown-item, .dropdown-menu {
  color:aliceblue;
  background-color: $menu-bg;
}

.dropdown-item:hover,
.dropdown-item:focus {
  color:aliceblue;
  background-color: $menu-bg-hover;
}

.page-header {
  padding: 0 0 9px 5px;
  margin: 10px 0 20px 0;
  border-bottom: 1px solid #eee;
}

.pointer {
  cursor: pointer;
}

.spinner-parent {
  top: 45vh;
  position: fixed;
  left: 0;
  right: 0;
  z-index: 100;
}

.undetect {
  background-color: $undetect
}

.clear {
  clear: both;
}

.form-control:disabled, .form-control[readonly] {
  background-color: #e9ecef5e;
  opacity: 1;
}

.v-select {
  min-width: 130px;
  width: 200px;
  margin-left: 5px;
  margin-right: 20px;
  .dropdown-menu {
    color: #000;
  }
  span.selected-tag {
    pointer-events: none;
  }
  span.selected-tag + input[type=search] {
    width: 0 !important;
  }
  &.open input[type=search] {
    width: auto !important;
  }
}

em {
  font-style: normal;
}

textarea:focus,
input[type="text"]:focus,
input[type="password"]:focus,
input[type="datetime"]:focus,
input[type="datetime-local"]:focus,
input[type="date"]:focus,
input[type="month"]:focus,
input[type="time"]:focus,
input[type="week"]:focus,
input[type="number"]:focus,
input[type="email"]:focus,
input[type="url"]:focus,
input[type="search"]:focus,
input[type="tel"]:focus,
input[type="color"]:focus,
input[type="file"]:focus,
.uneditable-input:focus {   
  border-color: rgba(203, 206, 209, 0.8);
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.075) inset, 0 0 13px rgba(203, 206, 209, 0.6);
  outline: 0 none;
}

</style>
