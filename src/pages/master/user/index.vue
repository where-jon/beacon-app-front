<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="users" />
  </div>
</template>

<script>
import mList from '../../../components/page/list.vue'
import { mapState } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import { APP } from '../../../sub/constant/config.js'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import listmixinVue from '../../../components/mixin/listmixin.vue'
import breadcrumb from '../../../components/layout/breadcrumb.vue'

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
        indexPath: '/master/user',
        editPath: '/master/user/edit',
        bulkEditPath: '/master/user/bulkedit',
        appServicePath: '/meta/user',
        csvOut: true,
        custumCsvColumns: [
          'userId',
          'loginId',
          APP.USER_WITH_NAME? 'name': null,
          'pass',
          APP.USER_WITH_EMAIL? 'email': null,
          'roleName',
          'description',
        ].filter((val) => val),
        fields: addLabelByKey(this.$i18n, [ 
          {key: 'loginId', sortable: true  },
          APP.USER_WITH_NAME? {key: 'name', sortable: true  }: null,
          APP.USER_WITH_EMAIL? {key: 'email', sortable: true }: null,
          {key: 'roleName', label: 'role', sortable: true },
          {key: 'description', sortable: true },
          {key: 'userId', sortable: true },
          {key: 'actions', thStyle: {width:'130px !important'} }
        ]),
        sortBy: 'loginId',
        initTotalRows: this.$store.state.app_service.users.length
      },
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.user'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'users',
      'forceFetchUser',
    ]),
  },
  methods: {
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
