<template>
  <div class="container-fluid">
    <ex-master p-master-name="zone" :p-category-name="pName" :p-type-list="pTypeList" :p-params="params" />
  </div>
</template>

<script>
import { APP } from '../../../sub/constant/config'
import * as ExtValueHelper from '../../../sub/helper/domain/ExtValueHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
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
      default: 'class',
    },
    pPath: {
      type: String,
      default: '/master/zoneClass',
    },
    pAppServicePath: {
      type: String,
      default: '/core/zone',
    },
    pTypeList: {
      type: Array,
      default: () => APP.ZONE.TYPES,
    },
  },
  data() {
    return {
      params: {
        name: 'zone',
        id: 'zoneId',
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
        {key: 'ID', label: 'id', sortable: true },
        {key: 'zoneType', label: 'zoneType', sortable: true },
        {key: 'zoneName', sortable: true }
      ].concat(this.createCustomColumn())
        .concat([
          {key: 'areaName', sortable: true},
          {key: 'categoryName', label: 'categoryName', sortable: true},
        ])
        .concat([ {key: 'actions', thStyle: {width:'130px !important'} } ])
        .filter(val => val))
    },
    createCustomColumn(isDownload){
      const ret = []
      APP.ZONE.WITH.forEach(val => {
        if(!isDownload && !ExtValueHelper.isShowList(APP.ZONE, val)) {
          return
        }
        ret.push({key: val, label: val, sortable: true})
      })
      return ret
    },
    async onSaved(){
    },
    editResponse(data) {
      data.forEach(val => {
        if (val.categoryName) {
          let label = this.$i18n.tnl('label.' + val.categoryName.toLowerCase()) 
          val.categoryName = label? label: val.categoryName
        }
      })
    },
  }
}
</script>

<style scoped lang="scss">

</style>
