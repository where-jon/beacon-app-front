<template>
  <div id="mapContainer" class="container-fluid">
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <b-alert variant="info" dismissible :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">
        <div v-html="message" />
      </b-alert>
      <analysis-search :fromHeatmap="fromHeatmap"/>
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
      let positions = 
        _.reduce(this.positionHistories, (ary, hist) => {
          if (ary[hist.posId]) {
            ary[hist.posId].value++
          } else {
            ary[hist.posId] = {
              posId: hist.posId,
              x: hist.x,
              y: hist.y,
              value: 1,
            }
          }
          return ary
        }, [])
      console.log(positions)
      positions = _.compact(positions)  
      return positions
    }
  },
  mounted() {
    this.heatmap = this.$refs.heatmap
    this.fetchData()
  },
  methods: {
    async display(param) {
      if(param.errorMessage){
        this.message = param.errorMessage
        this.showAlert = true
        return
      }
      try {
        const form = param.form
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
          return
        }
        this.positionHistories = results
        console.log(this.heatmapData)

        let heatmap = h337.create({
          container: document.getElementById('heatmap')
        })
        heatmap.setData({
          max: 5,
          data: this.heatmapData
        })
      } catch (e) {
        console.error(e)
      }
    },
    reset() {
      this.fetchData()
    },
    async fetchData(payload) {
      try {
        console.log('fetchData start.')

         // <- 今はここが動かない。

        

        // map.onload = (evt) => {
        //   console.log('in onload...')
        //   const size = this.calcFitSize(map, heatmap.parentElement)
        //   map.width = size.width
        //   map.height = size.height
        //   console.log(size)
          
          
        // }

        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      //this.replace({showProgress: false})
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