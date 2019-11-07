<template>
  <div id="locationSetting" class="container-fluid">
    <breadcrumb :items="items" />
    <alert :message="message" />

    <b-form inline class="mt-2" @submit.prevent>
      <b-form-row class="ml-1">
        <label v-t="'label.area'" class="mr-2 mb-2" />
        <span :title="vueSelectTitle(vueSelected.area)">
          <v-select v-model="vueSelected.area" :options="areaOptions" :disabled="settingStart" class="mr-2 mb-2 vue-options" :style="vueSelectStyle" :clearable="false">
            <template slot="selected-option" slot-scope="option">
              {{ vueSelectCutOn(option, true) }}
            </template>
            <template slot="no-options">
              {{ vueSelectNoMatchingOptions }}
            </template>
          </v-select>
        </span>
        <b-button v-t="'label.load'" :variant="theme" :disabled="settingStart || selectedArea == null" size="sm" class="mb-2" @click="changeArea" />
      </b-form-row>
    </b-form>
    <b-form inline class="mt-2" @submit.prevent>
      <b-form-row class="ml-1">
        <label v-t="'label.selectLocationDisp'" class="mt-mobile mr-2 mb-2" />
        <b-form-select v-model="form.locationDisp" :options="locationDispOptions" :disabled="settingStart" class="mr-2 mb-2" @change="changeLocationDisp" />
        <label v-t="'label.selectLocationPlace'" class="mt-mobile mr-2 mb-2" />
        <b-form-row>
          <span :title="vueSelectTitle(vueSelected.locationExb)">
            <v-select v-model="vueSelected.locationExb" :options="getLocationExbOptions()" :disabled="settingStart" size="sm" class="mb-2 mt-mobile vue-options" :style="vueSelectStyle" @input="showLocationOnMap">
              <template slot="selected-option" slot-scope="option">
                {{ vueSelectCutOn(option) }}
              </template>
              <template slot="no-options">
                {{ vueSelectNoMatchingOptions }}
              </template>
            </v-select>
          </span>
          <b-button v-t="'label.bulkAdd'" :variant="theme" :disabled="settingStart" size="sm" class="mt-mobile mb-2" @click="bulkAdd" /> 
          <b-button v-if="editable" v-t="'label.save'" :variant="theme" :disabled="!isChanged" size="sm" class="mt-mobile mb-2 ml-2" @click="save" /> 
        </b-form-row>
      </b-form-row>
    </b-form>
    <p />
    <b-form v-if="showMapRatio" inline class="mt-2" @submit.prevent>
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
        <b-button v-t="settingStart?'label.settingNow':'label.settingStart'" :variant="theme" :class="{'mt-mobile':true, 'mt-mobile-button': true, 'mr-2':true, blink:settingStart}" size="sm" @click="ratioSettingStart" /> 
      </b-form-row>
    </b-form>
    <div class="mt-3">
      <canvas id="map" ref="map" @click="closeVueSelect" />
    </div>
    <b-modal id="modalEdit" :title="$t('label.masterLocation')" size="lg" hide-footer @update="onUpdate" @delete="onDelete">
      <location-edit ref="locationEdit" />
    </b-modal>
    <b-modal id="modalInfo" :title="$t('label.mapRatioSetting')" ok-only>
      {{ $t('message.mapRatioSetting') }}
    </b-modal>
    <b-modal id="modalWarn" :title="$t('label.confirm')" @ok="setChangeArea" @hide="changeAreaDone">
      {{ $t('message.unsavedData') }}
    </b-modal>
    <b-modal id="modalDeleteConfirm" :title="$t('label.confirm')" @ok="execDelete">
      {{ $t('message.deleteConfirm', { target: form.location? form.location.locationName: null }) }}
    </b-modal>

    <tool-tip id="toolTip" :tool-tip-show="toolTipShow" :tool-tip-label="toolTipLabel" :tool-tip-style="toolTipStyle" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { Shape, Container, Text } from 'createjs-module'
import { APP, DISP } from '../../../sub/constant/config'
import { UPDATE_ONLY_NN } from '../../../sub/constant/Constants'
import * as ArrayUtil from '../../../sub/util/ArrayUtil'
import * as BrowserUtil from '../../../sub/util/BrowserUtil'
import * as StringUtil from '../../../sub/util/StringUtil'
import * as Util from '../../../sub/util/Util'
import * as AppServiceHelper from '../../../sub/helper/dataproc/AppServiceHelper'
import * as ConfigHelper from '../../../sub/helper/dataproc/ConfigHelper'
import * as HttpHelper from '../../../sub/helper/base/HttpHelper'
import * as IconHelper from '../../../sub/helper/ui/IconHelper'
import * as OptionHelper from '../../../sub/helper/dataproc/OptionHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as StyleHelper from '../../../sub/helper/ui/StyleHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import * as VueSelectHelper from '../../../sub/helper/ui/VueSelectHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import showmapmixin from '../../../components/mixin/showmapmixin.vue'
import alert from '../../../components/parts/alert.vue'
import ToolTip from '../../../components/parts/toolTip.vue'
import locationEdit from './position-edit.vue'

