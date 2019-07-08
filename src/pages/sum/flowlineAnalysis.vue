<template>
  <div class="container-fluid">
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <alert :message="message" />

      <div class="mapContainer mb-5">
        <div class="container">
          <analysis-search @changeArea="changeArea" @display="display" />
          <b-row>
            <canvas id="map" ref="map" @click="closeVueSelect" />
          </b-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Container, Shape } from '@createjs/easeljs/dist/easeljs.module'
import { DISP } from '../../sub/constant/config'
import * as ColorUtil from '../../sub/util/ColorUtil'
import * as Util from '../../sub/util/Util'
import * as FlowLineHelper from '../../sub/helper/ui/FlowLineHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import alert from '../../components/parts/alert.vue'
import analysisSearch from '../../components/parts/analysissearch.vue'

export default {
  components: {
    breadcrumb,
    alert,
    analysisSearch,
  },
  mixins: [showmapmixin],
  data () {
    return {
      items: ViewHelper.createBreadCrumbItems('sumTitle', 'flowlineAnalysis'),
      message: '',
      dotRadius: 3,
      startInfo: {caption: 'start', color: '#2299cc'},
      endInfo: {caption: 'end', color: '#ee0033'},
      container: null,
      shownParam: null,
      noImageErrorKey: 'noMapImage',
    }
  },
  methods: {
    async fetchData(payload){
      try {
        this.showProgress()
        this.replace({showAlert: false})
        this.showMapImageDef(() => {
          if (this.container) {
            this.container.removeAllChildren()
            this.stage.removeChild(this.container)
          }
          if (!this.container) {
            this.container = new Container()
          }
          this.container.x = 0
          this.container.y = 0
          this.container.width = this.bitmap.width
          this.container.height = this.bitmap.height
          this.stage.addChild(this.container)
          this.stage.update()
        })
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.hideProgress()
    },
    showMapImage() {
      // 地図ダブルタップ時のみ利用
      this.fetchData()
    },

    analysePotInfos(results){
      const potInfos = {}
      results.forEach((val) => {
        if(!potInfos[val.potId]){
          potInfos[val.potId] = []
        }
        potInfos[val.potId].push(val)
      })
      return potInfos
    },
    analyseWeightInfos(positionInfos){
      const weightInfos = []
      Object.values(positionInfos).forEach(positionInfo => {
        if(!weightInfos.includes(positionInfo.count)){
          weightInfos.push(positionInfo.count)
        }
      })
      weightInfos.sort((a, b) => a - b)
      const min = DISP.ANALYSIS.LINE.MIN_WEIGHT
      const max = min + weightInfos.length - 1 < DISP.ANALYSIS.LINE.MAX_WEIGHT? min + weightInfos.length - 1: DISP.ANALYSIS.LINE.MAX_WEIGHT
      const per = max <= min? 0: weightInfos.length <= 1? 0: (max - min) / (weightInfos.length - 1)
      Object.values(positionInfos).forEach(positionInfo => {
        const stageIndex = weightInfos.indexOf(positionInfo.count)
        positionInfo.weight = min + stageIndex * per
      })
      return positionInfos
    },
    analysePositionInfos(potInfos){
      const positionInfos = {}
      Object.values(potInfos).forEach((potInfo) => {
        for(let idx = 1; idx < potInfo.length; idx++){
          if(potInfo[idx - 1].posId == potInfo[idx].posId){
            continue
          }
          const positionInfoKey = potInfo[idx - 1].posId < potInfo[idx].posId? `${potInfo[idx - 1].posId}-${potInfo[idx].posId}`: `${potInfo[idx].posId}-${potInfo[idx - 1].posId}`
          if(!positionInfos[positionInfoKey]){
            positionInfos[positionInfoKey] = {
              start: potInfo[idx - 1],
              end: potInfo[idx],
              count: 0,
            }
          }
          positionInfos[positionInfoKey].count++
        }
      })
      return this.analyseWeightInfos(positionInfos)
    },
    analyseFlowline(results){
      const potInfos = this.analysePotInfos(results)
      const positionInfos = this.analysePositionInfos(potInfos)
      return {potInfos: potInfos, positionInfos: positionInfos}
    },
    drawFlowline(param, positionInfos){
      const line = new Shape()
      line.graphics.beginStroke(ColorUtil.getRGBA(DISP.ANALYSIS.LINE.COLOR, DISP.ANALYSIS.LINE.OPACITY))
      Object.entries(positionInfos).forEach(([key, positionInfo]) => {
        line.graphics.setStrokeStyle(positionInfo.weight)
        line.graphics.moveTo(positionInfo.start.x * param.mapScale, positionInfo.start.y * param.mapScale)
        line.graphics.lineTo(positionInfo.end.x * param.mapScale, positionInfo.end.y * param.mapScale)
      })
      param.view.addChild(line)
    },
    drawStartEnd(param, potInfos, potId){
      if(param.form.potId){
        const potInfo = potInfos[potId]
        FlowLineHelper.drawArrowPoint(param.view, {...potInfo[0], mapScale: param.mapScale}, this.startInfo.color, this.startInfo.caption)
        FlowLineHelper.drawArrowPoint(param.view, {...potInfo[potInfo.length - 1], mapScale: param.mapScale}, this.endInfo.color, this.endInfo.caption)
      }
      else{
        Object.values(potInfos).forEach((potInfo) => {
          FlowLineHelper.drawDotPoint(param.view, {...potInfo[0], mapScale: param.mapScale}, this.startInfo.color, this.dotRadius)
          FlowLineHelper.drawDotPoint(param.view, {...potInfo[potInfo.length - 1], mapScale: param.mapScale}, this.endInfo.color, this.dotRadius)
        })
      }
    },
    draw(param, analyseResults){
      this.drawFlowline(param, analyseResults.positionInfos)
      this.drawStartEnd(param, analyseResults.potInfos, param.form.potId)
    },
    async display(param){
      if(Util.hasValue(param.errorMessage)){
        this.message = param.errorMessage
        this.shownParam = null
        return
      }
      const analysisResults = this.analyseFlowline(param.results)
      param = {
        ...param,
        view: this.container,
        mapScale: 1
      }
      this.container.removeAllChildren()
      this.draw(param, analysisResults)
      this.stage.update()
      this.shownParam = param
    },
  }
}
</script>

<style scoped lang="scss">
</style>
