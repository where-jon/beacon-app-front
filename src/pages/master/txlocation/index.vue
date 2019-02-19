<template>
  <div id="txLocationSetting">
    <breadcrumb :items="items" />
    <alert :message="message" />

    <b-form inline class="mt-2">
      <b-form-row class="ml-1">
        <label class="mr-2 mb-2">
          {{ $t('label.area') }}
        </label>
        <b-form-select v-model="selectedArea" :options="areaOptions" class="mr-2 mb-2 areaOptions" />
        <b-button v-t="'label.load'" :variant="getButtonTheme()" size="sm" class="mb-2" @click="changeArea" />
      </b-form-row>
    </b-form>
    <b-form inline class="mt-2">
      <b-form-row class="ml-1">
        <label class="mt-mobile mr-2 mb-2">
          {{ $t('label.tx') }}
        </label>
        <b-form-row>
          <v-select v-model="selectedTx_" :options="txOptions" :on-change="showTxOnMap" size="sm" class="mb-2 mt-mobile txOptions">
            <div slot="no-options">
              {{ $i18n.tnl('label.vSelectNoOptions') }}
            </div>
          </v-select>
          <b-button v-t="'label.bulkAdd'" :variant="getButtonTheme()" size="sm" class="mt-mobile mb-2" @click="bulkAdd" /> 
          <b-button v-t="'label.save'" :variant="getButtonTheme()" :disabled="!isChanged" size="sm" class="mt-mobile ml-2 mb-2" @click="save" /> 
        </b-form-row>
      </b-form-row>
    </b-form>
    <p />
    <div class="mt-3">
      <canvas id="map" ref="map" />
    </div>
    <b-modal id="modalWarn" :title="$t('label.confirm')" @ok="setChangeArea" @hide="changeAreaDone">
      {{ $t('message.unsavedData') }}
    </b-modal>
    <b-modal id="modalDeleteConfirm" :title="$t('label.confirm')" @ok="deleteTxDone">
      {{ $t('message.deleteConfirm', {target: deleteTarget? deleteTarget.minor: null}) }}
    </b-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as HttpHelper from '../../../sub/helper/HttpHelper'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as Util from '../../../sub/util/Util'
import { DISP } from '../../../sub/constant/config'
import { UPDATE_ONLY_NN } from '../../../sub/constant/Constants'
import { Shape, Container, Text } from '@createjs/easeljs/dist/easeljs.module'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import alert from '../../../components/parts/alert.vue'
import commonmixinVue from '../../../components/mixin/commonmixin.vue'
import showmapmixin from '../../../components/mixin/showmapmixin.vue'

