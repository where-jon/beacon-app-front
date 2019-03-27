<template>
  <b-navbar :class="topNavBarClasses" toggleable="md" type="dark">
    <!-- Responsive menu -->
    <b-navbar-toggle v-show="!isLoginPage && getShowNav()" target="nav_collapse" />  

    <!-- Title -->
    <b-navbar-brand>
      <div id="appTitle" class="appTitle">
        <img v-if="getShowLogo()" id="topLogo" :src="logoSrc" width="0" height="0" :style="{position: 'relative'}" @load="setLogo">
        <span v-else v-t="'label.title'" />
      </div>
    </b-navbar-brand>

    <b-collapse v-show="!isLoginPage && getShowNav()" id="nav_collapse" ref="collapse" is-nav>
      <!-- left (navi dropdown menu) -->
      <b-navbar-nav v-show="!isLoginPage && getShowNav()">
        <b-nav-item-dropdown v-for="group in this.$store.state.menu" :key="group.path">
          <template slot="button-content">
            <em class="word-break">
              {{ $i18n.tnl('label.' + group.key) }}
            </em>
          </template>
          <b-dropdown-item v-for="page in group.pages" :key="page.key" v-t="'label.' + page.key" :class="navbarClasses" href="#" @click="move('/' + group.base + page.path)" />
        </b-nav-item-dropdown>
      </b-navbar-nav>

      <!-- right -->
      <b-navbar-nav v-show="!isLoginPage" class="ml-auto">
        <!-- region -->
        <table>
          <tr>
            <td>
              <table v-if="isTenantAdmin() || hasMultiRegion(regions)" class="region-table">
                <tr v-if="isTenantAdmin()">
                  <td>
                    <i class="far fa-building mr-1" style="visibility: hidden;" />
                    <em v-t="this.$store.state.currentTenant? this.$store.state.currentTenant.tenantName: ''" class="region-em word-break" />
                  </td>
                </tr>
                <tr v-if="hasMultiRegion(regions)">
                  <td :class="regionTdClasses">
                    <b-nav-item-dropdown :class="navbarClasses" size="sm" right>
                      <template slot="button-content">
                        <i class="far fa-building mr-1" />
                        <span>{{ this.$store.state.currentRegion? this.$store.state.currentRegion.regionName: '' }}</span>
                      </template>
                      <b-dropdown-item v-for="region in regionOptions(regions)" :key="region.regionId" :class="navbarClasses" href="#" @click="switchRegion($event.target, region)">
                        <i :style="getStyleDropdownRegion(region.regionId)" class="far fa-building mr-1" aria-hidden="true" />
                        <span>{{ region.regionName }}</span>
                      </b-dropdown-item>
                    </b-nav-item-dropdown>
                  </td>
                </tr>
              </table>
              <div v-show="getShowNav() && isResponsiveMenu()">
                <custom-link :link-key="linkKey" :link-url="linkUrl" />
                <!-- user & logout -->
                <b-nav-item-dropdown right>
                  <template slot="button-content">
                    <i class="fa fa-user" aria-hidden="true" />&nbsp;
                    <em class="word-break">
                      {{ loginId }}
                    </em>
                  </template>
                  <b-dropdown-item href="#" @click="move('/setting/personal')">
                    <i class="fas fa-user-cog menu-item-icon" />&nbsp;{{ $t('label.personal') }}
                  </b-dropdown-item>
                  <b-dropdown-item href="#" @click="logout">
                    <i class="fas fa-sign-out-alt menu-item-icon" />&nbsp;{{ $t('label.logout') }}
                  </b-dropdown-item>
                  <b-dropdown-divider />
                  <b-dropdown-item @click="versionClick">
                    {{ getVersion() }}
                  </b-dropdown-item>
                </b-nav-item-dropdown>
              </div>
            </td>
            <td v-show="!(getShowNav() && isResponsiveMenu())">
              <!-- user & logout -->
              <b-nav-item-dropdown right>
                <template slot="button-content">
                  <i class="fa fa-user" aria-hidden="true" />&nbsp;
                  <em class="word-break">
                    {{ loginId }}
                  </em>
                </template>
                <b-dropdown-item href="#" @click="move('/setting/personal')">
                  <i class="fas fa-user-cog menu-item-icon" />&nbsp;{{ $t('label.personal') }}
                </b-dropdown-item>
                <b-dropdown-item href="#" @click="logout">
                  <i class="fas fa-sign-out-alt menu-item-icon" />&nbsp;{{ $t('label.logout') }}
                </b-dropdown-item>
                <b-dropdown-divider />
                <b-dropdown-item @click="versionClick">
                  {{ getVersion() }}
                </b-dropdown-item>
              </b-nav-item-dropdown>
            </td>
          </tr>
        </table>
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
import CustomLink from '../parts/customlink.vue'
import * as StateHelper from '../../sub/helper/StateHelper'

