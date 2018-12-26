<template>
  <div id="locationSetting">
    <breadcrumb :items="items" />
    <b-alert :show="showInfo" variant="info" dismissible>
      {{ message }}
    </b-alert>
    <b-alert :show="showAlert" variant="danger" dismissible @dismissed="showAlert=false">
      <template v-if="Array.isArray(message)">
        <span v-for="line in message" :key="line">
          {{ line }} <br>
        </span>
      </template>
      <span v-else>
        {{ message }}
      </span>
    </b-alert>

    <b-form inline class="mt-2">
      <b-form-row class="ml-1">
        <label class="mr-2 mb-2">
          {{ $t('label.area') }}
        </label>
        <b-form-select v-model="selectedArea" :options="areaOptions" :disabled="settingStart" class="mr-2 mb-2 areaOptions" />
        <b-button v-t="'label.load'" :variant="getButtonTheme()" :disabled="settingStart" size="sm" class="mb-2" @click="changeArea" />
      </b-form-row>
    </b-form>
    <b-form inline class="mt-2">
      <b-form-row class="ml-1">
        <label class="mt-mobile mr-2 mb-2">
          {{ $t('label.exb') }}
        </label>
        <b-form-select v-model="exbDisp" :options="exbDispOptions" :disabled="settingStart" class="mr-2 mb-2" @change="changeExbDisp" />
        <b-form-row>
          <v-select v-model="selectedExb_" :options="exbOptions" :on-change="showExbOnMap" :disabled="settingStart" size="sm" class="mb-2 mt-mobile exbOptions">
            <div slot="no-options">
              {{ $i18n.tnl('label.vSelectNoOptions') }}
            </div>
          </v-select>
          <b-button v-t="'label.bulkAdd'" :variant="getButtonTheme()" :disabled="settingStart" size="sm" class="mt-mobile mb-2" @click="bulkAdd" /> 
        </b-form-row>
      </b-form-row>
    </b-form>
    <b-form inline class="mt-2">
      <b-form-row class="mr-3 mb-3 ml-1">
        <label class="mr-2">
          {{ $t('label.mapRatio') }}
        </label>
        <input :value="mapRatio" :readonly="true" size="sm" type="number" class="ratioInput form-control">
      </b-form-row>
      <b-form-row class="mr-3 mb-3 ml-1">
        <label class="mr-2 mt-mobile">
          {{ "= "+ $t('label.realWidth') }}
        </label>
        <input v-model="realWidth" size="sm" type="number" class="mt-mobile ratioInput form-control">
      </b-form-row>
      <b-form-row class="mr-3 mb-3 ml-1">
        <label class="mr-2">
          {{ "/ "+ $t('label.pixelWidth') }}
        </label>
        <input v-model="pixelWidth" :readonly="true" size="sm" type="number" class="ratioInput form-control">
      </b-form-row>
      <b-form-row class="mb-3 ml-1">
        <b-button v-t="settingStart?'label.settingNow':'label.settingStart'" :variant="getButtonTheme()" :class="{'mt-mobile':true, 'mt-mobile-button': true, 'mr-2':true, blink:settingStart}" size="sm" @click="ratioSettingStart" /> 
        <b-button v-t="'label.save'" :variant="getButtonTheme()" :disabled="!isChanged" size="sm" @click="save" /> 
      </b-form-row>
    </b-form>
    <p />
    <div class="mt-3">
      <canvas id="map" ref="map" />
    </div>
    <!-- modal -->
    <b-modal id="modalError" :title="$t('label.error')" ok-only>
      {{ $t('message.noMapImage') }}
    </b-modal>
    <b-modal id="modalInfo" :title="$t('label.mapRatioSetting')" ok-only>
      {{ $t('message.mapRatioSetting') }}
    </b-modal>
    <b-modal id="modalWarn" :title="$t('label.confirm')" @ok="setChangeArea" @hide="changeAreaDone">
      {{ $t('message.unsavedData') }}
    </b-modal>
    <b-modal id="modalDeleteConfirm" :title="$t('label.confirm')" @ok="deleteExbDone">
      {{ $t('message.deleteConfirm', {target: deleteTarget? getExbDisp(deleteTarget.deviceId): null}) }}
    </b-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as HttpHelper from '../../../sub/helper/HttpHelper'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as Util from '../../../sub/util/Util'
