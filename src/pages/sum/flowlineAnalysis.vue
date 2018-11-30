<template>
  <div>
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <b-alert variant="info" dismissible :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">
        <div v-html="message" />
      </b-alert>
      <analysis-search/>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { Shape } from '@createjs/easeljs/dist/easeljs.module'
import { DISP, APP } from '../../sub/constant/config'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import analysisSearch from '../../components/parts/analysissearch.vue'
import drawMixin from '../../components/mixin/drawmixin.vue'
import { getTheme } from '../../sub/helper/ThemeHelper'
import * as HttpHelper from '../../sub/helper/HttpHelper'

export default {
  mixins: [ drawMixin ],
  components: {
    breadcrumb,
    analysisSearch,
  },
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
      startInfo: {caption: "start", color: "#2299cc"},
      endInfo: {caption: "end", color: "#ee0033"},
      //
      showInfo: false,
      showAlert: false,
      message: "",
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
        return false
      }
      try {
        const results = await HttpHelper.getAppService(`/core/positionHistory/${param.form.areaId}/${param.form.groupId? param.form.groupId: 0}/${param.form.potId? param.form.potId: 0}/${param.form.datetimeFrom.getTime()}/${param.form.datetimeTo.getTime()}`)
        if(!results.length){
          this.message = this.$i18n.tnl("message.notFoundData", {target: this.$i18n.tnl("label.flowlineAnalysis")})
          this.showAlert = true
          return false
        }
        const analysisResults = this.analyseFlowline(results)
        this.draw(param, analysisResults)
        return true
      }catch(e){
        console.error(e)
      }
    },
  }
}
</script>

<style scoped lang="scss">
</style>