export default {
  components: {
    CustomLink,
  },
  mixins: [commonmixinVue],
  data() {
    return {
      nav : this.$store.state.menu,
      logoSrc: '',
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
    linkKey(){
      return HtmlUtil.getResourcePath(APP.SHOW_MENU_LINK)
    },
    linkUrl(){
      return APP.SHOW_MENU_LINK_URL
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
      if(this.getShowNav() && HtmlUtil.getLangShort() != 'ja'){
        classes['topMenuNavbar'] = true
      }
      return classes
    },
    regionTdClasses() {
      const classes = {region: true}
      if(Util.isIos()){
        classes['mobile-region'] = true
      }
      return classes
    },
  },
  async created() {
    HtmlUtil.getLogoData(`${HtmlUtil.getDomainCd()}.png`, (result, success) => {
      this.logoSrc = success? result: '/toplogo.png'
    })
  },
  async mounted() {
    window.addEventListener('resize', () => {
      this.adjustLogoOffsetX()
      this.$forceUpdate()
    })
    if(window.localStorage.getItem('login') != null){
      await StateHelper.load('region', true)
      this.$forceUpdate()
    }
  },
  methods: {
    getVersion(){
      return APP.VERSION
    },
    getShowLogo(){
      return DISP.SHOW_LOGO
    },
    getShowNav(){
      return HtmlUtil.isMobile() || DISP.SHOW_NAV
    },
    logout() {
      this.$refs.collapse.show = false
      AuthHelper.logout()
    },
    isTenantAdmin() {
      const login = JSON.parse(window.localStorage.getItem('login'))
      return login? login.tenantAdmin: false
    },
    hasMultiRegion(regions){
      return regions && regions.length > 1
    },
    isResponsiveMenu(){
      return Util.isResponsiveMode()
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
        Util.hasValue(login.userRegionIdList)?
          regions.filter((region) => login.userRegionIdList.includes(region.regionId)):
          regions.filter((region) => login.currentRegion? region.regionId == login.currentRegion.regionId: false)
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
    disableSwitchRegion(item){
      const login = JSON.parse(window.localStorage.getItem('login'))
      if(!login || !login.currentRegion){
        return true
      }
      return item.regionId == login.currentRegion.regionId
    },
    async switchRegion(target, item) {
      if(this.disableSwitchRegion(item)){
        return
      }
      await AuthHelper.switchRegion(item.regionId)
      location.reload()
    },
    versionClick() {
      console.log('app service revision:', this.$store.state.serviceRev)
      console.log('app front revision:', this.$store.state.frontRev)
    },
    getAppTitleWidth(){
      const appTitle = document.getElementById('appTitle')
      return appTitle? appTitle.clientWidth - appTitle.offsetLeft : 0
    },
    getLogoWidth(){
      const logo = document.getElementById('topLogo')
      return logo? logo.width: 0
    },
    getLogoOffsetX(){
      const appTitleWidth = this.getAppTitleWidth()
      const logoWidth = this.getLogoWidth()
      return appTitleWidth <= logoWidth? 0: Math.ceil((appTitleWidth - logoWidth) / 2)
    },
    adjustLogoOffsetX(){
      const topLogo = document.getElementById('topLogo')
      if(!topLogo){
        return
      }
      topLogo.style.left = `${this.getLogoOffsetX()}px`
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
      this.adjustLogoOffsetX()
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

li.nav-item.b-nav-dropdown.exeo > *{
  background-color: $exeo;
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

a.dropdown-item.exeo:hover, 
a.dropdown-item.exeo:focus {
  background: #7b8ccb !important;
}

div.navbar-brand {
  margin: 0 auto;
}

.word-break {
  word-break: break-all !important;
}

.mobile-region {
  @media (max-width: 1023px) and (min-width: 768px) {
    max-width: 64px;
  }
  @media (max-width: 1119px) and (min-width: 1024px) {
    max-width: 192px;
  }
}

.region > li > a {
  padding: 0px !important;
}

em:not(:hover) {
  color: white;
}

.region-table {
  margin-bottom: auto;
  margin-top: auto;
  margin-right: 2px;
  word-break: break-all;
  word-wrap: break-all;
  @media (max-width: 1119px) and (min-width: 768px) {
    table-layout: fixed;
  }
}

.region-em {
  color: white !important;
}

i.menu-item-icon {
  width: 20px;
}
</style>
