<template>
  <div>
    <b-form inline @submit.prevent>
      <b-form-row class="my-1">
        <b-button type="button" :variant="theme" v-t="'label.filter'" size="sm" class="ml-sm-4 ml-2 mr-1" @click="displayDetailFilter" />
      </b-form-row>
      <b-form-row class="my-1 ml-2">
        <label v-if="filter" v-t="'label.enabled'" />
      </b-form-row>
    </b-form>
    <b-modal id="modalDetailFilter" :title="$t('label.filter')" :ok-title="$t('label.filter')" :cancel-title="$t('label.close')" @show="execInit" @ok="execOk" @hidden="execHide" >
      <div v-if="pluginHtml" id="pluginHtml" v-html="pluginHtml" />

      <span v-if="pluginJson" id="pluginJson">
        <b-form @submit.prevent>
          <b-form-row v-for="(plugin, index) in pluginJson" :key="index" class="my-2 ml-2 ml-sm-0">
            <label class="ml-sm-4 ml-2 mr-1">
              {{ $t('label.' + plugin.name) }}
            </label>
            <span v-if="useVueSelect(plugin)" :title="vueSelectTitle(plugin.value)">
              <v-select v-model="plugin.value" :options="plugin.options" class="ml-1 mr-2 vue-options" :style="vueSelectStyle">
                <template slot="selected-option" slot-scope="option">
                  {{ vueSelectCutOn(option, false) }}
                </template>
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </span>

            <span v-if="useSelect(plugin)">
              <b-form-select v-model="plugin.value" :options="plugin.options" size="sm" class="extra-filter" />
            </span>

            <span v-if="useTextBox(plugin)">
              <b-input-group>
                <input v-model="plugin.value" class="form-control form-control-sm align-self-center" :maxlength="plugin.max">
                <b-input-group-append>
                  <b-button v-t="'label.clear'" :disabled="!plugin.value" variant="secondary" class="align-self-center" @click="$set(plugin, 'value', '')" />
                </b-input-group-append>
              </b-input-group>
            </span>

            <span v-if="useNumberTextBox(plugin)">
              <b-input-group>
                <input v-model="plugin.value" type="number" class="form-control form-control-sm align-self-center text-right" :maxlength="plugin.max" :min="plugin.min" :max="plugin.max" :step="plugin.step">
              </b-input-group>
            </span>

            <span v-if="useNumberRangeBox(plugin)">
              <b-input-group>
                <input v-model="plugin.value" type="number" class="form-control form-control-sm align-self-center text-right" :maxlength="plugin.max" :min="plugin.min" :max="plugin.max" :step="plugin.step">
                <label v-if="hasValue(plugin.unit)" class="ml-sm-2 ml-1 mr-1">
                  {{ $t('label.' + plugin.unit) }}
                </label>
                <b-form-select v-model="plugin.extValue.type" :options="numberRangeOption" size="sm" class="extra-filter" />
              </b-input-group>
            </span>

            <span v-if="useDate(plugin)">
              <b-input-group>
                <date-picker v-model="plugin.value" value-format="timestamp" size="small" type="date" class="mr-2 inputdatefrom" />
              </b-input-group>
            </span>

            <span v-if="useCheckBox(plugin)">
              <b-input-group>
                <b-form-checkbox-group v-model="plugin.value" :options="plugin.options" class="ml-4" />
              </b-input-group>
            </span>

            <label v-if="hasValue(plugin.suffix)" class="ml-sm-2 ml-1 mr-1">
              {{ $t('label.' + plugin.suffix) }}
            </label>

          </b-form-row>
        </b-form>
      </span>
    </b-modal>
  </div>
</template>

<script>
import _ from 'lodash'
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import commonmixin from '../../components/mixin/commonmixin.vue'
import * as Util from '../../sub/util/Util'
import * as AppServiceHelper from '../../sub/helper/dataproc/AppServiceHelper'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import * as PluginHelper from '../../sub/helper/dataproc/PluginHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'