export default {
  components: {
    breadcrumb,
    alert,
  },
  mixins: [showmapmixin, commonmixinVue ],
  data() {
    return {
      message: '',
      selectedTx_: null,
      isChangeArea: false,
      isChanged: false,
      workTxs: [],
      txOptions: [],
      deleteTarget: null,
      keepTxPosition: false,
      toggleCallBack: () => {
        this.keepTxPosition = true
      },
      ICON_ARROW_WIDTH: 20,
      ICON_ARROW_HEIGHT: 10,
      noImageErrorKey: 'noMapImage',
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.txLocationSetting'),
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
  },
  beforeDestroy() {
    this.selectedArea = null
  },
  methods: {
    reset() {
      this.replace({showAlert: false})
      this.replace({showInfo: false})
      this.selectedTx_ = null
      this.isChanged = false
      this.isShownMapImage = false
      this.isChangeArea = false
      this.positionedTx = []
      this.txOptions = []
    },
    async fetchData(payload) {
      try {
        await this.fetchAreaExbs(true)
        if (payload && payload.done) {
          payload.done()
        }
        this.workTxs = _.cloneDeep(this.txs)
        this.setTxPosition()
        this.showMapImage()
      }
      catch(e) {
        console.error(e)
      }
    },
    setTxPosition() {
      this.positionedTx = _.filter(this.workTxs, (tx) => {
        return tx.location && tx.location.areaId == this.selectedArea && tx.location.x && tx.location.y > 0
      })
      this.txOptions = _(this.workTxs).filter((val) => {
        return !val.location || (!val.location.x || !val.location.y || (val.location.x && val.location.y <= 0))
      })
        .map((val) => { // TODO: minor以外の表示対応
          return {
            label: '' + val.minor + '(' + val.txName + ')', 
            value: val.txId
          }
        }).value()
    },
    showMapImage() {
      this.showMapImageDef(() => {
        if (this.txCon) {
          this.txCon.removeAllChildren()
        }
        else {
          this.txCon = new Container()
        }

        this.positionedTx.forEach((tx) => {
          this.replaceExb(tx, (tx) => {
            tx.x = tx.location.x * this.mapImageScale
            tx.y = tx.location.y * this.mapImageScale
          })
          this.showTx(tx)
        })
        this.keepTxPosition = false

        this.stage.addChild(this.txCon)
        this.stage.update()
        this.forceUpdateRealWidth()
      })
    },
    createTxIcon(tx) {
      const {w, h} = DISP.EXB_LOC_SIZE
      const fromX = -w / 2
      const fromY = -h / 2
      const x = w + fromX
      const y = h + fromY
      const txBtn = new Container()
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
      txBtn.addChild(s)
      const label = new Text(tx.minor)
      label.font = DISP.EXB_LOC_FONT
      label.color = DISP.EXB_LOC_COLOR
      label.textAlign = 'center'
      label.textBaseline = 'middle'
      txBtn.addChild(label)
      txBtn.minor = tx.minor
      txBtn.txId = tx.txId
      txBtn.x = tx.x
      txBtn.y = tx.y - (h / 2 + this.ICON_ARROW_HEIGHT)
      return txBtn
    },
    showTx(tx) {
      let stage = this.stage
      const offsetY = (DISP.EXB_LOC_SIZE.h / 2) + this.ICON_ARROW_HEIGHT
      const txBtn = this.createTxIcon(tx)
      txBtn.on('pressmove', (evt) => {
        tx.delEvent = false
        evt.currentTarget.set({
          x: evt.stageX,
          y: evt.stageY
        })
        stage.update()
      })

      txBtn.on('pressup', (evt) => {
        tx.x = evt.stageX
        tx.y = evt.stageY + offsetY
        this.isChanged = true
        tx.isChanged = true
      })

      txBtn.on('dblclick', (evt) => {
        this.deleteTarget = txBtn
        this.showDeletConfirm()
      })
      if(Util.isAndroidOrIOS()){
        txBtn.on('mousedown', (evt) => {
          tx.delEvent = true
        })

        txBtn.addEventListener('click', (evt) => {
          if(tx.delEvent){
            this.deleteTarget = txBtn
            this.showDeletConfirm()
          }
        })
      }
      this.txCon.addChild(txBtn)
    },
    showDeletConfirm(){
      this.$root.$emit('bv::show::modal', 'modalDeleteConfirm')
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
          this.setTxPosition()
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
    showTxOnMap(val, x = 50, y = 40) {
      if (!val || val.value == null) {
        return
      }
      let tx = _(this.workTxs).find((tx) => tx.txId == val.value)
      if (!tx) return

      if (!tx.location) {
        tx.location = {}
      }
      let loc = tx.location
      if (!loc.x || loc.x <= 0) {
        loc.x = x
      }
      if (!loc.y || loc.y <= 0) {
        loc.y = y
      }
      tx.x = loc.x
      tx.y = loc.y
      tx.isChanged = true
      this.isChanged = true
      this.positionedTx.push(tx)
      this.txOptions = this.txOptions.filter((val) => val.value != tx.txId)
      this.showTx(tx)
      this.stage.update()
    },
    bulkAdd() {
      let counter = 0
      let y = 20
      this.txOptions.forEach((val) => {
        let x = 30 + counter++ * 60
        if (x > this.mapWidth) {
          x = 30
          counter = 0
          y += 20
        }
        this.showTxOnMap(val, x, y)
      })
    },
    deleteTxDone(evt) {
      let tx = this.positionedTx.find((tx) => tx.minor == this.deleteTarget.minor)
      if (tx && tx.location) {
        tx.location.x = tx.location.y = null
        tx.x = tx.y = null
      }
      this.positionedTx = this.positionedTx.filter((tx) => tx.minor != this.deleteTarget.minor)
      this.txOptions.push({label: '' + this.deleteTarget.minor, value: this.deleteTarget.txId})
      this.txCon.removeChild(this.deleteTarget)
      this.stage.update()
    },
    createErrorMessage(e){
      if (e.key) {
        return this.$i18n.tnl('message.' + e.type, {key: this.$i18n.tnl('label.' + Util.snake2camel(e.key)), val: e.val})
      }
      return this.$i18n.tnl('message.failed', {target: this.$i18n.tnl('label.save'), code: e.message})
    },
    pushPositionedLocation(param){
      this.positionedTx.forEach((tx) => {
        if (tx.isChanged) {
          this.setLocation(tx, param)
        }
      })
    },
    pushWorkLocation(param){
      this.workTxs.forEach((tx) => { // deleted
        if (tx.location && tx.location.areaId == this.selectedArea) {
          if (!this.positionedTx.find((pTx) => pTx.txId == tx.txId)) {
            this.setLocation(tx, param, true)
          }
        }
      })
    },
    setLocation(tx, param, reset) {
      if (!tx.location.locationId) {
        tx.location.locationId = tx.btxId * -1
        tx.location.posId = tx.btxId * -1
        tx.location.locationName = 'Loc' + (tx.btxId * -1)
      }
      if (reset) {
        tx.location = {...tx.location, areaId: null, x: null, y: null, area: null}
      }
      else {
        tx.location = {...tx.location, areaId: this.selectedArea, area: null, x: Math.round(tx.x / this.mapImageScale), y: Math.round(tx.y / this.mapImageScale)}
      }
      if (tx.txSensorList) {
        tx.txSensorList.forEach((txSensor) =>{
          console.error(txSensor)
          txSensor.sensor = null
        })
      }
      if (Util.hasValue(tx.potTxList)) {
        tx.potTxList.forEach((potTx) => {
          if(potTx.pot){
            const dummyKey = potTx.potTxPK.txId * -1
            if(Util.hasValue(potTx.pot.potCategoryList)){
              potTx.pot.potCategoryList.forEach((potCategory) => {
                potCategory.potCategoryPK.potId = dummyKey
                potCategory.category = null
              })
            }
            if(Util.hasValue(potTx.pot.potGroupList)){
              potTx.pot.potGroupList.forEach((potGroup) => {
                potGroup.potGroupPK.potId = dummyKey
                potGroup.group = null
              })
            }
          }
        })
      }
      param.push(tx)
      tx.isChanged = false
    },
    async save() {
      this.showProgress()
      this.message = ''
      this.replace({showAlert: false})
      this.replace({showInfo: false})
      try {
        const param = []
        this.pushPositionedLocation(param)
        this.pushWorkLocation(param)

        if (param.length > 0) {
          await HttpHelper.postAppService('/core/tx/bulk?updateOnlyNN=' + UPDATE_ONLY_NN.NULL, param)
          await StateHelper.load('tx', true)
        }

        this.message = this.$i18n.tnl('message.completed', {target: this.$i18n.tnl('label.save')})
        this.replace({showInfo: true})
        this.isChanged = false
      } catch (e) {
        console.log(e)
        this.message = this.createErrorMessage(e)
        this.replace({showAlert: true})
        window.scrollTo(0, 0)
      }
      this.hideProgress()
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

.txOptions {
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