<template>
  <div id="mapContainer" class="container-fluid">
    <breadcrumb :items="items" :reload="true" />
    <b-row class="mt-2">
      <b-form inline class="mt-2">
        <label class="ml-3 mr-2">{{ $t('label.area') }}</label>
        <b-form-select v-model="selectedArea" :options="areaOptions" @change="changeArea" required class="ml-2"></b-form-select>
      </b-form>
    </b-row>
    <b-row class="mt-3">
      <canvas id="map" ref="map" @click="resetDetail"></canvas>
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
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as mock from '../../assets/mock/mock'
import txdetail from '../../components/txdetail.vue'
import { Tx, EXB, DISP, DEV } from '../../sub/constant/config'
import { Shape, Stage, Container, Bitmap, Text, Touch } from '@createjs/easeljs/dist/easeljs.module'
import { Tween, Ticker } from '@createjs/tweenjs/dist/tweenjs.module'
import breadcrumb from '../../components/breadcrumb.vue'
import showmapmixin from '../../components/showmapmixin.vue'
import moment from 'moment'

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
      txsMap: {},
      pot: {}
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
    let timer = 0
    window.addEventListener('resize', () => {
      if (timer > 0) {
        clearTimeout(timer);
      } 
      timer = setTimeout(() => {
        that.reset()
        if (that.stage) {
          that.stage.removeAllChildren()
          that.resetDetail()
          that.stage.update()
          that.fetchData()
        }
      }, 200);
    })
  },
  updated(){
    if (this.isFirstTime) return
    this.fetchData()
  },
  methods: {
    reset() {
      this.isShownMapImage = false
    },
    async showDetail(txId, x, y) {
      let rev = y > 400
      let map = HtmlUtil.getRect("#map")
      let containerParent = HtmlUtil.getRect("#mapContainer", "parentNode")
      let offsetX = map.left - containerParent.left
      let offsetY = map.top - containerParent.top
      const tipOffsetX = -34.5
      const tipOffsetY = 15
      const targetId = this.txsMap[txId]
      const p = await this.getDetail(targetId)
      const position = this.positions.find((e) => {
        return e.btx_id === txId
      })
      let selectedTx = {
        txId,
        minor: 'minor:' + txId,
        major: 'major:' + p.tx.major,
        class: !txId? "": "balloon" + (rev? "-u": ""),
        left: x + offsetX + tipOffsetX + (rev? - 7: 0),
        top: y + offsetY + tipOffsetY + DISP.TX_R + (rev? - 232: 0),
        name: p.potName,
        timestamp: position ? this.getFinalReceiveTime(position.timestamp) : '',
        thumbnail: p.thumbnail ? p.thumbnail : '',
        category: p.potCategoryList.length > 0 ? p.potCategoryList[0].category.categoryName : '',
        group: p.potGroupList.length > 0 ? p.potGroupList[0].group.groupName : ''
      }
      this.replaceMain({selectedTx})
    },
    resetDetail() {
      let selectedTx = {}
      this.replaceMain({selectedTx})
    },
    getFinalReceiveTime (time) {
      return time ? moment(time).format('YYYY/MM/DD HH:mm:ss') : ''
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

        this.txsMap = this.txs.reduce((obj, record) => {
          obj[record.btxId] = record.txId
          return obj
        }, {})
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    },
    async getDetail(txId) {
      let pot = await AppServiceHelper.fetch('/basic/pot/withThumbnail', txId)
      return pot
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
        return exb.enabled && exb.location.areaId == this.selectedArea && exb.location.x && exb.location.y > 0
      }).value()

      this.showTxAll()
    },
    showTxAll() {
      if (!this.txCont) {
        return
      }
      this.txCont.removeAllChildren()
      this.stage.update()
      PositionHelper.adjustPosition(this.positions, this.mapImageScale, this.positionedExb).forEach((pos) => { // TODO: Txのチェックも追加
        this.showTx(pos)
      })
    },
    showTx(pos) {
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
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/config.scss";

::-webkit-scrollbar { 
  display: none; 
}


</style>