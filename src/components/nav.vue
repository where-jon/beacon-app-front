<template>
  <b-navbar toggleable="md" type="dark">
    <!-- Responsive menu -->
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>  

    <!-- Title -->
    <b-navbar-brand><span v-t="'label.title'" /></b-navbar-brand>

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
        <!-- reload -->
        <b-nav-item right>
          <div v-show="!isLoginPage && showReload">
            <i class="fas fa-sync-alt" :title="$t('label.reload')" @click="fetchData" ><span class="d-md-none" v-t="'label.reload'"></span></i>
          </div>
        </b-nav-item>

        <!-- user & logout -->
        <b-nav-item-dropdown right>
          <template slot="button-content">
            <i class="fa fa-user" aria-hidden="true"></i>&nbsp;<em>{{ loginId }}</em>
          </template>
          <b-dropdown-item href="#" @click="profile">Profile</b-dropdown-item>
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
import { DISP, APP } from '../sub/constant/config'
import { LOGIN_MODE } from '../sub/constant/Constants'

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
      nav : this.$store.state.menu
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
    ])
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

nav.navbar {
  background-color: $menu-bg;
}

.navbar-dark .navbar-nav .nav-link {
  color: white;
}

ul.navbar-nav {
  margin-left: 5%;
}

</style>
