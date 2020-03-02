<template>
  <b-navbar :class="topNavBarClasses" toggleable="md" type="dark">
    <b-modal id="helpModal" size="lg" :title="$t('label.help')" ok-only>
      <help :from-page="fromPageUrl" />
    </b-modal>
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
        <b-nav-item-dropdown v-for="group in this.$store.state.menu" :key="group.path" class="white-dropdown">
          <template slot="button-content">
            <em class="word-break">
              {{ $i18n.tnl('label.' + group.key) }}
            </em>
          </template>
          <b-dropdown-item v-for="page in group.pages" :key="page.key" v-t="'label.' + (page.label? page.label: page.key)" :class="navbarClasses" href="#" @click="move('/' + group.base + page.path)" />
        </b-nav-item-dropdown>
      </b-navbar-nav>

      <!-- right -->
      <b-navbar-nav v-show="!isLoginPage" class="ml-auto">
        <!-- region -->
        <table>
          <tr>
            <td v-if="isTenantAdmin()" class="region-table pr-3">
              <font-awesome-icon icon="building" class="mr-1" style="visibility: hidden;" />
              <em v-t="this.$store.state.currentTenant? this.$store.state.currentTenant.tenantName: ''" class="region-em word-break" />
            </td>
            <td v-if="hasMultiRegion(regions)" class="region-table pr-3">
              <div :class="regionTdClasses">
                <b-nav-item-dropdown :class="navbarClasses" size="sm" right>
                  <template slot="button-content">
                    <font-awesome-icon icon="building" class="mr-1" />
                    <em class="word-break">
                      {{ this.$store.state.currentRegion? this.$store.state.currentRegion.regionName: '' }}
                    </em>
                  </template>
                  <div :style="getNavBarHightStyle()">
                    <b-dropdown-item v-for="region in regionOptions(regions)" :key="region.regionId" :class="navbarClasses" href="#" @click="switchRegion($event.target, region)">
                      <font-awesome-icon v-if="getStyleDropdownRegion(region.regionId)" icon="building" fixed-width />
                      <span :style="{marginLeft: getStyleDropdownRegion(region.regionId)? '0px' : '20px'}">
                        {{ region.regionName }}
                      </span>
                    </b-dropdown-item>
                  </div>
                </b-nav-item-dropdown>
              </div>
            </td>
            <td v-show="getShowNav() && isResponsiveMenu()">
              <custom-link :link-key="linkKey" :link-url="linkUrl" />
              <!-- user & logout -->
              <b-nav-item-dropdown right>
                <template slot="button-content">
                  <font-awesome-icon icon="user" />&nbsp;
                  <em class="word-break">
                    {{ loginId }}
                  </em>
                </template>
                <b-dropdown-item href="#" @click="move('/setting/personal')">
                  <font-awesome-icon icon="user-cog" fixed-width />&nbsp;&nbsp;{{ $t('label.personal') }}
                </b-dropdown-item>
                <b-dropdown-item href="#" v-if="showHelp" @click="openHelp">
                  <font-awesome-icon icon="question-circle" fixed-width />&nbsp;&nbsp;{{ $t('label.help') }}
                </b-dropdown-item>
                <b-dropdown-item href="#" @click="logout">
                  <font-awesome-icon icon="sign-out-alt" fixed-width />&nbsp;&nbsp;{{ $t('label.logout') }}
                </b-dropdown-item>
                <b-dropdown-divider />
                <b-dropdown-item @click="versionClick">
                  {{ getVersion() }}
                </b-dropdown-item>
              </b-nav-item-dropdown>
            </td>
            <td v-show="!(getShowNav() && isResponsiveMenu())">
              <!-- user & logout -->
              <b-nav-item-dropdown right class="white-dropdown">
                <template slot="button-content">
                  <font-awesome-icon icon="user" />&nbsp;
                  <em class="word-break">
                    {{ loginId }}
                  </em>
                </template>
                <b-dropdown-item href="#" @click="move('/setting/personal')">
                  <font-awesome-icon icon="user-cog" fixed-width />&nbsp;&nbsp;{{ $t('label.personal') }}
                </b-dropdown-item>
                <b-dropdown-item href="#" v-if="showHelp" @click="openHelp">
                  <font-awesome-icon icon="question-circle" fixed-width />&nbsp;&nbsp;{{ $t('label.help') }}
                </b-dropdown-item>
                <b-dropdown-item href="#" @click="logout">
                  <font-awesome-icon icon="sign-out-alt" fixed-width />&nbsp;&nbsp;{{ $t('label.logout') }}
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
import { APP, DISP } from '../../sub/constant/config'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as AuthHelper from '../../sub/helper/base/AuthHelper'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import * as ImageHelper from '../../sub/helper/base/ImageHelper'
import * as LocalStorageHelper from '../../sub/helper/base/LocalStorageHelper'
import * as RegionHelper from '../../sub/helper/domain/RegionHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import { getThemeClasses } from '../../sub/helper/ui/ThemeHelper'
import commonmixin from '../mixin/commonmixin.vue'
import Help from '../page/help.vue'
import CustomLink from '../parts/customlink.vue'

