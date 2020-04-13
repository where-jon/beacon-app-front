<template>
  <div id="mapContainer" class="container-fluid">
    <breadcrumb :items="breadCrumbs" :reload="true" :state="reloadState" />
    <b-row class="mt-2">
      <b-form inline class="mt-2" @submit.prevent>
        <b-form-row class="my-1 ml-2 ml-sm-0">
          <label class="ml-sm-4 ml-2 mr-1">
            {{ $t('label.area') }}
          </label>
          <span :title="vueSelectTitle(vueSelected.area)">
            <v-select v-model="vueSelected.area" :options="areaOptions" :clearable="false" class="ml-1 mr-2 vue-options" :style="vueSelectStyle">
              <template slot="selected-option" slot-scope="option">
                {{ vueSelectCutOn(option, true) }}
              </template>
              <template slot="no-options">
                {{ vueSelectNoMatchingOptions }}
              </template>
            </v-select>
          </span>
        </b-form-row>
        <b-form-row>
          <b-form-checkbox v-model="modeRssi" class="ml-sm-4 ml-2 mr-1">
            {{ $t('label.dispRssi') }}
          </b-form-checkbox>
        </b-form-row>
        <b-form-row class="my-1 ml-2 ml-sm-0">
          <label class="ml-sm-4 ml-2 mr-1">
            {{ $t('label.tx') }}
          </label>
          <v-select v-model="vueSelected.tx" :options="txRecords" class="ml-1 mr-2 vue-options" :style="vueSelectStyle">
            <template slot="no-options">
              {{ vueSelectNoMatchingOptions }}
            </template>
          </v-select>
        </b-form-row>
        <b-form-row class="my-1 ml-2 ml-sm-0">
          <b-button class="ml-sm-4 ml-2 mr-1" :pressed.sync="isPause" :variant="theme">
            <font-awesome-icon v-if="!isPause" icon="pause" />
            <span v-if="!isPause">
              &nbsp;{{ $t('label.reload') }}{{ $t('label.pause') }}
            </span>
            <font-awesome-icon v-if="isPause" icon="play" />
            <span v-if="isPause">
              &nbsp;{{ $t('label.reload') }}{{ $t('label.restart') }}
            </span>
          </b-button>
        </b-form-row>
      </b-form>
    </b-row>
    <b-row class="mt-3">
      <canvas id="map" ref="map" />
    </b-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { Container, Shape, Text } from 'createjs-module'
import { APP, DISP } from '../../sub/constant/config'
import * as Util from '../../sub/util/Util'
import * as EXCloudHelper from '../../sub/helper/dataproc/EXCloudHelper'
import * as PositionHelper from '../../sub/helper/domain/PositionHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../mixin/commonmixin.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'

class RssiIcon {
  constructor(parent, rssi, scale, level = 3) {
    const w = DISP.INSTALLATION.WIDTH
    const h = DISP.INSTALLATION.HEIGHT
    const color = (() => {
      const bg = DISP.INSTALLATION.BG_COLOR
      const color = DISP.INSTALLATION.FONT_COLOR
      switch (level) {
      case 0:
        return {bg: bg[0], text: color[0]}
      case 1:
        return {bg: bg[1], text: color[1]}
      case 2:
        return {bg: bg[2], text: color[2]}
      default:
        return {bg: bg[3], text: color[3]}
      }
    })()
    this.container = new Container()
    const s = new Shape()
    s.graphics.beginFill(color.bg).drawRect(0, 0, w * scale, h * scale)
    const label = new Text(rssi)
    this.container.addChild(s, label)
    label.set({
      font: DISP.INSTALLATION.FONT_SIZE * scale + 'px ' + DISP.EXB_LOC.FONT,
      color: color.text,
      textAlign: 'center',
      textBaseline: 'bottom',
      x: w * scale / 2,
      y: h * scale,
    })
    this.parent = parent
  }

  add(x, y) {
    this.container.x = x
    this.container.y = y
    this.parent.addChild(this.container)
    return this.container
  }
}

const isMatchId = (selectedId, obj, propName) => {
  if (!selectedId) {
    return true
  }

  if (!obj || !obj[propName]) {
    return false
  }

  return selectedId === obj[propName]
}

