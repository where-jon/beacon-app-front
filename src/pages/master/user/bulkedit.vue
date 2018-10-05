<template>
  <div>
    <breadcrumb :items="items" />
    <bulkedit :name="name" :id="id" :backPath="backPath" :app-service-path="appServicePath" :form="form" />
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as Util from '../../../sub/util/Util'
import editmixinVue from '../../../components/editmixin.vue'
import breadcrumb from '../../../components/breadcrumb.vue'
import bulkedit from '../../../components/bulkedit.vue'

export default {
  components: {
    breadcrumb,
    bulkedit,
  },
  mixins: [editmixinVue],
  data() {
    return {
      name: 'user',
      id: 'userId',
      backPath: '/master/user',
      appServicePath: '/meta/user',
      form: {
        csvFile: undefined,
      },
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.user'),
          href: '/master/user',
        },
        {
          text: this.$i18n.t('label.user') + this.$i18n.t('label.bulkRegister'),
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
    async save() {
      const MAIN_COL = "userId"
      const INT_TYPE_LIST = ["userId", "roleId"]
      await this.bulkSave(MAIN_COL, INT_TYPE_LIST)
    },
  }
}
</script>

<style scoped lang="scss">

</style>