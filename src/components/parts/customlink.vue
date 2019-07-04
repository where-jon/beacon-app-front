<template>
  <div v-if="linkKey" :style="{margin: '8px 0px'}" class="word-break">
    <span v-if="linkUrl">
      <a v-if="isImage" :href="linkUrl" target="_blank">
        <img :id="componentId" :src="linkKey" width="0" height="0" :style="{position: 'relative'}" @load="setLogo()">
      </a>
      <a v-else :href="linkUrl" target="_blank">
        <span :id="textComponentId" :style="textStyle">
          {{ getText() }}
        </span>
      </a>
    </span>
    <span v-else>
      <img v-if="isImage" :id="componentId" :src="linkKey" width="0" height="0" :style="{position: 'relative'}" @load="setLogo()">
      <span v-else :id="textComponentId" :style="textStyle">
        {{ getText() }}
      </span>
    </span>
  </div>
</template>

<script>

import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as ImageHelper from '../../sub/helper/ImageHelper'

export default {
  props: {
    linkKey: {
      type: String,
      default: '',
    },
    linkUrl: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      margin : 16,
      textStyle: {},
    }
  },
  computed: {
    componentId(){
      return `linkLogo-${this._uid}`
    },
    textComponentId(){
      return `linkText-${this._uid}`
    },
    isImage(){
      return ImageHelper.isImageFile(this.linkKey)
    }
  },
  mounted(){
    window.addEventListener('resize', this.handleResize)
    this.textStyle = this.getTextStyle()
  },
  beforeDestroy(){
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    handleResize(){
      this.setLogo()
      this.textStyle = this.getTextStyle()
      this.$forceUpdate()
    },
    getText(){
      return this.$i18n.tnl(`label.${this.linkKey}`)
    },
    getTextStyle(){
      const linkText = document.getElementById(this.textComponentId)
      const sideBar = document.getElementById('bd-sidebar')
      const ret = {
        'position': 'relative',
        'font-size': '16px',
        'text-align': 'center',
        'color': '#ffffff',
      }
      if(!linkText || !sideBar){
        return ret
      }
      if(!BrowserUtil.isResponsiveMode()){
        ret.left = `${(sideBar.clientWidth - linkText.offsetWidth) / 2}px`
      }
      else{
        ret.left = `${this.margin / 2}px`
      }
      return ret
    },
    setLogo(){
      const linkLogo = document.getElementById(this.componentId)
      const sideBar = document.getElementById('bd-sidebar')
      if(!linkLogo || !sideBar){
        return
      }
      if(!BrowserUtil.isResponsiveMode()){
        const sideBarWidth = sideBar.clientWidth - this.margin
        const widthRatio = sideBarWidth / linkLogo.naturalWidth
        linkLogo.width = Math.ceil(linkLogo.naturalWidth * widthRatio)
        linkLogo.height = Math.ceil(linkLogo.naturalHeight * widthRatio)
        linkLogo.style.left = `${(sideBarWidth - linkLogo.width + this.margin) / 2}px`
      }
      else{
        const maxHeight = 40
        const heightRatio = maxHeight / linkLogo.naturalHeight
        linkLogo.width = Math.ceil(linkLogo.naturalWidth * heightRatio)
        linkLogo.height = Math.ceil(linkLogo.naturalHeight * heightRatio)
        linkLogo.style.left = `${this.margin / 2}px`
      }
    }
  },
}

</script>

<style>
@import "../../sub/constant/label.scss";
</style>
