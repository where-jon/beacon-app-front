<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="params" compact-mode />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import { LOCATION, BULK } from '../../../sub/constant/Constants'
import * as Util from '../../../sub/util/Util'
import * as MenuHelper from '../../../sub/helper/dataproc/MenuHelper'
import * as OptionHelper from '../../../sub/helper/dataproc/OptionHelper'
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
        this.isShowLocationType()? {key: 'locationTypeName', label: 'locationType', sortable: true }: null,
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
        const column = {key: val, label: val, sortable: true}
        if('zoneClass' == val){
          if(MenuHelper.isMenuEntry('/master/zoneClass')){
            ret.push(Object.assign({}, column, {key: 'zoneClass', label: 'zoneClass'}))
          }
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
    createListParams(){
      const retMap = { locationType: {} }
      OptionHelper.getLocationTypeOptions().forEach(option => retMap.locationType[option.value.toString()] = option.text)
      return retMap
    },
    editResponse(data) {
      data.forEach(val => {
        val.zoneClass = Util.getValue(val, 'zoneClass', '').split(BULK.SPLITTER)
        val.zoneBlock = Util.getValue(val, 'zoneBlock', '').split(BULK.SPLITTER)
      })
    },
  }
}
</script>

<style scoped lang="scss">

</style>