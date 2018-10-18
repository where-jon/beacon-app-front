<template>
  <div id="locationSetting">
    <breadcrumb :items="items" />
    <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
    <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">{{ message }}</b-alert>

    <b-form inline class="mt-2">
      <label class="mr-2">{{ $t('label.area') }}</label>
      <b-form-select v-model="selectedArea" :options="areaOptions" class="mr-2 areaOptions" :disabled="settingStart"></b-form-select>
      <b-button size="sm" class="mr-4" variant="outline-info" v-t="'label.load'" @click="changeArea" :disabled="settingStart"></b-button>
      <label class="mt-mobile">{{ $t('label.exb') }}</label>
      <v-select size="sm" v-model="selectedExb_" :options="exbOptions" :on-change="showExbOnMap" class="mx-2 mt-mobile exbOptions" :disabled="settingStart"></v-select>
      <b-button size="sm" variant="outline-info" v-t="'label.bulkAdd'" @click="bulkAdd" class="mt-mobile" :disabled="settingStart"></b-button> 
    </b-form>
    <b-form inline class="mt-2">
      <label class="mr-2">{{ $t('label.mapRatio') }}</label>
      <b-form-input size="sm" type="number" :value="mapRatio" :readonly="true" class="mr-2 ratioInput"/>
      <label class="mr-2 mt-mobile">{{ "= "+ $t('label.realWidth') }}</label>
      <b-form-input size="sm" type="number" v-model="realWidth" class="mr-2 mt-mobile ratioInput"/>
      <label class="mr-2">{{ "/ "+ $t('label.pixelWidth') }}</label>
      <b-form-input size="sm" type="number" v-model="pixelWidth" :readonly="true" class="mr-2 ratioInput"/>
      <b-button size="sm" variant="outline-info" v-t="settingStart?'label.settingNow':'label.settingStart'" @click="ratioSettingStart" :class="{'mt-mobile':true, 'mr-2':true, blink:settingStart}"></b-button> 
      <b-button size="sm" variant="info" v-t="'label.save'" @click="save" :disabled="!isChanged"></b-button> 
    </b-form>
    <p></p>
    <div class="mt-3">
      <canvas id="map" ref="map"></canvas>
    </div>
    <!-- modal -->
    <b-modal id="modalError" :title="$t('label.error')" ok-only>
      {{ $t('message.noMapImage') }}
    </b-modal>
    <b-modal id="modalInfo" :title="$t('label.mapRatioSetting')" ok-only>
      {{ $t('message.mapRatioSetting') }}
    </b-modal>
    <b-modal id="modalWarn" :title="$t('label.confirm')" @ok="changeAreaDone" @hide="unChangeArea" >
      {{ $t('message.unsavedData') }}
    </b-modal>
    <b-modal id="modalDeleteConfirm" :title="$t('label.confirm')" @ok="deleteExbDone" >
      {{ $t('message.deleteConfirm', {target: deleteTarget? deleteTarget.deviceId: null}) }}
    </b-modal>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as HttpHelper from '../../../sub/helper/HttpHelper'
import * as StateHelper from '../../../sub/helper/StateHelper'
import { APP, DISP } from '../../../sub/constant/config'
import { UPDATE_ONLY_NN } from '../../../sub/constant/Constants'
import { Shape, Stage, Container, Bitmap, Text, Touch } from '@createjs/easeljs/dist/easeljs.module'
import { Tween, Ticker } from '@createjs/tweenjs/dist/tweenjs.module'
import breadcrumb from '../../../components/breadcrumb.vue'
import showmapmixin from '../../../components/showmapmixin.vue'

let that