export default {
  components: {
    DatePicker,
  },
  mixins: [ commonmixin ],
  props: {
    pluginName: {
      type: String,
      default: '/plugin/filter',
    },
    saveFilter: {
      type: Boolean,
      default: false,
    },
    componentId: {
      type: String,
      default: 'default',
    },
  },
  data() {
    return {
      pluginHtml: null,
      pluginJson: [],
      pluginRequest: '',
      filter: false,
    }
  },
  computed: {
    vueSelected() {
      return ['area', 'category', 'group', 'tx', 'exb', 'pot', 'location', 'zone']
    },
    loadStates() { // TODO: 未使用なら削除
      return []
    },
    numberRangeOption() {
      return [
        { value: 0, text: this.$i18n.tnl('label.more') },
        { value: 1, text: this.$i18n.tnl('label.less') },
      ]
    },
    condition: {
      get() {
        const key = 'detailFilterCondition_' + this.componentId
        if(this.$store.state.main[key]){
          return JSON.parse(JSON.stringify(this.$store.state.main[key]))
        }
        return null
      },
      set(val) {
        const key = 'detailFilterCondition_' + this.componentId
        this.replaceMain({[key]: val})
      },
    },
  },
  async mounted() {
    if(this.popInit()) {
      this.condition = null
    }
    ViewHelper.importElementUI()
    this.fetchPlugin()
  },
  beforeDestroy() {
    if(this.saveFilter){
      this.condition = { ...this.$data }
    }
  },
  methods: {
    hasValue(val){
      return Util.hasValue(val)
    },
    popInit(){
      const ret = this.$store.state.main.initDetailFilter
      this.replaceMain({initDetailFilter: null})
      return ret
    },
    getOptionName(plugin){
      return Util.getValue(plugin, 'option', plugin.name)
    },
    displayDetailFilter(){
      this.$root.$emit('bv::show::modal', 'modalDetailFilter')
    },
    useVueSelect(plugin){
      return PluginHelper.isSelectTag(plugin) && (this.vueSelected.some(key => key == this.getOptionName(plugin)) || plugin.combobox != null)
    },
    useSelect(plugin){
      return PluginHelper.isSelectTag(plugin) && !this.vueSelected.some(key => key == this.getOptionName(plugin)) && plugin.combobox == null
    },
    useTextBox(plugin){
      return PluginHelper.isTextboxTag(plugin)
    },
    useNumberTextBox(plugin){
      return PluginHelper.isNumberTextboxTag(plugin)
    },
    useNumberRangeBox(plugin){
      return PluginHelper.isNumberRangeTag(plugin)
    },
    useCheckBox(plugin){
      return PluginHelper.isCheckboxTag(plugin)
    },
    useDate(plugin){
      return PluginHelper.isDateTag(plugin)
    },
    hasFilterValue(){
      return this.pluginJson.some(plugin => {
        if(this.useVueSelect(plugin)){
          return Util.hasValue(Util.getValue(plugin.value, 'value', null))
        }
        return Util.hasValue(plugin.value)
      })
    },
    async getPluginOptions(plugin){
      const optionKey = this.getOptionName(plugin)
      const options = this[optionKey + 'Options']

      const ret = options != null? options: await AppServiceHelper.fetchList(`/${this.pluginRequest}/option/${optionKey}`)
      if(plugin.lang != null){
        ret.forEach(r => {
          r.label = this.$i18n.tnl('label.' + r.label)
          r.text = this.$i18n.tnl('label.' + r.text)
        })
      }
      if(this.useSelect(plugin) && !ret.some(r => r.value == null)){
        ret.unshift({ value: null, text: '', label: '' })
      }
      return ret
    },
    reflreshPlugin(){
      this.pluginJson.forEach(async (val, index) => {
        if(this.useVueSelect(val) || this.useSelect(val) || this.useCheckBox(val)){
          this.$set(val, 'options', await this.getPluginOptions(val))
        }
        if(this.useNumberRangeBox(val)){
          this.$set(val, 'extValue', { type: 0 })
        }
      })
    },
    finalizePlugin(resultObj){
      this.pluginRequest = Util.getValue(resultObj, 'request', '')
      this.pluginJson = Util.getValue(resultObj, 'ui', [])
      this.reflreshPlugin()
    },
    fetchPlugin(){
      if(this.condition){
        Object.keys(this.$data).forEach(key => this.$set(this.$data, key, this.condition[key]))
        this.initExec()
        return
      }
      PluginHelper.load(this.pluginName, result => {
        this.pluginHtml = result
        this.$nextTick(() => {
          this.finalizePlugin(PluginHelper.convert())
          PluginHelper.rePosition()
        })
      }, result => this.finalizePlugin(JSON.parse(result)))
    },
    execInit(){
      this.pluginJson.forEach(val => {
        this.$set(val, 'oldExtValue', Util.hasValue(val.extValue)? { ...val.extValue }: {})
        if(this.useVueSelect(val)){
          this.$set(val, 'oldValue', Util.hasValue(val.value)? { ...val.value }: null)
          return
        }
        this.$set(val, 'oldValue', val.value)
      })
    },
    execHide(){
      if(!this.isOk){
        this.pluginJson.forEach(val => {
          this.$set(val, 'extValue', Util.hasValue(val.oldExtValue)? { ...val.oldExtValue }: {})
          if(this.useVueSelect(val)){
            this.$set(val, 'value', Util.hasValue(val.oldValue)? { ...val.oldValue }: null)
            return
          }
          this.$set(val, 'value', val.oldValue)
        })
      }
      this.isOk = false
    },
    createQueryParam(plugin){
      const key = '' + plugin.name + '='
      if(this.useSelect(plugin)){
        return key + (plugin.value? plugin.value: 0)
      }
      if(this.useTextBox(plugin)){
        return key + (Util.hasValue(plugin.value)? plugin.value: '')
      }
      if(this.useNumberTextBox(plugin)){
        return key + (Util.hasValue(plugin.value)? plugin.value: '')
      }
      if(this.useNumberRangeBox(plugin)){
        return key + JSON.stringify(Util.hasValue(plugin.value)? { value: plugin.value, type: plugin.extValue.type }: {})
      }
      if(this.useCheckBox(plugin)){
        return key + JSON.stringify(Util.hasValue(plugin.value)? plugin.value: [])
      }
      if(this.useDate(plugin)){
        return key + (Util.hasValue(plugin.value)? plugin.value: '')
      }
      return key + Util.getValue(plugin.value, 'value', 0)
    },
    async execOk(){
      this.isOk = true
      this.filter = this.hasFilterValue()
      if(!Util.hasValue(this.pluginRequest)){
        return
      }
      const query = this.pluginJson.map(plugin => this.createQueryParam(plugin)).join('&')
      const list = await HttpHelper.getAppService(`/${this.pluginRequest}/filter?${encodeURI(query)}${Util.hasValue(query)? '&': ''}_=${new Date().getTime()}`)
      this.$emit('detailFilter', list.map(val => val.value))
    },
    initExec(){
      this.reflreshPlugin()
      this.$nextTick(async () => {
        await this.execOk()
        this.isOk = false
      })
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/vue.scss";

  select.extra-filter {
    max-width: 10em;
  }
</style>
