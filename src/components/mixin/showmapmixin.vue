
<script>
import { Stage,Touch,Bitmap } from 'createjs-module'
import { DISP } from '../../sub/constant/config'
import { POSITION, KEY } from '../../sub/constant/Constants'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as Util from '../../sub/util/Util'
import * as VueUtil from '../../sub/util/VueUtil'
import * as StringUtil from '../../sub/util/StringUtil'
import * as AreaMapHelper from '../../sub/helper/domain/AreaMapHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as LocalStorageHelper from '../../sub/helper/base/LocalStorageHelper'
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
      oldSelectedAreaId: null, // p, loc, tx
      isShownMapImage: false, // p, loc, tx
      tempMapFitMobile: DISP.MAP_FIT_MOBILE, // p, loc, tx, heatmap-position
      canvasScale: 1, // p, rssimap, position, thermohumidity, heatmap-position
      reloadSelectedTx: {}, // pir, position
      showReady: false, //  pir, positio
      showIconMinWidth: POSITION.SHOW_ICON_MIN_WIDTH, // pir, position

      showTryCount: 0, // p
      loadComplete: false, // p

      onResize: null,
    }
  },
  computed: {
  },
  async created() {
    const currentAreaId = LocalStorageHelper.getLocalStorage(KEY.CURRENT.AREA)
    if(Util.hasValue(currentAreaId)) {
      this.selectedAreaId = currentAreaId
    }
    this.vueSelected.area = VueSelectHelper.getVueSelectData(this.areaOptions, this.selectedAreaId, !Util.hasValue(this.selectedAreaId))
    this.selectedAreaId = Util.getValue(this, 'vueSelected.area.value', this.getInitAreaOption())
    this.loadComplete = true
    this.defineResizeEvent(this.$route.path)
  },
  mounted() {
    this.oldSelectedAreaId = this.getInitAreaOption()
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
    if(this.onResize){
      window.removeEventListener('resize', this.onResize)
    }
  },
  methods: {
    defineResizeEvent(path) {
      if (!StringUtil.startsWithAny(path, ['/main','/sum','/develop/installation'])) {
        return
      }
      let timer = 0
      let currentWidth = window.innerWidth
      this.onResize = () => {
        if (path != this.$route.path) {
          window.removeEventListener('resize', this.onResize)
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
            this.$nextTick(async () => await this.onChangeAreaDone(null, true))
          }
        }, 200)
      }
      window.addEventListener('resize', this.onResize)
    },
    getInitAreaOption(){ // p
      return this.selectedAreaId? this.selectedAreaId : Util.hasValue(this.areaOptions)? this.areaOptions[0].value: null
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
          if(!VueUtil.isAuthVuePage(this)){
            return
          }
          this.showMapImage && this.showMapImage(disableErrorPopup)
        }, 200)
        return
      }
      this.showTryCount++
      if (this.isShownMapImage) {
        if (callback) {
          setTimeout(() => {
            if(!VueUtil.isAuthVuePage(this)){
              return
            }
            callback()
          }, 0)
        }
        return
      }

      if (!StateHelper.getMapImage(this.getInitAreaOption())) {
        if (this.showTryCount < 10) {
          VueUtil.nextTickEx(this, () => {
            console.warn('again because no image')
            this.showMapImage(disableErrorPopup)
          })
        }
        else {
          Util.debug('No mapImage in showMapImageDef.')
          if (this.$route.path.startsWith('/main') && !disableErrorPopup) {
            this.noImageErrorKey && this.showErrorModal({key: this.noImageErrorKey})
          }
        }
        return
      }
      const bg = new Image()
      bg.src = StateHelper.getMapImage(this.getInitAreaOption())
      bg.onload = (evt) => {
        this.drawMapImage(bg)
        if (callback) {
          setTimeout(() => {
            if(!VueUtil.isAuthVuePage(this)){
              return
            }
            callback()
          }, 0)
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
      // イベント伝搬設定
      this.stage.on('click', (evt) => {
        this.resetDetail()
      })

      const bitmap = new Bitmap(bg)
      bitmap.scaleY = bitmap.scaleX = 1
      bitmap.width = canvas.width
      bitmap.height = canvas.height
      this.stage.addChild(bitmap)

      this.stage.update()
      this.bitmap = bitmap
      this.oldSelectedAreaId = this.selectedAreaId

      if(this.onMapLoaded){
        setTimeout(() => {
          if(!VueUtil.isAuthVuePage(this)){
            return
          }
          this.onMapLoaded(size)
        }, 500)
      }
    },
    async changeArea(areaId) { // analysissearch, rssimap, pir, position, thermohumiidty, loc, tx
      if (!areaId) {
        return
      }
      this.icons = {} // キャッシュをクリア
      try {
        await StateHelper.loadAreaImage(areaId, true)
        const area = this.areaIdMap[areaId]
        if (StateHelper.getMapImage(area.areaId)) {
          if(!Util.v(this, 'selectedTx.btxId')){
            this.reset()
          }
          this.selectedAreaId = areaId
          this.onChangeAreaDone && await this.onChangeAreaDone()
        }
        else {
          Util.debug('No mapImage in changeArea.')
          this.noImageErrorKey && this.showErrorModal({key: this.noImageErrorKey})
          this.$nextTick(() => this.selectedAreaId = this.oldSelectedAreaId)
        }
      } catch (e) {
        // マップ画像が見つからなかった(status 404)
        if (e.message.indexOf('404') > -1) {
          this.showErrorModal({key: this.noImageErrorKey})
          this.initMap && this.initMap()
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
      if(this.icons)this.icons = []
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

