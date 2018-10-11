<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="roles" />
  </div>
</template>

<script>
import mList from '../../../components/list.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
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
        name: 'role',
        id: 'roleId',
        editPath: '/master/role/edit',
        bulkEditPath: '/master/role/bulkedit',
        appServicePath: '/meta/role',
        csvOut: true,
        fields: addLabelByKey(this.$i18n, [ 
          {key: "roleId", sortable: true },
          {key: "roleName", sortable: true },
          {key: "actions", thStyle: {width:'130px !important'} }
        ]),
        initTotalRows: this.$store.state.app_service.roles.length
      },
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.role'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'roles',
    ]),
  },
  methods: {
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        let roles = await AppServiceHelper.fetchList("/meta/role/", 'roleId')
        if (payload && payload.done) {
          payload.done()
        }
        this.replaceAS({roles})
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
