<template>
  <div class="container-fluid">
    <ex-master p-master-name="category" :p-category-name="pName" :p-type-list="pTypeList" :p-params="params" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import { CATEGORY, SHAPE, BULK } from '../../../sub/constant/Constants'
import * as ColorUtil from '../../../sub/util/ColorUtil'
import * as StringUtil from '../../../sub/util/StringUtil'
import * as Util from '../../../sub/util/Util'
import * as ExtValueHelper from '../../../sub/helper/domain/ExtValueHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as MasterHelper from '../../../sub/helper/domain/MasterHelper'
import * as StyleHelper from '../../../sub/helper/ui/StyleHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import exMaster from '../../../components/page/ex-master.vue'

export default {
  props: {
    pName: {
      type: String,
      default: '',
    },
    pShowAuth: {
      type: Boolean,
      default: false,
    },
    pShowDescription: {
      type: Boolean,
      default: true,
    },
    pShowIcon: {
      type: Boolean,
      default: true,
    },
    pPath: {
      type: String,
      default: '/master/category',
    },
    pAppServicePath: {
      type: String,
      default: '/basic/category',
    },
    pTypeList: {
      type: Array,
      default: () => [CATEGORY.PERSON, CATEGORY.THING, CATEGORY.ZONE, CATEGORY.OTHER],
    },
  },
  components: {
    exMaster,
  },
  data() {
    return {
      params: {
        name: 'category',
        dispName: StringUtil.concatCamel('category', this.pName),
        id: 'categoryId',
        indexPath: this.pPath,
        editPath: this.pPath + '/edit',
        bulkEditPath: this.pPath + '/bulkedit',
        appServicePath: this.pAppServicePath,
        csvOut: true,
        fields: this.getFields(),
        sortBy: 'ID',
      },
    }
  },
  methods: {
    getFields(){
      return ViewHelper.addLabelByKey(this.$i18n, [ 
        { key: 'ID', label: 'id', sortable: true },
        { key: 'categoryName', label: StringUtil.concatCamel(this.pName, 'categoryName'), sortable: true },
        !this.pName? { key: 'categoryTypeName', label: 'categoryType', sortable: true }: null
      ].concat(this.createCustomColumn())
        .concat([
          this.pShowIcon? { key: 'style', label: 'display' }: null,
          this.pShowAuth? { key: 'guardNames' , label: 'zoneGuard' }: null,
          this.pShowAuth? { key: 'doorNames' , label: 'zoneDoor' }: null,
          this.pShowDescription? { key: 'description' }: null,
        ])
        .concat([ {key: 'actions', thStyle: {width:'130px !important'} } ])
        .filter(val => val))
    },
    createCustomColumn(isDownload){
      const ret = []
      APP.CATEGORY.WITH.forEach(val => {
        if(!isDownload && !ExtValueHelper.isShowList(APP.CATEGORY, val)) {
          return
        }
        ret.push({key: val, label: val, sortable: true})
      })
      return ret
    },
    getCustumCsvColumns(){
      return [
          'ID', 'categoryName', 'categoryTypeName'
      ].concat(this.createCustomColumn(true).map(val => val.key))
        .concat(['color', 'bgColor', 'display.shape', 'description',
          this.pShowAuth? 'guardNames': null,
          this.pShowAuth? 'doorNames': null
        ])
        .filter(val => val)
    },
    async Saved(){
    },
    createListParams(){
      const retMap = { categoryType: {} }
      CATEGORY.getTypes(true).forEach(option => retMap.categoryType[option.value? option.value.toString(): '0'] = option.text)
      return retMap
    },
    style(row) {
      return StyleHelper.getStyleDisplay1(row)
    },
  }
}
</script>

<style scoped lang="scss">

</style>
