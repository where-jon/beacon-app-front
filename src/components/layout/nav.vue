<template>
  <b-navbar toggleable="md" type="dark" :class="topNavBarClasses">
    <!-- Responsive menu -->
    <b-navbar-toggle target="nav_collapse" v-show="!isLoginPage && showNav"></b-navbar-toggle>  

    <!-- Title -->
    <b-navbar-brand>
      <div class="appTitle">
        <img src="/toplogo.png" width="220" height="36" v-if="showLogo" />
        <span v-if="!showLogo" v-t="'label.title'"></span>
      </div>
    </b-navbar-brand>

    <b-collapse is-nav id="nav_collapse" v-show="!isLoginPage && showNav">

      <!-- left (navi dropdown menu) -->
      <b-navbar-nav>
        <b-nav-item-dropdown v-for="group in this.$store.state.menu" :key="group.path">
          <template slot="button-content">
            <em v-t="'label.' + group.key" />
          </template>
          <b-dropdown-item v-for="page in group.pages" :key="page.key" href="#" @click="move('/' + group.base + page.path)" v-t="'label.' + page.key" :class="navbarClasses"/>
        </b-nav-item-dropdown>
      </b-navbar-nav>

      <!-- right -->
      <b-navbar-nav class="ml-auto" v-show="!isLoginPage && showNav">
        <!-- user & logout -->
        <b-nav-item-dropdown right>
          <template slot="button-content">
            <i class="fa fa-user" aria-hidden="true"></i>&nbsp;<em>{{ loginId }}</em>
          </template>
          <b-dropdown-item href="#" @click="move('/setting/personal')" v-t="'label.personal'"></b-dropdown-item>
          <b-dropdown-item href="#" @click="logout"><i class="fas fa-sign-out-alt"></i>&nbsp;<span v-t="'label.logout'"></span></b-dropdown-item>
          <b-dropdown-divider/>
          <b-dropdown-item @click="versionClick">{{ version }}</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>

    </b-collapse>
  </b-navbar>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as AuthHelper from '../../sub/helper/AuthHelper'
import { DISP, APP } from '../../sub/constant/config'
import { LOGIN_MODE } from '../../sub/constant/Constants'
import { getThemeClasses } from '../../sub/helper/ThemeHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import commonmixinVue from '../mixin/commonmixin.vue';

export default {
  mixin: [commonmixinVue],
  data() {
    return {
      version: APP.VERSION,
      nav : this.$store.state.menu,
      showLogo: DISP.SHOW_LOGO,
      showNav: HtmlUtil.isMobile() || DISP.SHOW_NAV
    }
  },
  mounted() {
      window.addEventListener('resize', () => {
        this.showNav = HtmlUtil.isMobile() || DISP.SHOW_NAV
      })
  },
  computed: {
    isLoginPage() {
      return this.$route.path == APP.LOGIN_PAGE || this.$route.path == APP.LOGIN_PAGE + '/' || this.$route.path == APP.ERROR_PAGE
    },
    isNoLogin() {
      return APP.LOGIN_MODE == LOGIN_MODE.NO_LOGIN
    },
    loginId() {
      return this.$store.state.loginId
    },
    ...mapState('app_service', [
      'pots',
    ]),
    navbarClasses() {
      const storeTheme = this.$store.state.setting.theme
      return getThemeClasses()
    },
    topNavBarClasses() {
      let classes = {}
      Object.assign(classes , this.navbarClasses);
      if(this.showNav && HtmlUtil.getLangShort() != "ja"){
        classes["topMenuNavbar"] = true
      }
      return classes
    },
  },
  methods: {
    logout() {
      AuthHelper.logout()
    },
    move(page) {
      this.$router.push(page)
    },
    versionClick() {
      console.log("app service revision:", this.$store.state.serviceRev)
      console.log("app front revision:", this.$store.state.frontRev)
    }
  }
}
</script>

<style lang="scss">
@import "../../sub/constant/config.scss";

.rotate {
  animation: fa-spin 2s infinite linear;
}

.topMenuNavbar {
  @media (max-width: 1119px) and (min-width: 768px) {
    min-width: 1120px;
  }
}

.navbar-dark .navbar-nav .nav-link {
  color: white;
}

div.appTitle {
  min-width: calc(15vw);
}

a.dropdown-item.default:hover {
  background-color: #7EA0C4 !important;
}

a.dropdown-item.earthcolor:hover {
  background-color: #819E6E !important;
}

a.dropdown-item.autumn:hover {
  background: #C5AA78 !important;
}

a.dropdown-item.vivid:hover {
  background: #EE5588 !important;
}

div.navbar-brand {
  margin: 0 auto;
}

em:not(:hover) {
  color: white;
}
</style>
