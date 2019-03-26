<template>
  <div>
    <ul class="menu-groups">
      <li v-for="(group, i) in nav" :key="group.path" :to="'/' + group.base" class="menu-group" active-class="active">
        <ul class="menu-group-items">
          <li class="menu-item title clearfix" @click.stop="onMenuClick(i)">
            <span class="title">
              <i :class="group.icon" />&nbsp;&nbsp;{{ $t("label." + group.key) }}
            </span>
            <span class="direction">
              <i v-if="selectedItem !== i" class="fa fa-angle-left" />
              <i v-if="selectedItem === i" class="fa fa-angle-down" />
            </span>
          </li>
          <vue-slide-up-down :active="selectedItem === i">
            <li v-for="page in group.pages" :key="page.key" :class="menuItemClasses">
              <router-link :to="'/' + group.base + page.path" class="bd-toc-link">
                <i :class="page.icon" class="ml-3 menu-item-icon" />&nbsp;{{ $t("label." + (page.label? page.label: page.key)) }}
              </router-link>
            </li>
          </vue-slide-up-down>
        </ul>
      </li>
    </ul>
    <custom-link :link-key="linkKey" :link-url="linkUrl" />
  </div>
</template>

<script>

import CustomLink from '../parts/customlink.vue'
import { APP } from '../../sub/constant/config'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import { getThemeClasses } from '../../sub/helper/ThemeHelper'
import VueSlideUpDown from 'vue-slide-up-down'

export default {
  components: {
    'vue-slide-up-down': VueSlideUpDown,
    CustomLink,
  },
  data() {
    return {
      nav : this.$store.state.menu,
      selectedItem: -1,
      userRole: this.$store.state.role,
    }
  },
  computed: {
    loginId() {
      return this.$store.state.loginId
    },
    linkKey(){
      return HtmlUtil.getResourcePath(APP.SHOW_MENU_LINK)
    },
    linkUrl(){
      return APP.SHOW_MENU_LINK_URL
    },
    menuItemClasses () {
      // use for update theme-color
      this.$store.state.setting.theme
      return {
        'menu-item': true,
        item: true,
        ...getThemeClasses()
      }
    }
  },
  methods: {
    onMenuClick (index) {
      this.selectedItem = index === this.selectedItem ? -1 : index
    },
  },
  templates: {
    'vue-slide-up-down':VueSlideUpDown
  }
}
</script>

<style lang="scss">
@import "../../sub/constant/config.scss";

.bd-sidebar {
  order: 0;
  border-bottom: 1px solid rgba(0, 0, 0, .1);
  padding-left: 0px;
  padding-right: 0px;
  min-height: calc(100vh - 62px);

  @media (min-width: 768px) {
    @supports (position: sticky) {
      position: sticky;
      z-index: 100;
    }
  }

  @media (min-width: 1200px) {
    flex: 0 1 320px;
  }
}

.bd-links {
  padding-bottom: 1rem;
  margin-right: -0.9rem;
  margin-left: -0.9rem;

  @media (min-width: 768px) {
    @supports (position: sticky) {
      max-height: calc(100vh - 9rem);
      overflow-y: auto;
    }
  }

  // Override collapse behaviors
  @media (min-width: 768px) {
    display: block !important;
  }
}

.bd-toc-link {
  display: block;
  color: white;
  &:hover {
    text-decoration: none;
    color: white;
  }
  padding-left: 10px;
}

.bd-toc-item {
  padding-top: 0.6rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid #e7e7e7;
  &.active {

    > .bd-toc-link {
      color: white;

      &:hover {
        background-color: #ccc;
      }
    }

    > .bd-sidenav {
      display: block;
    }
  }
}

ul.menu-groups {
  padding: 0;
}

li.menu-group {
  display: block;
  list-style: none;
  cursor: pointer;
}

ul.menu-group-items {
  list-style: none;
  padding: 0;
  border-bottom: 1px solid #eee;
}

li.menu-item {
  display: block;
  color: white;
}

li.menu-item.item {
  line-height: 55px;
}

li.menu-item.item.default {
  background: $default-menu-item;
}

li.menu-item.item.default:hover {
  background: #7EA0C4;
}

li.menu-item.item.earthcolor {
  background: $earth-color-menu-item;
}

li.menu-item.item.earthcolor:hover {
  background: #819E6E;
}

li.menu-item.item.autumn {
  background: $autumn-menu-item;
}

li.menu-item.item.autumn:hover {
  background:#C5AA78;
}

li.menu-item.item.vivid {
  background: $vivid-menu-item;
}

li.menu-item.item.vivid:hover {
  background: #EE5588;
}

li.menu-item.item.gray-scale {
  background: $gray-scale-menu-item;
}

li.menu-item.item.gray-scale:hover {
  background: #787878;
}

li.menu-item.item.indigo {
  background: $indigo-menu-item;
}

li.menu-item.item.indigo:hover {
  background: #8A91C7;
}

li.menu-item.item.exeo {
  background: $exeo-menu-item;
}

li.menu-item.item.exeo:hover {
  background: #5868D5;
}

.clearfix::after {
  content: "";
  display: block;
  clear: both;
}

span.title {
  display: block;
  line-height: 55px;
  padding-left: 10px;
  float: left;
  width: 90%;
}

span.direction {
  display: block;
  line-height: 55px;
  float: left;
  text-align: right;
}

i.ml-3.menu-item-icon {
  width: 20px;
}

</style>
