
<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { Shape, Stage, Container, Bitmap, Text, Touch } from '@createjs/easeljs/dist/easeljs.module'
import { Tween, Ticker } from '@createjs/tweenjs/dist/tweenjs.module'
import { EventBus } from '../sub/helper/EventHelper'
import { DISP } from '../sub/constant/config.js'
import * as Util from '../sub/util/Util'
import * as HtmlUtil from '../sub/util/HtmlUtil'
import * as PositionHelper from '../sub/helper/PositionHelper'
import * as StateHelper from '../sub/helper/StateHelper'
import reloadmixinVue from './reloadmixin.vue'

let that

export default {
  mixins: [reloadmixinVue],
  data() {
    return {
      isShownMapImage: false,
      positionedExb: [],
      realWidth: null,
      isFirstTime: true,
      showTryCount: 0,
    }
  },
  computed: {
    mapImage() {
      let area = _.find(this.$store.state.app_service.areas, (area) => {
        if (this.selectedArea == null) {
          this.selectedArea = area.areaId // nullの場合、最初のものにする
        }
        return area.areaId == this.selectedArea
      })
      return area && area.mapImage
    },
    areaOptions() {
      let ret = _(this.$store.state.app_service.areas).map((val) => {
        return {text: val.areaName, value: val.areaId}
      }).value()
      return ret
    },
    ...mapState('app_service', [
      'areas',
      'exbs',
      'txs',
    ]),
    selectedArea: {
      get() { return this.$store.state.main.selectedArea},
      set(val) { this.replaceMain({'selectedArea': val})},
    },
  },
  created() {
    that = this

    if (this.$route.path.startsWith("/main")) {      
      let timer = 0
      let path = this.$route.path
      let onResize = () => {
        // const positions = PositionHelper.adjustPosition(this.positions)
        // that.replaceMain({positions})
        if (path != this.$route.path) {
          window.removeEventListener('resize', onResize)
          clearTimeout(timer);
          return
        }
        if (timer > 0) {
          clearTimeout(timer);
        } 
        timer = setTimeout(() => {
          console.log(path + " : " + this.$route.path)
          that.reset()
          if (that.stage) {
            that.stage.removeAllChildren()
            if (that.resetDetail) {
              that.resetDetail()
            }
            that.stage.update()
            that.fetchData()
          }
        }, 200);
      }
      window.addEventListener('resize', onResize)
    }
  },
  methods: {
    ...mapMutations('main', [
      'replaceMain', 
    ]),
    async fetchAreaExbs(tx) {
      if (this.isFirstTime) {
        await StateHelper.load('area')
        this.selectedArea = this.selectedArea ? this.selectedArea : Util.getValue(this, 'areas.0.areaId', null)
        console.log("after loadAreas. selectedArea=" + this.selectedArea)
        await StateHelper.load('exb')
        if (tx) {
          await StateHelper.load('tx')
        }
        this.isFirstTime = false
      }
    },
    showMapImageDef() {
      this.showTryCount++
      console.log('showMapImageDef', this.selectedArea, this.isShownMapImage)
      if (this.isShownMapImage) return false
      let canvas = this.$refs.map

      if (!this.mapImage) {
        if (this.showTryCount < 10) {
          this.$nextTick(() => {
            console.warn("again because no image")
            that.showMapImage()
          })
        }
        else {
          this.$root.$emit('bv::show::modal', 'modalError')
        }
        return true
      }

      var bg = new Image()
      bg.src = this.mapImage
      if (bg.height == 0 || bg.width == 0 || !canvas) {
        this.$nextTick(() => {
          console.warn("again because image is 0")
          if (this.showTryCount > 30) {
            window.location.reload()
            return
          }
          else if (this.showTryCount > 20) {
            this.isFirstTime = true
            this.fetchData()
            return
          }
          that.showMapImage()
        })
        return true
      }
      this.mapWidth = bg.width
      this.mapHeight = bg.height
      this.isShownMapImage = true
      let parent = document.getElementById("map").parentElement
      let parentHeight = document.documentElement.clientHeight - parent.offsetTop - 82
      let isMapWidthLarger = parentHeight / parent.clientWidth > bg.height / bg.width
      let fitWidth = HtmlUtil.isMobile()? ((DISP.MAP_FIT_MOBILE == "both" && isMapWidthLarger) || DISP.MAP_FIT_MOBILE == "width"): (DISP.MAP_FIT == "both" && isMapWidthLarger) || DISP.MAP_FIT == "width"
      if (fitWidth) {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientWidth * bg.height / bg.width
      }
      else {
        canvas.width = parentHeight * bg.width / bg.height
        canvas.height = parentHeight
      }
      console.debug(fitWidth, canvas.width, canvas.height, parentHeight)

      if (this.stage) { 
        this.stage.removeAllChildren()
        if (this.txCont) {
          this.txCont.removeAllChildren()
          this.txCont = null
        }
        if (this.exbCon) {
          this.exbCon.removeAllChildren()
          this.stage.update()
          this.exbCon = null
        }
      }
      this.stage = new Stage("map")
      this.stage.canvas = canvas
      this.stage.mouseEnabled = true
      if (Touch.isSupported()) {
        Touch.enable(this.stage)
      }

      var bitmap = new Bitmap(bg)
      this.mapImageScale = bitmap.scaleY = bitmap.scaleX = canvas.width / bg.width
      bitmap.width = canvas.width
      bitmap.height = canvas.height
      this.stage.addChild(bitmap)

      this.stage.update() 
      this.bitmap = bitmap
      this.oldSelectedArea = this.selectedArea
    },
    changeArea(val) {
      if (val) {
        this.reset()
        this.selectedArea = val
        this.fetchData()
      }      
    },
    forceUpdateRealWidth() {
      if (!this.realWidth) { // Due to force update computed property mapRatio
        this.realWidth = 1
        this.$nextTick(() => {
          that.realWidth = ""
        })
      }
    },
    async getPotByTxId(txId) {
      let pot = await AppServiceHelper.fetch('/basic/pot', txId)
      this.replaceMain({pot})
    },
  }
}
</script>

<style lang="scss">
@import "../sub/constant/config.scss";

#map {
  margin: 0 auto;
}

</style>

