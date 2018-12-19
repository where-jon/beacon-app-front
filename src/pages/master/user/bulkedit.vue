<template>
  <div>
    <breadcrumb :items="items" />
    <bulkedit ref="bulkEdit" :name="name" :id="id" :backPath="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as Util from '../../../sub/util/Util'
import { ROLE } from '../../../sub/constant/Constants'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkedit from '../../../components/page/bulkedit.vue'

export default {
  components: {
    breadcrumb,
    bulkedit,
  },
  data() {
    return {
      name: 'user',
      id: 'userId',
      backPath: '/master/user',
      appServicePath: '/meta/user',
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.user'),
          href: '/master/user',
        },
        {
          text: this.$i18n.tnl('label.bulkRegister'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'user', 'roles'
    ]),
  },
  methods: {
    async save(bulkSaveFunc) {
      const MAIN_COL = "userId"
      const ROLE_COL = ["roleName"]
      const NUMBER_TYPE_LIST = ["roleId"]
      await StateHelper.load('role')
      const roles = this.roles.filter((role) => role.roleName != ROLE.SUPER_ADMIN || this.$refs.bulkEdit.isSuperEditable)
      await bulkSaveFunc(MAIN_COL, NUMBER_TYPE_LIST, null, (entity, headerName, val, dummyKey) => {
        if (headerName == MAIN_COL && !Util.hasValue(val)) {
          val = dummyKey--
        }
        if (_.includes(ROLE_COL, headerName)) {
          if(roles? roles.find((role) => role.roleName == val): false){
            entity.role = {roleId: dummyKey--, roleName: val}
            entity.roleNameAuth = true
          }
        }
        entity[headerName] = val
        return dummyKey
      })
    },
  }
}
</script>

<style scoped lang="scss">

</style>