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
      name: 'thing',
      id: 'thingId',
      backPath: '/master/thing',
      appServicePath: '/basic/thing',
      form: {
        csvFile: undefined,
      },
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.thing'),
          href: '/master/thing',
        },
        {
          text: this.$i18n.t('label.thing') + this.$i18n.t('label.bulkRegister'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'thing',
    ]),
  },
  methods: {
    async save() {
      const MAIN_COL = "thingId"
      const NULLABLE_NUMBER_COL = ["exbId"]
      const THING_CATEGORY = ["categoryId"]
      const INT_TYPE_LIST = ["thingId", "txId"]

      await this.bulkSave(MAIN_COL, INT_TYPE_LIST, null, (entity, headerName, val, dummyKey) => {
        if (Util.equalsAny(headerName, THING_CATEGORY)) {
          if (headerName === "categoryId" && Util.hasValue(val)) {
            entity.thingCategoryList = [{thingCategoryPK: {categoryId: Number(val)}}]
          }
        }
        else {
          if (headerName === MAIN_COL && val.length != 0) {
            val = dummyKey--
          }
          if (NULLABLE_NUMBER_COL.includes(headerName) && Util.hasValue(val)) {
            val = Number(val)
          }
          entity[headerName] = val
        }
        return dummyKey
      })
    },
  }
}
</script>

<style scoped lang="scss">

</style>