<template>
  <!-- <b-breadcrumb :items="items" :style="{ marginTop: '20px'}"/> -->
  <div :class="breadcrumbClasses" :style="{ marginTop: '20px'}">
    <div class="col-md-11">
      <ol class="breadcrumb-items">
        <li v-for="(item, index) in items" :key="index">
          <span v-if="isActive(item)" v-text="item.text"></span>
          <a v-if="isLink(item)" v-text="item.text" :href="item.href"></a>
        </li>
      </ol>
    </div>
    <div class="col-md-1" :style="{ textAlign: 'right' }">
      <a href="#" v-if="reload" :style="{ color: 'white' }"><i title="リロード" class="fas fa-sync-alt"></i></a>
    </div>
  </div>
</template>

<script>

  import bBreadcrumb from 'bootstrap-vue/es/components/breadcrumb/breadcrumb';
  import { THEME } from '../sub/constant/config'
  import { getTheme } from '../sub/helper/ThemeHelper'

  export default {
    data () {
      return {
      }
   },
   props: ['items', 'reload'],
   computed: {
     loginId() {
       return this.$store.state.loginId
     },
     breadcrumbClasses () {
       const storeTheme = this.$store.state.setting.theme
       const theme = getTheme(this.loginId)
       const array = THEME.map((e) => {
         const obj = {}
         obj[e.name] = e.name === theme
         return obj
       })
       let themeClasses = {}
       Object.assign(themeClasses, ...array)
       return {
         breadcrumb: true,
         ...themeClasses
       }
     }
   },
   methods: {
     isActive (item) {
       return (typeof item.active) !== 'undefined' && item.active
     },
     isLink (item) {
       return (!this.isActive(item)) && item.href !== 'undefined'
     }
   }
  }

</script>

<style lang="scss">
  @import "../sub/constant/config.scss";

  ol.breadcrumb-items {
    list-style: none;
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  ol.breadcrumb-items li {
    display: inline;
    font-size: 1em;
  }

  ol.breadcrumb-items li a {
    text-decoration: none;
    color: white;
  }

  ol.breadcrumb-items li:not(:first-child):before {
    content: '　/　';
  }

  div.breadcrumb.default {
    background-color: #e4e4e4;
    color: #444;
  }

  div.breadcrumb.primary {
    background-color: $blue;
    color: white;
  }

  div.breadcrumb.secondary {
    background-color: $gray-600;
    color: white;
  }

  div.breadcrumb.success {
    background-color: $green;
    color: white;
  }

  div.breadcrumb.info {
    background-color: $cyan;
    color: white;
  }

  div.breadcrumb.warning {
    background-color: $yellow;
    color: #444;
  }

  div.breadcrumb.danger {
    background-color: $red;
    color: white;
  }

  div.breadcrumb.light {
    background-color: $gray-100;
    color: white;
  }

  div.breadcrumb.dark {
    background-color: $gray-800;
    color: white;
  }
</style>