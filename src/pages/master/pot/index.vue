<template>
  <div class="container-fluid">
    <ex-master p-master-name="pot" :p-category-name="pName" :p-type-list="pTypeList" :p-params="params" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP, EXCLOUD, APP_SERVICE } from '../../../sub/constant/config'
import { CATEGORY, BULK } from '../../../sub/constant/Constants'
import * as ArrayUtil from '../../../sub/util/ArrayUtil'
import * as Util from '../../../sub/util/Util'
import * as MenuHelper from '../../../sub/helper/dataproc/MenuHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import * as PotHelper from '../../../sub/helper/domain/PotHelper'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import exMaster from '../../../components/page/ex-master.vue'

export default {
  components: {
    exMaster,
  },
  mixins: [commonmixin],
  props: {
    pName: {
      type: String,
      default: '',
    },
    pPath: {
      type: String,
      default: '/master/pot',
    },
    pAppServicePath: {
      type: String,
      default: '/basic/pot',
    },
    pTypeList: {
      type: Array,
      default: () => [CATEGORY.PERSON, CATEGORY.THING, CATEGORY.OTHER],
    },
  },
  data() {
    return {
      params: {
        name: 'pot',
        id: 'potId',
        indexPath: this.pPath,
        editPath: this.pPath + '/edit',
        appServicePath: this.pAppServicePath,
        bulkEditPath: this.pPath + '/bulkEdit',
        bulkUploadPath: this.pPath + '/bulkUpload',
        csvOut: true,
        fields: this.getFields(),
        extraFilter: [
          MenuHelper.isEnabledMenu('group') && ArrayUtil.includesIgnoreCase(APP.POT.WITH, 'group')? 'group': null, 
          MenuHelper.isEnabledMenu('category') && ArrayUtil.includesIgnoreCase(APP.POT.WITH, 'category')? 
            {key: 'category', optionFunc: this.filteredCategoryOptions}
            : null
        ].filter(e => e),
        sortBy: 'ruby',
        addFilterFields: ['txIdNames'],
      },
      name: 'pot',
      extValueDefault: {},
      thumbnailUrl: APP_SERVICE.BASE_URL + EXCLOUD.POT_THUMBNAIL_URL,
      thumbnailUrlMap: {}
    }
  },
  computed: {
    ...mapState('app_service', [
      'updatedPotThumbnailList',
      'thumbnailUrls',
    ]),
  },
  async created() {
    this.replaceAS({updatedPotThumbnailList: []})
    this.thumbnailUrlMap = {}
    this.replaceAS({thumbnailUrls: this.thumbnailUrlMap})
  },
  methods: {
    filteredCategoryOptions() {
      return this.categoryOptions.filter(
        option => this.pTypeList.includes(Util.v(this.categoryIdMap[option.value], 'categoryType'))
      )
    },
    getFullName(){
      return this.pName? this.pName: 'pot'
    },
    editResponse(data) {
      data.forEach(pot => {
        pot.txIdNames = Util.getValue(pot, 'btxId', Util.getValue(pot, 'minor', '')).split(BULK.SPLITTER)
        pot.authCategoryNames = Util.getValue(pot, 'auth', '').split(BULK.SPLITTER)
      })
    },
    getFields(){
      const columnsOrder = ['ID', 'potName', 'ruby', 'thumbnail', 'groupName', 'actions']
      const customColumn = PotHelper.createCustomColumn(this.pName)
      .filter(c => c.key !== 'categoryName' && c.key !== 'potType')
      let result = ViewHelper.addLabelByKey(this.$i18n, [ 
        {key: 'ID', sortable: true , tdClass: 'thumb-rowdata'},
        {key: 'potName', sortable: true , tdClass: 'thumb-rowdata'},
        ArrayUtil.includesIgnoreCase(APP[this.getFullName().toUpperCase()].WITH, 'thumbnail')? {key: 'thumbnail', tdClass: 'thumb-rowdata' }: null,
        // {key: 'txIdName', label:'tx', sortable: true, tdClass: 'thumb-rowdata' },
        // {key: 'displayName', sortable: true, tdClass: 'thumb-rowdata'},
      ]
      .concat(customColumn)
        .concat([
          {key: 'actions', thStyle: {'min-width':'130px !important'} , tdClass: 'thumb-rowdata'},
        ])).filter(val => val)
        return columnsOrder.map(order => result.find(r => r.key === order)).filter(r => r !== null)
    },
    thumbnail(row) {
      return row.existThumbnail? this.thumbnailUrl.replace('{id}', row.updateKey) + row.thumbnailUpdateDt: null
    },
  }
}
</script>

<style scoped lang="scss">

</style>
