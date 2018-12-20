<template>
  <div>
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <b-alert variant="info" dismissible :show="showInfo">
        {{ message }}
      </b-alert>
      <b-alert variant="danger" dismissible :show="showAlert" @dismissed="showAlert=false">
        <div v-html="message" />
      </b-alert>
      <div class="mapContainer mb-5">
        <div class="container">
          <analysis-search :area-options="areaOptions" @changeArea="changeArea"
                           @display="display"
          />
          <b-row>
            <canvas id="map" ref="map" />
          </b-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { Shape } from '@createjs/easeljs/dist/easeljs.module'
import { DISP, APP } from '../../sub/constant/config'
import { Container } from '@createjs/easeljs/dist/easeljs.module'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import analysisSearch from '../../components/parts/analysissearch.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import drawMixin from '../../components/mixin/drawmixin.vue'
import { getTheme } from '../../sub/helper/ThemeHelper'

export default {
  components: {
    breadcrumb,
    analysisSearch,
  },
  mixins: [showmapmixin, drawMixin ],
  data () {
    return {
      items: [
        {
          text: this.$i18n.tnl('label.sumTitle'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.flowlineAnalysis'),
          active: true
        }
      ],
      dotRadius: 3,
      startInfo: {caption: 'start', color: '#2299cc'},
      endInfo: {caption: 'end', color: '#ee0033'},
      container: null,
      shownParam: null,
      //
      showInfo: false,
      showAlert: false,
      message: '',
      //
    }
  },
  computed: {
    theme () {
      const theme = getTheme()
      return 'outline-' + theme
    },
  },
  methods: {
    showMapImage() {
      // 地図ダブルタップ時のみ利用
      this.fetchData()
    },
    reset() {
      this.isShownMapImage = false
      this.shownParam = null
    },
    async fetchData(payload){
      try {
        this.replace({showProgress: true})
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
          this.forceUpdateRealWidth()
          if (this.shownParam) {
            this.display(this.shownParam)
          }
        })
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
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
      Object.values(positionInfos).forEach((positionInfo) => {
        if(!weightInfos.includes(positionInfo.count)){
          weightInfos.push(positionInfo.count)
        }
      })
      weightInfos.sort((a, b) => a - b)
      const max = weightInfos.length < DISP.ANALYSIS.LINE.MAX_WEIGHT? weightInfos.length: DISP.ANALYSIS.LINE.MAX_WEIGHT
      Object.values(positionInfos).forEach((positionInfo) => {
        const stageIndex = weightInfos.indexOf(positionInfo.count)
        const per = max <= 1? 0: weightInfos.length <= 1? 1: (max - 1) / (weightInfos.length - 1)
        positionInfo.weight = 1 + stageIndex * per
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
      line.graphics.beginStroke(this.getRGBA(DISP.ANALYSIS.LINE.COLOR, DISP.ANALYSIS.LINE.OPACITY))
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
        this.drawArrowPoint(param.view, {...potInfo[0], mapScale: param.mapScale}, this.startInfo.color, this.startInfo.caption)
        this.drawArrowPoint(param.view, {...potInfo[potInfo.length - 1], mapScale: param.mapScale}, this.endInfo.color, this.endInfo.caption)
      }
      else{
        Object.values(potInfos).forEach((potInfo) => {
          this.drawDotPoint(param.view, {...potInfo[0], mapScale: param.mapScale}, this.startInfo.color, this.dotRadius)
          this.drawDotPoint(param.view, {...potInfo[potInfo.length - 1], mapScale: param.mapScale}, this.endInfo.color, this.dotRadius)
        })
      }
    },
    draw(param, analyseResults){
      this.drawFlowline(param, analyseResults.positionInfos)
      this.drawStartEnd(param, analyseResults.potInfos, param.form.potId)
    },
    async display(param){
      this.showAlert = false
      if(param.errorMessage){
        this.message = param.errorMessage
        this.showAlert = true
        return
      }
      const analysisResults = this.analyseFlowline(param.results)
      param = {
        ...param,
        view: this.container,
        mapScale: this.mapImageScale
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