export default {
  components: {
    breadcrumb,
    alert,
    ToolTip,
    locationEdit,
  },
  mixins: [commonmixin, showmapmixin],
  data() {
    return {
      items: ViewHelper.createBreadCrumbItems('master', 'locationSetting'),
      vueSelected: {
        area: null,
        locationExb: null,
      },
      form: {
        locationDisp: null,
        locationExb: null,
        location: null,
      },
      work: {
        locationList: [],
        exbList: [],
      },
      message: '',
      dummyKey: -1,

      exbOptions: [],
      exbDispOptions: [],
      exbDisp: 'deviceIdX',
      realWidth: null,
      pixelWidth: null,
      mapRatioChanged: false,
      isChangeArea: false,
      settingStart: false,
      isChanged: false,
      ICON_FONTSIZE_RATIO: 1.3,
      mapRatio: null,
      revTrgCnt: [],
      lineCnt: null,
      ICON_ARROW_WIDTH: DISP.EXB_LOC.SIZE.W / 3,
      ICON_ARROW_HEIGHT: DISP.EXB_LOC.SIZE.H / 3,
      DISPLAY_NAME_BYTE_LENGTH: 6,
      showMapRatio: DISP.SHOW_MAP_RATIO,
      noImageErrorKey: 'noMapImage',

      toolTipShow: false,
      toolTipLabel: '',
      toolTipStyle: {
        'left': null,
        'top': null,
        'border-color': DISP.THERMOH.TOOLTIP_BORDERCOLOR,
        'border-radius': '' + DISP.THERMOH.TOOLTIP_ROUNDRECT + 'px',
        'font': DISP.THERMOH.TOOLTIP_FONT,
        'background-color': DISP.THERMOH.TOOLTIP_BGCOLOR,
        'color': DISP.THERMOH.TOOLTIP_COLOR,
      },
    }
  },
  computed: {
    ...mapState('app_service', [
      'pageSendParam',
    ]),
    initAreaId(){
      const areaId = Util.getValue(this.pageSendParam, 'areaId', null)
      return VueSelectHelper.getVueSelectData(this.areaOptions, areaId, !Util.hasValue(areaId))
    },
    locationDispOptions(){
      return OptionHelper.getLocationDispOptions()
    },
  },
  watch: {
    'vueSelected.area': {
      handler: function(newVal, oldVal){
        this.selectedArea = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
    'vueSelected.locationExb': {
      handler: function(newVal, oldVal){
        this.form.locationExb = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
    realWidth: function(newVal, oldVal) {
      Util.debug({newVal, oldVal})
      this.onMapImageScale()
    },
    pixelWidth: function(newVal, oldVal) {
      Util.debug({newVal, oldVal})
      this.onMapImageScale()
    }
  },
  async mounted() {
    await Promise.all(['area', 'exb', 'location'].map(StateHelper.load))
    this.form.locationDisp = Util.getValue(this.locationDispOptions, '0.value', null)
    this.vueSelected.area = this.initAreaId
    this.replaceAS({pageSendParam: null})
    this.$nextTick(async () => {
      this.changeArea()
      await this.fetchData()
    })
  },
  beforeDestroy() {
    this.selectedArea = null
  },
  methods: {
    reset() {
      StateHelper.initShowMessage()
      this.pixelWidth = null
      this.realWidth = null
      this.mapRatioChanged = false
      this.settingStart = false
      this.isChanged = false
      this.isShownMapImage = false
      this.isChangeArea = false
      this.mapRatio = null
      this.revTrgCnt = []
      this.lineCnt = null

      this.positionedExb = []
      this.exbOptions = []
    },
    isDispLocation(){
      return ['locationName', 'locationCd'].includes(this.form.locationDisp)
    },
    isDispExb(){
      return ['deivceId', 'deviceIdX'].includes(this.form.locationDisp)
    },
    getLocationExbOptions(){
      if(this.isDispLocation()){
        return OptionHelper.getLocationOptions(this.work.locationList, this.form.locationDisp)
          .sort((a, b) => !Util.hasValue(b.value)? 1: StringUtil.compareStrNum(a.label, b.label))
      }
      return OptionHelper.getLocationExbOptions(this.work.exbList, this.form.locationDisp)
        .sort((a, b) => StringUtil.compareStrNum(a.label, b.label))
    },
    getPositionedLocationList(){
      return this.work.locationList.filter(location => Util.hasValue(this.selectedArea) && this.selectedArea == Util.getValue(location, 'areaId', null))
    },
    changeLocationDisp(newVal){
      this.vueSelected.locationExb = null
      if(!this.locationCon){
        return
      }
      const buttonNum = this.locationCon.numChildren
      for (let idx = buttonNum - 1; 0 <= idx; idx--) {
        const locationButton = this.locationCon.getChildAt(idx)
        if (Util.getValue(locationButton, 'location.areaId', null) != this.oldSelectedArea) {
          this.locationCon.removeChild(locationButton)
        }
      }
      for (let idx = 0; idx < buttonNum; idx++) {
        const locationButton = this.locationCon.getChildAt(idx)
        if (!locationButton) {
          continue
        }
        const text = locationButton.getChildAt(1)
        if (text) {
          text.text = StringUtil.cutOnLongByte(locationButton.location[newVal], this.DISPLAY_NAME_BYTE_LENGTH)
          text.font = StyleHelper.getInRectFontSize(text.text, DISP.EXB_LOC.SIZE.W / this.canvasScale, DISP.EXB_LOC.SIZE.H / this.canvasScale)
        }
      }
      this.stage.update()
    },
    refleshLocationList(){
      const locationMap = {}
      this.work.exbList.forEach(exb => {
        if(Util.hasValue(exb.locationId)){
          if(!locationMap[exb.locationId]){
            locationMap[exb.locationId] = []
          }
          locationMap[exb.locationId].push(exb)
        }
      })
      this.work.locationList.forEach(location => {
        const exbList = locationMap[location.locationId]? locationMap[location.locationId]: []
        const exbNum = exbList.length
        location.exbList = exbList
        location.deviceId = Util.getValue(exbList, '0.deviceId', '') + (1 < exbNum? '+': '')
        location.deviceIdX = Util.getValue(exbList, '0.deviceIdX', '') + (1 < exbNum? '+': '')
      })
      this.changeLocationDisp(this.form.locationDisp)
    },
    fetchData(payload) {
      try {
        if (payload && payload.done) {
          payload.done()
        }
        this.work.exbList = _.cloneDeep(this.exbs)
        this.work.locationList = _.cloneDeep(this.locations)
        this.refleshLocationList()
        this.showMapImage()
      }
      catch(e) {
        console.error(e)
      }
    },
    showMapImage() {
      this.showMapImageDef(() => {
        if (!this.locationCon) {
          this.locationCon = new Container()
        }
        this.locationCon.removeAllChildren()
        this.getPositionedLocationList().forEach(location => this.showLocation(location))
        this.stage.addChild(this.locationCon)
        this.stage.update()
        this.stage.enableMouseOver()
      })
    },
    onMapImageScale() {
      if (this.pixelWidth && this.realWidth) {
        this.mapRatio = Math.floor(this.realWidth / this.pixelWidth)
        return
      }
      if (this.selectedArea) {
        const area = _.find(this.areas, area => area.areaId == this.selectedArea)
        if (area && area.mapRatio) {
          this.mapRatio = area.mapRatio
        }
      }
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
    async changeAreaDone() {
      if (!this.isChangeArea) {
        this.selectedArea = this.oldSelectedArea
        return
      }
      this.isChangeArea = false
      if (!this.selectedArea) {
        return
      }
      await StateHelper.loadAreaImage(this.selectedArea)
      this.reset()
      this.fetchData()
    },
    setChangeArea() {
      this.isChangeArea = true
    },
    showLocation(location) {
      const offsetY = (DISP.EXB_LOC.SIZE.H / 2 + this.ICON_ARROW_HEIGHT) / this.canvasScale
      const locationButton = IconHelper.createLocationIcon(location, this.form.locationDisp, this.DISPLAY_NAME_BYTE_LENGTH, DISP.EXB_LOC, this.canvasScale)
      locationButton.on('pressmove', evt => {
        location.popEvent = false
        evt.currentTarget.set({ x: evt.stageX, y: evt.stageY })
        this.stage.update()
      })

      locationButton.on('pressup', evt => {
        location.x = evt.stageX
        location.y = evt.stageY + offsetY
        this.isChanged = true
        location.isChanged = true
      })

      locationButton.on('dblclick', evt => this.showEditPopup(locationButton.location))
      if(BrowserUtil.isAndroidOrIOS()){
        locationButton.on('mousedown', evt => locationButton.popEvent = true)

        locationButton.addEventListener('click', evt => {
          if(locationButton.popEvent){
            this.showEditPopup(locationButton.location)
          }
        })
      }
      locationButton.on('mouseover', evt => this.createTooltip(evt, evt.target.parent))
      locationButton.on('mouseout', evt => this.removeTooltip())

      this.locationCon.addChild(locationButton)
    },
    createEmptyLocation(x, y){
      const masterCd = StateHelper.createMasterCd('location', this.work.locationList)
      const newLocation = {
        locationId: this.dummyKey--,
        locationCd: masterCd,
        locationName: this.$i18n.tnl('label.initLocation') + masterCd,
        areaId: this.oldSelectedArea,
        x: x,
        y: y,
        isChanged: true,
        exbList: [],
      }
      this.work.locationList.push(newLocation)
      return newLocation
    },
    createLocation(masterId, x, y){
      if(this.isDispLocation()){
        const target = this.work.locationList.find(location => location.locationId == masterId)
        if(target){
          target.areaId = this.oldSelectedArea
          target.x = x
          target.y = y
          target.isChanged = true
          return target
        }
        return this.createEmptyLocation(x, y)
      }
      const newLocation = this.createEmptyLocation(x, y)
      const initExb = this.work.exbList.find(exb => exb.exbId == masterId)
      if(!initExb){
        return newLocation
      }
      const deviceId = '' + initExb.deviceId
      initExb.locationId = newLocation.locationId

      newLocation.locationCd = deviceId
      newLocation.locationName = deviceId
      newLocation.deviceId = initExb.deviceId
      newLocation.deviceIdX = initExb.deviceId.toString(16)
      newLocation.exbList.push(initExb)
      return newLocation
    },
    showLocationOnMap(val, x = 50, y = 40) {
      const masterId = Util.getValue(val, 'value', null)
      if (masterId == null) {
        return
      }
      const location = this.createLocation(masterId, x, y)
      this.isChanged = true
      this.showLocation(location)
      this.stage.update()
    },
    bulkAdd() {
      let counter = 0
      let y = 40
      const mapMaxPosX = this.mapWidth
      this.getLocationExbOptions().filter(val => Util.hasValue(val.value)).forEach(val => {
        let x = 30 + counter++ * 60
        if (x > mapMaxPosX) {
          x = 30
          counter = 1
          y += 20
        }
        this.showLocationOnMap(val, x, y)
      })
    },
    showEditPopup(location){
      this.form.location = location
      this.$refs.locationEdit.setParam(location, this.work.locationList, this.work.exbList.filter(exb => !Util.hasValue(exb.locationId) || exb.locationId == location.locationId))
      this.$root.$emit('bv::show::modal', 'modalEdit')
    },
    onUpdate(form){
      this.form.location.locationCd = form.locationCd
      this.form.location.locationName = form.locationName

      this.work.exbList.forEach(exb => {
        if(exb.locationId == form.locationId && !form.exbIdList.includes(exb.exbId)){
          exb.locationId = null
        }
        else if(!Util.hasValue(exb.locationId) && form.exbIdList.includes(exb.exbId)){
          exb.locationId = form.locationId
        }
      })
      this.refleshLocationList()
    },
    onDelete() {
      this.$root.$emit('bv::show::modal', 'modalDeleteConfirm')
    },
    execDelete(){
      const formLocation = this.form.location
      formLocation.areaId = formLocation.x = formLocation.y = null

      if(formLocation.locationId < 0){
        this.work.locationList = this.work.locationList.filter(location => location.locationId != formLocation.locationId)
      }
      this.work.exbList.forEach(exb => {
        if(exb.locationId == formLocation.locationId){
          exb.locationId = null
        }
      })
      this.refleshLocationList()
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
      const stage = this.stage
      this.stage.addEventListener('stagemousedown', evt => {
        if (messureCount == 2) {
          return
        }
        const current = { x: evt.stageX, y: evt.stageY }
        const revTrgCnt = this.createTriangle(messureCount, current) 
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
          this.pixelWidth = Math.floor(Math.sqrt(Math.pow(current.x - start.x, 2) + Math.pow(current.y - start.y, 2)))
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
      const revTrg = new Shape()
      const color = messureCount == 0? '#2299cc': '#ee0033'
      revTrg.graphics.beginFill(color).drawPolyStar(0, -20, 20, 3, 0, 90)

      const label = new Text(messureCount == 0? 'start': 'end')
      label.font = '16px Arial'
      label.color = '#000'
      label.textAlign = 'center'
      label.textBaseline = 'middle'
      label.y = -40

      const revTrgCnt = new Container()
      revTrgCnt.x = current.x
      revTrgCnt.y = current.y
      revTrgCnt.addChild(label)
      revTrgCnt.addChild(revTrg)

      return revTrgCnt
    },
    createErrorMessage(e){
      if (e.key) {
        return this.$i18n.tnl('message.' + e.type, {key: this.$i18n.tnl('label.' + StringUtil.snake2camel(e.key)), val: e.val})
      }
      return this.$i18n.tnl('message.failed', {target: this.$i18n.tnl('label.save'), code: e.message})
    },
    getSaveLocationList(){
      return this.work.locationList.filter(location => location.isChanged).map(location => {
        return {
           ...location,
           isChanged: false,
           exbList: [],
           exbIdList: Util.getValue(location, 'exbList', []).map(val => val.exbId),
           x: Math.round(location.x),
           y: Math.round(location.y),
        }
      })
    },
    createSendArea(){
      const currentArea = this.areas.find(area => area.areaId == this.oldSelectedArea)
      const ret = {
        areaId: this.oldSelectedArea,
        areaCd: currentArea.areaCd,
        areaName: currentArea.areaName,
        mapRatio: this.mapRatio,
        ignoreMap: 1,
      }
      return ret
    },
    async save() {
      this.showProgress()
      this.message = ''
      StateHelper.initShowMessage()
      try {
        const param = this.getSaveLocationList()

        if (param.length > 0) {
          await HttpHelper.postAppService('/core/location/updateLocation', param)
          await StateHelper.load('exb', true)
          await StateHelper.load('location', true)
        }

        if (this.mapRatioChanged && this.mapRatio != null) {
          await AppServiceHelper.save('/core/area', this.createSendArea(), UPDATE_ONLY_NN.EMPTY_ZERO)
          await StateHelper.load('area', true)
        }
        this.message = this.$i18n.tnl('message.completed', {target: this.$i18n.tnl('label.save')})
        this.replace({showInfo: true})
        this.isChanged = false
        await this.fetchData()
      } catch (e) {
        console.error(e)
        this.message = this.createErrorMessage(e)
        this.replace({showAlert: true})
        window.scrollTo(0, 0)
      }
      this.hideProgress()
    },
    removeTooltip() {
      this.toolTipShow = false
      this.toolTipStyle.left = null
      this.toolTipStyle.top = null
    },
    createTooltipInfo(nativeEvent, container){
      const location = container.location
      const pageElement = document.getElementById('bd-page')
      const keyObj = ConfigHelper.includesDeviceType('deviceId')? { labelKey: 'EXBeacon', valKey: 'deviceId' }: { labelKey: 'EXBeaconX', valKey: 'deviceIdX' }
      return {
        fontSize: StyleHelper.getFont2Size(DISP.THERMOH.TOOLTIP_FONT),
        locationCdLabel: this.$i18n.tnl('label.locationCdComp') + ':' + location.locationCd,
        locationNameLabel: this.$i18n.tnl('label.locationName') + ':' + location.locationName,
        deviceIdLabel: this.$i18n.tnl('label.' + keyObj.labelKey) + ':' + location.exbList.map(exb => exb[keyObj.valKey]).join(', '),
        baseX: window.pageXOffset + nativeEvent.clientX - Util.getValue(pageElement, 'offsetLeft', 0),
        baseY: window.pageYOffset + nativeEvent.clientY - Util.getValue(pageElement, 'offsetTop', 0),
        isDispRight: container.x * 2 <= this.stage.canvas.width,
      }
    },
    createTooltip(event, container) {
      const tooltipInfo = this.createTooltipInfo(event.nativeEvent, container)

      this.toolTipLabel = [tooltipInfo.locationCdLabel, tooltipInfo.locationNameLabel, tooltipInfo.deviceIdLabel].filter(val => val)
      this.toolTipShow = true
      this.$nextTick(() => {
        const toolTipElement = document.getElementById('toolTipComponent')
        const left = tooltipInfo.baseX + (tooltipInfo.isDispRight? 8: -1 * Util.getValue(toolTipElement, 'clientWidth', 0) - 4)
        const top = tooltipInfo.baseY - Util.getValue(toolTipElement, 'clientHeight', 0) - 4
        this.toolTipStyle.left = '' + left + 'px'
        this.toolTipStyle.top = '' + top + 'px'
      })
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../../sub/constant/config.scss";
@import "../../../sub/constant/browser.scss";
@import "../../../sub/constant/vue.scss";

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

.blink {
  animation: blink 0.8s infinite alternate;
}

@keyframes blink {
  from { background-color: white; }
  to { background-color: #ffc107; }
}
</style>