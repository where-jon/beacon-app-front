<template>
  <div id="mapContainer" class="container-fluid">
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <alert :message="message" />

      <div class="mapContainer mb-5">
        <div class="container">
          <analysis-search :from-heatmap="true" @changeArea="changeArea" @display="display" />
        </div>
        <b-row>
          <div id="heatmap" ref="heatmap" class="mx-auto" />
        </b-row>
      </div>
    </div>
  </div>
</template>

<script>
import h337 from 'heatmap.js'
import { DISP } from '../../sub/constant/config'
import * as Util from '../../sub/util/Util'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import alert from '../../components/parts/alert.vue'
import analysisSearch from '../../components/parts/analysissearch.vue'
import * as ViewHelper from '../../sub/helper/ViewHelper'

export default {
  components: {
    breadcrumb,
    alert,
    analysisSearch,
  },
  mixins: [showmapmixin],
  data() {
    return {
      positionHistories: [],
      heatmap: null,
      fromHeatmap: true,
      message: '',
      noImageErrorKey: 'noMapImage',
      items: ViewHelper.createBreadCrumbItems('sumTitle', 'heatmapPosition'),
    }
  },
  computed: {
    heatmapData() {
      let positions = 
        _.reduce(this.positionHistories, (ary, hist) => {
          if (ary[hist.posId]) {
            ary[hist.posId].value++
          } else {
            ary[hist.posId] = {
              posId: hist.posId,
              x: Math.round(hist.x * this.canvasScale),
              y: Math.round(hist.y * this.canvasScale),
              value: 1,
            }
          }
          return ary
        }, [])
      positions = _.compact(positions)
      const maxValue = _.maxBy(positions, 'value').value
      return {
        max: maxValue,
        data: positions,
      }
    }
  },
  methods: {
    async fetchData(payload){
      try {
        this.showProgress()
        this.replace({showAlert: false})
        const map = new Image()

        this.removeHeatmap()
        const heatmap = document.getElementById('heatmap')
        while (heatmap.firstChild) {
          heatmap.removeChild(heatmap.firstChild)
        }
        map.onload = (evt) => {
          Util.debug('in onload...')
          const size = this.calcFitSize(map, heatmap.parentElement)
          this.canvasScale = size.width / map.width // showmapmixinと同じ処理が必要
          map.width = size.width
          map.height = size.height
          heatmap.appendChild(map)
          Util.debug(size)
        }
        map.src = this.mapImage()
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
      if(Util.hasValue(param.errorMessage)){
        this.positionHistories = []
        this.message = param.errorMessage
        this.replace({showAlert: true})
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
        radius: DISP.ANALYSIS.HEATMAP.RADIUS * this.canvasScale,
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