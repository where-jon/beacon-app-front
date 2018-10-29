<template>
  <div class="breadcrumb navigation row">
    <div class="col-auto mr-auto list-container">
      <ol class="breadcrumb-items">
        <li v-for="(item, index) in items" :key="index">
          <span v-if="isActive(item)" v-text="item.text"></span>
          <a v-if="isLink(item)" v-text="item.text" href="#" @click="move(item.href)"></a>
        </li>
      </ol>
    </div>
    <div class="col-auto reload-button-container ">
      <a href="#" id="reload" v-if="reload" @click="onClickReload"><i title="リロード" :class="classes"></i></a>
    </div>
    <div class="col-auto px-0" >
      <b-nav-item-dropdown v-if="extraNavSpec.length > 0" class="extra-nav"
        :extra-menu-classes="extNavClasses" right>
        <template slot="button-content">
          <em>{{items.slice(-1)[0].text}}</em>
        </template>
        <b-dropdown-item v-for="extraNav in extraNavSpec" :key="extraNav.key"
            @click="move(extraNav.path)" :class="extNavClasses">
          <i :class="extraNav.icon" class="ml-3" />&nbsp;{{$t('label.' + extraNav.key)}}
        </b-dropdown-item>
      </b-nav-item-dropdown>
    </div>
  </div>
</template>

<script>

import Breadcrumb from 'bootstrap-vue/es/components/breadcrumb/breadcrumb'
import { getTheme, themeColors, getThemeClasses } from '../sub/helper/ThemeHelper'
import * as HtmlUtil from '../sub/util/HtmlUtil'
import * as AuthHelper from '../sub/helper/AuthHelper'
import { EventBus } from '../sub/helper/EventHelper'
import { DISP, APP, THEME } from '../sub/constant/config'

export default {
  data () {
    return {
    }
  },
  props: {
    items: Array,
    reload: {
      type: Boolean,
      default: false
    },
    isLoad: {
      type: Boolean,
      default: false
    },
    extraNavSpec: {
      type: Array,
      default() {return []},
    }
  },
  mounted() {
    let reload = document.getElementById("reload")
    if (reload) {
      HtmlUtil.registerInterval(()=>{
        reload.click()
      }, DISP.AUTO_RELOAD)  
    }

    this.setDropdownMenuColor()
  },
  computed: {
    loginId() {
      return this.$store.state.loginId
    },
    classes() {
      return 'fas fa-sync-alt' + (!this.isLoad ? '' : ' fa-spin')
    },
    extNavClasses() {
      const storeTheme = this.$store.state.setting.theme
      const theme = getThemeClasses(this.loginId)
      return _.findKey(theme, (val) => {return val})
    },
  },
  methods: {
    isActive (item) {
      return item.active != null && item.active
    },
    isLink (item) {
      return (!this.isActive(item)) && item.href !== 'undefined'
    },
    move(page) {
      this.$router.push(page)
    },
    onClickReload(e) {
      HtmlUtil.addClass(e, "rotate")
      EventBus.$emit('reload', {
        done() {
          HtmlUtil.removeClass(e, "rotate")
          AuthHelper.checkSession()
        }
      })
    },
    setColor(className, color) {
      [].forEach.call(document.getElementsByClassName(className), (e) => {
        e.style.backgroundColor = color
      })
    },
    setDropdownMenuColor() {
      const theme = getTheme(this.loginId)
      const color = themeColors[theme]
      this.setColor('dropdown-menu', color)
      this.setColor('dropdown-item', color)
    }
  }
}

</script>

<style lang="scss">
  @import "../sub/constant/config.scss";

  div.breadcrumb.navigation {
    margin-top: 20px;
    padding: 7px;
  }

  div.list-container {
    padding: 0px 0px 0px 5px;
  }

  ol.breadcrumb-items {
    list-style: none;
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  ol.breadcrumb-items li {
    display: inline;
    color: #333;
  }

  ol.breadcrumb-items li a {
    text-decoration: none;
  }

  ol.breadcrumb-items li:not(:first-child):before {
    content: '　/　';
  }

  div.reload-button-container {
    text-align: right;
    padding-right: 7px;
  }

  div.reload-button-container a {
    color: #333;
    text-decoration: none;
  }

  li.extra-nav a.nav-link {
    padding-top: 0rem;
    padding-bottom: 0rem;
    color: #333;
    background-color: #e9ecef;
  }

</style>