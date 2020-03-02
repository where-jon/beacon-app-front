<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="params" compact-mode />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as MasterHelper from '../../../sub/helper/domain/MasterHelper'
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
        fields: this.getFields(),
        sortBy: 'loginId',
      },
      items: ViewHelper.createBreadCrumbItems('master', 'user'),
    }
  },
  computed: {
    // ...mapState('app_service', [
    //   'regions',
    // ]),
  },
  async created() {
  },
  methods: {
    createCustomColumn(){
      return APP.USER.WITH.map(val => ({key: val == 'region'? 'regionNames': val, label: val, sortable: true}))
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
    async onSaved(){
    },
  }
}
</script>

<style scoped lang="scss">

</style>
