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
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import breadcrumb from '../../../components/breadcrumb.vue'
import bulkedit from '../../../components/bulkedit.vue'

export default {
  components: {
    breadcrumb,
    bulkedit,
  },
  data() {
    return {
      name: 'roleFeature',
      id: 'roleId',
      backPath: '/master/role/edit',
      appServicePath: '/meta/roleFeature',
      roleFeature:{
        roleId: this.$store.state.app_service.role.roleId
      },
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.role'),
          href: '/master/role',
        },
        {
          text: this.$i18n.t('label.role') + this.$i18n.t('label.detail'),
          href: '/master/role/edit',
        },
        {
          text: this.$i18n.t('label.feature') + this.$i18n.t('label.bulkRegister'),
          active: true
        }
      ],
    }
  },
  computed: {
    ...mapState('app_service', [
      'role',
    ]),
  },
  methods: {
    async save(bulkSaveFunc) {
      const MAIN_COL = ["roleId", "featureId"]
      const PRIMARY_KEYS = ["roleId", "featureId"]
      await bulkSaveFunc(MAIN_COL, null, null, (entity, headerName, val, dummyKey) => {
        if (Util.equalsAny(headerName, PRIMARY_KEYS)) {
          if(!entity.roleFeaturePK){
            entity.roleFeaturePK = Object()
          }
          if (headerName === "roleId" && Util.hasValue(val)) {
            entity.roleFeaturePK.roleId = Number(val)
          }
          else if (headerName === "featureId" && Util.hasValue(val)) {
            entity.roleFeaturePK.featureId = Number(val)
          }
        }
        else {
          val = Number(val)
          entity[headerName] = val
        }
        return dummyKey
      })
      const roleFeatures = await AppServiceHelper.fetch("/meta/roleFeature", this.role.roleId)
      this.replaceAS({roleFeatures})
    },
  }
}
</script>

<style scoped lang="scss">

</style>