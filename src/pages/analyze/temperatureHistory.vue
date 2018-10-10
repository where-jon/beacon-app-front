<template>
  <div>
    <breadcrumb :items="items" :reload="true" />
    <div class="container">
      <b-row>
        <b-col md="8" offset-md="2">
          <b-form>
            <b-form-group>
              <label v-t="'label.zoneType'" />
              <v-select v-model="selectedCategory" :options="categoryOptions" :on-change="categoryChange" required class="ml-2"></v-select>
            </b-form-group>
            <b-form-group>
              <label v-t="'label.zoneName'" />
              <v-select v-model="zone" :options="zoneOptions" required class="ml-2"></v-select>
            </b-form-group>
            <b-form-group>
              <label v-t="'label.analyzeMonth'" />
              <b-form-input type="date" required />
              ～
              <b-form-input type="date" required />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.analyzeType'" />
              <v-select :options="analyzeTypeOptions" required class="ml-2"></v-select>
            </b-form-group>
            <b-button size="sm" variant="info" v-t="'label.download'" ></b-button> 
          </b-form>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import { EventBus } from '../../sub/helper/EventHelper'
import { EXB, DISP, APP } from '../../sub/constant/config'
import breadcrumb from '../../components/breadcrumb.vue'
import { getTheme } from '../../sub/helper/ThemeHelper'

export default {
  components: {
    breadcrumb,
  },
  data () {
    return {
      items: [
        {
          text: this.$i18n.t('label.analyze'),
          active: true
        },
        {
          text: this.$i18n.t('label.temperatureHistory'),
          active: true
        }
      ],
      selectedCategory: "",
      categoryList: [{label:"", value:null}],
      zone: null,
      zones: null,
      zoneList: [{label:"", value:null}],
    }
    
  },
  computed: {
    categoryOptions() {
      return this.categoryList
    },
    zoneOptions() {
      return this.zoneList
    },
    analyzeTypeOptions() {
      return [
        {label:this.$i18n.t('label.analyzeType0'), value:0},
        {label:this.$i18n.t('label.analyzeType1'), value:1},
      ]
    },
    getTheme () {
      const theme = getTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    ...mapState('monitor', [
      'temperatureHistory',
    ])
  },
  mounted() {
    this.fetchData()
    this.replace({title: this.$i18n.t('label.temperatureHistory')})
  },
  created() {
    EventBus.$on('reload', (payload)=>{
       this.fetchData(payload)
    })
  },
  methods: {
    async fetchData(payload) {
      try {
        let categorys = await AppServiceHelper.fetchList2(
          '/basic/category',
          '/basic/category/',
          'categoryId'
        )
        if (payload && payload.done) {
          payload.done()
        }
        this.categoryList = []
        categorys.forEach(elm => {
          if (elm.categoryType == 2) {
            this.categoryList.push({
              label: elm.categoryName,
              value: elm.categoryId/1
            })
          }
        });
        //
        this.zones = await AppServiceHelper.fetchList2(
          '/core/zone',
          '/core/zone',
          'zoneId'
        )
        if (payload && payload.done) {
          payload.done()
        }
        this.zoneList = []
        this.zones.forEach(elm => {
          this.zoneList.push({
            label: elm.zoneName,
            value: elm.zoneId
          })          
        })
      } catch(e) {
        console.error(e)
      }
    },
    categoryChange(val) {
      if (val == undefined || val.value == undefined) { return }
      this.$emit('input', val)
      this.zoneList = []
      this.zones.forEach(elm => {
        if (elm.categoryId == val.value) {
          this.zoneList.push({
            label: elm.zoneName,
            value: elm.zoneId
          })
        }
      })
      this.zone = ""
    },
    download() {
      HtmlUtil.fileDL(
        "temperatureHistory.csv",
        Util.converToCsv(this.temperatureHistory)
      )
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
</style>
