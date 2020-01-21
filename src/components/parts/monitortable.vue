<template>
  <div>
    <b-row align-h="end">
      <!-- 絞り込みフィルタ -->
      <b-form-row class="ml-sm-4 ml-2 mr-1">
        <b-input-group >
          <label v-t="'label.filter'" class="mr-2  align-self-center" />
          <input v-model="filter.reg" class="form-control align-self-center" :maxlength="maxFilterLength">
          <b-input-group-append>
            <b-btn v-t="'label.clear'" :disabled="!filter.reg" variant="secondary" class="align-self-center" @click="filter.reg = ''" />
          </b-input-group-append>
        </b-input-group>
      </b-form-row>
      <!-- 総件数カウンタ -->
      <all-count :count="allCount" />
      <!-- ダウンロード-->
      <b-col v-if="bulkReferenceable" md="2" class="mb-3 mr-3">
        <b-button v-if="!iosOrAndroid" v-t="'label.download'" :variant="theme" @click="download()" class="download-button" />
      </b-col>
    </b-row>
    <b-table :fields="fields" :items="items" 
                  :current-page="currentPage" 
                  :per-page="perPage" 
                  :filter="filterGrid" 
                  :sort-by.sync="sortBy" 
                  :sort-compare="sortCompare" 
                  :sort-desc.sync="sortDesc" 
                  :empty-filtered-text="emptyMessage" 
                  show-empty stacked="md" 
                  striped 
                  hover 
                  outlined 
                  caption-top 
                  @filtered="onFiltered"
                  @sort-changed="() => {}"
    />
    <!-- pager -->
    <b-row>
      <b-col md="6" class="mt-1 mb-3">
        <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" class="my-0" @input="() => {}" />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import VueScrollingTable from 'vue-scrolling-table'
import * as DetectStateHelper from '../../sub/helper/domain/DetectStateHelper'
import * as TelemetryHelper from '../../sub/helper/domain/TelemetryHelper'
import * as StringUtil from '../../sub/util/StringUtil'
import * as Util from '../../sub/util/Util'
import commonmixin from '../mixin/commonmixin.vue'
import reloadmixin from '../mixin/reloadmixin.vue'
import allCount from './allcount.vue'

export default {
  components: {
    VueScrollingTable,
    allCount,
  },
  mixins: [commonmixin, reloadmixin],
  props: {
    isDev: {
      type: Boolean,
      default: false
    },
    vueTableMode: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: ''
    },
    allCount: {
      type: Number,
      default: 0
    },
    fields: {
      type: Array,
      default: () => [],
    },
    list: {
      type: Array,
      default: () => [],
    },
    trClass: {
      type: Function,
      default: () => ''
    },
    tdClass: {
      type: Function,
      default: () => ''
    },
    perPage: {
      type: [String, Number],
      default: 10,
    },
    maxFilterLength: {
      type: [String, Number],
      default: 20,
    },
},
  data () {
    return {
      badgeClassPrefix: 'badge badge-pill badge-',
      currentPage: 1,
      totalRows: 0,
      filter: {
        reg: '',
      },
      emptyMessage: this.$i18n.tnl('message.listEmpty'),
      sortBy: null,
      sortDesc: false,
      sortCompare: (aData, bData, key) => this.sortCompareCustom(aData, bData, key),
    }
  },
  computed: {
    items() {
      return this.list.map(item => {
        return _.reduce(item, (result, val  , key) => {
          result[key] =  StringUtil.cutOnLong(val, 50)
          return result
        }, {})
      })
    },
  },
  methods: {
    getTelemetryPowerLevelClass(val, isPowerState = false){
      return TelemetryHelper.getTelemetryPowerLevelClass(val, isPowerState)
    },
    getStateClass(type, updatetime) {
      return this.badgeClassPrefix + DetectStateHelper.getClass(DetectStateHelper.getStateFromDetail(type, updatetime))
    },
    getStateLabel(type, updatetime) {
      return DetectStateHelper.getLabel(DetectStateHelper.getStateFromDetail(type, updatetime))
    },
    getPositionPowerLevelLabel(val) {
      const powerLevel = TelemetryHelper.getPositionPowerLevel(val)
      if (powerLevel) {
        return this.$i18n.tnl('label.power-' + powerLevel)
      }
      return '-'
    },
    getPositionPowerLevelClass(val) {
      const LEVEL_CLASS_MAP = {good:'success', warning:'warning', poor:'danger'}
      const powerLevel = TelemetryHelper.getPositionPowerLevel(val)
      if (powerLevel) {
        return this.badgeClassPrefix + LEVEL_CLASS_MAP[powerLevel]
      }
      return ''
    },
    async fetchData(payload) {
      if(this.$parent.$options.methods && this.$parent.$options.methods.fetchData){
        await this.$parent.$options.methods.fetchData.call(this.$parent, payload)
      }
    },
    download() {
      this.$parent.$options.methods.download.call(this.$parent)
    },
    filterGridGeneral(originItem){
      if(originItem.isParent){
        return this.items.find(item => !item.isParent && item.categoryKey == originItem.categoryKey && this.filterGrid(item))? true: false
      }
      if(!this.filter.reg){
        return true
      }
      try{
        const regExp = new RegExp('.*' + this.filter.reg + '.*', 'i')
        const param = this.fields.filter(field => Util.getValue(field, 'filterable', true)).concat(this.addFilterFields? this.addFilterFields.map(field => ({key: field})): []).map(val => Util.getValue(originItem, val.key, ''))
        return regExp.test(JSON.stringify(param))
      }
      catch(e){
        return false
      }
    },
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length
      this.currentPage = 1
    },
    filterGrid(originItem) {
      const regBool = this.filterGridGeneral(originItem)
      return regBool
    },
    sortCompareCustom(aData, bData, key){
      return this.defaultSortCompare(aData, bData, key)
    },
}
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/scrolltable.scss";

div.table-area {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

tbody {
  display:block;
  height:400px;
  overflow:auto;
  min-width: 530px;
}

thead, tbody tr {
  display:table;
  width:100%;
  table-layout:fixed;
}

td {
  word-break: break-all;
}

span.badge {
  margin-right: 0px;
}

td.exb-state {
  padding: 0.75rem 0rem 0.75rem 0rem;
}

thead {
  width: calc( 100% - 1em )
}

.power-safe {
  color: #28a745;
}

.power-warning {
  color: #ffd700;
}

.power-empty {
  color: #f17777;
}

.download-button{
  width: 128px;
}
</style>
