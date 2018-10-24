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
import breadcrumb from '../../../components/breadcrumb.vue'
import bulkedit from '../../../components/bulkedit.vue'

export default {
  components: {
    breadcrumb,
    bulkedit,
  },
  data() {
    return {
      name: 'region',
      id: 'regionId',
      backPath: '/master/region',
      appServicePath: '/core/region',
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.region'),
          href: '/master/region',
        },
        {
          text: this.$i18n.tnl('label.region') + this.$i18n.tnl('label.bulkRegister'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'region',
    ]),
  },
  methods: {
    async save(bulkSaveFunc) {
      const MAIN_COL = "regionId"
      const NUMBER_TYPE_LIST = ["regionId", "meshId"]
      await bulkSaveFunc(MAIN_COL, NUMBER_TYPE_LIST)
    },
  }
}
</script>

<style scoped lang="scss">

</style>