export default {
  components: {
    breadcrumb,
  },
  mixins: [commonmixin, showmapmixin],
  data () {
    return {
      breadCrumbs: ViewHelper.createBreadCrumbItems('monitor', 'installation'),
      modeRssi: true,
      exbDisp: 'deviceId',
      nearest: [],
      targetTx: null,
      exbBtns : [],
      RSSI_SCALE: 5,
      isPause: false,
      firstTime: true,
      reloadState: {isLoad: false},
      noImageErrorKey: 'noMapImage',
      posCache: [],
    }
  },
  computed: {
    ...mapState([
      'reload',
    ]),
    txRecords() {
      const btxs = this.nearest.map(n => ({label: n.btxId, value: n.btxId}))
      if (!this.selectedGroupId && !this.selectedCategoryId) {
        return btxs
      }
      const target = this.txs.filter(tx => isMatchId(this.selectedGroupId, tx.pot.group, 'groupId') &&
      isMatchId(this.selectedCategoryId, tx.pot.category, 'categoryId'))
      return target.length > 0 ? btxs.filter(btx => target.some(t => btx.value === t.btxId)) : []
    },
  },
  watch: {
    modeRssi: function(newVal, oldVal) {
      this.$emit('rssi', newVal)
    },
    isPause: function(newVal, oldVal) {
      // リロード一時停止
      if (newVal) {
        this.stopAutoReload()
        return
      }
      // リロード再開
      this.startAutoReload()
    },
    'vueSelected.area': {
      handler: function(newVal, oldVal){
        this.selectedAreaId = Util.getValue(newVal, 'value')
        this.changeArea(this.selectedAreaId)
      },
      deep: true,
    },
    'vueSelected.tx': {
      handler: function(newVal, oldVal){
        this.targetTx = Util.getValue(newVal, 'value')
        this.dispRssiIcons(this.targetTx)
      },
      deep: true,
    },
  },
  async mounted() {
    this.reloadState.isLoad = false
  },
  methods: {
    initMap() {
      if (this.rssiCon) {
        this.rssiCon.removeAllChildren()
      }
      if (this.exbCon && this.exbCon !== null) {
        this.stage.removeChild(this.exbCon)
      }
      this.stage.update()
      this.posCache = []
    },
    showMapImage(disableErrorPopup, payload) {
      this.showMapImageDef(async () => {
        try {
          this.showProgress()
          this.initMap()
          const reloadButton = document.getElementById('spinner')
          if(!this.firstTime && reloadButton){
            this.reloadState.isLoad = true
          }

          this.positionedExb = this.getExbPosition()
          this.exbCon = new Container()
          // TODO:以下のように書き換えたが動作している。なぜボタンを渡す必要がある？ もっと根本的に短くかけると思われる。
          // this.exbBtns = this.positionedExb.map((exb) => {
          this.positionedExb.forEach((exb) => {
            // const clone = Object.assign({}, exb)
            // if (!this.keepExbPosition) {
            //   clone.x = exb.location.x
            //   clone.y = exb.location.y
            // }
            // const exbBtn = this.createExbIcon(clone)
            const exbBtn = this.createExbIcon(exb)
            this.exbCon.addChild(exbBtn)
            // return exbBtn
          })

          let positions = PositionHelper.filterPositions(undefined, false)
          // this.nearest = await this.getNearest(this.exbBtns)
          this.nearest = await this.getNearest(this.positionedExb)
          this.nearest = this.nearest.filter((n) => positions.some((pos) => pos.btxId == n.btxId))

          this.stage.addChild(this.exbCon)
          this.stage.setChildIndex(this.exbCon, this.stage.numChildren-1)
          this.stage.update()
          if (this.targetTx) {
            this.dispRssiIcons(this.targetTx)
          }

          if (payload && payload.done) {
            payload.done()
          }

          if(!this.firstTime && reloadButton){
            this.reloadState.isLoad = false
          }
          this.firstTime = false
        } catch (e) {
          console.error(e)
        } finally {
          this.reloadState.isLoad = false
          this.hideProgress()
        }
      }, disableErrorPopup)
    },
    async fetchData(payload) {
      this.onChangeAreaDone(payload)
    },
    async onChangeAreaDone(payload, disableErrorPopup) {
      this.showReady = false
      const disabledProgress = Util.getValue(payload, 'disabledProgress', false)
      try {
        this.reloadSelectedTx = this.reload? this.selectedTx: {}
        this.replace({reload: false})
        if(!disabledProgress){
          this.showProgress()
        }
        this.showMapImage(disableErrorPopup, payload)
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      if(!disabledProgress){
        this.hideProgress()
      }
    },
    createExbIcon(exb) {
      const exbBtn = new Container()
      const s = new Shape()
      const w = DISP.INSTALLATION.WIDTH / this.canvasScale
      const h = DISP.INSTALLATION.HEIGHT / this.canvasScale
      s.graphics.beginFill(DISP.EXB_LOC.RSSI_BGCOLOR).drawRect(0, 0, w, h)
      s.x = -w * 0.5
      s.y = -h * 0.5
      exbBtn.addChild(s)
      const label = new Text(this.getExbDisp(exb.deviceId))
      label.font = DISP.INSTALLATION.FONT_SIZE / this.canvasScale + 'px ' + DISP.EXB_LOC.FONT
      label.color = DISP.EXB_LOC.COLOR
      label.textAlign = 'center'
      label.textBaseline = 'middle'
      exbBtn.addChild(label)
      exbBtn.deviceId = exb.deviceId
      exbBtn.exbId = exb.exbId
      const posKey = exb.x+'-'+exb.y
      if(this.posCache[posKey]){
        exbBtn.x = this.posCache[posKey].x
        exbBtn.y = this.posCache[posKey].y + h * 2
        this.posCache[posKey] = { x: exbBtn.x, y: exbBtn.y }
      }else{
        exbBtn.x = exb.x
        exbBtn.y = exb.y
        this.posCache[posKey] = {x: exb.x, y: exb.y}
      }
      return exbBtn
    },
    getExbDisp(deviceId) {
      switch(this.exbDisp) {
      case 'deviceIdX':
        return deviceId.toString(16).toUpperCase()
      case 'deviceId':
        return deviceId
      }
    },
    getExbPosition() {
      return this.exbs.filter(exb => exb.location && exb.location.areaId === this.selectedAreaId && exb.location.x && exb.location.y > 0)
    },
    async getNearest(exbs) {
      const positions = await EXCloudHelper.fetchRawPosition()
      const xymap = {}
      exbs.forEach(e => xymap[e.deviceId] = {x: e.x, y: e.y})
      return positions.filter(position => exbs.some(exb => exb.deviceId == position.deviceId))
        .map(position => {
          position.nearest && position.nearest.forEach(n => {
            const target = xymap[n.deviceId]
            if (target) {
              n.x = target.x
              n.y = target.y
            }
          })
          return {btxId: position.btxId, nearest: position.nearest? position.nearest: []}
        })
    },
    dispRssiIcons(btxId) {
      if (this.rssiCon) {
        this.rssiCon.removeAllChildren()
      }
      else {
        this.rssiCon = new Container()
      }

      if (!this.rssiCon.parent) {
        this.stage.addChild(this.rssiCon)
      }

      if (!btxId) {
        this.stage.update()
        return
      }

      const target = this.nearest.find((n) => n.btxId === btxId)
      if (!target) {
        return
      }

      const minusX = DISP.INSTALLATION.WIDTH / this.canvasScale / 2
      const minusY = DISP.INSTALLATION.HEIGHT / this.canvasScale * 1.6
      const pow = Math.pow(10, this.RSSI_SCALE)

      const now = new Date().getTime()
      target.nearest.filter((t) => t.x && t.y && t.timestamp >= now - APP.POS.LOST_TIME).forEach((t, i, a) => {
        const rssi = Math.floor(t.rssi * pow) / pow 
        new RssiIcon(this.rssiCon, rssi.toFixed(2), 1/this.canvasScale, i).add(t.x - minusX, t.y - minusY)
        this.stage.setChildIndex(this.rssiCon, this.stage.numChildren-1)
      })
      this.stage.update()
    },
  },
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/vue.scss";
</style>
