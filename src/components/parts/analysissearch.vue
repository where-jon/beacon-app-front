<template>
  <div>
    <b-form inline @submit.prevent>
      <b-form-group>
        <b-form-row>
          <b-form-row class="mb-3">
            <label v-t="'label.area'" class="mr-2 mb-2"/>
            <b-form-select v-model="form.areaId" :options="areaOptions"  class="inputSelect" required />
          </b-form-row>
        </b-form-row>
      </b-form-group>          
    </b-form>
    <b-form inline @submit.prevent>
      <b-form-row>
        <b-form-group>
          <b-form-row v-if="enableGroup" class="mb-3 mr-5">
            <label v-t="'label.group'" class="mr-2" />
            <b-form-select v-model="form.groupId" :options="groupOptions" @change="changeGroup" class="mr-2 inputSelect" />
          </b-form-row>
        </b-form-group>
        <b-form-group>
          <b-form-row class="mb-3 mr-2">
            <label v-t="'label.individual'" class="mr-2" />
            <b-form-select v-model="form.potId" :options="potOptions" class="mr-2 inputSelect" />
          </b-form-row>
        </b-form-group>
      </b-form-row>
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
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale'
import * as Util from '../../sub/util/Util'
import { getTheme } from '../../sub/helper/ThemeHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as HttpHelper from '../../sub/helper/HttpHelper'
import { APP } from '../../sub/constant/config.js'
import { CATEGORY } from '../../sub/constant/Constants'
import validatemixin from '../mixin/validatemixin.vue'
import commonmixinVue from '../mixin/commonmixin.vue'

export default {
  mixins: [validatemixin, commonmixinVue],
  components: {
    DatePicker,
  },
  props: {
    fromHeatmap: {
      type: Boolean,
      default: false,
    },
    areaOptions: {
      type: Array,
      required: true,
    }
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
      appServicePath: '/core/positionHistory',
      groupOptions: [],
      potOptions: [],
      interval: 24 * 60 * 60 * 1000,
      intervalHours: 24,
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
      return this.isEnabledMenu("group") && APP.POT_WITH_GROUP
    },
    requirePerson(){
      return !this.fromHeatmap
    }
  },
  watch: {
    'form.areaId' : function(newAreaId, oldAreaId){
      this.changeArea(newAreaId)
    }
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
    changeArea(areaId) {
      this.$emit("changeArea", areaId)
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
        {type: "require", 
          names: [this.enableGroup? "group": null, this.requirePerson? "individual": null].filter((val) => val),
          values: [this.enableGroup? this.form.groupId: null, this.requirePerson? this.form.potId: null].filter((val) => val)},
        {type: "require", names: ["historyDateFrom"], values: [this.form.datetimeFrom]},
        {type: "require", names: ["historyDateFrom"], values: [this.form.datetimeTo]},
        this.form.datetimeFrom && this.form.datetimeTo? {type: "asc", names: ["historyDateFrom"], values: [this.form.datetimeFrom.getTime(), this.form.datetimeTo.getTime()], equal: false}: null,
        this.form.datetimeFrom && this.form.datetimeTo? {type: "less", names: ["historyDateFrom"], values: [this.form.datetimeFrom.getTime() * -1, this.form.datetimeTo.getTime()], base: this.interval, displayBase: this.intervalHours, equal: true}: null,
      ].filter((val) => val && val.names.length >= 1))
      return this.formatValidateMessage(errors)
    },
    async display() {
      let errorMessage = this.validate()
      if (errorMessage) {
         this.$emit("display", {form: this.form, results: [], errorMessage})
      } else {
        try {
          const form = this.form
          let reqParam = [
            this.appServicePath,
            form.areaId,
            form.groupId ? form.groupId : '0',
            form.potId ? form.potId : '0',
            form.datetimeFrom.getTime(),
            form.datetimeTo.getTime(),
          ].join('/')
          Util.debug(reqParam)
          const results = await HttpHelper.getAppService(reqParam)
          Util.debug(results)
          if(!results.length){
            errorMessage = this.$i18n.tnl("message.notFoundData", {target: this.$i18n.tnl("label.heatmapPosition")})
          }
          this.$emit("display", {form: this.form, results, errorMessage})
        } catch (e) {
          console.error(e)
        }
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
</style>
