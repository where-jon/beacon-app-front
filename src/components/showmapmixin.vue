
<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { Shape, Stage, Container, Bitmap, Text, Touch } from '@createjs/easeljs/dist/easeljs.module'
import { Tween, Ticker } from '@createjs/tweenjs/dist/tweenjs.module'
import { EventBus } from '../sub/helper/EventHelper'
import { DISP } from '../sub/constant/config.js'
import * as Util from '../sub/util/Util'
import * as AppServiceHelper from '../sub/helper/AppServiceHelper'
import * as PositionHelper from '../sub/helper/PositionHelper'
import reloadmixinVue from './reloadmixin.vue'

let that

export default {
  mixins: [reloadmixinVue],
  data() {
    return {
      selectedArea: null,
      isShownMapImage: false,
      positionedExb: [],
      realWidth: null,
      isFirstTime: true,
    }
  },
  computed: {
    mapImage() {
      let area = _.find(this.$store.state.app_service.areas, (area) => this.selectedArea && area.areaId == this.selectedArea.value)
      return area && area.mapImage
    },
    areaOptions() {
      let ret = _(this.$store.state.app_service.areas).map((val) => {
        return {label: val.areaName, value: val.areaId}
      }).value()
      return ret
    },
    ...mapState('app_service', [
      'areas',
    ]),
  },
  created() {
    that = this
    window.addEventListener('resize', () => {
      const positions = PositionHelper.adjustPosition(this.positions)
      that.replaceMain({positions})
    })
  },
  methods: {
    async fetchAreaExbs(tx) {
      if (this.isFirstTime) {
        let areas = await AppServiceHelper.fetchList('/core/area/withImage', 'areaId')
        this.selectedArea = areas && {label:areas[0].areaName, value:areas[0].areaId}
        this.replaceAS({areas})

        this.exbs = await AppServiceHelper.fetchList('/core/exb/withLocation', 'exbId')
        if (tx) {
          this.txs = await AppServiceHelper.fetchList('/core/tx', 'txId')
        }
        this.isFirstTime = false
      }
    },
    showMapImageDef() {
      console.log('showMapImageDef', this.isShownMapImage)
      if (this.isShownMapImage) return
      console.debug("showMapImage")
      let parent = document.getElementById("map").parentElement
      let canvas = this.$refs.map
      var bg = new Image()
      if (!this.mapImage) {
        console.warn("no mapImage")
        this.$root.$emit('bv::show::modal', 'modalError')
        return true
      }
      bg.src = this.mapImage
      let that = this
      if (bg.height == 0 || bg.width == 0 || !canvas) {
        this.$nextTick(() => {
          console.debug("again")
          that.showMapImage()
        })
        return true
      }
      this.mapWidth = bg.width
      this.mapHeight = bg.height
      this.isShownMapImage = true
      let parentHeight = document.documentElement.clientHeight - parent.offsetTop - 82
      let isMapWidthLarger = parentHeight / parent.clientWidth > bg.height / bg.width
      let fitWidth = (DISP.MAP_FIT == "both" && isMapWidthLarger) || DISP.MAP_FIT == "width"
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
      }
      this.stage = new Stage("map")
      this.stage.canvas = canvas
      this.stage.mouseEnabled = true

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
      if (this.isFirstTime) return
      if (val && val.value) {
        this.reset()
        this.selectedArea = val
        this.showMapImage()
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
    getSensorId(exb) {
      return Util.getValue(exb, 'exbSensorList.0.sensor.sensorId').val
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

