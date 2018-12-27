
<script>
import { mapState, mapMutations } from 'vuex'
import { Stage, Bitmap, Touch } from '@createjs/easeljs/dist/easeljs.module'
import { DISP } from '../../sub/constant/config.js'
import * as Util from '../../sub/util/Util'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as StateHelper from '../../sub/helper/StateHelper'
import reloadmixinVue from './reloadmixin.vue'

export default {
  mixins: [reloadmixinVue],
  data() {
    return {
      isShownMapImage: false,
      positionedExb: [],
      realWidth: null,
      isFirstTime: true,
      showTryCount: 0,
      tempMapFitMobile: DISP.MAP_FIT_MOBILE,
      oldMapImageScale: 0,
    }
  },
  computed: {
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
    ...mapState([
      'loginId'
    ]),
    selectedArea: {
      get() { return this.$store.state.main.selectedArea},
      set(val) { this.replaceMain({'selectedArea': val})},
    },
  },
  created() {
    if (this.$route.path.startsWith('/main')) {      
      let timer = 0
      let path = this.$route.path
      let currentWidth = window.innerWidth
      let onResize = () => {
        if (path != this.$route.path) {
          window.removeEventListener('resize', onResize)
          clearTimeout(timer)
          return
        }
        if (timer > 0) {
          clearTimeout(timer)
        } 
        timer = setTimeout(() => {
          if (currentWidth === window.innerWidth && Util.isAndroidOrIOS()) {
            // モバイル端末だと表示の直後にリサイズイベントが発生してしまうため、
            // 画面横幅が変わっていなければ処理をキャンセル
            return
          } else {
            currentWidth = window.innerWidth
          }
          console.log(path + ' : ' + this.$route.path, this)
          this.reset()
          if (this.stage) {
            this.stage.removeAllChildren()
            if (this.resetDetail) {
              this.resetDetail()
            }
            this.stage.update()
            this.fetchData()
          }
        }, 200)
      }
      window.addEventListener('resize', onResize)
    }
  },
  mounted() {
    Util.debug('In showmapmixin mounted.')
    this.addDblTapListener(() => {
      Util.debug('in Listener')
      this.toggleCallBack && this.toggleCallBack()
      this.isShownMapImage = false
      this.toggleMapFitMobile()
      this.showMapImage && this.showMapImage()
    })
  },
  beforeDestroy() {
    this.tempMapFitMobile = DISP.MAP_FIT_MOBILE
  },
  methods: {
    ...mapMutations('main', [
      'replaceMain', 
    ]),
    mapImage() {
      let area = _.find(this.areas, (area) => {
        if (this.selectedArea == null) {
          this.selectedArea = area.areaId // nullの場合、最初のものにする
        }
        return area.areaId == this.selectedArea
      })
      return area && this.getMapImage(area.areaId)
    },
    getMapImage(areaId) {
      let areaImage = _.find(this.$store.state.app_service.areaImages, (areaImage) => {
        return areaImage.areaId == areaId
      })
      return areaImage && areaImage.mapImage
    },
    async fetchAreaExbs(tx) {
      if (this.isFirstTime) {
        await StateHelper.load('area')
        this.selectedArea = this.selectedArea ? this.selectedArea : Util.getValue(this, 'areas.0.areaId', null)
        await StateHelper.loadAreaImage(this.selectedArea)
        console.log('after loadAreas. selectedArea=' + this.selectedArea)
        await StateHelper.load('exb')
        if (tx) {
          await StateHelper.load('tx')
        }
        this.isFirstTime = false
      }
    },
    showMapImageDef(callback) {
      this.showTryCount++
      console.log('showMapImageDef', this.selectedArea, this.isShownMapImage)
      if (this.isShownMapImage) {
        if (callback) {
          callback()
        }
        return
      }
      if (!this.mapImage()) {
        if (this.showTryCount < 10) {
          this.$nextTick(() => {
            console.warn('again because no image')
            this.showMapImage()
          })
        }
        else {
          Util.debug('No mapImage in showMapImageDef.')
          this.noImageErrorKey && this.loginId && this.showErrorModal({key: this.noImageErrorKey})
        }
        return
      }

      var bg = new Image()
      bg.src = this.mapImage()
      bg.onload = (evt) => {
        this.drawMapImage(bg)
        if (callback) {
          callback()
        }
      }
    },
    calcFitSize(target, parent, top = 82) {
      const parentHeight = document.documentElement.clientHeight - parent.offsetTop - top
      const isMapWidthLarger = parentHeight / parent.clientWidth > target.height / target.width
      let fitWidth
      if (HtmlUtil.isMobile()) {
        fitWidth = (this.tempMapFitMobile == 'both' && isMapWidthLarger) || this.tempMapFitMobile == 'width'
      } else {
        fitWidth = (DISP.MAP_FIT == 'both' && isMapWidthLarger) || DISP.MAP_FIT == 'width'
      }
      const result = {}
      if (fitWidth) {
        result.width = parent.clientWidth
        result.height = parent.clientWidth * target.height / target.width
      } else {
        result.width = parentHeight * target.width / target.height
        result.height = parentHeight
      }
      this.oldMapImageScale = this.mapImageScale
      this.mapImageScale = result.width / target.width
      console.debug(fitWidth, result.width, result.height, parentHeight)
      if (this.onMapImageScale) {
        this.onMapImageScale()
      }
      return result
    },
    drawMapImage(bg) {
      let canvas = this.$refs.map
      this.mapWidth = bg.width
      this.mapHeight = bg.height
      this.isShownMapImage = true
      let parent = document.getElementById('map').parentElement

      const size = this.calcFitSize(bg, parent)
      canvas.width = size.width
      canvas.height = size.height

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
      this.stage = new Stage('map')
      this.stage.canvas = canvas
      this.stage.mouseEnabled = true
      if (Touch.isSupported()) {
        Touch.enable(this.stage)
      }

      var bitmap = new Bitmap(bg)
      bitmap.scaleY = bitmap.scaleX = this.mapImageScale
      bitmap.width = canvas.width
      bitmap.height = canvas.height
      this.stage.addChild(bitmap)

      this.stage.update() 
      this.bitmap = bitmap
      this.oldSelectedArea = this.selectedArea
    },
    changeArea(val) {
      if (val) {
        let area = _.find(this.areas, (area) => {
          return area.areaId == val
        })
        if (this.getMapImage(area.areaId)) {
          this.reset()
          this.selectedArea = val
          this.fetchData()
        }
        else {
          Util.debug('No mapImage in changeArea.')
          this.noImageErrorKey && this.showErrorModal({key: this.noImageErrorKey})
          this.$nextTick(() => {
            this.selectedArea = this.oldSelectedArea
          })
        }
      }      
    },
    forceUpdateRealWidth() {
      if (!this.realWidth) { // Due to force update computed property mapRatio
        this.realWidth = 1
        this.$nextTick(() => {
          this.realWidth = ''
        })
      }
    },
    replaceExb(exb, nokeep) {
      if (this.keepExbPosition) {
        exb.x = exb.x / this.oldMapImageScale * this.mapImageScale
        exb.y = exb.y / this.oldMapImageScale * this.mapImageScale
      } else {
        nokeep(exb)
      }
    },
    toggleMapFitMobile() {
      if (this.tempMapFitMobile === 'both') {
        this.tempMapFitMobile = 'width'
      } else {
        this.tempMapFitMobile = 'both'
      }
      Util.debug('tempMapFitMobile: ' + this.tempMapFitMobile)
    },
    getDblTapListener(callback) {
      let dblTap = false
      return (evt) => {
        if (dblTap) {
          Util.debug('second tap!')
          Util.debug(evt)
          callback && callback()
        } else {
          Util.debug('first tap!')
          dblTap = true
          setTimeout(() => {dblTap = false}, 500)
        }
      }
    },
    addDblTapListener(callback) {
      Util.debug('add listener')
      const listener = this.getDblTapListener(callback)
      const map = this.$refs.map
      map && map.addEventListener('touchstart', (evt) => listener(evt))
    }
  }
}
</script>

<style lang="scss">
@import "../../sub/constant/config.scss";

#map {
  margin: 0 auto;
}

</style>

