<template>
  <div class="container-fluid">
    <ex-master p-master-name="category" :p-category-name="pName" :p-type-list="pTypeList" :p-params="params" :p-list="categoryList" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { CATEGORY, SHAPE } from '../../../sub/constant/Constants'
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
  mixins: [reloadmixin],
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
        custumCsvColumns: ['ID', 'categoryName', 'categoryTypeName', 'color', 'bgColor', 'shape', 'description'],
        fields: ViewHelper.addLabelByKey(this.$i18n, [ 
          {key: 'categoryCd', label: 'id', sortable: true },
          {key: 'categoryName', label: StringUtil.concatCamel(this.pName, 'categoryName'), sortable: true },
          !this.pName? {key: 'categoryTypeName', label: 'categoryType', sortable: true }: null,
          this.pShowIcon? {key: 'style', label: 'display' }: null,
          {key: 'description' },
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
      val.color = ColorUtil.colorCd4display(Util.getValue(val, 'display.color', '000000'))
      val.bgColor = ColorUtil.colorCd4display(Util.getValue(val, 'display.bgColor', 'FFFFFF'))
      val.shape = Util.getValue(val, 'display.shape', SHAPE.SQUARE)
    },
  }
}
</script>

<style scoped lang="scss">

</style>
