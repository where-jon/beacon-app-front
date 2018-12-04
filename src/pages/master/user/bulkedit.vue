<template>
  <div>
    <breadcrumb :items="items" />
    <bulkedit :name="name" :id="id" :backPath="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as Util from '../../../sub/util/Util'
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
          text: this.$i18n.tnl('label.user') + this.$i18n.tnl('label.bulkRegister'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'user',
    ]),
  },
  methods: {
    async save(bulkSaveFunc) {
      const MAIN_COL = "userId"
      const ROLE_COL = ["roleName"]
      const NUMBER_TYPE_LIST = ["roleId"]
      await bulkSaveFunc(MAIN_COL, NUMBER_TYPE_LIST, null, (entity, headerName, val, dummyKey) => {
        if (headerName == MAIN_COL && !Util.hasValue(val)) {
          val = dummyKey--
        }
        if (_.includes(ROLE_COL, headerName)) {
          entity.role = {roleId: dummyKey--, roleName: val}
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