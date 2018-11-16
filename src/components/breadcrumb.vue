<template>
  <div class="legend-base">
    <div class="breadcrumb navigation row">
      <div class="col-auto mr-auto list-container">
        <ol class="breadcrumb-items">
          <li v-for="(item, index) in items" :key="index">
            <span v-if="isActive(item)" v-text="item.text"></span>
            <a v-if="isLink(item)" v-text="item.text" href="#" @click="move(item.href)"></a>
          </li>
        </ol>
      </div>
      <div v-if="useLegend && legendItems" ref="legendButton" class="col-auto px-0" >
        <b-button v-if="showLegend" class="legend-button-active" @click="switchLegend">{{$i18n.tnl('label.legend')}}</b-button>
        <b-button v-else class="legend-button" @click="switchLegend">{{$i18n.tnl('label.legend')}}</b-button>
      </div>
      <div class="col-auto px-0" >
        <b-nav-item-dropdown v-if="availableNavSpec.length > 1" class="extra-nav"
          :extra-menu-classes="extNavClasses" right>
          <template slot="button-content">
            <em>{{shortName}}</em>
          </template>
          <b-dropdown-item v-for="extraNav in availableNavSpec" :key="extraNav.key"
              @click="move(extraNav.path)" :class="extNavClasses">
            <i :class="extraNav.icon" class="mx-1" />&nbsp;{{$t('label.' + extraNav.key)}}
          </b-dropdown-item>
        </b-nav-item-dropdown>
      </div>
      <div class="col-auto reload-button-container ">
        <a href="#" id="reload" v-if="reload" @click="onClickReload"><i title="リロード" :class="classes"></i></a>
      </div>
    </div>
    <div ref="legendItem" v-if="showLegend && legendItems" class="legend-item">
      <legend-item :legendItems="legendItems" />
    </div>
  </div>
</template>

<script>

import Breadcrumb from 'bootstrap-vue/es/components/breadcrumb/breadcrumb'
import { getThemeColor, getThemeClasses } from '../sub/helper/ThemeHelper'
import * as HtmlUtil from '../sub/util/HtmlUtil'
import * as AuthHelper from '../sub/helper/AuthHelper'
import { EventBus } from '../sub/helper/EventHelper'
import { DISP, APP } from '../sub/constant/config'
import LegendItem from './legend.vue'

export default {
  components: {
    'legendItem': LegendItem,
  },
  data () {
    return {
      showLegend: false,
      touchLegend: false,
      useLegend: APP.USE_LEGEND,
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
    },
    shortName: {
      type: String,
      default: ""
    },
    legendItems: {
      type: Array,
      default: null
    },
  },
  mounted() {
    let reload = document.getElementById("reload")
    if (reload) {
      HtmlUtil.registerInterval(()=>{
        reload.click()
      }, APP.AUTO_RELOAD)  
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
    availableNavSpec() {
      return _.filter(this.extraNavSpec, (spec) => {
        for (let menu of this.$store.state.menu) {
          const base = menu.base
          for (let page of menu.pages) {
            if (spec.path === '/' + base + page.path) {
              return true
            }
          }
        }
        return false
      })
    }
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
      const color = getThemeColor(this.loginId)
      this.setColor('dropdown-menu', color)
      this.setColor('dropdown-item', color)
    },
    switchLegend(){
      this.showLegend = !this.showLegend
      if(this.showLegend){
        document.addEventListener('mousedown', this.touchStart)
        document.addEventListener('mouseup', this.touchEnd)
        document.addEventListener('touchstart', this.touchStart)
        document.addEventListener('touchmove', this.touchMove)
        document.addEventListener('touchend', this.touchEnd)
      }
      else{
        document.removeEventListener('mousedown', this.touchStart)
        document.removeEventListener('mouseup', this.touchEnd)
        document.removeEventListener('touchstart', this.touchStart)
        document.removeEventListener('touchmove', this.touchMove)
        document.removeEventListener('touchend', this.touchEnd)
      }
    },
    outTarget(e){
      return this.$refs.legendItem !== e.target && !this.$refs.legendItem.contains(e.target) &&
        this.$refs.legendButton !== e.target && !this.$refs.legendButton.contains(e.target)
    },
    touchStart(e) {
      if(!this.outTarget(e)) {
        this.touchLegend = true
      }
    },
    touchMove(e) {
      this.touchLegend = true
    },
    touchEnd(e) {
      if(!e.touches || e.touches.length == 0){
        if(!this.touchLegend) {
          this.documentClick(e)
        }
        this.touchLegend = false
      }
    },
    documentClick(e) {
      if(this.outTarget(e)) {
        this.switchLegend()
      }
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
    padding-top: 0.1rem;
    padding-bottom: 0rem;
    background-color: #e9ecef;
  }

  li.extra-nav em:not(:hover) {
    color: #333;
  }

  li.extra-nav .dropdown-item i {
    width: 20px;
    text-align: center;
  }

  li.extra-nav .dropdown-menu {
    min-width: 0px;
  }

  .legend-base {
    position: relative;
  }

  .legend-item {
    position: absolute;
    right: 0px;
    z-index: 10;
  }

  .legend-button {
    border: none;
    color: #333;
    background-color: #e9ecef;
    line-height: 1 !important;
  }

  .legend-button-active {
    border: none;
    color: #fff;
    background-color: #6c757d !important;
    line-height: 1 !important;
  }
</style>