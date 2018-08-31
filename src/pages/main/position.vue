<template>
  <div id="mapContainer" class="container-fluid">
    <b-row class="mt-2">
      <b-form inline class="mt-2">
        <label class="mr-2">{{ $t('label.area') }}</label>
        <v-select v-model="selectedArea" :options="areaOptions" :on-change="changeArea" required class="ml-2"></v-select>
      </b-form>
    </b-row>
    <b-row class="mt-3">
      <canvas id="map" ref="map"></canvas>
    </b-row>
    <div v-if="selectedTx.txId" >
      <txdetail :selectedTx="selectedTx" @resetDetail="resetDetail"></txdetail>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as PositionHelper from '../../sub/helper/PositionHelper'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import { EventBus } from '../../sub/helper/EventHelper'
import txdetail from '../../components/txdetail.vue'
import { Tx, EXB, DISP } from '../../sub/constant/config'
import { Shape, Stage, Container, Bitmap, Text, Touch } from '@createjs/easeljs/dist/easeljs.module'
import { Tween, Ticker } from '@createjs/tweenjs/dist/tweenjs.module'

let that

export default {
  components: {
    'txdetail': txdetail,
  },
  data() {
     return {
       selectedArea: null,
       isShownMapImage: false,
       positionedExb: [],
       isFirstTime: true,
    }
  },
  watch: {
    selectedArea: function(newVal, oldVal) {
      console.log({newVal, oldVal})
    }
  },
  computed: {
    mapImage() {
      let area = _.find(this.$store.state.app_service.areas, (area) => this.selectedArea && (area.areaId == this.selectedArea.value))
      return area && area.mapImage
    },
    areaOptions() {
      let ret = _(this.$store.state.app_service.areas).map((val) => {
        return {label: val.areaName, value: val.areaId}
      }).value()
      return ret
    },
    ...mapState('main', [
      'positions',
      'selectedTx',
    ]),
    ...mapState('app_service', [
      'areas',
    ]),
  },
  mounted() {
    that = this
    this.replace({title: this.$i18n.t('label.showPosition')})
    this.fetchData()
  },
  created(){
    EventBus.$on('reload', (payload)=>{
       this.fetchData(payload)
    })
    window.addEventListener('resize', () => {
      const positions = PositionHelper.adjustPosition(this.positions)
      that.replaceMain({positions})
    })
  },
  updated(){
    this.fetchData()
  },
  methods: {
    reset() {
      this.isShownMapImage = false
    },
    showDetail(txId, x, y) {
      console.log(txId, x, y)
      let rev = y > 400

      let map = HtmlUtil.getRect("#map")
      let containerParent = HtmlUtil.getRect("#mapContainer", "parentNode")
      let offsetX = map.left - containerParent.left
      let offsetY = map.top - containerParent.top
      const tipOffsetX = -34.5
      const tipOffsetY = 15

      let selectedTx = {
        txId,
        class: !txId? "": "balloon" + (rev? "-u": ""),
        left: x + offsetX + tipOffsetX + (rev? - 7: 0),
        top: y + offsetY + tipOffsetY + DISP.TX_R + (rev? - 232: 0),
      }
      this.replaceMain({selectedTx})
    },
    resetDetail() {
      console.log("resetDetail")
      let selectedTx = {}
      this.replaceMain({selectedTx})
    },
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        if (this.isFirstTime) {
          let areas = await AppServiceHelper.fetchList('/core/area/withImage', 'areaId')
          this.selectedArea = areas && {label:areas[0].areaName, value:areas[0].areaId}
          this.replaceAS({areas})

          this.exbs = await AppServiceHelper.fetchList('/core/exb/withLocation', 'exbId')
          this.txs = await AppServiceHelper.fetchList('/core/tx', 'txId')
          this.isFirstTime = false
        }

        let positions = await EXCloudHelper.fetchPosition(this.exbs, this.txs)

        if (payload && payload.done) {
          payload.done()
        }
        this.showMapImage()

        this.positionedExb = _(this.exbs).filter((exb) => {
          return exb.enabled && this.selectedArea && exb.location.areaId == this.selectedArea.value && exb.location.x && exb.location.y > 0
        }).value()

        this.showTxAll(positions)
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    },
    showMapImage() {
      if (this.isShownMapImage) return
      console.debug("showMapImage")
      let parent = document.getElementById("map").parentElement
      let canvas = this.$refs.map
      var bg = new Image()
      if (!this.mapImage) {
        console.warn("no mapImage")
        return
      }
      bg.src = this.mapImage
      if (bg.height == 0 || bg.width == 0) {
        this.$nextTick(() => {
          console.debug("again")
          that.showMapImage()
        })
        return
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
      this.txCont = new Container()
      this.txCont.width = bitmap.width
      this.txCont.height = bitmap.height
      stage.addChild(this.txCont)

      stage.update()
      this.stage = stage      
    },
    showTxAll(positions) {
      // console.debug('showTxAll', {positions})
      if (!this.txCont) {
        return
      }
      this.txCont.removeAllChildren()
      PositionHelper.adjustPosition(positions, this.mapImageScale, this.positionedExb).forEach((pos) => { // TODO: Txのチェックも追加
        this.showTx(pos)
      })
    },
    showTx(pos) {
      // console.debug('showTx', {pos})

      let stage = this.stage
      let txBtn = new Container()
      let btnBg = new Shape()
      btnBg.graphics.beginStroke("#ccc").beginFill(DISP.TX_BGCOLOR).drawCircle(0, 0, DISP.TX_R)
      txBtn.addChild(btnBg)

      let label = new Text(pos.label)
      label.font = DISP.TX_FONT
      label.color = DISP.TX_COLOR
      label.textAlign = "center"
      label.textBaseline = "middle"
      txBtn.addChild(label)

      txBtn.txId = pos.id
      txBtn.x = pos.x
      txBtn.y = pos.y
      txBtn.on('click', (evt) =>{
        let txBtn = evt.currentTarget
        this.showDetail(txBtn.txId, txBtn.x, txBtn.y)
      })

      this.txCont.addChild(txBtn)
      stage.update()
    },
    changeArea(val) {
      if (val.value) {
        this.reset()
        this.selectedArea = val
        console.log(this.selectedArea.value)
        this.showMapImage()
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

<style scoped lang="scss">
@import "../../sub/constant/config.scss";

::-webkit-scrollbar { 
  display: none; 
}


</style>