<template>
  <b-collapse tag="nav" is-nav class="bd-links" id="bd-docs-nav">
    <router-link tag="div" class="bd-toc-item" v-for="group in nav" :key="group.path" :to="'/' + group.base" active-class="active" >
      <router-link class="bd-toc-link" :to="'/' + group.path">
        <i :class="group.icon"></i>&nbsp;{{ $t("label." + group.key) }}
      </router-link>
      <b-nav class="bd-sidenav">
        <b-nav-item v-for="page in group.pages" :to="'/' + group.base + page.path" :key="page.key" class="ml-2">
          <i :class="page.icon"></i>&nbsp;{{ $t("label." + page.key) }}
        </b-nav-item>
      </b-nav>
    </router-link>
  </b-collapse>
</template>

<script>

export default {
  data() {
    return {
      nav : this.$store.state.menu
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
  // background-color: #f5f2f9;
  border-bottom: 1px solid rgba(0, 0, 0, .1);

  @media (min-width: 768px) {
    @supports (position: sticky) {
      position: sticky;
      top: 4rem;
      z-index: 1000;
      height: calc(100vh - 4rem);
    }
    border-right: 1px solid rgba(0, 0, 0, .1);
  }

  @media (min-width: 1200px) {
    flex: 0 1 320px;
  }
}

.bd-links {
  padding-top: 1rem;
  padding-bottom: 1rem;
  margin-right: -15px;
  margin-left: -15px;

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
}

.bd-toc-link {
  display: block;
  padding: .25rem 1.5rem;
  font-weight: 500;
  font-size: 20px;
  color: rgba(0, 0, 0, .65);

  &:hover {
    color: rgba(0, 0, 0, .85);
    text-decoration: none;
  }
}

.bd-toc-item {
  &.active {
    margin-bottom: 1rem;

    &:not(:first-child) {
      margin-top: 1rem;
    }

    > .bd-toc-link {
      color: rgba(0, 0, 0, .85);

      &:hover {
        background-color: transparent;
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
  padding: .25rem 1.5rem;
  font-size: 90%;
  color: rgba(0, 0, 0, .65);
}

.bd-sidebar .nav > li > a:hover {
  color: rgba(0, 0, 0, .85);
  text-decoration: none;
  background-color: transparent;
}

.bd-sidebar .nav > .active > a,
.bd-sidebar .nav > .active:hover > a {
  font-weight: 500;
  color: rgba(0, 0, 0, .85);
  background-color: transparent;
}


.bd-sidebar .nav > li > a.active {
  /*color: #0275d8;*/
  color: black;
  font-weight: bold;
}

</style>
