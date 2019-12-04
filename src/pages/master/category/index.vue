<template>
  <div class="container-fluid">
    <ex-master p-master-name="category" :p-category-name="pName" :p-type-list="pTypeList" :p-params="params" :p-list="categoryList" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { CATEGORY, BULK } from '../../../sub/constant/Constants'
import * as ColorUtil from '../../../sub/util/ColorUtil'
import * as StringUtil from '../../../sub/util/StringUtil'
import * as Util from '../../../sub/util/Util'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as StyleHelper from '../../../sub/helper/ui/StyleHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import reloadmixin from '../../../components/mixin/reloadmixin.vue'
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
    pTypeList: {
      type: Array,
      default: () => [CATEGORY.PERSON, CATEGORY.THING, CATEGORY.ZONE],
    },
  },
  components: {
    exMaster,
  },
  mixins: [reloadmixin],
  data() {
    return {
      params: {
        name: 'category',
        dispName: StringUtil.concatCamel('category', this.pName),
        id: 'categoryId',
        indexPath: this.pPath,
        editPath: this.pPath + '/edit',
        bulkEditPath: this.pPath + '/bulkedit',
        appServicePath: '/basic/category',
        csvOut: true,
        custumCsvColumns: [
          'ID', 'categoryName', 'categoryTypeName', 'color', 'bgColor', 'display.shape', 'description',
          this.pShowAuth? 'guardNames': null,
          this.pShowAuth? 'doorNames': null].filter(val => val),
        fields: ViewHelper.addLabelByKey(this.$i18n, [ 
          { key: 'categoryCd', label: 'id', sortable: true },
          { key: 'categoryName', label: StringUtil.concatCamel(this.pName, 'categoryName'), sortable: true },
          !this.pName? { key: 'categoryTypeName', label: 'categoryType', sortable: true }: null,
          this.pShowIcon? { key: 'style', label: 'display' }: null,
          this.pShowAuth? { key: 'guardNames' , label: 'zoneGuard' }: null,
          this.pShowAuth? { key: 'doorNames' , label: 'zoneDoor' }: null,
          this.pShowDescription? { key: 'description' }: null,
          {key: 'actions', thStyle: {width:'130px !important'} }
        ]).filter(val => val),
        sortBy: 'categoryCd',
        initTotalRows: this.categoryLength
      },
      categoryStyles: [],
    }
  },
  computed: {
    categoryList() {
      return this.$store.state.app_service.categories.filter(category => !category.systemUse)
    },
    categoryLength() {
      return this.categoryList().length
    },
    ...mapState('app_service', [
      'categories',
    ]),
  },
  methods: {
    onSaved(){
      StateHelper.setForceFetch('pot', true)
      StateHelper.setForceFetch('tx', true)
      StateHelper.setForceFetch('zone', true)
    },
    async fetchData(payload) {
      try {
        this.showProgress()
        await StateHelper.load('category')
        this.categoryStyles = StyleHelper.getStyleDisplay(this.categories)
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.hideProgress()
    },
    style(row) {
      const categoryStyle = this.categoryStyles.find(val => val.entity.categoryId == row.categoryId)
      return categoryStyle? categoryStyle.style: null
    },
    customCsvData(val){
      val.ID = val.categoryCd
      val.color = ColorUtil.colorCd4display(Util.getValue(val, 'display.color', null))
      val.bgColor = ColorUtil.colorCd4display(Util.getValue(val, 'display.bgColor', null))
      val.guardNames = val.guardNames.join(BULK.SPLITTER)
      val.doorNames = val.doorNames.join(BULK.SPLITTER)
    },
  }
}
</script>

<style scoped lang="scss">

</style>
