<template>
  <div class="container scroll">
  <main class="bd-content">
    <p></p>
    <b-row align-h="end">
      <b-col md="2" class="mb-3 mr-3">
        <b-button variant='outline-primary' @click="download()" v-t="'label.download'" />
      </b-col>
    </b-row>
      <table class="table table-hover table-bordered">
        <thead>
          <tr>
            <th scope="col">btx_id</th>
            <th scope="col">device_id</th>
            <th scope="col">pos_id</th>
            <th scope="col">phase</th>
            <th scope="col">power_level</th>
            <th scope="col">updatetime</th>
            <th scope="col">nearest1</th>
            <th scope="col">nearest2</th>
            <th scope="col">nearest3</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(pos, index) in positions" :key="index" :class="{undetect: isUndetect(pos.updatetime)}">
            <td scope="row">{{ pos.btx_id }}</td>
            <td>{{ pos.device_id }}</td>
            <td>{{ pos.pos_id }}</td>
            <td variant="danger" >{{ pos.phase }}</td>
            <td>{{ pos.power_level }}</td>
            <td>{{ pos.updatetime }}</td>
            <td v-for="index in [0,1,2]" :key="index">
              <table v-if="pos.nearest && pos.nearest[index]" class="table-sm borderless">
                <tr v-for="(value, key) in pos.nearest[index]" :key="key">
                  <td>{{ key }}</td>
                  <td>{{ value }}</td>
                </tr>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </main>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import { EventBus } from '../../sub/helper/EventHelper'
import { EXB, DISP, APP } from '../../sub/constant/config'

export default {
  computed: {
    ...mapState('monitor', [
      'positions',
    ])
  },
  mounted() {
    this.fetchData()
    this.replace({title: this.$i18n.t('label.position')})
  },
  created(){
    EventBus.$on('reload', (payload)=>{
       this.fetchData(payload)
    })
  },
  methods: {
    async fetchData(payload) {
      try {
        let positions = await EXCloudHelper.fetchRawPosition()
        if (payload && payload.done) {
          payload.done()
        }
        this.replaceMonitor({positions})
      }
      catch(e) {
        console.error(e)
      }
    },
    isUndetect(updated) {
      return updated == "" || new Date() - new Date(updated) > APP.UNDETECT_TIME
    },
    download() {
      HtmlUtil.fileDL("position.csv", Util.converToCsv(this.positions, ["btx_id","device_id","pos_id","phase","power_level","updatetime","nearest"]))
    },
    ...mapMutations([
      'replace', 
    ]),
    ...mapMutations('monitor', [
      'replaceMonitor', 
    ]),
  }
}
</script>

<style scoped lang="scss">

.scroll{
  overflow: auto;
  white-space: nowrap;
}

.borderless td, .borderless th {
    border: none;
}

</style>