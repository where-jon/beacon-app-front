<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="params" :list="users" />
  </div>
</template>

<script>
import mList from '../../../components/page/list.vue'
import { mapState } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import { APP } from '../../../sub/constant/config.js'
import listmixinVue from '../../../components/mixin/listmixin.vue'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import * as Util from '../../../sub/util/Util'

export default {
  components: {
    mList, 
    breadcrumb,
  },
  mixins: [listmixinVue],
  data() {
    return {
      params: {
        name: 'user',
        id: 'userId',
        confirmName: 'loginId',
        indexPath: '/master/user',
        editPath: '/master/user/edit',
        bulkEditPath: '/master/user/bulkedit',
        appServicePath: '/meta/user',
        csvOut: true,
        custumCsvColumns: this.getCustomCsvColumns(),
        fields: this.getFields(),
        sortBy: 'loginId',
        initTotalRows: this.$store.state.app_service.users.length
      },
      items: ViewHelper.createBreadCrumbItems('master', 'user'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'users',
      'regions',
      'forceFetchUser',
    ]),
  },
  async created() {
    await StateHelper.load('region')
  },
  methods: {
    createCustomColumn(){
      return APP.USER.WITH.map(val => ({key: val == 'region'? 'regionNames': val, label: val, sortable: true}))
    },
    getCustomCsvColumns(){
      return ['loginId', 'pass']
        .concat(this.createCustomColumn().map(val => val.key))
        .concat('roleName', 'description')
        .filter(val => val)
    },
    customCsvData(val){
      val.regionNames = val.regionIds.map(regionId => {
        const target = this.regions.find(region => region.regionId == regionId)
        return Util.getValue(target, 'regionName', null)
      }).filter(val => val).join(';')
    },
    getFields(){
      return ViewHelper.addLabelByKey(this.$i18n, [ 
        {key: 'loginId', sortable: true }
      ].concat(this.createCustomColumn())
        .concat([
          {key: 'roleName', label: 'role', sortable: true },
          {key: 'description', sortable: true },
          {key: 'actions', thStyle: {width:'130px !important'} }
        ]))
    },
    async fetchData(payload) {
      try {
        this.showProgress()
        await StateHelper.load('user', this.forceFetchUser)
        StateHelper.setForceFetch('user', false)
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
