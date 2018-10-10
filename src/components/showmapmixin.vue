
<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { Shape, Stage, Container, Bitmap, Text, Touch } from '@createjs/easeljs/dist/easeljs.module'
import { Tween, Ticker } from '@createjs/tweenjs/dist/tweenjs.module'
import { EventBus } from '../sub/helper/EventHelper'
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
      if (bg.height == 0 || bg.width == 0) {
        this.$nextTick(() => {
          console.debug("again")
          that.showMapImage()
        })
        return true
      }
      this.mapWidth = bg.width
      this.mapHeight = bg.height
      this.isShownMapImage = true
      canvas.width = parent.clientWidth
      canvas.height = parent.clientWidth * bg.height / bg.width

      const stage = new Stage("map")
      stage.canvas = canvas
      stage.mouseEnabled = true

      var bitmap = new Bitmap(bg)
      this.mapImageScale = bitmap.scaleY = bitmap.scaleX = parent.clientWidth / bg.width
      bitmap.width = parent.clientWidth
      bitmap.height = parent.clientWidth * bg.height / bg.width
      stage.addChild(bitmap)

      stage.update() 

      this.stage = stage
      this.bitmap = bitmap

      this.oldSelectedArea = this.selectedArea
    },
    changeArea(val) {
      if (this.isFirstTime) return
      if (val && val.value) {
        this.reset()
        this.selectedArea = val
        console.log(this.selectedArea.value)
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
    ...mapMutations([
      'replace', 
    ]),
    ...mapMutations('main', [
      'replaceMain', 
    ]),
    ...mapMutations('app_service', [
      'replaceAS', 
    ]),
  }
}
</script>
