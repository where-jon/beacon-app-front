
<script>
import { EventBus } from '../../sub/helper/EventHelper'
import * as AuthHelper from '../../sub/helper/AuthHelper'
import commonmixinVue from './commonmixin.vue'
import * as Util from '../../sub/util/Util'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import { APP } from '../../sub/constant/config'

export default {
  mixins: [commonmixinVue],
  computed: {
    iosOrAndroid() {
      return Util.isAndroidOrIOS()
    },
  },  
  created(){
    EventBus.$off('reload')
    EventBus.$on('reload', (payload)=>{
      this.fetchData(payload)
    })
  },
  methods: {
    startAutoReload() {
      HtmlUtil.registerInterval(()=>{
        this.$store.commit('replace', {reload: true})
        const windowScroll = {x: window.pageXOffset , y: window.pageYOffset}
        EventBus.$emit('reload', {done() { AuthHelper.checkSession() }})
        window.scroll(windowScroll.x, windowScroll.y)
      }, APP.AUTO_RELOAD)
    },
    stopAutoReload() {
      HtmlUtil.removeInterval()
    },
  },
}
</script>