export default {
  mixins: [showmapmixin],
  components: {
    breadcrumb,
  },
  data() {
     return {
      showInfo: false,
      showAlert: false,
      message: '',
      selectedExb_: null,
      pixelWidth: null,
      mapRatioChanged: false,
      settingStart: false,
      isChanged: false,
      exbOptions: [],
      deleteTarget: null,
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.locationSetting'),
          active: true
        }
      ]
    }
  },
  watch: {
    mapRatio: function(newVal, oldVal) {
      console.log({newVal, oldVal})
    },
    selectedArea: function(newVal, oldVal) {
      console.log({newVal, oldVal})
    }
  },
  computed: {
    mapRatio() {
      if (this.pixelWidth || this.realWidth) {
        if (this.pixelWidth && this.realWidth) {
          return Math.floor(this.realWidth / this.pixelWidth) 
        } 
      }
      else if (this.oldSelectedArea) {
        let area = _.find(this.$store.state.app_service.areas, (area) => this.oldSelectedArea && area.areaId == this.oldSelectedArea.value)
        if (area && area.mapRatio) {
         return area.mapRatio / this.mapImageScale
        }
      }
    },
  },
  mounted() {
    that = this
    this.replace({title: this.$i18n.t('label.location')})
    this.fetchData()
  },
  created() {
  },
  updated(){
    if (this.isShownMapImage || !this.mapImage) {
      return
    }
    this.showMapImage()
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
      this.positionedExb = []
      this.exbOptions = []
    },
    async fetchData(payload) {
      try {
        await this.fetchAreaExbs()
        if (payload && payload.done) {
          payload.done()
        }

        this.setExbPosition()
        this.showMapImage()
      }
      catch(e) {
        console.error(e)
      }
    },
    setExbPosition() {
      this.positionedExb = _(this.exbs).filter((exb) => {
        return exb.location.areaId == this.selectedArea && exb.location.x && exb.location.y > 0
      }).cloneDeep()

      this.exbOptions = _(this.exbs).filter((val) => {
        return val.enabled && (!val.location.x || !val.location.y || (val.location.x && val.location.y <= 0))
      })
      .map((val) => {
        return {label: '' + val.deviceId.toString(16).toUpperCase(), value: val.exbId}
      }).value()
    },
    showMapImage() {
      if (this.showMapImageDef()) {
        return
      }

      if (this.exbCon) {
        this.exbCon.removeAllChildren()
      }
      else {
        this.exbCon = new Container()
      }

      this.positionedExb.forEach((exb) => {
        exb.x = exb.location.x * this.mapImageScale
        exb.y = exb.location.y * this.mapImageScale
        this.showExb(exb)
      })

      this.stage.addChild(this.exbCon)
      this.stage.update()

      this.forceUpdateRealWidth()
    },
    showExb(exb) {
      console.log({exb})

      let stage = this.stage
      let exbBtn = new Container()
      let btnBg = new Shape()
      let {w, h} = DISP.EXB_LOC_SIZE
      btnBg.graphics.beginFill(DISP.EXB_LOC_BGCOLOR).drawRect(-w/2, -h/2, w, h)
      // btnBg.graphics.beginFill(DISP.EXB_LOC_BGCOLOR).drawRoundRect(-w/2, -h/2, w, h, 20, 20)
      exbBtn.addChild(btnBg)

      let label = new Text(exb.deviceId.toString(16).toUpperCase())
      label.font = DISP.EXB_LOC_FONT
      label.color = DISP.EXB_LOC_COLOR
      label.textAlign = "center"
      label.textBaseline = "middle"
      exbBtn.addChild(label)

      exbBtn.deviceId = exb.deviceId
      exbBtn.exbId = exb.exbId
      exbBtn.x = exb.x
      exbBtn.y = exb.y
      exbBtn.on('pressmove', (evt) => {
        evt.currentTarget.set({
            x: evt.stageX,
            y: evt.stageY
        })
        stage.update()
      })

      exbBtn.on('pressup', (evt) => {
        console.log(evt.stageX, evt.stageY)
        exb.x = evt.stageX
        exb.y = evt.stageY
        this.isChanged = true
        exb.isChanged = true
      })

      exbBtn.on('dblclick', (evt) => {
        that.deleteTarget = exbBtn
        that.$root.$emit('bv::show::modal', 'modalDeleteConfirm')
      })

      this.exbCon.addChild(exbBtn)

    },
    ratioSettingStart() {
      this.settingStart = !this.settingStart
      if (!this.settingStart) {
        return
      }
      this.$root.$emit('bv::show::modal', 'modalInfo')

      let messureCount = 0
      let start
      let stage = this.stage
      this.stage.on('click', (evt) => {
        if (messureCount == 2) {
          return
        }
        let revTrgCnt = new Container()
        let revTrg = new Shape()
        let color = messureCount == 0? '#2299cc': '#ee0033'
        let current = {x:evt.stageX, y:evt.stageY}
        revTrg.graphics.beginFill(color).drawPolyStar(0, -20, 20, 3, 0, 90)

        let label = new Text(messureCount == 0? 'start': 'end')
        label.font = "16px Arial"
        label.color = "#000"
        label.textAlign = "center"
        label.textBaseline = "middle"
        label.y = -40

        revTrgCnt.x = current.x
        revTrgCnt.y = current.y
        revTrgCnt.addChild(label)
        revTrgCnt.addChild(revTrg)

        stage.addChild(revTrgCnt)
        if (messureCount == 0) {
          start = current
        }
        else {
          let line = new Shape()
          line.graphics.beginStroke("#ff2244")
          line.graphics.setStrokeStyle(1)
          line.graphics.moveTo(start.x, start.y)
          line.graphics.lineTo(current.x, current.y)
          stage.addChild(line)
          that.pixelWidth = Math.floor(Math.sqrt(Math.pow(current.x-start.x, 2) + Math.pow(current.y-start.y, 2)))
          that.mapRatioChanged = true
          that.isChanged = true
        }
        messureCount++

        stage.update()
      })
    },
    changeArea() {
      if (this.isChanged) {
        this.$root.$emit('bv::show::modal', 'modalWarn')
      }
      else {
        this.changeAreaDone()
      }
    },
    unChangeArea() {
      this.selectedArea = this.oldSelectedArea
    },
    changeAreaDone() {
      if (this.selectedArea) {
        this.reset()
        this.setExbPosition()
        this.showMapImage()
      }      
    },
    showExbOnMap(val, x = 50, y = 30) {
      if (!val || !val.value) {
        return
      }
      let exb = _(this.exbs).find((exb) => exb.exbId == val.value)
      if (!exb) return
      exb = _.cloneDeep(exb)

      let loc = exb.location
      if (loc.x <= 0) {
        loc.x = x
      }
      if (loc.y <= 0) {
        loc.y = y
      }
      exb.x = loc.x
      exb.y = loc.y
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
        that.showExbOnMap(val, x, y)
      })
    },
    deleteExbDone(evt) {
      this.positionedExb = this.positionedExb.filter((exb) => exb.deviceId != this.deleteTarget.deviceId)
      this.exbOptions.push({label: "" + this.deleteTarget.deviceId, value: this.deleteTarget.exbId})
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
            exb.location = {locationId: exb.location.locationId, areaId: this.selectedArea, x: exb.x / this.mapImageScale, y: exb.y / this.mapImageScale}
            param.push(exb.location)
            exb.isChanged = false
          }
        })
        this.exbs.forEach((exb) => { // deleted
          if (exb.location.areaId == this.selectedArea) {
            if (!this.positionedExb.find((pExb) => pExb.exbId == exb.exbId)) {
              exb.location = {locationId: exb.location.locationId, areaId: null, x: null, y: null}
              exb.isChanged = false
              param.push(exb.location)
            }
          }
        })

        if (param.length > 0) {
          await HttpHelper.postAppService('/core/location/updateLocation', param)
          await StateHelper.load('exb')
        }
        if (this.mapRatioChanged) {
          await AppServiceHelper.bulkSave('/core/area', [{areaId: this.selectedArea, mapRatio: this.mapRatio * this.mapImageScale}], UPDATE_ONLY_NN.EMPTY_ZERO)
          await StateHelper.load('area')
        }
        this.message = this.$i18n.t('message.completed', {target: this.$i18n.t('label.save')})
        this.showInfo = true
        this.isChanged = false
      } catch (e) {
        if (e.key) {
          this.message = this.$i18n.t('message.' + e.type, {key: this.$i18n.t('label.' + Util.snake2camel(e.key)), val: e.val})
        }
        else {
          this.message = this.$i18n.t('message.failed', {target: this.$i18n.t('label.save'), code: e.message})
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

@media screen and (max-width: 767px) {
  .mt-mobile {margin-top:5px;}
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