<template>
  <div>
    <breadcrumb :items="items" />
    <bulkupload :name="name" :id="id" :backPath="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/breadcrumb.vue'
import bulkupload from '../../../components/bulkupload.vue'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'

export default {
  components: {
    breadcrumb,
    bulkupload,
  },
  data() {
    return {
      name: 'pot',
      id: 'potId',
      backPath: '/master/pot',
      appServicePath: '/basic/pot',
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.pot'),
          href: '/master/pot',
        },
        {
          text: this.$i18n.tnl('label.pot') + this.$i18n.tnl('label.bulkUpload'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'pot', 'pots'
    ]),
  },
  methods: {
    search(key) {
      const target = this.pots.find((val) => val.potId == key)
      return target? {id: target.potId, name: target.potName, ...target}: null
    },
    async save(thumbnails) {
      return await AppServiceHelper.bulkSave(this.appServicePath, thumbnails)
    },
  }
}
</script>

<style scoped lang="scss">

</style>