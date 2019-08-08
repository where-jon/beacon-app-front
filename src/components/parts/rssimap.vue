<template>
  <div id="mapContainer" class="container-fluid">
    <breadcrumb :items="items" :reload="true" :state="reloadState" />
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
        <b-form-row v-if="useGroup" class="my-1 ml-2 ml-sm-0">
          <label class="ml-sm-4 ml-2 mr-1">
            {{ $t('label.group') }}
          </label>
          <span :title="vueSelectTitle(vueSelected.group)">
            <v-select v-model="vueSelected.group" :options="groupOptions" class="ml-1 mr-2 vue-options" :style="vueSelectStyle">
              <template slot="selected-option" slot-scope="option">
                {{ vueSelectCutOn(option) }}
              </template>
              <template slot="no-options">
                {{ vueSelectNoMatchingOptions }}
              </template>
            </v-select>
          </span>
        </b-form-row>
        <b-form-row v-if="useCategory" class="my-1 ml-2 ml-sm-0">
          <label class="ml-sm-4 ml-2 mr-1">
            {{ $t('label.category') }}
          </label>
          <span :title="vueSelectTitle(vueSelected.category)">
            <v-select v-model="vueSelected.category" :options="categoryOptionsForPot" class="ml-1 mr-2 vue-options" :style="vueSelectStyle">
              <template slot="selected-option" slot-scope="option">
                {{ vueSelectCutOn(option) }}
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
import { APP, DISP, EXCLOUD } from '../../sub/constant/config'
import { CATEGORY } from '../../sub/constant/Constants'
import * as ArrayUtil from '../../sub/util/ArrayUtil'
import * as Util from '../../sub/util/Util'
import * as VueUtil from '../../sub/util/VueUtil'
import * as EXCloudHelper from '../../sub/helper/dataproc/EXCloudHelper'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import * as MenuHelper from '../../sub/helper/dataproc/MenuHelper'
import * as PositionHelper from '../../sub/helper/domain/PositionHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../mixin/commonmixin.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'

