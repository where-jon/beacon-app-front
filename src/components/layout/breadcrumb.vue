<template>
  <div class="legend-base">
    <div class="breadcrumb navigation row">
      <div class="col-auto mr-auto list-container">
        <ol class="breadcrumb-items">
          <li v-for="(item, index) in items" :key="index">
            <span v-if="isActive(item)" v-text="item.text" />
            <a v-if="isLink(item)" href="#" @click="move(item.href)" v-text="item.text" />
          </li>
        </ol>
      </div>
      <div v-if="filterToggle" class="col-auto px-1">
        <b-button v-b-toggle.collapse-filter class="legend-button" @click="switchFilter">
          {{ $i18n.tnl('label.filter') }}
          <span class="when-opened"><font-awesome-icon icon="angle-up" /></span> <span class="when-closed"><font-awesome-icon icon="angle-down" /></span>
        </b-button>
      </div>
      <div v-if="useLegend && legendItems" ref="legendButton" class="col-auto px-1">
        <b-button v-if="showLegend" class="legend-button-active" @click="switchLegend">
          {{ $i18n.tnl('label.legend') }}
        </b-button>
        <b-button v-else class="legend-button" @click="switchLegend">
          {{ $i18n.tnl('label.legend') }}
        </b-button>
      </div>
      <div class="col-auto px-0">
        <b-nav-item-dropdown v-if="availableNavSpec.length > 1" :extra-menu-classes="extNavClasses"
                             class="extra-nav" right
        >
          <template slot="button-content">
            <em>{{ shortName }}</em>
          </template>
          <b-dropdown-item v-for="extraNav in availableNavSpec" :key="extraNav.key"
                           :class="extNavClasses" @click="move(extraNav.path)"
          >
            <font-awesome-icon :icon="['fas', extraNav.icon]" fixed-width />&nbsp;{{ $t('label.' + extraNav.key) }}
          </b-dropdown-item>
        </b-nav-item-dropdown>
      </div>
      <div class="col-auto reload-button-container">
        <a v-if="autoPager" id="autoPager" href="#" @click="toggleAutoPager">
          <font-awesome-icon v-if="isAutoPagerPlaying" icon="pause" />
          <font-awesome-icon v-else icon="play" />
        </a>
      </div>
      <div class="col-auto reload-button-container ">
        <a v-if="reload" id="reload" href="#" @click="clickReload">
          <font-awesome-icon id="spinner" icon="sync-alt" :class="state.isLoad ? 'fa-spin' : ''" />
        </a>
      </div>
    </div>
    <div v-if="showLegend && legendItems" ref="legendItem" class="legend-item">
      <legend-item :legend-items="legendItems" />
    </div>
  </div>
</template>

<script>

import { APP } from '../../sub/constant/config'
import * as Util from '../../sub/util/Util'
import * as AuthHelper from '../../sub/helper/base/AuthHelper'
import { EventBus } from '../../sub/helper/base/EventHelper'
import { getThemeColor, getThemeClasses } from '../../sub/helper/ui/ThemeHelper'
import LegendItem from '../parts/legend.vue'
import commonmixin from '../mixin/commonmixin.vue'

export default {
  components: {
    'legendItem': LegendItem,
  },
  mixins: [commonmixin],
  props: {
    items: {
      type: Array,
      required: true,
    },
    reload: {
      type: Boolean,
      default: false
    },
    filterToggle: {
      type: Boolean,
      default: false
    },
    autoPager: {
      type: Boolean,
      default: false
    },
    autoPagerPlay: {
      type: Boolean,
      default: false
    },
    autoReload: {
      type: Boolean,
      default: true
    },
    state: {
      type: Object,
      default: () => ({ isLoad: false })
    },
    extraNavSpec: {
      type: Array,
      default() {return []},
    },
    shortName: {
      type: String,
      default: ''
    },
    legendItems: {
      type: Array,
      default: null
    },
  },
  data () {
    return {
      showLegend: false,
      touchLegend: false,
      isAutoPagerPlaying: this.autoPagerPlay,
      useLegend: APP.POS.USE_LEGEND,
    }
  },
  computed: {
    extNavClasses() {
      const theme = getThemeClasses()
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
    },
  },
  mounted() {
    this.setDropdownMenuColor()
    if(!this.autoReload){
      return
    }
    let reload = document.getElementById('reload')
    if (reload) {
      Util.registerInterval(()=>{
        this.$store.commit('replace', {reload: true})
        const windowScroll = {x: window.pageXOffset , y: window.pageYOffset}
        this.clickReload()
        window.scroll(windowScroll.x, windowScroll.y)
      }, APP.COMMON.AUTO_RELOAD)
      if(Util.getValue(this.state, 'initialize', true)){
        this.clickReload()
      }
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
    clickReload(e) {
      if(this.state.prevent){
        return
      }
      this.state.isLoad = true
      const that = this
      EventBus.$emit('reload', {
        done() {
          that.state.isLoad = false
          AuthHelper.checkSession()
        }
      })
    },
    toggleAutoPager(e) {
      this.isAutoPagerPlaying = !this.isAutoPagerPlaying
      EventBus.$emit('toggleAutoPager', this.isAutoPagerPlaying)
    },
    setColor(className, color) {
      [].forEach.call(document.getElementsByClassName(className), (e) => {
        e.style.backgroundColor = color
      })
    },
    setDropdownMenuColor() {
      const color = getThemeColor()
      this.setColor('dropdown-menu', color)
      this.setColor('dropdown-item', color)
    },
    switchFilter(e) {
      this.callParentMethod('switchFilter', e)
    },
    switchLegend(e){
      this.showLegend = !this.showLegend
      if(this.showLegend){
        document.addEventListener('mousedown', this.touchStart)
        document.addEventListener('mouseup', this.touchEnd)
        document.addEventListener('touchstart', this.touchStart)
        document.addEventListener('touchmove', this.touchMove)
        document.addEventListener('touchend', this.touchEnd)
      }
      else{
        e && e.target && e.target.blur()
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
  @import "../../sub/constant/config.scss";

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
    content: '\00a0\00a0\00a0/\00a0\00a0\00a0'; /* \00a0 = &nbsp; */
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

  @keyframes legend-flash {
  0%,100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
 }

.collapsed > .when-opened,
:not(.collapsed) > .when-closed {
  display: none;
}

</style>