export default {
  components: {
    Help,
    CustomLink,
  },
  mixins: [commonmixin],
  data() {
    return {
      nav : this.$store.state.menu,
      logoSrc: '',
      fromPageUrl: '',
    }
  },
  computed: {
    isLoginPage() {
      return this.$route.path == APP.MENU.LOGIN_PAGE || this.$route.path == APP.MENU.LOGIN_PAGE + '/' || this.$route.path == APP.MENU.ERROR_PAGE
    },
    linkKey(){
      return HttpHelper.getResourcePath(APP.MENU.SHOW_MENU_LINK)
    },
    linkUrl(){
      return APP.MENU.SHOW_MENU_LINK_URL
    },
    showHelp(){
      return DISP.MENU.SHOW_HELP
    },
    ...mapState('app_service', [
      'pots', 'regions',
    ]),
    navbarClasses() {
      // use for update theme-color
      this.$store.state.setting.theme
      const ret = getThemeClasses()
      ret['white-dropdown'] = true
      return ret
    },
    topNavBarClasses() {
      let classes = {}
      Object.assign(classes , this.navbarClasses)
      if(this.getShowNav() && BrowserUtil.getLangShort() != 'ja'){
        classes['topMenuNavbar'] = true
      }
      classes['word-break'] = true
      return classes
    },
    regionTdClasses() {
      const classes = {region: true}
      if(BrowserUtil.isIos()){
        classes['mobile-region'] = true
      }
      return classes
    },
  },
  async created() {
    ImageHelper.getLogoData(`${BrowserUtil.getDomainCd()}.png`, (result, success) => {
      this.logoSrc = success? result: '/toplogo.png'
    })
    this.$root.$on('bv::modal::shown', (bvModalEvt, modalId) => {
      if(bvModalEvt.target.id == 'helpModal') {
        setTimeout(() => {
          document.getElementById('initialize').click()
        },200)
      }
    })
  },
  async mounted() {
    window.addEventListener('resize', () => {
      this.adjustLogoOffsetX()
      this.$forceUpdate()
    })
    if(LocalStorageHelper.existLocalStorage('login')){
      this.$forceUpdate()
    }
  },
  methods: {
    getVersion(){
      return APP.COMMON.VERSION
    },
    getShowLogo(){
      return DISP.MENU.SHOW_LOGO
    },
    getShowNav(){
      return BrowserUtil.isMobile() || DISP.MENU.SHOW_NAV
    },
    logout() {
      this.$refs.collapse.show = false
      AuthHelper.logout()
    },
    openHelp() {
      const path = _.filter(this.$route.path.split('/'), (path) => Boolean(path))
      const lastPath = path? path[path.length - 1]: ''
      if (path && this.useLastUrl(lastPath)) {
        this.fromPageUrl = '#' + lastPath
      } else {
        this.fromPageUrl = path? '#' + path[path.length - 2] + '_' + lastPath: ''
      }
      this.$root.$emit('bv::show::modal', 'helpModal')
    },
    useLastUrl(lastPath) {
      return lastPath == 'bulkedit'
    },
    isTenantAdmin() {
      const login = LocalStorageHelper.getLogin()
      return login? login.tenantAdmin: false
    },
    hasMultiRegion(regions){
      return regions && regions.length > 1
    },
    isResponsiveMenu(){
      return BrowserUtil.isResponsiveMode()
    },
    getStyleDropdownRegion(regionId) {
      const login = LocalStorageHelper.getLogin()
      const currentRegionId = login && login.currentRegion? login.currentRegion.regionId: null
      return currentRegionId === regionId
    },
    move(page) {
      this.$router.push(page)
    },
    regionOptions(regions){
      return RegionHelper.enableRegionOptions(regions)
    },
    disableSwitchRegion(item){
      const login = LocalStorageHelper.getLogin()
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
    async versionClick() {
      const {frontRev, serviceRev} = await AuthHelper.getRevInfo()
      console.log('app service revision:', serviceRev)
      console.log('app front revision:', frontRev)
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
    },
    getNavBarHightStyle(){
      const ret = {
        'overflow-y': 'auto',
        'max-height': '400px',
      }
      return ret
    },
  }
}
</script>

<style lang="scss">
@import "../../sub/constant/config.scss";
@import "../../sub/constant/label.scss";

.topMenuNavbar {
  @media (max-width: 1119px) and (min-width: 768px) {
    min-width: 1120px;
  }
}

.navbar-dark .navbar-nav .nav-link {
  color: white;
}

.white-dropdown > .nav-link:hover {
  color: rgba(255, 255, 255, 0.5) !important;
}

.white-dropdown > .nav-link{
  color: rgba(255, 255, 255, 1.0) !important;
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
  max-width: 100%;
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

.dropdown-toggle{
  white-space: normal !important;
}

</style>