class RssiIcon {
  constructor(parent, rssi, scale, level = 3) {
    const RSSI_ICON_WIDTH = DISP.INSTALLATION.RSSI_ICON_WIDTH
    const RSSI_ICON_HEIGHT = DISP.INSTALLATION.RSSI_ICON_HEIGHT
    const color = (() => {
      switch (level) {
      case 0:
        return {bg: '#dc143c', text: 'white'}
      case 1:
        return {bg: '#ff4500', text: 'white'}
      case 2:
        return {bg: '#ff6347', text: 'white'}
      default:
        return {bg: '#87cefa', text: 'black'}
      }
    })()
    this.container = new Container()
    const s = new Shape()
    s.graphics.beginFill(color.bg).drawRect(0, 0, RSSI_ICON_WIDTH * scale, RSSI_ICON_HEIGHT * scale)
    const label = new Text(rssi)
    this.container.addChild(s, label)
    label.set({
      font: 20 * scale + 'px ' + DISP.EXB_LOC.FONT,
      color: color.text,
      textAlign: 'center',
      textBaseline: 'bottom',
      x: RSSI_ICON_WIDTH * scale / 2,
      y: RSSI_ICON_HEIGHT * scale,
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
      items: ViewHelper.createBreadCrumbItems('develop', 'installation'),
      useGroup: MenuHelper.useMaster('group') && ArrayUtil.includesIgnoreCase(APP.TX.WITH, 'group'),
      useCategory: MenuHelper.useMaster('category') && ArrayUtil.includesIgnoreCase(APP.TX.WITH, 'category'),
      modeRssi: true,
      exbDisp: 'deviceId',
      nearest: [],
      targetTx: null,
      exbBtns : [],
      RSSI_SCALE: 5,
      RSSI_ICON_WIDTH: DISP.INSTALLATION.RSSI_ICON_WIDTH,
      RSSI_ICON_HEIGHT: DISP.INSTALLATION.RSSI_ICON_HEIGHT,
      isPause: false,
      firstTime: true,
      reloadState: {isLoad: false},
      noImageErrorKey: 'noMapImage',
    }
  },
  computed: {
    ...mapState([
      'reload',
    ]),
    categoryOptionsForPot() {
      return StateHelper.getOptionsFromState('category', false, true,
        category => CATEGORY.POT_AVAILABLE.includes(category.categoryType)
      )
    },
    txRecords() {
      const btxs = this.nearest.map(n => ({label: n.btx_id, value: n.btx_id}))
      if (!this.selectedGroup && !this.selectedCategory) {
        return btxs
      }
      const target = this.txs.filter(tx => isMatchId(this.selectedGroup, tx.group, 'groupId') &&
      isMatchId(this.selectedCategory, tx.category, 'categoryId'))
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
        this.selectedArea = Util.getValue(newVal, 'value', null)
        this.changeArea(this.selectedArea)
      },
      deep: true,
    },
    'vueSelected.category': {
      handler: function(newVal, oldVal){
        this.selectedCategory = Util.getValue(newVal, 'value', null)
        this.vueSelected.tx = null
      },
      deep: true,
    },
    'vueSelected.group': {
      handler: function(newVal, oldVal){
        this.selectedGroup = Util.getValue(newVal, 'value', null)
        this.vueSelected.tx = null
      },
      deep: true,
    },
    'vueSelected.tx': {
      handler: function(newVal, oldVal){
        this.targetTx = Util.getValue(newVal, 'value', null)
        this.dispRssiIcons(this.targetTx)
      },
      deep: true,
    },
  },
  async mounted() {
    this.reloadState.isLoad = false
    await Promise.all(['category', 'group'].map(StateHelper.load))
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
          this.exbBtns = this.positionedExb.map((exb) => {
            const clone = Object.assign({}, exb)
            if (!this.keepExbPosition) {
              clone.x = exb.location.x
              clone.y = exb.location.y
            }
            const exbBtn = this.createExbIcon(clone)
            this.exbCon.addChild(exbBtn)
            return exbBtn
          })

          let positions = PositionHelper.getPositions(false)
          this.nearest = await this.getNearest(this.exbBtns)
          this.nearest = this.nearest.filter((n) => positions.some((pos) => pos.btx_id === n.btx_id))

          this.stage.addChild(this.exbCon)
          this.stage.setChildIndex(this.exbCon, this.stage.numChildren-1)
          this.stage.update()
          if (this.targetTx) {
            this.dispRssiIcons(this.targetTx)
          }

          await StateHelper.load('tx')

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
    async fetchData(payload, disableErrorPopup) {
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
      s.graphics.beginFill(DISP.EXB_LOC.BGCOLOR).drawCircle(0, 0, DISP.EXB_LOC.RSSI_RADIUS / this.canvasScale, DISP.EXB_LOC.RSSI_RADIUS / this.canvasScale)
      exbBtn.addChild(s)
      const label = new Text(this.getExbDisp(exb.deviceId))
      label.font = 20 / this.canvasScale + 'px ' + DISP.EXB_LOC.FONT
      label.color = DISP.EXB_LOC.COLOR
      label.textAlign = 'center'
      label.textBaseline = 'middle'
      exbBtn.addChild(label)
      exbBtn.deviceId = exb.deviceId
      exbBtn.exbId = exb.exbId
      exbBtn.x = exb.x
      exbBtn.y = exb.y
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
      return this.exbs.filter((exb) => exb.location.areaId === this.selectedArea && exb.location.x && exb.location.y > 0)
    },
    async getNearest(exbs) {
      const positions = await HttpHelper.getExCloud(EXCloudHelper.url(EXCLOUD.POSITION_URL) + new Date().getTime())
      const xymap = {}
      exbs.forEach((e) => xymap[e.deviceId] = {x: e.x, y: e.y})
      return positions.filter((position) => exbs.some((exb) => exb.deviceId === position.device_id))
        .map((position) => {
          position.nearest.forEach((n) => {
            const target = xymap[n.device_id]
            if (target) {
              n.x = target.x
              n.y = target.y
            }
          })
          return {btx_id: position.btx_id, nearest: position.nearest}
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

      const target = this.nearest.find((n) => n.btx_id === btxId)
      if (!target) {
        return
      }

      const minusX = this.RSSI_ICON_WIDTH / this.canvasScale / 2
      const minusY = this.RSSI_ICON_HEIGHT / this.canvasScale * 2
      const pow = Math.pow(10, this.RSSI_SCALE)

      target.nearest.filter((t) => t.x && t.y).forEach((t, i, a) => {
        const rssi = Math.floor(t.rssi * pow) / pow 
        new RssiIcon(this.rssiCon, rssi, 1/this.canvasScale, i).add(t.x - minusX, t.y - minusY)
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
