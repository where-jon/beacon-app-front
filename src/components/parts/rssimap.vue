<template>
  <div id="mapContainer" class="container-fluid">
    <breadcrumb :items="items" :reload="false" />
    <b-row class="mt-2">
      <b-form inline class="mt-2" @submit.prevent>
        <b-form-row class="my-1 ml-2 ml-sm-0">
          <label class="ml-sm-4 ml-2 mr-1">
            {{ $t('label.area') }}
          </label>
          <b-form-select v-model="selectedArea" :options="areaOptions" required class="ml-1 mr-2" @change="changeArea" />
        </b-form-row>
        <b-form-row v-if="useGroup" class="my-1 ml-2 ml-sm-0">
          <label class="ml-sm-4 ml-2 mr-1">
            {{ $t('label.group') }}
          </label>
          <b-form-select v-model="selectedGroup" :options="groupOptions" class="ml-1 mr-2" />
        </b-form-row>
        <b-form-row v-if="useCategory" class="my-1 ml-2 ml-sm-0">
          <label class="ml-sm-4 ml-2 mr-1">
            {{ $t('label.category') }}
          </label>
          <b-form-select v-model="selectedCategory" :options="categoryOptionsForPot" class="ml-1 mr-2" />
        </b-form-row>
        <b-form-row v-if="showDetected" class="my-1 ml-2 ml-sm-0">
          <span class="ml-sm-4 ml-2 mr-1">
            {{ $t('label.detectedCount') + ' : ' }}
          </span>
          <span class="mr-1">
            {{ detectedCount }}
          </span>
        </b-form-row>
        <b-form-row>
          <b-form-checkbox v-model="modeRssi" class="ml-sm-4 ml-2 mr-1">
            {{ $t('label.dispRssi') }}
          </b-form-checkbox>
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
import breadcrumb from '../../components/layout/breadcrumb.vue'
import * as MenuHelper from '../../sub/helper/MenuHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as HttpHelper from '../../sub/helper/HttpHelper'
import { APP, DISP, EXCLOUD } from '../../sub/constant/config'
import { CATEGORY } from '../../sub/constant/Constants'
import { Container, Shape, Text } from '@createjs/easeljs/dist/easeljs.module'
import commonmixinVue from '../../components/mixin/commonmixin.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'

export default {
  components: {
    breadcrumb,
  },
  mixins: [showmapmixin, commonmixinVue],
  data () {
    return {
      items: [
        {
          text: this.$i18n.tnl('label.develop'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.installation'),
          active: true
        },
      ],
      useGroup: MenuHelper.useMaster('group') && APP.TX_WITH_GROUP,
      useCategory: MenuHelper.useMaster('category') && APP.TX_WITH_CATEGORY,
      modeRssi: true,
      exbDisp: 'deviceNum',
      EXB_ICON_RADIUS: 18,
      txs: [],
    }
  },
  computed: {
    ...mapState('app_service', [
      'pageSendParam',
    ]),
    categoryOptionsForPot() {
      return StateHelper.getOptionsFromState('category', false, false,
        category => CATEGORY.POT_AVAILABLE.includes(category.categoryType)
      )
    },
  },
  watch: {
    modeRssi: function(newVal, oldVal) {
      this.$emit('rssi', newVal)
    },
  },
  async mounted() {
    await StateHelper.load('category')
    await StateHelper.load('group')
    await this.fetchData()
  },
  methods: {
    async fetchData(payload, disableErrorPopup) {
      this.showMapImageDef(async () => {
        await this.fetchAreaExbs()
        this.positionedExb = this.getExbPosition()
        this.getRssiMap(this.positionedExb)
        if (this.exbCon) {
          this.exbCon.removeAllChildren()
        }
        else {
          this.exbCon = new Container()
        }
        this.positionedExb.forEach((exb) => {
          const clone = Object.assign({}, exb)
          this.replaceExb(exb, (exb) => {
            clone.x = exb.location.x * this.mapImageScale
            clone.y = exb.location.y * this.mapImageScale
          })
          this.showExb(clone)
        })
        this.keepExbPosition = false
        this.stage.addChild(this.exbCon)
        this.stage.update()
        this.forceUpdateRealWidth()
      }, disableErrorPopup)
    },
    showExb(exb) {
      const exbBtn = this.createExbIcon(exb)
      this.exbCon.addChild(exbBtn)
    },
    createExbIcon(exb) {
      const exbBtn = new Container()
      const s = new Shape()
      s.graphics.beginFill(DISP.EXB_LOC_BGCOLOR).drawCircle(0, 0, this.EXB_ICON_RADIUS, this.EXB_ICON_RADIUS)
      exbBtn.addChild(s)
      const label = new Text(this.getExbDisp(exb.deviceId))
      label.font = DISP.EXB_LOC_FONT
      label.color = DISP.EXB_LOC_COLOR
      label.textAlign = 'center'
      label.textBaseline = 'middle'
      exbBtn.addChild(label)
      exbBtn.deviceId = exb.deviceId
      exbBtn.exbId = exb.exbId
      exbBtn.x = exb.x + this.EXB_ICON_RADIUS
      exbBtn.y = exb.y + this.EXB_ICON_RADIUS
      return exbBtn
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
    getExbPosition() {
      return this.exbs.filter((exb) => exb.location.areaId === this.selectedArea && exb.location.x && exb.location.y > 0)
    },
    async getRssiMap(exbs) {
      let positions = await HttpHelper.getExCloud(EXCloudHelper.url(EXCLOUD.POSITION_URL) + new Date().getTime())
      positions = positions.filter((position) => exbs.some((exb) => exb.deviceId === position.device_id))
        .map((position) => {
          return {btx_id: position.btx_id, nearest: position.nearest}
        })
      console.log(positions)
    },
  },
}
</script>