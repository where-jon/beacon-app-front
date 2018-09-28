<template>
  <div class="container">
    <breadcrumb :items="items" :reload="true" />
    <b-row align-h="end">
      <b-col md="2" class="mb-3 mr-3">
        <b-button :variant='getTheme' @click="download()" v-t="'label.download'" />
      </b-col>
    </b-row>
    <div class="table-area">
      <vue-scrolling-table>
        <template slot="thead">
          <th scope="col"
          v-for="(val, key) in ['btx_id','device_id','pos_id','phase','power_level','updatetime','nearest1','nearest2','nearest3']"
          :key="key" >{{ val }}</th>
        </template>
        <template slot="tbody">
          <tr v-for="(pos, index) in positions" :key="index" :class="{undetect: isUndetect(pos.updatetime)}">
            <td scope="row">{{ pos.btx_id }}</td>
            <td>{{ pos.device_id }}</td>
            <td>{{ pos.pos_id }}</td>
            <td variant="danger" >{{ pos.phase }}</td>
            <td>{{ pos.power_level }}</td>
            <td>{{ pos.updatetime }}</td>
            <td v-for="index in [0,1,2]" :key="index">
              <div v-if="pos.nearest && pos.nearest[index]">
                <div v-for="(value, key) in pos.nearest[index]" :key="key">
                  {{ key }}:{{ value }}
                </div>
              </div>
            </td>
          </tr>
        </template>
      </vue-scrolling-table>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import { EventBus } from '../../sub/helper/EventHelper'
import { EXB, DISP, APP } from '../../sub/constant/config'
import breadcrumb from '../../components/breadcrumb.vue'
import VueScrollingTable from "vue-scrolling-table"
import { getTheme } from '../../sub/helper/ThemeHelper'

export default {
  components: {
    breadcrumb,
    VueScrollingTable,
  },
  data () {
    return {
      items: [
        {
          text: this.$i18n.t('label.monitor'),
          active: true
        },
        {
          text: this.$i18n.t('label.position'),
          active: true
        }
      ]
    }
  },
  computed: {
    getTheme () {
      const theme = getTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
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
      this.replace({showProgress: true})
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
      this.replace({showProgress: false})
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
  @import "../../sub/constant/scrolltable.scss";
</style>