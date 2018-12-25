<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="roles" />
  </div>
</template>

<script>
import mList from '../../../components/page/list.vue'
import { mapState } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
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
        name: 'role',
        id: 'roleId',
        editPath: '/master/role/edit',
        bulkEditPath: '/master/role/bulkedit',
        appServicePath: '/meta/role',
        csvOut: true,
        fields: addLabelByKey(this.$i18n, [ 
          {key: 'roleId', sortable: true },
          {key: 'roleName', sortable: true },
          {key: 'actions', thStyle: {width:'130px !important'} }
        ]),
        initTotalRows: this.$store.state.app_service.roles.length
      },
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.role'),
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
        this.showProgress()
        await StateHelper.load('role')
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
