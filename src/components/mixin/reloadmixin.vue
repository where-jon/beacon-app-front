
<script>
import { EventBus } from '../../sub/helper/EventHelper'
import * as AuthHelper from '../../sub/helper/AuthHelper'
import commonmixinVue from './commonmixin.vue'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import { APP } from '../../sub/constant/config'

export default {
  mixins: [commonmixinVue],
  created(){
    EventBus.$off('reload')
    EventBus.$on('reload', (payload)=>{
      this.fetchData(payload)
    })
    EventBus.$off('positionReload')
    EventBus.$on('positionReload', (payload)=>{
      this.fetchData(payload)
    })
    EventBus.$off('otherReload')
    EventBus.$on('otherReload', (payload)=>{
      if (!payload.disabledPosition) {
        this.fetchData(payload)
      }
    })
  },
  methods: {
    startOtherAutoReload() {
      HtmlUtil.registerInterval(() => {
        this.$store.commit('replace', {reload: true})
        const windowScroll = {x: window.pageXOffset , y: window.pageYOffset}
        EventBus.$emit('otherReload', {
          disabledPosition: true,
          done() { AuthHelper.checkSession() }
        })
        window.scroll(windowScroll.x, windowScroll.y)
      }, APP.COMMON.AUTO_RELOAD)
    },
    startPositionAutoReload() {
      HtmlUtil.registerInterval(() => {
        EventBus.$emit('positionReload', {
          disabledProgress: true,
          disabledOther: true,
        })
      }, APP.POS.AUTO_RELOAD)
    },
    startAutoReload() {
      HtmlUtil.registerInterval(()=>{
        this.$store.commit('replace', {reload: true})
        const windowScroll = {x: window.pageXOffset , y: window.pageYOffset}
        EventBus.$emit('reload', {done() { AuthHelper.checkSession() }})
        window.scroll(windowScroll.x, windowScroll.y)
      }, APP.COMMON.AUTO_RELOAD)
    },
    stopAutoReload() {
      HtmlUtil.removeInterval()
    },
  },
}
</script>
