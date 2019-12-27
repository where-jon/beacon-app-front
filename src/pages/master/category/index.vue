<template>
  <div class="container-fluid">
    <ex-master p-master-name="category" :p-category-name="pName" :p-type-list="pTypeList" :p-params="params" />
  </div>
</template>

<script>
import { CATEGORY } from '../../../sub/constant/Constants'
import * as StringUtil from '../../../sub/util/StringUtil'
import * as Util from '../../../sub/util/Util'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as StyleHelper from '../../../sub/helper/ui/StyleHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import exMaster from '../../../components/page/ex-master.vue'

export default {
  props: {
    pName: {
      type: String,
      default: '',
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
        id: 'categoryId',
        indexPath: this.pPath,
        editPath: this.pPath + '/edit',
        bulkEditPath: this.pPath + '/bulkedit',
        appServicePath: this.pAppServicePath,
        csvOut: true,
        fields: ViewHelper.addLabelByKey(this.$i18n, [ 
          {key: 'ID', label: 'id', sortable: true },
          {key: 'categoryName', label: StringUtil.concatCamel(this.pName, 'categoryName'), sortable: true },
          !this.pName? {key: 'categoryTypeName', label: 'categoryType', sortable: true }: null,
          this.pShowIcon? {key: 'style', label: 'display' }: null,
          {key: 'description' },
          {key: 'actions', thStyle: {width:'130px !important'} }
        ]).filter(val => val),
        sortBy: 'ID',
      },
    }
  },
  methods: {
    onSaved(){
      StateHelper.setForceFetch('pot', true)
      StateHelper.setForceFetch('tx', true)
      StateHelper.setForceFetch('zone', true)
    },
    createListParams(){
      const retMap = { categoryType: {} }
      CATEGORY.getTypes().forEach(option => retMap.categoryType[option.value? option.value.toString(): '0'] = option.text)
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
