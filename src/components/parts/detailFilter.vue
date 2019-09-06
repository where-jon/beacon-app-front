<template>
  <div>
    <b-button type="button" :variant="theme" v-t="'label.detailFilter'" size="sm" class="ml-sm-4 ml-2 mr-1" @click="displayDetailFilter" />
    <b-modal id="modalDetailFilter" :title="$t('label.detailFilter')" :ok-title="$t('label.search')" :cancel-title="$t('label.cancel')" @show="execInit" @ok="execOk" @hidden="execHide" >
      <div v-if="pluginHtml" id="pluginHtml" v-html="pluginHtml" />

      <span v-if="pluginJson" id="pluginJson">
        <b-form @submit.prevent>
          <b-form-row v-for="(plugin, index) in pluginJson" :key="index" class="my-1 ml-2 ml-sm-0">
            <label class="ml-sm-4 ml-2 mr-1">
              {{ $t('label.' + plugin.name) }}
            </label>
            <span v-if="useVueSelect(plugin)" :title="vueSelectTitle(plugin.value)">
              <v-select v-model="plugin.value" :options="plugin.options" class="ml-1 mr-2 vue-options" :style="vueSelectStyle">
                <template slot="selected-option" slot-scope="option">
                  {{ vueSelectCutOn(option, true) }}
                </template>
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </span>

            <span v-if="useSelect(plugin)">
              <b-form-select v-model="plugin.value" :options="plugin.options" class="extra-filter" />
            </span>

            <span v-if="useTextBox(plugin)">
              <b-input-group>
                <input v-model="plugin.value" class="form-control align-self-center" :maxlength="plugin.max">
                <b-input-group-append>
                  <b-button v-t="'label.clear'" :disabled="!plugin.value" variant="secondary" class="align-self-center" @click="$set(plugin, 'value', '')" />
                </b-input-group-append>
              </b-input-group>
            </span>
          </b-form-row>
        </b-form>
      </span>
    </b-modal>
  </div>
</template>

<script>
import _ from 'lodash'
import commonmixin from '../../components/mixin/commonmixin.vue'
import * as Util from '../../sub/util/Util'
import * as AppServiceHelper from '../../sub/helper/dataproc/AppServiceHelper'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import * as PluginHelper from '../../sub/helper/dataproc/PluginHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'

export default {
  mixins: [ commonmixin ],
  props: {
    pluginName: {
      type: String,
      default: '/plugin/filter',
    },
  },
  data() {
    return {
      pluginHtml: null,
      pluginJson: [],
      pluginRequest: '',
    }
  },
  computed: {
    vueSelected() {
      return ['area', 'category', 'group', 'tx', 'exb', 'pot', 'location', 'zone']
    },
    loadStates() {
      return ['area', 'category', 'group', 'tx', 'exb', 'pot', 'location', 'zone', 'sensor']
    },
  },
  async mounted() {
    await Promise.all(this.loadStates.map(StateHelper.load))
    this.fetchPlugin()
  },
  methods: {
    displayDetailFilter(){
      this.$root.$emit('bv::show::modal', 'modalDetailFilter')
    },
    useVueSelect(plugin){
      return PluginHelper.isSelectTag(plugin) && this.vueSelected.some(key => key == plugin.name)
    },
    useSelect(plugin){
      return PluginHelper.isSelectTag(plugin) && !this.vueSelected.some(key => key == plugin.name)
    },
    useTextBox(plugin){
      return PluginHelper.isTextboxTag(plugin)
    },
    getPluginOptions(plugin){
      const optionKey = Util.getValue(plugin, 'option', plugin.name)
      if(Util.hasValue(this[optionKey + 'Options'])){
        return this[optionKey + 'Options']
      }
      return AppServiceHelper.fetchList(`/${this.pluginRequest}/option/${optionKey}`)
    },
    finalizePlugin(resultObj){
      this.pluginRequest = Util.getValue(resultObj, 'request', '')
      this.pluginJson = Util.getValue(resultObj, 'ui', [])
      this.pluginJson.forEach(async val => {
        if(this.useVueSelect(val) || this.useSelect(val)){
          this.$set(val, 'options', await this.getPluginOptions(val))
        }
      })
    },
    fetchPlugin(){
      PluginHelper.load(this.pluginName, result => {
        this.pluginHtml = result
        this.$nextTick(() => {
          this.finalizePlugin(PluginHelper.convert())
          PluginHelper.rePosition()
        })
      }, result => this.finalizePlugin(JSON.parse(result)))
    },
    execInit(){
      this.pluginJson.forEach(val => val.oldValue = _.cloneDeep(val.value))
    },
    execHide(){
      if(!this.isOk){
        this.pluginJson.forEach(val => val.value = _.cloneDeep(val.oldValue))
      }
      this.isOk = false
    },
    async execOk(){
      this.isOk = true
      if(!Util.hasValue(this.pluginRequest)){
        return
      }
      const query = this.pluginJson.map(plugin => {
        const key = '' + plugin.name + '='
        if(this.useSelect(plugin)){
          return key + (plugin.value? plugin.value: 0)
        }
        if(this.useTextBox(plugin)){
          return key + (Util.hasValue(plugin.value)? plugin.value: '')
        }
        return key + Util.getValue(plugin.value, 'value', 0)
      }).join('&')
      const list = await HttpHelper.getAppService(`/${this.pluginRequest}/filter?${encodeURI(query)}${Util.hasValue(query)? '&': ''}_=${new Date().getTime()}`)
      this.$emit('detailFilter', list.map(val => val.value))
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
