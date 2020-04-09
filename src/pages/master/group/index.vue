<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" />
    <m-list :params="params" compact-mode />
  </div>
</template>

<script>
import { APP } from '../../../sub/constant/config'
import * as ExtValueHelper from '../../../sub/helper/domain/ExtValueHelper'
import * as StyleHelper from '../../../sub/helper/ui/StyleHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import mList from '../../../components/page/list.vue'

export default {
  components: {
    breadcrumb,
    mList, 
  },
  mixins: [commonmixin],
  data() {
    return {
      params: {
        name: 'group',
        id: 'groupId',
        indexPath: '/master/group',
        editPath: '/master/group/edit',
        bulkEditPath: '/master/group/bulkedit',
        appServicePath: '/basic/group',
        csvOut: true,
        fields: this.getFields(),
        sortBy: 'ID',
      },
      breadCrumbs: ViewHelper.createBreadCrumbItems('master', 'group'),
    }
  },
  methods: {
    getFields(){
      return ViewHelper.addLabelByKey(this.$i18n, [ 
        {key: 'ID', label: 'id', sortable: true },
        {key: 'groupName', sortable: true }
      ].concat(this.createCustomColumn())
        .concat([
          {key: 'style', label: 'display' } ,
          {key: 'description' },
          {key: 'actions', thStyle: {width:'130px !important'} }
        ])
        .filter(val => val))
    },
    createCustomColumn(isDownload){
      const ret = []
      APP.GROUP.WITH.forEach(val => {
        if(!isDownload && !ExtValueHelper.isShowList(APP.GROUP, val)) {
          return
        }
        ret.push({key: val, label: val, sortable: true})
      })
      return ret
    },
    getCustumCsvColumns(){
      return ['ID', 'groupName']
        .concat(this.createCustomColumn(true).map(val => val.key))
        .concat(['color', 'bgColor', 'shape', 'description'])
        .filter(val => val)
    },
    async onSaved(){
    },
    style(row) {
      return StyleHelper.getStyleDisplay1(row)
    },
  }
}
</script>

<style scoped lang="scss">

</style>
