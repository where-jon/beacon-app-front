<template>
  <b-navbar toggleable="md" type="dark" :class="navbarClasses">
    <!-- Responsive menu -->
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>  

    <!-- Title -->
    <b-navbar-brand>
      <!--
      <span v-t="'label.title'" />
      -->
      <img src="/toplogo.png" width=220 height=36 />
    </b-navbar-brand>

    <b-collapse is-nav id="nav_collapse" v-if="!isLoginPage">

      <!-- left (navi dropdown menu) -->
      <b-navbar-nav>
        <b-nav-item-dropdown v-for="group in this.$store.state.menu" :key="group.path">
          <template slot="button-content">
            <em v-t="'label.' + group.key" />
          </template>
          <b-dropdown-item v-for="page in group.pages" :key="page.key" href="#" @click="move('/' + group.base + page.path)" v-t="'label.' + page.key" />
        </b-nav-item-dropdown>
      </b-navbar-nav>

      <!-- right -->
      <b-navbar-nav class="ml-auto">
        <!-- user & logout -->
        <b-nav-item-dropdown right>
          <template slot="button-content">
            <i class="fa fa-user" aria-hidden="true"></i>&nbsp;<em>{{ loginId }}</em>
          </template>
          <b-dropdown-item href="#" @click="move('/setting/personal')">Profile</b-dropdown-item>
          <b-dropdown-item href="#" @click="logout"><i class="fas fa-sign-out-alt"></i>&nbsp;Logout</b-dropdown-item>
          <b-dropdown-divider/>
          <b-dropdown-item>{{ version }}</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>

    </b-collapse>
  </b-navbar>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import { EventBus } from '../sub/helper/EventHelper'
import * as HtmlUtil from '../sub/util/HtmlUtil'
import * as Util from '../sub/util/Util'
import * as AuthHelper from '../sub/helper/AuthHelper'
import { DISP, APP, THEME } from '../sub/constant/config'
import { LOGIN_MODE } from '../sub/constant/Constants'
import { getThemeClasses } from '../sub/helper/ThemeHelper'

export default {
  mounted() {
    setInterval(()=>{
      let reload = document.getElementsByClassName("reload")[0]
      if (reload) {
        reload.click()
      }
    }, DISP.AUTO_RELOAD)  
  },
  data() {
    return {
      version: APP.VERSION,
      nav : this.$store.state.menu,
    }
  },
  computed: {
    isLoginPage() {
      return this.$route.path == APP.LOGIN_PAGE
    },
    showReload() {
      return !this.$route.path.endsWith("edit") && this.$route.path != '/master/location'
    },
    isNoLogin() {
      return APP.LOGIN_MODE == LOGIN_MODE.NO_LOGIN
    },
    loginId() {
      return this.$store.state.loginId
    },
    ...mapState('app_service', [
      'persons',
    ]),
    navbarClasses () {
      const storeTheme = this.$store.state.setting.theme
      return getThemeClasses(this.loginId)
    },
  },
  methods: {
    logout() {
      AuthHelper.logout()
    },
    profile() {
      alert('Not implemented')
    },
    move(page) {
      this.$router.push(page)
    },
    fetchData(e) {
      HtmlUtil.addClass(e, "rotate")
      EventBus.$emit('reload', {
        done() {
          HtmlUtil.removeClass(e, "rotate")
          AuthHelper.checkSession()
        }
      })
    },
    ...mapMutations('app_service', [
      'replaceAS', 
    ])
  }
}
</script>

<style lang="scss">
@import "../sub/constant/config.scss";

.rotate {
  animation: fa-spin 2s infinite linear;
}

.navbar-dark .navbar-nav .nav-link {
  color: white;
}

ul.navbar-nav {
  margin-left: 5%;
}

.dropdown-menu.default {
  background-color: $menu-bg;
}

.dropdown-menu.primary {
  background-color: $blue;
}

.dropdown-menu.secondary {
  background-color: $gray-600;
}

.dropdown-menu.success {
  background-color: $green;
}

.dropdown-menu.info {
  background-color: $cyan;
}

.dropdown-menu.warning {
  background-color: $yellow;
}

.dropdown-menu.danger {
  background-color: $red;
}

.dropdown-menu.light {
  background-color: $gray-100;
}

.dropdown-menu.dark {
  background-color: $gray-800;
}

</style>
