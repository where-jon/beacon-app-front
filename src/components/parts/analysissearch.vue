<template>
  <div class="mapContainer mb-5">
    <div class="container">
      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row>
            <b-form-row class="mb-3">
              <label v-t="'label.area'" class="mr-2 mb-2"/>
              <b-form-select v-model="form.areaId" :options="areaOptions" @change="changeArea" class="inputSelect" required />
            </b-form-row>
          </b-form-row>
        </b-form-group>          
      </b-form>
      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row>
            <b-form-row v-if="enableGroup" class="mb-3 mr-5">
              <label v-t="'label.group'" class="mr-2" />
              <b-form-select v-model="form.groupId" :options="groupOptions" @change="changeGroup" class="mr-2 inputSelect" />
            </b-form-row>
            <b-form-row class="mb-3 mr-2">
              <label v-t="'label.individual'" class="mr-2" />
              <b-form-select v-model="form.potId" :options="potOptions" class="mr-2 inputSelect" />
            </b-form-row>
          </b-form-row>
        </b-form-group>
      </b-form>
      <b-form inline @submit.prevent>
        <b-form-group class="mr-5">
          <b-form-row>
            <b-form-row class="mb-3 mr-2">
              <label v-t="'label.historyDateFrom'" class="mr-2"/>
              <date-picker v-model="form.datetimeFrom" type="datetime" :clearable="false" @change="changeDatetimeFrom" class="mr-2 inputdatefrom" required/>
            </b-form-row>
            <b-form-row class="mb-3 mr-2">
              <label v-t="'label.historyDateTo'" class="mr-2" />
              <date-picker v-model="form.datetimeTo" type="datetime" :clearable="false" class="mr-2 inputdateto" required/>
            </b-form-row>
          </b-form-row>
        </b-form-group>
        <b-form-group>
          <b-form-row class="mb-3 mr-2">
            <b-button :variant="theme" @click="display" v-t="'label.display'" />
          </b-form-row>
        </b-form-group>
      </b-form>
      <b-row>
        <canvas id="map" ref="map" v-if="!fromHeatmap"/>
      </b-row>
    </div>
    <div id="heatmap" ref="heatmap" v-if="fromHeatmap" />
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import { Container } from '@createjs/easeljs/dist/easeljs.module'
import locale from 'element-ui/lib/locale'
import * as Util from '../../sub/util/Util'
import { getTheme } from '../../sub/helper/ThemeHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import { APP } from '../../sub/constant/config.js'
import { CATEGORY } from '../../sub/constant/Constants'
import showmapmixin from '../mixin/showmapmixin.vue'
import validatemixin from '../mixin/validatemixin.vue'

export default {
  mixins: [showmapmixin, validatemixin],
  components: {
    DatePicker,
  },
  props: {
    fromHeatmap: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      form: {
        areaId: null,
        groupId: null,
        potId: null,
        datetimeFrom: null,
        datetimeTo: null,
      },
      groupOptions: [],
      potOptions: [],
      interval: 24 * 60 * 60 * 1000,
      intervalHours: 24,
      container: null,
      isShownFlowline: false,
    }
  },
  computed: {
    theme () {
      const theme = getTheme()
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'areas',
      'groups',
      'pots',
    ]),
    enableGroup () {
      return this.isEnabledMenu("group")
    },
  },
  async created() {
    await StateHelper.load('area')
    await StateHelper.load('group')
    await StateHelper.load('pot')
    this.groupOptions = Util.getOptions("group", this.groups)
    this.changeGroup()
    this.form.areaId = this.areas? this.areas[0].areaId: null
    this.changeArea(this.form.areaId)
    const date = new Date()
    this.form.datetimeFrom = this.getDatetime(date, {hours: -1})
    this.form.datetimeTo = this.getDatetime(date)
  },
  mounted() {
    import(`element-ui/lib/locale/lang/${this.$i18n.locale}`).then( (mojule) =>{
      locale.use(mojule.default)
    })
  },
  methods: {
    getDatetime(baseDatetime, controlData){
      const datetime = new Date(baseDatetime.getTime())
      datetime.setMilliseconds(0)
      if(!controlData){
        return datetime
      }
      datetime.setFullYear(datetime.getFullYear() + (controlData.year? controlData.year: 0))
      datetime.setDate(datetime.getDate() + (controlData.date? controlData.date: 0))
      datetime.setHours(datetime.getHours() + (controlData.hours? controlData.hours: 0))
      datetime.setMinutes(datetime.getMinutes() + (controlData.minutes? controlData.minutes: 0))
      datetime.setSeconds(datetime.getSeconds() + (controlData.seconds? controlData.seconds: 0))
      return datetime
    },
    changeGroup(newVal = this.form.groupId) {
      const options = this.pots.filter((val) => 
        val.potType == CATEGORY.getTypes()[0].value && (!newVal || val.groupId == newVal)
      )
      this.potOptions = Util.getOptions("pot", options)
      if(!this.potOptions.find((val) => val.value == this.form.potId)){
        this.form.potId = null
      }
    },
    changeDatetimeFrom(newVal = this.form.datetimeFrom) {
      if(newVal){
        this.form.datetimeTo = this.getDatetime(newVal, {minutes: APP.ANALYSIS_DATETIME_INTERVAL})
      }
      else{
        this.form.datetimeTo = null
      }
    },
    validate() {
      const errors = this.validateCheck([
        {type: "require", names: ["area"], values: [this.form.areaId]},
        {type: "require", names: [this.enableGroup? "group": null, "individual"].filter((val) => val), values: [this.enableGroup? this.form.groupId: null, this.form.potId].filter((val) => val)},
        {type: "require", names: ["historyDateFrom"], values: [this.form.datetimeFrom]},
        {type: "require", names: ["historyDateFrom"], values: [this.form.datetimeTo]},
        this.form.datetimeFrom && this.form.datetimeTo? {type: "asc", names: ["historyDateFrom"], values: [this.form.datetimeFrom.getTime(), this.form.datetimeTo.getTime()], equal: false}: null,
        this.form.datetimeFrom && this.form.datetimeTo? {type: "less", names: ["historyDateFrom"], values: [this.form.datetimeFrom.getTime() * -1, this.form.datetimeTo.getTime()], base: this.interval, displayBase: this.intervalHours, equal: true}: null,
      ].filter((val) => val))
      return this.formatValidateMessage(errors)
    },
    async display() {
      this.container ? this.container.removeAllChildren() : null
      this.isShownFlowline = 
          await this.$parent.$options.methods.display.call(this.$parent, {view: this.container, form: this.form, errorMessage: this.validate(), mapScale: this.mapImageScale})
      this.stage ? this.stage.update() : null
    },
    showMapImage() {
      // 地図ダブルタップ時のみ利用
      this.fetchData()
    },
    reset() {
      this.isShownMapImage = false
      if (this.fromHeatmap) {
        this.fetchDataHeatmap()
      }
    },
    async fetchData(payload){
      try {
        this.replace({showProgress: true})

        this.fromHeatmap ? this.fetchDataHeatmap() : this.fetchDataFlowline()

        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    },
    fetchDataFlowline(){
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
        if (this.isShownFlowline) {
          this.display()
        }
      })
    },
    fetchDataHeatmap(){
      const map = new Image()
      map.src = this.mapImage

      this.$emit('resetHeatmap')
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
      }
    },
  }
}
</script>

<style scoped lang="scss">
.inputSelect {
  min-width: 160px;
}
.inputdatefrom {
  width: 200px;
}
.inputdateto {
  width: 200px;
}
div#heatmap {
  display: inline-block;
}
</style>
