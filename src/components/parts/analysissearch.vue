<template>
  <div>
    <b-form inline @submit.prevent>
      <b-form-group>
        <b-form-row>
          <b-form-row class="mb-3">
            <label v-t="'label.area'" class="mr-2 mb-2" />
            <v-select v-model="vueSelected.area" :options="areaOptions" :clearable="false" class="inputSelect vue-options" />
          </b-form-row>
        </b-form-row>
      </b-form-group>          
    </b-form>
    <b-form inline @submit.prevent>
      <b-form-row>
        <b-form-group>
          <b-form-row v-if="enableCategory" class="mb-3 mr-5">
            <label v-t="'label.category'" class="mr-2" />
            <v-select v-model="vueSelected.category" :options="getCategoryOptions(showCategoryTypes)" class="mr-2 inputSelect vue-options" />
          </b-form-row>
        </b-form-group>
        <b-form-group>
          <b-form-row v-if="enableGroup" class="mb-3 mr-5">
            <label v-t="'label.group'" class="mr-2" />
            <v-select v-model="vueSelected.group" :options="groupOptions" class="mr-2 inputSelect vue-options" />
          </b-form-row>
        </b-form-group>
        <b-form-group>
          <b-form-row v-if="enableIndividual" class="mb-3 mr-2">
            <label v-t="'label.individual'" class="mr-2" />
            <v-select v-model="vueSelected.pot" :options="potOptions" class="mr-2 inputSelect vue-options" />
          </b-form-row>
        </b-form-group>
      </b-form-row>
    </b-form>
    <b-form inline @submit.prevent>
      <b-form-group class="mr-5">
        <b-form-row>
          <b-form-row class="mb-3 mr-2">
            <label v-t="'label.historyDateFrom'" class="mr-2" />
            <date-picker v-model="form.datetimeFrom" :clearable="false" type="datetime" class="mr-2 inputdatefrom" required @change="changeDatetimeFrom" />
          </b-form-row>
          <b-form-row class="mb-3 mr-2">
            <label v-t="'label.historyDateTo'" class="mr-2" />
            <date-picker v-model="form.datetimeTo" :clearable="false" type="datetime" class="mr-2 inputdateto" required />
          </b-form-row>
        </b-form-row>
      </b-form-group>
      <b-form-group>
        <b-form-row class="mb-3 mr-2">
          <b-button v-t="'label.display'" :variant="theme" @click="display" />
        </b-form-row>
      </b-form-group>
    </b-form>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import * as Util from '../../sub/util/Util'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import { getTheme } from '../../sub/helper/ThemeHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as HttpHelper from '../../sub/helper/HttpHelper'
import { APP } from '../../sub/constant/config.js'
import { CATEGORY } from '../../sub/constant/Constants'
import validatemixin from '../mixin/validatemixin.vue'
import commonmixinVue from '../mixin/commonmixin.vue'
import { EventBus } from '../../sub/helper/EventHelper'

