<template>
  <div>
    <m-nav></m-nav>
    <b-container fluid>
      <b-row class="flex-xl-nowrap2" v-if="!isLoginPage">
        <b-col md="2" xl="2" id="bd-sidebar" :class="sidebarClasses" v-if="showSidebar">
          <m-sidebar></m-sidebar>
        </b-col>
        <b-col :md="showSidebar? 10: 12" class="pl-0 pr-0">
          <b-container fluid>
            <b-row>
              <b-col class="pb-md-3 pl-md-5 pl-xl-5 pr-xl-5 bd-content">
                <nuxt/>
                <div class="spinner-parent" v-if="showProgress">
                  <vue-simple-spinner size="large" line-fg-color="#a09e9e" line-bg-color="#dee2e6"></vue-simple-spinner>
                </div>
              </b-col>
            </b-row>
          </b-container>
        </b-col>
      </b-row>
      <nuxt v-else />
    </b-container>
  </div>
</template>

<script>

import Vue from 'vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import { EventBus } from '../sub/helper/EventHelper'
import { APP, DISP } from '../sub/constant/config'
import styles from '../sub/constant/config.scss'

import mSidebar from '~/components/sidebar.vue'
import mNav from '~/components/nav.vue'

import vSelect from 'vue-select'
import BootstrapVue from 'bootstrap-vue'
import Spinner from 'vue-simple-spinner'
import '@fortawesome/fontawesome-free-webfonts/css/fontawesome.css'
import '@fortawesome/fontawesome-free-webfonts/css/fa-solid.css'
import '@fortawesome/fontawesome-free-webfonts/css/fa-brands.css'
import '@fortawesome/fontawesome-free-webfonts/css/fa-regular.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue)
Vue.component('vue-simple-spinner', Spinner)
Vue.component('v-select', vSelect)


export default {
  components: {
    mSidebar, 
    mNav
  },
  mounted() {
  },
  data() {
    return {
      showSidebar: DISP.SHOW_SIDEBAR,
      sidebarClasses: {
        'bd-sidebar': true,
        default: DISP.THEME === 'default',
        primary: DISP.THEME === 'primary',
        secondary: DISP.THEME === 'secondary',
        success: DISP.THEME === 'success',
        info: DISP.THEME === 'info',
        warning: DISP.THEME === 'warning',
        danger: DISP.THEME === 'danger',
        light: DISP.THEME === 'light',
        dark: DISP.THEME === 'dark',
      },
    }
  },
  computed: {
    isLoginPage() {
      return this.$router.app._route.path == APP.LOGIN_PAGE
    },
    ...mapState([
      'showProgress',
      'title',
    ]),
  },
  methods: {
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

.dropdown-item:hover {
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
  top: 45%;
  position: absolute;
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

.bd-sidebar.default {
  background-color: $menu-bg;
}

.bd-sidebar.primary {
  background-color: $blue;
}

.bd-sidebar.secondary {
  background-color: $gray-600;
}

.bd-sidebar.success {
  background-color: $green;
}

.bd-sidebar.info {
  background-color: $cyan;
}

.bd-sidebar.warning {
  background-color: $yellow;
}

.bd-sidebar.danger {
  background-color: $red;
}

.bd-sidebar.light {
  background-color: $gray-100;
}

.bd-sidebar.dark {
  background-color: $gray-800;
}

</style>
