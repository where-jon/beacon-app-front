<template>
  <b-navbar toggleable="md" type="dark" :class="topNavBarClasses">
    <!-- Responsive menu -->
    <b-navbar-toggle v-show="!isLoginPage && showNav" target="nav_collapse" />  

    <!-- Title -->
    <b-navbar-brand>
      <div class="appTitle">
        <img v-if="showLogo" src="/toplogo.png" width="220" height="36">
        <span v-if="!showLogo" v-t="'label.title'" />
      </div>
    </b-navbar-brand>

    <b-collapse v-show="!isLoginPage && showNav" id="nav_collapse" ref="collapse" is-nav>
      <!-- left (navi dropdown menu) -->
      <b-navbar-nav>
        <b-nav-item-dropdown v-for="group in this.$store.state.menu" :key="group.path">
          <template slot="button-content">
            <em v-t="'label.' + group.key" />
          </template>
          <b-dropdown-item v-for="page in group.pages" :key="page.key" v-t="'label.' + page.key" href="#" :class="navbarClasses" @click="move('/' + group.base + page.path)" />
        </b-nav-item-dropdown>
      </b-navbar-nav>

      <!-- right -->
      <b-navbar-nav v-show="!isLoginPage && showNav" class="ml-auto">
        <!-- region -->
        <b-nav-item-dropdown right>
          <template slot="button-content">
            <div v-if="isTenantAdmin">
              <i class="far fa-building mr-1" aria-hidden="true" style="visibility: hidden;" />
              <span>{{ currentTenantName }}</span>
            </div>
            <i class="far fa-building mr-1" aria-hidden="true" />
            <span>{{ currentRegionName }}</span>
          </template>
          <b-dropdown-item v-for="region in this.$store.state.app_service.regions" :key="region.regionId" href="#" @click="switchRegion(region)">
            <i class="far fa-building mr-1" aria-hidden="true" :style="getStyleDropdownRegion(region.regionId)" />
            <span>{{ region.regionName }}</span>
          </b-dropdown-item>
        </b-nav-item-dropdown>
        <!-- user & logout -->
        <b-nav-item-dropdown right>
          <template slot="button-content">
            <i class="fa fa-user" aria-hidden="true" />&nbsp;<em>{{ loginId }}</em>
          </template>
          <b-dropdown-item href="#" @click="move('/setting/personal')">
            <i class="fas fa-user-cog menu-item-icon" />&nbsp;{{ $t('label.personal') }}
          </b-dropdown-item>
          <b-dropdown-item href="#" @click="logout">
            <i class="fas fa-sign-out-alt menu-item-icon" />&nbsp;{{ $t('label.logout') }}
          </b-dropdown-item>
          <b-dropdown-divider />
          <b-dropdown-item @click="versionClick">
            {{ version }}
          </b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
import { mapState } from 'vuex'
import * as AuthHelper from '../../sub/helper/AuthHelper'
import { DISP, APP } from '../../sub/constant/config'
import { LOGIN_MODE } from '../../sub/constant/Constants'
import { getThemeClasses } from '../../sub/helper/ThemeHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import commonmixinVue from '../mixin/commonmixin.vue'
import * as StateHelper from '../../sub/helper/StateHelper'

export default {
  mixin: [commonmixinVue],
  data() {
    return {
      version: APP.VERSION,
      nav : this.$store.state.menu,
      showLogo: DISP.SHOW_LOGO,
      showNav: HtmlUtil.isMobile() || DISP.SHOW_NAV,
      login: JSON.parse(window.localStorage.getItem('login')),
      currentTenantName: '',
      currentRegionName: '',
      currentRegionId: null,
      switchReload: true,
    }
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
      'pots', 'regions',
    ]),
    navbarClasses() {
      return getThemeClasses()
    },
    topNavBarClasses() {
      let classes = {}
      Object.assign(classes , this.navbarClasses)
      if(this.showNav && HtmlUtil.getLangShort() != 'ja'){
        classes['topMenuNavbar'] = true
      }
      return classes
    },
  },
  async created() {
    this.currentTenantName = this.login && this.login.currentTenant? this.login.currentTenant.tenantName: ''
    this.currentRegionName = this.login && this.login.currentRegion? this.login.currentRegion.regionName: ''
    this.currentRegionId = this.login && this.login.currentRegion? this.login.currentRegion.regionId: null
    if(this.switchReload){
      this.switchReload = false
      await StateHelper.load('region')
    }
  },
  async mounted() {
    window.addEventListener('resize', () => {
      this.showNav = HtmlUtil.isMobile() || DISP.SHOW_NAV
    })
  },
  methods: {
    logout() {
      this.$refs.collapse.show = false
      AuthHelper.logout()
    },
    isTenantAdmin() {
      return this.$store.state.tenantAdmin
    },
    getStyleDropdownRegion(regionId) {
      return {visibility: this.currentRegionId == regionId? 'visible': 'hidden'}
    },
    move(page) {
      this.$router.push(page)
    },
    async switchRegion(item) {
      await AuthHelper.switchRegion(item.regionId)
      location.reload()
    },
    versionClick() {
      console.log('app service revision:', this.$store.state.serviceRev)
      console.log('app front revision:', this.$store.state.frontRev)
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

i.menu-item-icon {
  width: 20px;
}
</style>
