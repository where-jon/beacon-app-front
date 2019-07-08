
<script>
import { Stage, Bitmap, Touch } from '@createjs/easeljs/dist/easeljs.module'
import { DISP } from '../../sub/constant/config'
import { POSITION } from '../../sub/constant/Constants'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as Util from '../../sub/util/Util'
import * as VueUtil from '../../sub/util/VueUtil'
import * as StringUtil from '../../sub/util/StringUtil'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as AreaMapHelper from '../../sub/helper/domain/AreaMapHelper'
import * as VueSelectHelper from '../../sub/helper/ui/VueSelectHelper'
import reloadmixin from './reloadmixin.vue'
import commonmixin from './commonmixin.vue'

export default {
  mixins: [reloadmixin, commonmixin],
  data() {
    return {
      vueSelected: {
        area: null,
        group: null,
        category: null,
        tx: null,
      },
      positionedExb: [], // p, rssimap, pir, position, thermohumidity, loc
      oldSelectedArea: null, // p, loc, tx
      isShownMapImage: false, // p, loc, tx
      tempMapFitMobile: DISP.MAP_FIT_MOBILE, // p, loc, tx, heatmap-position
      canvasScale: 1, // p, rssimap, position, thermohumidity, heatmap-position
      reloadSelectedTx: {}, // pir, position
      showReady: false, //  pir, positio
      showingDetailTime: null, //  pir, position
      showIconMinWidth: POSITION.SHOW_ICON_MIN_WIDTH, // pir, position

      showTryCount: 0, // p
      loadComplete: false, // p
    }
  },
  computed: {
  },
  async created() {
    await StateHelper.load('area')
    this.vueSelected.area = VueSelectHelper.getVueSelectData(this.areaOptions, this.selectedArea, !Util.hasValue(this.selectedArea))
    this.selectedArea = this.getInitAreaOption()
    this.loadComplete = true
    this.defineResizeEvent(this.$route.path)
  },
  mounted() {
    this.oldSelectedArea = this.getInitAreaOption()
    Util.debug('In showmapmixin mounted.')
    AreaMapHelper.addDblTapListener(this.$refs.map, () => {
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
    defineResizeEvent(path) {
      if (StringUtil.startsWithAny(path, ['/main','/sum','/develop/installation'])) {
        let timer = 0
        let currentWidth = window.innerWidth
        const onResize = () => {
          if (path != this.$route.path) {
            window.removeEventListener('resize', onResize)
            clearTimeout(timer)
            return
          }
          this.icons = {} // リサイズ時にアイコンキャッシュをクリア
          if (timer > 0) {
            clearTimeout(timer)
          } 
          timer = setTimeout( async () => {
            if (currentWidth === window.innerWidth && BrowserUtil.isAndroidOrIOS()) {
              // モバイル端末だと表示の直後にリサイズイベントが発生してしまうため、
              // 画面横幅が変わっていなければ処理をキャンセル
              return
            } else {
              currentWidth = window.innerWidth
            }
            this.reset()
            if (this.stage) {
              this.stage.removeAllChildren()
              this.stage.update()
              this.$nextTick(async () => {
                await this.fetchData(null, true)
              })
            }
          }, 200)
        }
        window.addEventListener('resize', onResize)
      }
    },
    getInitAreaOption(){ // p
      return this.selectedArea? this.selectedArea : Util.hasValue(this.areaOptions)? this.areaOptions[0].value: null
    },
    getMapScale(){ // p, pir
      return DISP.TX.R_ABSOLUTE ? this.canvasScale : 1
    },
    showMapImageDef(callback, disableErrorPopup) { // rssimap, pir, position, thermohumiidty, loc, tx, flowline
      if(VueUtil.endsWithSlashUrl(this)){
        return
      }
      if(!this.loadComplete){
        setTimeout(() => {
          this.showMapImage && this.showMapImage(disableErrorPopup)
        }, 200)
        return
      }
      this.showTryCount++
      if (this.isShownMapImage) {
        if (callback) {
          setTimeout(() => callback(), 0)
        }
        return
      }
      
      if (!StateHelper.getMapImage(this.getInitAreaOption())) {
        if (this.showTryCount < 10) {
          this.$nextTick(() => {
            console.warn('again because no image')
            this.showMapImage(disableErrorPopup)
          })
        }
        else {
          Util.debug('No mapImage in showMapImageDef.')
          if (this.$route.path.startsWith('/main') && !disableErrorPopup) {
            this.noImageErrorKey && this.loginId && this.showErrorModal({key: this.noImageErrorKey})
          }
        }
        return
      }
      const bg = new Image()
      bg.src = StateHelper.getMapImage(this.getInitAreaOption())
      bg.onload = (evt) => {
        this.drawMapImage(bg)
        if (callback) {
          setTimeout(() => callback(), 0)
        }
      }
    },
    drawMapImage(bg) { // p
      const canvas = this.$refs.map
      if (!canvas) {
        return
      }

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
      
      this.mapWidth = bg.width
      this.mapHeight = bg.height
      this.isShownMapImage = true
      const parent = document.getElementById('map').parentElement
      const size = AreaMapHelper.calcFitSize(bg, parent, this.tempMapFitMobile, this.onMapImageScale)
      this.canvasScale = size.width / bg.width

      // キャンバスのサイズを画像サイズに合わせる
      canvas.width = bg.width
      canvas.height = bg.height

      // cssで表示サイズを設定する
      canvas.style.width = String(size.width) + 'px'
      canvas.style.height = String(size.height) + 'px'

      this.stage = new Stage('map')
      this.stage.canvas = canvas
      this.stage.mouseEnabled = true
      if (Touch.isSupported()) {
        Touch.enable(this.stage)
      }

      const bitmap = new Bitmap(bg)
      bitmap.scaleY = bitmap.scaleX = 1
      bitmap.width = canvas.width
      bitmap.height = canvas.height
      this.stage.addChild(bitmap)

      this.stage.update() 
      this.bitmap = bitmap
      this.oldSelectedArea = this.selectedArea

      if(this.onMapLoaded){
        setTimeout(() => {
          this.onMapLoaded(size)
        }, 500)
      }
    },
    async changeArea(val) { // analysissearch, rssimap, pir, position, thermohumiidty, loc, tx
      if (val) {
        this.icons = {} // キャッシュをクリア
        try {
          await StateHelper.loadAreaImage(val, true)
          const area = _.find(this.areas, (area) => {
            return area.areaId == val
          })
          if (StateHelper.getMapImage(area.areaId)) {
            if(!Util.getValue(this, 'selectedTx.btxId', null)){
              this.reset()
            }
            this.selectedArea = val
            this.fetchData && await this.fetchData()
          }
          else {
            Util.debug('No mapImage in changeArea.')
            this.noImageErrorKey && this.showErrorModal({key: this.noImageErrorKey})
            this.$nextTick(() => {
              this.selectedArea = this.oldSelectedArea
            })
          }
        } catch (e) {
          // マップ画像が見つからなかった(status 404)
          if (e.message.indexOf('404') > -1) {
            this.showErrorModal({key: this.noImageErrorKey})
          }
        }
      }      
    },
    // forceUpdateRealWidth() { // rssimap, loc, tx, flowline　多分不要
    //   if (!this.realWidth) { // Due to force update computed property mapRatio
    //     this.realWidth = 1
    //     this.$nextTick(() => {
    //       this.realWidth = ''
    //     })
    //   }
    // },
    toggleMapFitMobile() { // p
      if (this.tempMapFitMobile === 'both') {
        this.tempMapFitMobile = 'width'
      } else {
        this.tempMapFitMobile = 'both'
      }
      Util.debug('tempMapFitMobile: ' + this.tempMapFitMobile)
    },
    reset() { // p, pir, position
      this.isShownMapImage = false
      this.resetDetail()
      if(this.onReset){
        this.onReset()
      }
    },
    resetDetail() { // p, pir, position
      if (!this.showingDetailTime || new Date().getTime() - this.showingDetailTime > 100) {
        const selectedTx = {}
        this.replaceMain({selectedTx})
      }
    },
    resetExb() { // pir, thermohumidity
      if (this.exbCon) {
        this.exbCon.removeAllChildren()
      }
      this.positionedExb.forEach((exb) => {
        this.showExb(exb)
      })
      this.keepExbPosition = false
    },
  }
}
</script>

<style lang="scss">
@import "../../sub/constant/config.scss";

#map {
  margin: 0 auto;
}

</style>

