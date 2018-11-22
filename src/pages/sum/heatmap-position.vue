<template>
  <div id="mapContainer" class="container-fluid">
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <b-alert variant="info" dismissible :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">
        <div v-html="message" />
      </b-alert>
      <analysis-search :fromHeatmap="fromHeatmap" @:resetHeatmap="removeHeatmap()"/>
    </div>
    <!-- modal -->
    <b-modal id="modalError" :title="$t('label.error')" ok-only>
      {{ $t('message.noMapImage') }}
    </b-modal>
  </div>
</template>

<script>
import h337 from 'heatmap.js'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as Util from '../../sub/util/Util'
import * as HttpHelper from '../../sub/helper/HttpHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import analysisSearch from '../../components/parts/analysissearch.vue'

export default {
  components: {
    breadcrumb,
    analysisSearch
  },
  data() {
    return {
      positionHistories: [],
      heatmap: null,
      mapScale: 1,
      fromHeatmap: true,
      showInfo: false,
      showAlert: false,
      message: "",
      items: [
        {
          text: this.$i18n.tnl('label.analysis'),
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
      const scale = this.mapScale
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
      console.log(positions)
      positions = _.compact(positions)
      let maxValue = _.maxBy(positions, 'value').value
      return {
        max: maxValue,
        data: positions,
      }
    }
  },
  methods: {
    async display(param) {
      if(param.errorMessage){
        this.message = param.errorMessage
        this.showAlert = true
        this.removeHeatmap()
        return
      }
      try {
        const form = param.form
        this.mapScale = param.mapScale
        let reqParam = [
          '/core/positionHistory',
          form.areaId,
          form.groupId ? form.groupId : '0',
          form.potId ? form.potId : '0',
          form.datetimeFrom.getTime(),
          form.datetimeTo.getTime(),
        ].join('/')
        console.log(reqParam)
        const results = await HttpHelper.getAppService(reqParam)
        console.log(results)
        if(!results.length){
          this.message = this.$i18n.tnl("message.notFoundData", {target: this.$i18n.tnl("label.heatmapPosition")})
          this.showAlert = true
          this.removeHeatmap()
          return
        }
        this.positionHistories = results

        this.drawHeatmap(document.getElementById('heatmap'))

      } catch (e) {
        console.error(e)
      }
    },
    drawHeatmap(element) {
      this.removeHeatmap()
      Util.debug(this.heatmapData)
      let heatmap = h337.create({
        container: element
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


</style>