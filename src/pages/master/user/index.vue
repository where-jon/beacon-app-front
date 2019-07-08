<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="params" :list="users" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import * as StateHelper from '../../../sub/helper/dataprocess/StateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import reloadmixin from '../../../components/mixin/reloadmixin.vue'
import mList from '../../../components/page/list.vue'

export default {
  components: {
    breadcrumb,
    mList,
  },
  mixins: [reloadmixin],
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
      val.regionNames = val.regionNames.join(';')
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
    onSaved(){
      StateHelper.setForceFetch('pot', true)
    },
    async fetchData(payload) {
      try {
        this.showProgress()
        await StateHelper.load('user')
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