export default {
  components: {
    DatePicker,
  },
  mixins: [validatemixin, commonmixinVue],
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
        categoryId: null,
        groupId: null,
        potId: null,
        datetimeFrom: null,
        datetimeTo: null,
      },
      vueSelected: {
        area: null,
        category: null,
        group: null,
        pot: null,
      },
      appServicePath: '/core/positionHistory',
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
      'categories',
      'groups',
      'pots',
    ]),
    showCategoryTypes () {
      return CATEGORY.POT_AVAILABLE
    },
    enableCategory () {
      return this.isEnabledMenu('category') && Util.includesIgnoreCase(APP.POT.WITH, 'category')
    },
    enableGroup () {
      return this.isEnabledMenu('group') && Util.includesIgnoreCase(APP.POT.WITH, 'group')
    },
    enableIndividual () {
      return !this.fromHeatmap || (this.fromHeatmap && APP.HEATMAP.USE_INDIVIDUAL)
    },
    requireCategory(){
      return !this.fromHeatmap
    },
    requireGroup(){
      return !this.fromHeatmap
    },
    requirePerson(){
      return !this.fromHeatmap
    }
  },
  watch: {
    'vueSelected.area': {
      handler: function(newVal, oldVal){
        this.form.areaId = Util.getValue(newVal, 'value', null)
        this.changeArea(this.form.areaId)
      },
      deep: true,
    },
    'vueSelected.category': {
      handler: function(newVal, oldVal){
        this.form.categoryId = Util.getValue(newVal, 'value', null)
        this.changeCategory()
      },
      deep: true,
    },
    'vueSelected.group': {
      handler: function(newVal, oldVal){
        this.form.groupId = Util.getValue(newVal, 'value', null)
        this.changeGroup()
      },
      deep: true,
    },
    'vueSelected.pot': {
      handler: function(newVal, oldVal){
        this.form.potId = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
  },
  async created() {
    await StateHelper.load('area')
    await StateHelper.load('category')
    await StateHelper.load('group')
    await StateHelper.load('pot')
    this.changeCategory()
    this.changeGroup()
    this.vueSelected.area = StateHelper.getVueSelectData(this.areaOptions, null, true)
    const date = new Date()
    this.form.datetimeFrom = Util.getDatetime(date, {hours: -1})
    this.form.datetimeTo = Util.getDatetime(date)

    EventBus.$on('onDisplay', (payload)=>{
      this.onDisplay()
    })
  },
  mounted() {
    HtmlUtil.importElementUI()
  },
  methods: {
    changeCategory(newVal = this.form.categoryId) {
      this.potOptions = StateHelper.getOptionsFromState('pot', false, true, 
        pot => pot.potType == CATEGORY.PERSON && (!newVal || pot.categoryId == newVal)
      )
      if(!this.potOptions.find(val => val.value == this.form.potId)){
        this.form.potId = null
      }
    },
    changeGroup(newVal = this.form.groupId) {
      this.potOptions = StateHelper.getOptionsFromState('pot', false, true, 
        pot => pot.potType == CATEGORY.PERSON && (!newVal || pot.groupId == newVal)
      )
      if(!this.potOptions.find(val => val.value == this.form.potId)){
        this.form.potId = null
      }
    },
    changeArea(areaId) {
      this.$emit('changeArea', areaId)
    },
    changeDatetimeFrom(newVal = this.form.datetimeFrom) {
      if(newVal){
        this.form.datetimeTo = Util.getDatetime(newVal, {minutes: APP.ANALYSIS.DATETIME_INTERVAL})
      }
      else{
        this.form.datetimeTo = null
      }
    },
    validate() {
      const errors = this.validateCheck([
        {type: 'require', names: ['area'], values: [this.form.areaId]},
        {type: 'require', 
          names: [(this.enableCategory && this.requireCategory)? 'category': null, (this.enableGroup && this.requireGroup)? 'group': null, this.requirePerson? 'individual': null].filter((val) => val),
          values: [this.enableCategory? this.form.categoryId: null, this.enableGroup? this.form.groupId: null, this.requirePerson? this.form.potId: null].filter((val) => val)},
        {type: 'require', names: ['historyDateFrom'], values: [this.form.datetimeFrom]},
        {type: 'require', names: ['historyDateFrom'], values: [this.form.datetimeTo]},
        this.form.datetimeFrom && this.form.datetimeTo? {type: 'asc', names: ['historyDateFrom'], values: [this.form.datetimeFrom.getTime(), this.form.datetimeTo.getTime()], equal: false}: null,
        this.form.datetimeFrom && this.form.datetimeTo? {type: 'less', names: ['historyDateFrom'], values: [this.form.datetimeFrom.getTime() * -1, this.form.datetimeTo.getTime()], base: this.interval, displayBase: this.intervalHours, equal: true}: null,
      ].filter(val => val && val.names.length >= 1))
      return this.formatValidateMessage(errors)
    },
    onDisplay(){
      this.display()
    },
    async display() {
      this.replace({showAlert: false})
      let errorMessage = this.validate()
      if (Util.hasValue(errorMessage)) {
        this.replace({showAlert: true})
        this.$emit('display', {form: this.form, results: [], errorMessage})
      } else {
        try {
          const form = this.form
          let reqParam = [
            this.appServicePath,
            form.areaId,
            form.categoryId ? form.categoryId : '0',
            form.groupId ? form.groupId : '0',
            form.potId ? form.potId : '0',
            form.datetimeFrom.getTime(),
            form.datetimeTo.getTime(),
          ].join('/')
          Util.debug(reqParam)
          const results = await HttpHelper.getAppService(reqParam)
          Util.debug(results)
          if(!results.length){
            this.replace({showAlert: true})
            errorMessage = this.$i18n.tnl('message.notFoundData', {target: this.fromHeatmap? this.$i18n.tnl('label.heatmapPosition'): this.$i18n.tnl('label.flowlineAnalysis')})
          }
          this.$emit('display', {form: this.form, results, errorMessage})
        } catch (e) {
          console.error(e)
        }
      }
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/vue.scss";
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
