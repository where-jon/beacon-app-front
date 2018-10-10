<template>
  <div id="mapContainer" class="container-fluid">
    <breadcrumb :items="items" :reload="true" />
    <b-row class="mt-2">
      <b-form inline class="mt-2">
        <label class="ml-3 mr-2">{{ $t('label.area') }}</label>
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
import * as mock from '../../assets/mock/mock'
import txdetail from '../../components/txdetail.vue'
import { Tx, EXB, DISP, DEV } from '../../sub/constant/config'
import { Shape, Stage, Container, Bitmap, Text, Touch } from '@createjs/easeljs/dist/easeljs.module'
import { Tween, Ticker } from '@createjs/tweenjs/dist/tweenjs.module'
import breadcrumb from '../../components/breadcrumb.vue'
import showmapmixin from '../../components/showmapmixin.vue'

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
      positions: [],
      count: 0, // for mock test 
    }
  },
  computed: {
    ...mapState('main', [
      'selectedTx',
      'orgPositions',
    ]),
  },
  mounted() {
    that = this
    this.replace({title: this.$i18n.t('label.showPosition')})
    this.fetchData()
    window.addEventListener('resize', () => {
      that.reset()
      that.stage.removeAllChildren()
      that.stage.update()
      that.fetchData()
    })
  },
  updated(){
    if (this.isFirstTime) return
    // this.fetchData()
  },
  methods: {
    reset() {
      this.isShownMapImage = false
    },
    showDetail(txId, x, y) {
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
      let selectedTx = {}
      this.replaceMain({selectedTx})
    },
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        await this.fetchAreaExbs(true)

        if (DEV.USE_MOCK_EXC) {
          // var pMock = mock.position
          var pMock = mock.positions[this.count]
        }
        let positions = await EXCloudHelper.fetchPosition(this.exbs, this.txs, pMock)
        let orgPositions = _.clone(this.orgPositions)
        if (orgPositions.length >= DISP.MOVING_AVERAGE) { // 移動平均数分のポジションデータを保持する
          orgPositions.shift()
        }
        orgPositions.push(positions)
        this.replaceMain({orgPositions})

        this.showMapImage()

        if (payload && payload.done) {
          payload.done()
        }
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

      if (!this.txCont) {
        this.txCont = new Container()
        this.txCont.width = this.bitmap.width
        this.txCont.height = this.bitmap.height
        this.stage.addChild(this.txCont)
        this.stage.update()
      }

      let now = !DEV.USE_MOCK_EXC? new Date().getTime(): mock.positions_conf.start + this.count++ * mock.positions_conf.interval  // for mock
      this.positions = PositionHelper.correctPosId(this.orgPositions, now)

      this.positionedExb = _(this.exbs).filter((exb) => {
        return exb.enabled && this.selectedArea && exb.location.areaId == this.selectedArea.value && exb.location.x && exb.location.y > 0
      }).value()

      this.showTxAll()
    },
    showTxAll() {
      if (!this.txCont) {
        return
      }
      console.debug('showTxAll', this.positions, this.txCont)
      this.txCont.removeAllChildren()
      this.stage.update()
      PositionHelper.adjustPosition(this.positions, this.mapImageScale, this.positionedExb).forEach((pos) => { // TODO: Txのチェックも追加
        this.showTx(pos)
      })
    },
    showTx(pos) {
      console.debug('showTx', {pos})

      let stage = this.stage
      let txBtn = new Container()
      let btnBg = new Shape()
      btnBg.graphics.beginStroke("#ccc").beginFill(DISP.TX_BGCOLOR).drawCircle(0, 0, DISP.TX_R)
      if (pos.transparent) {
        btnBg.alpha = 0.6
      }
      txBtn.addChild(btnBg)

      let label = new Text(pos.label)
      label.font = DISP.TX_FONT
      label.color = DISP.TX_COLOR
      label.textAlign = "center"
      label.textBaseline = "middle"
      txBtn.addChild(label)

      txBtn.txId = pos.btx_id
      txBtn.x = pos.x
      txBtn.y = pos.y
      txBtn.on('click', (evt) =>{
        let txBtn = evt.currentTarget
        that.showDetail(txBtn.txId, txBtn.x, txBtn.y)
      })

      this.txCont.addChild(txBtn)
      stage.update()
    },
    ...mapMutations('main', [
      'replaceMain', 
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