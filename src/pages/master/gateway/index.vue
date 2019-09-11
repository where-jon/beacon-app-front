<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="params" :list="gateways" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import * as ArrayUtil from '../../../sub/util/ArrayUtil'
import * as Util from '../../../sub/util/Util'
import * as ConfigHelper from '../../../sub/helper/dataproc/ConfigHelper'
import * as MenuHelper from '../../../sub/helper/dataproc/MenuHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import reloadmixin from '../../../components/mixin/reloadmixin.vue'
import mList from '../../../components/page/list.vue'
import * as HttpHelper from '../../../sub/helper/base/HttpHelper'

export default {
  components: {
    breadcrumb,
    mList, 
  },
  mixins: [reloadmixin],
  data() {
    return {
      params: {
        name: 'gateway',
        id: 'deviceId',
        confirmName: 'deviceId',
        indexPath: '/master/gateway',
        editPath: '/master/gateway/edit',
        appServicePath: '/core/gateway',
        csvOut: false,
        fields: this.getFields(),
        sortBy: 'deviceId',
        initTotalRows: 0
      },
      items: ViewHelper.createBreadCrumbItems('master', 'gateway'),
      gateways: []
    }
  },
  computed: {
    ...mapState('app_service', [
    ]),
    isUpdatable() {
      return false
    },
  },
  methods: {
    createIdColumn(){
      return ['deviceId'].filter(val => ConfigHelper.includesDeviceType(val))
        .map(val => ({key: val, label: val, sortable: true}))
    },
    getFields(){
      return ViewHelper.addLabelByKey(this.$i18n, this.createIdColumn()
        .concat([
          {key: 'meshId', label:'meshId', sortable: true,},
          {key: 'actions', thStyle: {width: '130px !important'} }
        ])
      )
    },
    async fetchData(payload) {
      try {
        this.showProgress()

        console.log('fetchData')

        let reqParam = [
          '/core/excloud/gwlist',
        ].join('/')
        //const results = await HttpHelper.getAppService(reqParam)
        //console.log(results)
        
        this.gateways = [{deviceId:10, meshId:0}]

        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.hideProgress()
    },
  }
}
</script>

<style scoped lang="scss">

</style>