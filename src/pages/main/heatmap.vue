<template>
  <div id="mapContainer" class="container-fluid">
    <breadcrumb :items="items" :reload="true" />
    <b-row class="mt-2">
      <b-form inline class="mt-2">
        <label class="ml-3 mr-2">{{ $t('label.area') }}</label>
        <b-form-select v-model="selectedArea" :options="areaOptions" @change="changeArea" required class="ml-2"></b-form-select>
      </b-form>
    </b-row>
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
import * as StateHelper from '../../sub/helper/StateHelper'
import { DEV, DISP, APP } from '../../sub/constant/config'
import { SENSOR } from '../../sub/constant/Constants'
import * as Util from '../../sub/util/Util'
import { Shape, Stage, Container, Bitmap, Text, Touch } from '@createjs/easeljs/dist/easeljs.module'
import { Tween, Ticker } from '@createjs/tweenjs/dist/tweenjs.module'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'

export default {
  mixins: [showmapmixin],
  components: {
    breadcrumb,
  },
  data() {
     return {
       keepExbPosition: false,
       toggleCallBack: () => {
        this.keepExbPosition = true
      },
      items: [
        {
          text: this.$i18n.tnl('label.main'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.pir'),
          active: true
        },
      ],
    }
  },
  computed: {
  },
  mounted() {
    this.replace({title: this.$i18n.tnl('label.pir')})
    this.fetchData()
  },
  methods: {
    reset() {
      this.fetchData()
    },
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        console.log('fetchData start.')
        await StateHelper.load('area')

        const map = new Image()
        map.src = this.mapImage

        let heatmap = document.getElementById('heatmap')
        while (heatmap.firstChild) {
          heatmap.removeChild(heatmap.firstChild)
        }
        heatmap.appendChild(map)

        map.onload = (evt) => {
          console.log('in onload...')
          const size = this.calcFitSize(map, heatmap.parentElement)
          map.width = size.width
          map.height = size.height
          console.log(size)
          
          heatmap = h337.create({
            container: heatmap
          })
          heatmap.setData({
            max: 20,
            data: [
              { x: 10, y: 15, value: 5},
              { x: 20, y: 25, value: 7},
              { x: 30, y: 35, value: 10},
              { x: 40, y: 45, value: 15},
              { x: 50, y: 55, value: 18},
              { x: 50, y: 65, value: 20},
              { x: 500, y: 370, value: 5},
              { x: 500, y: 380, value: 7},
              { x: 500, y: 390, value: 10},
              { x: 500, y: 400, value: 15},
              { x: 500, y: 430, value: 18},
              { x: 500, y: 450, value: 20},
            ]
          })
        }

        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
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