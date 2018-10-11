<template>
  <div class="breadcrumb navigation">
    <div class="col-md-11 list-container">
      <ol class="breadcrumb-items">
        <li v-for="(item, index) in items" :key="index">
          <span v-if="isActive(item)" v-text="item.text"></span>
          <a v-if="isLink(item)" v-text="item.text" href="#" @click="move(item.href)"></a>
        </li>
      </ol>
    </div>
    <div class="col-md-1 reload-button-container">
      <a href="#" id="reload" v-if="reload" @click="onClickReload"><i title="リロード" :class="classes"></i></a>
    </div>
  </div>
</template>

<script>

import bBreadcrumb from 'bootstrap-vue/es/components/breadcrumb/breadcrumb'
import { getTheme } from '../sub/helper/ThemeHelper'
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
    }
  },
  mounted() {
    let reload = document.getElementById("reload")
    if (reload) {
      HtmlUtil.registerInterval(()=>{
        reload.click()
      }, DISP.AUTO_RELOAD)  
    }
  },
  computed: {
    loginId() {
      return this.$store.state.loginId
    },
    classes() {
      return 'fas fa-sync-alt' + (!this.isLoad ? '' : ' fa-spin')
    }
  },
  methods: {
    isActive (item) {
      return (typeof item.active) !== 'undefined' && item.active
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

</style>