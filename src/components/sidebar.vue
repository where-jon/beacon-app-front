<template>
    <ul class="menu-groups">
      <li class="menu-group" v-for="(group, i) in nav" :key="group.path" :to="'/' + group.base" active-class="active">
        <ul class="menu-group-items">
          <li class="menu-item title clearfix" @click.stop="onMenuClick(i)">
            <span class="title"><i :class="group.icon"></i>&nbsp;&nbsp;{{ $t("label." + group.key) }}</span>
            <span class="direction">
              <i class="fa fa-angle-left" v-if="selectedItem !== i"></i>
              <i class="fa fa-angle-down" v-if="selectedItem === i"></i>
            </span>
          </li>
          <li :class="menuItemClasses" v-for="(page, j) in group.pages" :key="page.key" v-if="selectedItem === i">
            <router-link class="bd-toc-link" :to="'/' + group.base + page.path">
              <i :class="page.icon" class="ml-3"></i>&nbsp;{{ $t("label." + page.key) }}
            </router-link>
          </li>
        </ul>
      </li>
    </ul>
</template>

<script>

import { DISP } from '../sub/constant/config'

export default {
  data() {
    return {
      nav : this.$store.state.menu,
      selectedItem: -1,
      menuItemClasses: {
        'menu-item': true,
        item: true,
        default: DISP.THEME === 'default',
        primary: DISP.THEME === 'primary',
        secondary: DISP.THEME === 'secondary',
        success: DISP.THEME === 'success',
        info: DISP.THEME === 'info',
        warning: DISP.THEME === 'warning',
        danger: DISP.THEME === 'danger',
        light: DISP.THEME === 'light',
        dark: DISP.THEME === 'dark',
      }
    }
  },
  methods: {
    onMenuClick (index) {
      this.selectedItem = index === this.selectedItem ? -1 : index
    },
  }
}
</script>

<style lang="scss">
@import "../sub/constant/config.scss";

.bd-sidebar {
  order: 0;
  border-bottom: 1px solid rgba(0, 0, 0, .1);
  padding-left: 0px;
  padding-right: 0px;

  @media (min-width: 768px) {
    @supports (position: sticky) {
      position: sticky;
      z-index: 100;
    }
    min-height: calc(100vh - 56px)
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
  height: 55px;
  color: white;
}

li.menu-item.item {
  line-height: 55px;
}

li.menu-item.item.default {
  background: #478dca;
}

li.menu-item.item.default:hover {
  background: #4288c5;
}

li.menu-item.item.info {
  background: #59b9c6;
}

li.menu-item.item.info:hover {
  background: #59bad4;
}

li.menu-item.item.primary {
  background:#118cff;
}

li.menu-item.item.primary:hover {
  background:#119fff;
}

li.menu-item.item.secondary {
  background: #979ea7;
}

li.menu-item.item.secondary:hover {
  background: #9198a2;
}

li.menu-item.item.success {
  background: #39b856;
}

li.menu-item.item.success:hover {
  background: #27b744;
}

li.menu-item.item.warning {
  background: #ffda3f;
}

li.menu-item.item.warning:hover {
  background: #ffd439;
}

li.menu-item.item.danger {
  background: #de5767;
}

li.menu-item.item.danger:hover {
  background: #dc4555;
}

li.menu-item.item.dark {
  background: #464c52;
}

li.menu-item.item.dark:hover {
  background: #404450;
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

</style>
