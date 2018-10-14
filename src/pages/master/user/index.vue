<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="users" >
    </m-list>
  </div>
</template>

<script>
import mList from '../../../components/list.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import { APP } from '../../../sub/constant/config.js'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import listmixinVue from '../../../components/listmixin.vue'
import breadcrumb from '../../../components/breadcrumb.vue'

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
        editPath: '/master/user/edit',
        bulkEditPath: '/master/user/bulkedit',
        appServicePath: '/meta/user',
        csvOut: true,
        fields: addLabelByKey(this.$i18n, [ 
          {key: "userId", sortable: true },
          APP.USER_WITH_NAME? {key: "name", sortable: true  }: null,
          {key: "loginId", sortable: true  },
          APP.USER_WITH_EMAIL? {key: "email", sortable: true }: null,
          {key: "roleName", label: "role", sortable: true },
          {key: "description", sortable: true },
          {key: "actions", thStyle: {width:'130px !important'} }
        ]),
        initTotalRows: this.$store.state.app_service.users.length
      },
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.user'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'users',
    ]),
  },
  methods: {
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        let users = await AppServiceHelper.fetchList("/meta/user/", 'userId')
        users = users.map((val) => ({...val, roleName: val.role.roleName}))
        if (payload && payload.done) {
          payload.done()
        }
        this.replaceAS({users})
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    },
  }
}
</script>

<style scoped lang="scss">

</style>