import { APP, DISP } from '../../../sub/constant/config'
import { UPDATE_ONLY_NN } from '../../../sub/constant/Constants'
import { Shape, Container, Text } from '@createjs/easeljs/dist/easeljs.module'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import commonmixinVue from '../../../components/mixin/commonmixin.vue'
import showmapmixin from '../../../components/mixin/showmapmixin.vue'

export default {
  components: {
    breadcrumb,
  },
  mixins: [showmapmixin, commonmixinVue ],
  data() {
    return {
      showInfo: false,
      showAlert: false,
      message: '',
      selectedExb_: null,
      pixelWidth: null,
      mapRatioChanged: false,
      isChangeArea: false,
      settingStart: false,
      isChanged: false,
      workExbs: [],
      exbOptions: [],
      exbDisp: 'deviceIdX',
      exbDispOptions: [],
      deleteTarget: null,
      keepExbPosition: false,
      mapRatio: null,
      revTrgCnt: [],
      lineCnt: null,
      toggleCallBack: () => {
        this.keepExbPosition = true
      },
      ICON_ARROW_WIDTH: 20,
      ICON_ARROW_HEIGHT: 10,
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.locationSetting'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'pageSendParam',
    ]),
  },
  watch: {
    realWidth: function(newVal, oldVal) {
      console.log({newVal, oldVal})
      this.onMapImageScale()
    },
    pixelWidth: function(newVal, oldVal) {
      console.log({newVal, oldVal})
      this.onMapImageScale()
    }
  },
  mounted() {
    this.fetchData()
    if(this.pageSendParam){
      this.selectedArea = this.pageSendParam.areaId
      this.changeArea()
      this.replaceAS({pageSendParam: null})
    }
    else{
      this.selectedArea = null
    }

    const options = []
    if (APP.EXB_WITH_DEVICE_NUM) options.push({value:'deviceNum', text: this.$i18n.tnl('label.deviceNum')})
    if (APP.EXB_WITH_DEVICE_IDX) options.push({value:'deviceIdX', text: this.$i18n.tnl('label.deviceIdX')})
    if (APP.EXB_WITH_DEVICE_ID) options.push({value:'deviceId', text: this.$i18n.tnl('label.deviceId')})
    this.exbDispOptions = options
    this.exbDisp = options[0].value
  },
  beforeDestroy() {
    this.selectedArea = null
  },
  methods: {
    reset() {
      this.showInfo = false
      this.showAlert = false
      this.selectedExb_ = null
      this.pixelWidth = null
      this.realWidth = null
      this.mapRatioChanged = false
      this.settingStart = false
      this.isChanged = false
      this.isShownMapImage = false
      this.isChangeArea = false
      this.positionedExb = []
      this.exbOptions = []
      this.mapRatio = null
      this.revTrgCnt = []
      this.lineCnt = null
    },
    async fetchData(payload) {
      try {
        await this.fetchAreaExbs()
        if (payload && payload.done) {
          payload.done()
        }
        this.workExbs = _.cloneDeep(this.exbs)
        this.setExbPosition()
        this.showMapImage()
      }
      catch(e) {
        console.error(e)
      }
    },
    onMapImageScale() {
      if (this.pixelWidth && this.realWidth) {
        this.mapRatio = Math.floor(this.realWidth / this.pixelWidth)
      }
      else if (this.selectedArea) {
        let area = _.find(this.$store.state.app_service.areas, (area) => area.areaId == this.selectedArea)
        if (area && area.mapRatio) {
          this.mapRatio = area.mapRatio
        }
      }
    },
    setExbPosition() {
      this.positionedExb = _.filter(this.workExbs, (exb) => {
        return exb.location.areaId == this.selectedArea && exb.location.x && exb.location.y > 0
      })
      this.exbOptions = _(this.workExbs).filter((val) => {
        return val.enabled && (!val.location.x || !val.location.y || (val.location.x && val.location.y <= 0))
      })
        .map((val) => {
          return {
            label: '' + this.getExbDisp(val.deviceId), 
            value: val.exbId
          }
        }).value()
    },
    getExbDisp(deviceId) {
      switch(this.exbDisp) {
      case 'deviceIdX':
        return deviceId.toString(16).toUpperCase()
      case 'deviceId':
        return deviceId
      case 'deviceNum':
        return deviceId - this.$store.state.currentRegion.deviceOffset
      }
    },
    changeExbDisp(newVal) {
      this.exbDisp = newVal
      this.setExbPosition()
      for (let i=0; this.exbCon && i<this.exbCon.numChildren; i++) {
        let exbBtn = this.exbCon.getChildAt(i)
        if (exbBtn) {
          let text = exbBtn.getChildAt(1)
          if (text) {
            text.text = this.getExbDisp(exbBtn.deviceId)
          }
        }
      }
      this.stage.update()
    },
    showMapImage() {
      this.showMapImageDef(() => {
        if (this.exbCon) {
          this.exbCon.removeAllChildren()
        }
        else {
          this.exbCon = new Container()
        }

        this.positionedExb.forEach((exb) => {
          this.replaceExb(exb, (exb) => {
            exb.x = exb.location.x * this.mapImageScale
            exb.y = exb.location.y * this.mapImageScale
          })
          this.showExb(exb)
        })
        this.keepExbPosition = false

        this.stage.addChild(this.exbCon)
        this.stage.update()
        this.forceUpdateRealWidth()
      })
    },
    createExbIcon(exb) {
      const {w, h} = DISP.EXB_LOC_SIZE
      const fromX = -w / 2
      const fromY = -h / 2
      const x = w + fromX
      const y = h + fromY
      const exbBtn = new Container()
      const s = new Shape()
      s.graphics.beginFill(DISP.EXB_LOC_BGCOLOR)
      s.graphics.moveTo(fromX, fromY)
      s.graphics.lineTo(x, fromY)
      s.graphics.lineTo(x, y)
      s.graphics.lineTo(x - this.ICON_ARROW_WIDTH, y)
      s.graphics.lineTo(x - this.ICON_ARROW_WIDTH - this.ICON_ARROW_WIDTH / 2, y + this.ICON_ARROW_HEIGHT)
      s.graphics.lineTo(x - this.ICON_ARROW_WIDTH - this.ICON_ARROW_WIDTH, y)
      s.graphics.lineTo(fromX, y)
      s.graphics.lineTo(fromX, fromY)
      exbBtn.addChild(s)
      const label = new Text(this.getExbDisp(exb.deviceId))
      label.font = DISP.EXB_LOC_FONT
      label.color = DISP.EXB_LOC_COLOR
      label.textAlign = 'center'
      label.textBaseline = 'middle'
      exbBtn.addChild(label)
      exbBtn.deviceId = exb.deviceId
      exbBtn.exbId = exb.exbId
      exbBtn.x = exb.x
      exbBtn.y = exb.y - (h / 2 + this.ICON_ARROW_HEIGHT)
      return exbBtn
    },
    showExb(exb) {
      let stage = this.stage
      const offsetY = (DISP.EXB_LOC_SIZE.h / 2) + this.ICON_ARROW_HEIGHT
      const exbBtn = this.createExbIcon(exb)
      exbBtn.on('pressmove', (evt) => {
        evt.currentTarget.set({
          x: evt.stageX,
          y: evt.stageY
        })
        stage.update()
      })

      exbBtn.on('pressup', (evt) => {
        exb.x = evt.stageX
        exb.y = evt.stageY + offsetY
        this.isChanged = true
        exb.isChanged = true
      })

      exbBtn.on('dblclick', (evt) => {
        this.deleteTarget = exbBtn
        this.$root.$emit('bv::show::modal', 'modalDeleteConfirm')
      })
      this.exbCon.addChild(exbBtn)
    },
    ratioSettingStart() {
      this.settingStart = !this.settingStart
      if (!this.settingStart) {
        return
      }
      this.clearPrevious()
      this.$root.$emit('bv::show::modal', 'modalInfo')

      let messureCount = 0
      let start
      let stage = this.stage
      this.stage.addEventListener('stagemousedown', (evt) => {
        if (messureCount == 2) {
          return
        }
        let current = {x:evt.stageX, y:evt.stageY}
        let revTrgCnt = this.createTriangle(messureCount, current) 
        stage.addChild(revTrgCnt)
        this.revTrgCnt[messureCount] = revTrgCnt
        if (messureCount == 0) {
          start = current
        }
        else {
          let line = new Shape()
          line.graphics.beginStroke('#ff2244')
          line.graphics.setStrokeStyle(1)
          line.graphics.moveTo(start.x, start.y)
          line.graphics.lineTo(current.x, current.y)
          this.lineCnt = new Container()
          this.lineCnt.addChild(line)
          stage.addChild(this.lineCnt)
          this.pixelWidth = Math.floor(Math.sqrt(Math.pow(current.x-start.x, 2) + Math.pow(current.y-start.y, 2))) / this.mapImageScale
          this.mapRatioChanged = true
          this.isChanged = true
        }
        messureCount++

        stage.update()
      })
    },
    clearPrevious() {
      if (this.revTrgCnt[0]) {
        this.revTrgCnt[0].removeAllChildren()
      }
      if (this.revTrgCnt[1]) {
        this.revTrgCnt[1].removeAllChildren()
      }
      if (this.lineCnt) {
        this.lineCnt.removeAllChildren()
      }
      this.stage.update()
    },
    createTriangle(messureCount, current) {
      let revTrgCnt = new Container()
      let revTrg = new Shape()
      let color = messureCount == 0? '#2299cc': '#ee0033'
      revTrg.graphics.beginFill(color).drawPolyStar(0, -20, 20, 3, 0, 90)

      let label = new Text(messureCount == 0? 'start': 'end')
      label.font = '16px Arial'
      label.color = '#000'
      label.textAlign = 'center'
      label.textBaseline = 'middle'
      label.y = -40

      revTrgCnt.x = current.x
      revTrgCnt.y = current.y
      revTrgCnt.addChild(label)
      revTrgCnt.addChild(revTrg)

      return revTrgCnt
    },
    changeArea() {
      this.tempMapFitMobile = DISP.MAP_FIT_MOBILE
      if (this.isChanged) {
        this.$root.$emit('bv::show::modal', 'modalWarn')
      }
      else {
        this.isChangeArea = true
        this.changeAreaDone()
      }
    },
    changeAreaDone() {
      if (this.isChangeArea) {
        this.isChangeArea = false
        if (this.selectedArea) {
          this.reset()
          this.setExbPosition()
          this.showMapImage()
        }
      }
      else {
        this.selectedArea = this.oldSelectedArea
      }
    },
    setChangeArea() {
      this.isChangeArea = true
    },
    showExbOnMap(val, x = 50, y = 40) {
      if (!val || val.value == null) {
        return
      }
      let exb = _(this.workExbs).find((exb) => exb.exbId == val.value)
      if (!exb) return

      let loc = exb.location
      if (loc.x <= 0) {
        loc.x = x
      }
      if (loc.y <= 0) {
        loc.y = y
      }
      exb.x = loc.x
      exb.y = loc.y
      exb.isChanged = true
      this.isChanged = true
      this.positionedExb.push(exb)
      this.exbOptions = this.exbOptions.filter((val) => val.value != exb.exbId)
      this.showExb(exb)
      this.stage.update()
    },
    bulkAdd() {
      let counter = 0
      let y = 20
      this.exbOptions.forEach((val) => {
        let x = 30 + counter++ * 60
        if (x > this.mapWidth) {
          x = 30
          counter = 0
          y += 20
        }
        this.showExbOnMap(val, x, y)
      })
    },
    deleteExbDone(evt) {
      let exb = this.positionedExb.find((exb) => exb.deviceId == this.deleteTarget.deviceId)
      if (exb && exb.location) {
        exb.location.x = exb.location.y = null
        exb.x = exb.y = null
      }
      this.positionedExb = this.positionedExb.filter((exb) => exb.deviceId != this.deleteTarget.deviceId)
      this.exbOptions.push({label: '' + this.getExbDisp(this.deleteTarget.deviceId), value: this.deleteTarget.exbId})
      this.exbCon.removeChild(this.deleteTarget)
      this.stage.update()
    },
    async save() {
      this.replace({showProgress: true})
      this.message = ''
      this.showInfo = false
      this.showAlert = false
      try {
        let param = []

        this.positionedExb.forEach((exb) => {
          if (exb.isChanged) {
            exb.location = {locationId: exb.location.locationId, areaId: this.selectedArea, x: Math.round(exb.x / this.mapImageScale), y: Math.round(exb.y / this.mapImageScale)}
            param.push(exb.location)
            exb.isChanged = false
          }
        })

        this.workExbs.forEach((exb) => { // deleted
          if (exb.location.areaId == this.selectedArea) {
            if (!this.positionedExb.find((pExb) => {
              return pExb.exbId == exb.exbId
            })) {
              exb.location = {locationId: exb.location.locationId, areaId: null, x: null, y: null}
              exb.isChanged = false
              param.push(exb.location)
            }
          }
        })

        if (param.length > 0) {
          await HttpHelper.postAppService('/core/location/updateLocation', param)
          await StateHelper.load('exb', true)
        }

        if (this.mapRatioChanged && this.mapRatio != null) {
          await AppServiceHelper.save('/core/area', {areaId: this.selectedArea, mapRatio: this.mapRatio}, UPDATE_ONLY_NN.EMPTY_ZERO)
          await StateHelper.load('area', true)
        }
        this.message = this.$i18n.tnl('message.completed', {target: this.$i18n.tnl('label.save')})
        this.showInfo = true
        this.isChanged = false
      } catch (e) {
        console.log(e)
        if (e.key) {
          this.message = this.$i18n.tnl('message.' + e.type, {key: this.$i18n.tnl('label.' + Util.snake2camel(e.key)), val: e.val})
        }
        else {
          this.message = this.$i18n.tnl('message.failed', {target: this.$i18n.tnl('label.save'), code: e.message})
        }
        this.showAlert = true
        window.scrollTo(0, 0)
      }
      this.replace({showProgress: false})
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../../sub/constant/config.scss";

::-webkit-scrollbar { 
  display: none; 
}

@media screen and (max-width: 1050px) {
  .w-le-sm-100 {
    width: 100% !important;
  }
}

.pos {
  border: 1px #ddd solid;
  border-radius: 1.0vmin;
  background-color: #76ccf7;
  justify-content: center;
  text-align: center;
  cursor: pointer;
}

.vdr.active:before {
  content: none;
}

@media screen and (max-width: 575px) {
  .mt-mobile {margin-top:5px;}
  .mt-mobile-button {margin-bottom:4px;}
}

.ratioInput {
  width: 75px;
}

.exbOptions {
  width: 140px;
}

.blink {
  animation: blink 0.8s infinite alternate;
}

@keyframes blink {
  from { background-color: white; }
  to { background-color: #ffc107; }
}
</style>