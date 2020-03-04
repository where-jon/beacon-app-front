<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="params" compact-mode />
  </div>
</template>

<script>
import { APP } from '../../../sub/constant/config'
import { BULK } from '../../../sub/constant/Constants'
import * as ArrayUtil from '../../../sub/util/ArrayUtil'
import * as Util from '../../../sub/util/Util'
import * as ConfigHelper from '../../../sub/helper/dataproc/ConfigHelper'
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
        name: 'exb',
        id: 'exbId',
        confirmName: ConfigHelper.includesDeviceType('deviceId')? 'deviceId': ConfigHelper.includesDeviceType('deviceIdX')? 'deviceIdX': 'locationName',
        indexPath: '/master/exb',
        editPath: '/master/exb/edit',
        bulkEditPath: '/master/exb/bulkedit',
        appServicePath: '/core/exb',
        csvOut: true,
        fields: this.getFields(),
        sortBy: ConfigHelper.includesDeviceType('deviceId')? 'deviceId': ConfigHelper.includesDeviceType('deviceIdX')? 'deviceIdX': 'locationName',
      },
      items: ViewHelper.createBreadCrumbItems('master', 'masterExb'),
    }
  },
  methods: {
    getUseExbType() {
      return ArrayUtil.includesIgnoreCase(APP.EXB.WITH, 'exbType')
    },
    createIdColumn(){
      return ['deviceId', 'deviceIdX'].filter(val => ConfigHelper.includesDeviceType(val))
        .map(val => ({key: val, label: val, sortable: true}))
    },
    editResponse(data) {
      data.forEach(val => {
        val.sensorNames = Util.getValue(val, 'sensorNames', '').split(BULK.SPLITTER)
      })
    },
    getFields(){
      return ViewHelper.addLabelByKey(this.$i18n, this.createIdColumn()
        .concat([
          this.getUseExbType()? {key: 'exbType', label:'exbType', sortable: true,}: null,
          {key: 'sensorNames', label:'type', sortable: true,},
          {key: 'locationName', label:'locationName', sortable: true,},
          {key: 'areaName', label:'area', sortable: true,},
          {key: 'actions', thStyle: {width: '130px !important'} }
        ]).filter(val => val)
      )
    },
  }
}
</script>

<style scoped lang="scss">

</style>