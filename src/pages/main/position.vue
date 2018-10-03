<template>
  <div id="mapContainer" class="container-fluid">
    <breadcrumb :items="items" :reload="true" />
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
    <!-- modal -->
    <b-modal id="modalError" :title="$t('label.error')" ok-only>
      {{ $t('message.noMapImage') }}
    </b-modal>
    <b-modal id="modalInfo" :title="$t('label.error')" ok-only>
      {{ $t('message.noMapImage') }}
    </b-modal>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as PositionHelper from '../../sub/helper/PositionHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import txdetail from '../../components/txdetail.vue'
import { Tx, EXB, DISP } from '../../sub/constant/config'
import { Shape, Stage, Container, Bitmap, Text, Touch } from '@createjs/easeljs/dist/easeljs.module'
import { Tween, Ticker } from '@createjs/tweenjs/dist/tweenjs.module'
import breadcrumb from '../../components/breadcrumb.vue'
import showmapmixin from '../../components/showmapmixin.vue';

let that

export default {
  mixins: [showmapmixin],
  components: {
    'txdetail': txdetail,
    breadcrumb,
  },
  data() {
     return {
      items: [
        {
          text: this.$i18n.t('label.main'),
          active: true
        },
        {
          text: this.$i18n.t('label.showPosition'),
          active: true
        },
      ],
    }
  },
  computed: {
    ...mapState('main', [
      'positions',
      'selectedTx',
    ]),
  },
  mounted() {
    that = this
    this.replace({title: this.$i18n.t('label.showPosition')})
    this.fetchData()
  },
  updated(){
    if (this.isFirstTime) return
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
        await this.fetchAreaExbs(true)

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
      if (this.showMapImageDef()) {
        return
      }

      this.txCont = new Container()
      this.txCont.width = this.bitmap.width
      this.txCont.height = this.bitmap.height
      this.stage.addChild(this.txCont)

      this.stage.update()
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
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/config.scss";

::-webkit-scrollbar { 
  display: none; 
}


</style>