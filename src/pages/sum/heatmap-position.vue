<template>
  <div id="mapContainer">
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <b-alert variant="info" dismissible :show="showInfo">
        {{ message }}
      </b-alert>
      <b-alert variant="danger" dismissible :show="showAlert" @dismissed="showAlert=false">
        <template v-if="Array.isArray(message)">
          <span v-for="line in message" :key="line">
            {{ line }} <br>
          </span>
        </template>
        <span v-else>
          {{ message }}
        </span>
      </b-alert>
      <div class="mapContainer mb-5">
        <div class="container">
          <analysis-search :from-heatmap="fromHeatmap" :area-options="areaOptions"
                           @changeArea="changeArea" @display="display"
          />
        </div>
        <b-row>
          <div id="heatmap" ref="heatmap" class="mx-auto" />
        </b-row>
      </div>
    </div>
    <!-- modal -->
    <b-modal id="modalError" :title="$t('label.error')" ok-only>
      {{ $t('message.noMapImage') }}
    </b-modal>
  </div>
</template>

<script>
import h337 from 'heatmap.js'
import { DISP } from '../../sub/constant/config'
import * as Util from '../../sub/util/Util'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import analysisSearch from '../../components/parts/analysissearch.vue'

export default {
  components: {
    breadcrumb,
    analysisSearch
  },
  mixins: [showmapmixin],
  data() {
    return {
      positionHistories: [],
      heatmap: null,
      fromHeatmap: true,
      showInfo: false,
      showAlert: false,
      message: '',
      items: [
        {
          text: this.$i18n.tnl('label.sumTitle'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.heatmapPosition'),
          active: true
        }
      ],
    }
  },
  computed: {
    heatmapData() {
      const scale = this.mapImageScale
      let positions = 
        _.reduce(this.positionHistories, (ary, hist) => {
          if (ary[hist.posId]) {
            ary[hist.posId].value++
          } else {
            ary[hist.posId] = {
              posId: hist.posId,
              x: Math.round(hist.x * scale),
              y: Math.round(hist.y * scale),
              value: 1,
            }
          }
          return ary
        }, [])
      positions = _.compact(positions)
      let maxValue = _.maxBy(positions, 'value').value
      return {
        max: maxValue,
        data: positions,
      }
    }
  },
  methods: {
    reset() {
      this.fetchData()
    },
    async fetchData(payload){
      try {
        this.showProgress()
        const map = new Image()
        map.src = this.mapImage()

        this.removeHeatmap()
        let heatmap = document.getElementById('heatmap')
        while (heatmap.firstChild) {
          heatmap.removeChild(heatmap.firstChild)
        }
        heatmap.appendChild(map)
        map.onload = (evt) => {
          Util.debug('in onload...')
          const size = this.calcFitSize(map, heatmap.parentElement)
          map.width = size.width
          map.height = size.height
          Util.debug(size)
        }
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.hideProgress()
    },
    async display(param) {
      this.showAlert = false
      if(param.errorMessage){
        this.message = param.errorMessage
        this.showAlert = true
        this.removeHeatmap()
        return
      }
      this.positionHistories = param.results
      this.drawHeatmap(document.getElementById('heatmap'))
    },
    drawHeatmap(element) {
      this.removeHeatmap()
      Util.debug(this.heatmapData)
      let heatmap = h337.create({
        radius: DISP.ANALYSIS.HEATMAP.RADIUS,
        container: element,
      })
      heatmap.setData(this.heatmapData)
      this.heatmap = element.lastElementChild
    },
    removeHeatmap() {
      if (this.heatmap && this.heatmap.parentNode) {
        this.heatmap.parentNode.removeChild(this.heatmap)
      }
      this.heatmap = null
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/config.scss";

::-webkit-scrollbar { 
  display: none; 
}
div#heatmap {
  display: inline-block;
}
</style>