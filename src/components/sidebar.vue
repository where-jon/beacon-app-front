<template>
    <ul class="menu-groups">
      <li class="menu-group" v-for="(group, i) in nav" :key="group.path" :to="'/' + group.base" active-class="active">
        <ul class="menu-group-items">
          <li class="menu-item menu-title clearfix" @click.stop="onMenuClick(i)">
            <span class="title"><i :class="group.icon"></i>&nbsp;&nbsp;{{ $t("label." + group.key) }}</span>
            <span class="direction">
              <i class="fa fa-angle-left" v-if="selectedItem !== i"></i>
              <i class="fa fa-angle-down" v-if="selectedItem === i"></i>
            </span>
          </li>
          <li class="menu-item item" v-for="(page, j) in group.pages" :key="page.key" v-if="selectedItem === i">
            <router-link class="bd-toc-link" :to="'/' + group.base + page.path">
              <i :class="page.icon" class="ml-3"></i>&nbsp;{{ $t("label." + page.key) }}
            </router-link>
          </li>
        </ul>
      </li>
      <!--
          <router-link class="bd-toc-link" :to="'/' + group.path">
          </router-link>
      <div>
          <b-nav-item v-for="page in group.pages" :to="'/' + group.base + page.path" :key="page.key" @click.stop="onMenuItemClick()">
            <i :class="page.icon" class="ml-3"></i>&nbsp;{{ $t("label." + page.key) }}
          </b-nav-item>
      </div>
      -->
    </ul>
<!--
  <b-collapse tag="nav" is-nav class="bd-links" id="bd-docs-nav">
    <router-link tag="div" class="bd-toc-item" v-for="group in nav" :key="group.path" :to="'/' + group.base" active-class="active">
      <router-link class="bd-toc-link" :to="'/' + group.path" @click="onMenuClick()">
        <i :class="group.icon"></i>&nbsp;{{ $t("label." + group.key) }}
        <span><i class="fa fa-angle-left"></i></span>
      </router-link>
      <b-nav class="bd-sidenav">
        <b-nav-item v-for="page in group.pages" :to="'/' + group.base + page.path" :key="page.key">
          <i :class="page.icon" class="ml-3"></i>&nbsp;{{ $t("label." + page.key) }}
        </b-nav-item>
      </b-nav>
    </router-link>
  </b-collapse>
  -->
</template>

<script>

export default {
  data() {
    return {
      nav : this.$store.state.menu,
      selectedItem: -1
    }
  },
  methods: {
    onMenuClick (index) {
      this.selectedItem = index === this.selectedItem ? -1 : index
    }
  }
}
</script>

<style lang="scss">

.bd-toc {
  @supports (position: sticky) {
    position: sticky;
    top: 4rem;
    height: calc(100vh - 4rem);
    overflow-y: auto;
  }
  order: 2;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  font-size: .875rem;
}

.section-nav {
  padding-left: 0;
  border-left: 1px solid #eee;

  ul {
    padding-left: 1rem;

    ul {
      display: none;
    }
  }
}

.toc-entry {
  display: block;

  a {
    display: block;
    padding: .125rem 1.5rem;
    color: #99979c;

    &:hover {
      color: #0000ff;
      text-decoration: none;
    }
  }
}

.bd-sidebar {
  order: 0;
  border-bottom: 1px solid rgba(0, 0, 0, .1);
  background-color: #f8f8f8;
  border-color: #e7e7e7;
  padding-left: 0px;
  padding-right: 0px;

  @media (min-width: 768px) {
    @supports (position: sticky) {
      position: sticky;
      z-index: 100;
      height: calc(100vh - 4rem);
    }
    border-right: 1px solid rgba(0, 0, 0, .1);
  }

  @media (min-width: 1200px) {
    flex: 0 1 320px;
  }
}

.bd-links {
  // padding-top: 1rem;
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

.bd-sidenav {
  display: none;
  padding-top: 0.25rem;
}

.bd-toc-link {
  display: block;
  color:#337ab7;
  &:hover {
    text-decoration: none;
  }
  padding-left: 10px;
}

.bd-toc-item {
  padding-top: 0.6rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid #e7e7e7;
  &.active {

    &:not(:first-child) {
      // margin-top: 1rem;
    }

    > .bd-toc-link {
      color: #337ab7;

      &:hover {
        background-color: #ccc;
      }
    }

    > .bd-sidenav {
      display: block;
    }
  }
}

// All levels of nav
.bd-sidebar .nav > li > a {
  display: block;
  padding: .2rem 1.5rem;
  font-size: 90%;
  color: #337ab7;
}

.bd-sidebar .nav > li > a:hover {
  color: rgba(0, 0, 0, .85);
  text-decoration: none;
  background-color: #eee;
}

.bd-sidebar .nav > .active > a,
.bd-sidebar .nav > .active:hover > a {
  font-weight: 500;
  color: rgba(0, 0, 0, .85);
  background-color: transparent;
}


.bd-sidebar .nav > li > a.active {
  color: #337ab7;
  font-weight: bold;
  background-color: #eee;
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
  border-bottom: 1px solid #e4e4e4;
}

li.menu-item {
  display: block;
  padding: 10px;
}

.clearfix::after {
  content: "";
  display: block;
  clear: both;
}

span.title {
  display: block;
  color:#337ab7;
  float: left;
  width: 90%;
}

span.direction {
  display: block;
  color:#337ab7;
  float: left;
  text-align: right;
}

</style>
