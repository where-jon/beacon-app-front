<template>
  <b-container>
    <b-alert v-if="display()" :show="show" variant="warning" :dismissible="false">
      <span v-for="(line, index) in createMessage()" :key="index">
        {{ line }} <br>
      </span>
    </b-alert>
  </b-container>
</template>

<script>
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as Util from '../../sub/util/Util'

export default {
  props: {
    pName: {
      type: String,
      default: '',
    },
    pCustomMessage: {
      type: String,
      default: '',
    },
    browserSize: {
      type: Boolean,
      default: false,
    },
    mobile: {
      type: Boolean,
      default: false,
    },
    custom: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      show: false,
    }
  },
  created(){
    window.addEventListener('resize', this.resizeFunc)
  },
  beforeDestroy(){
    window.removeEventListener('resize', this.resizeFunc)
  },
  methods: {
    display(){
      return this.browserSize || this.mobile || this.custom
    },
    resizeFunc(){
      this.$forceUpdate()
    },
    createMessage(){
      const messageList = []
      if(this.browserSize && BrowserUtil.isResponsiveMode(true)){
        messageList.push(this.$i18n.tnl('message.browserSizeWarn'))
      }
      if(this.mobile && BrowserUtil.isAndroidOrIOS()){
        messageList.push(this.$i18n.tnl('message.mobileWarn', {name: this.$i18n.tnl('label.' + this.pName)}))
      }
      if(this.custom){
        messageList.push(this.pCustomMessage)
      }
      this.show = Util.hasValue(messageList)
      return messageList
    }
  }
}
</script>

<style>
</style>
