<template>
  <div id="mapContainer" class="container-fluid" >
    <breadcrumb :items="items" />
    <b-row class="mt-3">













      <div id="heatmap" ref="heatmap"></div>














    </b-row>
    <!-- modal -->
    <b-modal id="modalError" :title="$t('label.error')" ok-only>
      {{ $t('message.noMapImage') }}
    </b-modal>
  </div>
</template>

<script>
import h337 from 'heatmap.js'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as MenuHelper from '../../sub/helper/MenuHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import * as mock from '../../assets/mock/mock'
import txdetail from '../../components/txdetail.vue'
import { Tx, EXB, APP, DISP, DEV } from '../../sub/constant/config'
import { SHAPE, SENSOR, EXTRA_NAV, POSITION } from '../../sub/constant/Constants'
import { Shape, Stage, Container, Bitmap, Text, Touch } from '@createjs/easeljs/dist/easeljs.module'
import { Tween, Ticker } from '@createjs/tweenjs/dist/tweenjs.module'
import breadcrumb from '../../components/breadcrumb.vue'
import listmixin from '../../components/listmixin.vue'
import sensor from '../../components/sensor.vue'
import moment from 'moment'
import { rightpanewidth, rightpaneleft } from '../../sub/constant/config.scss'

export default {
  mixins: [listmixin],
  components: {
    'sensor': sensor,
    'txdetail': txdetail,
    breadcrumb,
  },
  data() {
     return {
      items: [
        {
          text: this.$i18n.tnl('label.main'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.showPosition'),
          active: true
        },
      ],
      count: 0, // for mock test 
      pot: {},
    }
  },
  computed: {
    positions() {
      let now = !DEV.USE_MOCK_EXC? new Date().getTime(): mock.positions_conf.start + this.count++ * mock.positions_conf.interval  // for mock
      let positions = PositionHelper.correctPosId(this.orgPositions, now)
      if (APP.USE_MEDITAG && this.meditagSensors) {
        positions = SensorHelper.setStress(positions, this.meditagSensors)
      }
      positions = this.positionFilter(positions, this.selectedGroup, this.selectedCategory)
      return positions
    },
    filter() {
      return [this.selectedGroup, this.selectedCategory]
    },
  },
  watch: {
    filter() {
      this.showTxAll()
    },
  },
  async mounted() {
    this.replace({title: this.$i18n.tnl('label.showPosition')})
    this.fetchData()
  },
  methods: {
    ...mapActions('main', [
      'pushOrgPositions',
    ]),
    async fetchData(payload) {
      const heatmap = h337.create({
			  container: document.getElementById('heatmap')
      })
      heatmap.width = 1000
      heatmap.height= 700
      heatmap.setData({
        max: 5,
        data: [{ x: 10, y: 15, value: 5},]
      })

      try {
        this.replace({showProgress: true})
        await StateHelper.load('tx')

        if (DEV.USE_MOCK_EXC) {
          // var pMock = mock.position
          var pMock = mock.positions[this.count]
        }
        let positions = await EXCloudHelper.fetchPosition(this.exbs, this.txs, pMock)
        // 移動平均数分のポジションデータを保持する
        this.pushOrgPositions(positions)

        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    },
    isShowModal() {
      return window.innerWidth < this.shwoIconMinWidth
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/config.scss";

$right-pane-width-px: $right-pane-width * 1px;
$right-pane-maxwidth-px: ($right-pane-width + 100) * 1px;
$right-pane-left-px: $right-pane-left * 1px;

::-webkit-scrollbar { 
  display: none; 
}

.rightPane {
  max-width: $right-pane-maxwidth-px;
  margin: 10px;
  padding: 3px;
  width: $right-pane-width-px;
  min-width: $right-pane-width-px;
  overflow: scroll;
  height: calc(100vh - 100px);
}

#heatmap {
  width: 100px;
  height: 700px;
}

</style>