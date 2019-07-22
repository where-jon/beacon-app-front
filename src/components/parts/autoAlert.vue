<template>
  <b-container>
    <b-alert v-if="display" :show="show" variant="warning" :dismissible="false">
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
    browserSize: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      show: false,
    }
  },
  computed: {
    display(){
      return this.browserSize
    },
  },
  created(){
    window.addEventListener('resize', this.resizeFunc)
  },
  beforeDestroy(){
    window.removeEventListener('resize', this.resizeFunc)
  },
  methods: {
    resizeFunc(){
      this.$forceUpdate()
    },
    createMessage(){
      const messageList = []
      if(this.browserSize && BrowserUtil.isResponsiveMode()){
        messageList.push(this.$i18n.tnl('message.browserSizeWarn'))
      }
      this.show = Util.hasValue(messageList)
      return messageList
    }
  }
}
</script>

<style>
</style>
