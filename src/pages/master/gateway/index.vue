<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" />
    <m-list :params="params" :list="gateways" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
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
        appServicePath: '/core/excloud/gwlist',
        csvOut: false,
        fields: this.getFields(),
        sortBy: 'deviceId',
        initTotalRows: 0
      },
      breadCrumbs: ViewHelper.createBreadCrumbItems('master', 'masterGateway'),
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
    getFields(){
      return ViewHelper.addLabelByKey(this.$i18n, [
        {key: 'deviceId', label:'deviceId', sortable: true,},
        {key: 'meshid', label:'meshId', sortable: true,},
        {key: 'actions', thStyle: {width: '130px !important'} }
      ])
    },
    async fetchData(payload) {
      try {
        this.showProgress()

        let reqParam = [
          '/core/excloud/gwlist',
        ].join('/')
        this.gateways = await HttpHelper.getAppService(reqParam)

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