
<script>
import { APP } from '../../sub/constant/config'
import * as Util from '../../sub/util/Util'
import * as AuthHelper from '../../sub/helper/base/AuthHelper'
import { EventBus } from '../../sub/helper/base/EventHelper'
import commonmixin from './commonmixin.vue'

export default {
  mixins: [commonmixin],
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
      Util.registerInterval(() => {
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
      Util.registerInterval(() => {
        EventBus.$emit('positionReload', {
          disabledProgress: true,
        })
      }, APP.POS.AUTO_RELOAD)
    },
    startAutoReload() {
      Util.registerInterval(()=>{
        this.$store.commit('replace', {reload: true})
        const windowScroll = {x: window.pageXOffset , y: window.pageYOffset}
        EventBus.$emit('reload', {done() { AuthHelper.checkSession() }})
        window.scroll(windowScroll.x, windowScroll.y)
      }, APP.COMMON.AUTO_RELOAD)
    },
    stopAutoReload() {
      Util.removeInterval()
    },
  },
}
</script>
