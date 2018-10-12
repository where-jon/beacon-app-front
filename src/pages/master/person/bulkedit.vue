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
      name: 'person',
      id: 'personId',
      backPath: '/master/person',
      appServicePath: '/basic/person',
      form: {
        csvFile: null,
      },
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.person'),
          href: '/master/person',
        },
        {
          text: this.$i18n.t('label.person') + this.$i18n.t('label.bulkRegister'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'person',
    ]),
  },
  methods: {
    async save() {
      const MAIN_COL = "personId"
      const NULLABLE_NUMBER_COL = ["txId", "exbId", "zoneId", "areaId"]
      const MANY_TO_MANY = ["groupId", "categoryId"]

      await this.bulkSave(MAIN_COL, null, null, (entity, headerName, val, dummyKey) => {
        if (MANY_TO_MANY.includes(headerName) && Util.hasValue(val)) {
          if("groupId" === headerName) {
            entity.personGroupList = [{personGroupPK: {groupId: Number(val)}}]
          }
          if("categoryId" === headerName) {
            entity.personCategoryList = [{personCategoryPK: {categoryId: Number(val)}}]
          }
          return dummyKey
        }

        let newVal
        if (MAIN_COL === headerName && val.length != 0) {
          newVal = dummyKey--
        } else if (NULLABLE_NUMBER_COL.includes(headerName) && Util.hasValue(val)) {
          newVal = Number(val)
        } else {
          newVal = val
        }
        entity[headerName] = newVal
        return dummyKey
      })
    },
  }
}
</script>

<style scoped lang="scss">

</style>