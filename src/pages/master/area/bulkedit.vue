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
      name: 'area',
      id: 'areaId',
      backPath: '/master/area',
      appServicePath: '/core/area',
      form: {
        csvFile: null,
      },
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.area'),
          href: '/master/area',
        },
        {
          text: this.$i18n.t('label.area') + this.$i18n.t('label.bulkRegister'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'area',
    ]),
  },
  methods: {
    async save() {
      const MAIN_COL = "areaId"
      const NUMBER_TYPE_LIST = ["areaId"]
      await this.bulkSave(MAIN_COL, NUMBER_TYPE_LIST)
    },
  }
}
</script>

<style scoped lang="scss">

</style>