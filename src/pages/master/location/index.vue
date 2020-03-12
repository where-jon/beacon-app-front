<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="params" compact-mode />
  </div>
</template>

<script>
import { APP } from '../../../sub/constant/config'
import { BULK } from '../../../sub/constant/Constants'
import * as Util from '../../../sub/util/Util'
import * as ExtValueHelper from '../../../sub/helper/domain/ExtValueHelper'
import * as MenuHelper from '../../../sub/helper/dataproc/MenuHelper'
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
        name: 'location',
        id: 'locationId',
        indexPath: '/master/location',
        editPath: '/master/location/edit',
        bulkEditPath: '/master/location/bulkedit',
        appServicePath: '/core/location',
        csvOut: true,
        fields: this.getFields(),
        sortBy: 'ID',
      },
      items: ViewHelper.createBreadCrumbItems('master', 'locationList'),
    }
  },
  methods: {
    isShowLocationType(){
      return 0 < APP.LOCATION.TYPE.WITH.length
    },
    getFields(){
      return ViewHelper.addLabelByKey(this.$i18n, [ 
        {key: 'ID', label: 'id', sortable: true },
        {key: 'locationName', sortable: true },
        this.isShowLocationType()? {key: 'locationType', label: 'locationType', sortable: true }: null,
        {key: 'areaName', label:'area', sortable: true },
        {key: 'x', label:'locationX', sortable: true },
        {key: 'y', label:'locationY', sortable: true }
      ].concat(this.createCustomColumn())
        .concat([ {key: 'actions', thStyle: {width:'130px !important'} } ])
        .filter(val => val))
    },
    createCustomColumn(){
      const ret = []
      APP.LOCATION.WITH.forEach(val => {
        if(!ExtValueHelper.isShowList(APP.LOCATION, val)) {
          return
        }
        const column = {key: val, label: val, sortable: true}
        if('zoneClass' == val){
          if(MenuHelper.isMenuEntry('/master/zoneClass')){
            ret.push(Object.assign({}, column, {key: 'zoneClass', label: 'zoneClass'}))
          }
          return
        }
        if('zoneBlock' == val){
          if(MenuHelper.isMenuEntry('/master/zoneBlock')){
            ret.push(Object.assign({}, column, {key: 'zoneBlock', label: 'zoneBlock'}))
          }
          return
        }
        ret.push(column)
      })
      return ret
    },
    editResponse(data) {
      data.forEach(val => {
        if (val.toilet) {
          let label = this.$i18n.tnl('label.' + val.toilet) 
          val.toilet = label? label: val.toilet
        }
        val.zoneClass = Util.getValue(val, 'zoneClass', '').split(BULK.SPLITTER)
        val.zoneBlock = Util.getValue(val, 'zoneBlock', '').split(BULK.SPLITTER)
      })
    },
  }
}
</script>

<style scoped lang="scss">

</style>