<template>
  <b-navbar :class="topNavBarClasses" toggleable="md" type="dark">
    <!-- Responsive menu -->
    <b-navbar-toggle v-show="!isLoginPage && showNav" target="nav_collapse" />  

    <!-- Title -->
    <b-navbar-brand>
      <div class="appTitle">
        <img v-if="showLogo" id="topLogo" src="/toplogo.png" width="0" height="0" @load="setLogo">
        <span v-if="!showLogo" v-t="'label.title'" />
      </div>
    </b-navbar-brand>

    <b-collapse v-show="!isLoginPage && showNav" id="nav_collapse" ref="collapse" is-nav>
      <!-- left (navi dropdown menu) -->
      <b-navbar-nav v-show="!isLoginPage && showNav">
        <b-nav-item-dropdown v-for="group in this.$store.state.menu" :key="group.path">
          <template slot="button-content">
            <em v-t="'label.' + group.key" />
          </template>
          <b-dropdown-item v-for="page in group.pages" :key="page.key" v-t="'label.' + page.key" :class="navbarClasses" href="#" @click="move('/' + group.base + page.path)" />
        </b-nav-item-dropdown>
      </b-navbar-nav>

      <!-- right -->
      <b-navbar-nav v-show="!isLoginPage" class="ml-auto">
        <!-- region -->
        <b-nav-item-dropdown v-if="hasMultiRegion(regions)" :class="navbarClasses" right>
          <template slot="button-content">
            <div v-if="isTenantAdmin()">
              <i class="far fa-building mr-1" style="visibility: hidden;" />
              <em v-t="this.$store.state.currentTenant? this.$store.state.currentTenant.tenantName: ''" />
            </div>
            <i class="far fa-building mr-1" />
            <span>{{ this.$store.state.currentRegion? this.$store.state.currentRegion.regionName: '' }}</span>
          </template>
          <b-dropdown-item v-for="region in regionOptions(regions)" :key="region.regionId" :class="navbarClasses" href="#" @click="switchRegion($event.target, region)">
            <i :style="getStyleDropdownRegion(region.regionId)" class="far fa-building mr-1" aria-hidden="true" />
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
import * as Util from '../../sub/util/Util'
import commonmixinVue from '../mixin/commonmixin.vue'
import * as StateHelper from '../../sub/helper/StateHelper'

export default {
  mixins: [commonmixinVue],
  data() {
    return {
      version: APP.VERSION,
      nav : this.$store.state.menu,
      showLogo: DISP.SHOW_LOGO,
      showNav: HtmlUtil.isMobile() || DISP.SHOW_NAV,
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
      // use for update theme-color
      this.$store.state.setting.theme
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
  async mounted() {
    window.addEventListener('resize', () => {
      this.showNav = HtmlUtil.isMobile() || DISP.SHOW_NAV
    })
    if(window.localStorage.getItem('login') != null){
      await StateHelper.load('region', true)
      this.$forceUpdate()
    }
  },
  methods: {
    logout() {
      this.$refs.collapse.show = false
      AuthHelper.logout()
    },
    isTenantAdmin() {
      const login = JSON.parse(window.localStorage.getItem('login'))
      return login? login.tenantAdmin: false
    },
    hasMultiRegion(regions){
      const regs = this.regionOptions(regions)
      return regs && regs.length > 1
    },
    getStyleDropdownRegion(regionId) {
      const login = JSON.parse(window.localStorage.getItem('login'))
      const currentRegionId = login && login.currentRegion? login.currentRegion.regionId: null
      return {visibility: currentRegionId == regionId? 'visible': 'hidden'}
    },
    move(page) {
      this.$router.push(page)
    },
    regionOptions(regions){
      const login = JSON.parse(window.localStorage.getItem('login'))
      if(!login){
        return []
      }
      const ret = login.allRegionMove || login.isProvider || login.tenantAdmin?
        regions.filter((val) => val):
        regions.filter((region) => login.userRegionIdList.includes(region.regionId))
      return ret.sort((a, b) => this.optionSort(a, b))
    },
    optionSort(regionA, regionB){
      const aSortBy = regionA.regionName
      const bSortBy = regionB.regionName
      if(!isNaN(aSortBy) && !isNaN(bSortBy)){
        const aNum = Number(aSortBy)
        const bNum = Number(bSortBy)
        return aNum < bNum? -1: aNum > bNum? 1: 0
      }
      const aCodeArr = Util.getSjisCodePoint(aSortBy, 'SJIS')
      const bCodeArr = Util.getSjisCodePoint(bSortBy, 'SJIS')
      for(let cnt = 0; cnt < aCodeArr.length && cnt < bCodeArr.length; cnt++){
        if(aCodeArr[cnt] < bCodeArr[cnt]){
          return -1
        }
        if(aCodeArr[cnt] > bCodeArr[cnt]){
          return 1
        }
      }
      return 0
    },
    async switchRegion(target, item) {
      await AuthHelper.switchRegion(item.regionId)
      location.reload()
    },
    versionClick() {
      console.log('app service revision:', this.$store.state.serviceRev)
      console.log('app front revision:', this.$store.state.frontRev)
    },
    setLogo(){
      const topLogo = document.getElementById('topLogo')
      if(!topLogo){
        return
      }
      const maxWidth = 220
      const maxHeight = 36
      const widthRatio = maxWidth / topLogo.naturalWidth
      const heightRatio = maxHeight / topLogo.naturalHeight
      const ratio = widthRatio < heightRatio? widthRatio: heightRatio
      topLogo.width = Math.ceil(topLogo.naturalWidth * ratio)
      topLogo.height = Math.ceil(topLogo.naturalHeight * ratio)
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

li.nav-item.b-nav-dropdown.default > *{
  background-color: $default;
}

li.nav-item.b-nav-dropdown.earthcolor > *{
  background-color: $earth-color;
}

li.nav-item.b-nav-dropdown.autumn > *{
  background-color: $autumn;
}

li.nav-item.b-nav-dropdown.vivid > *{
  background-color: $vivid;
}

li.nav-item.b-nav-dropdown.gray-scale > *{
  background-color: $gray-scale;
}

li.nav-item.b-nav-dropdown.indigo > *{
  background-color: $indigo;
}

a.dropdown-item.default:hover,
a.dropdown-item.default:focus {
  background-color: #7EA0C4 !important;
}

a.dropdown-item.earthcolor:hover,
a.dropdown-item.earthcolor:focus {
  background-color: #819E6E !important;
}

a.dropdown-item.autumn:hover,
a.dropdown-item.autumn:focus {
  background: #C5AA78 !important;
}

a.dropdown-item.vivid:hover, 
a.dropdown-item.vivid:focus {
  background: #EE5588 !important;
}

a.dropdown-item.gray-scale:hover, 
a.dropdown-item.gray-scale:focus {
  background: #787878 !important;
}

a.dropdown-item.indigo:hover, 
a.dropdown-item.indigo:focus {
  background: #8A91C7 !important;
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
