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
          text: this.$i18n.tnl('label.pot') + this.$i18n.tnl('label.bulkRegister'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'pot',
    ]),
  },
  methods: {
    async save(bulkSaveFunc) {
      const MAIN_COL = "potId"
      const NULLABLE_NUMBER_COL = ["txId", "exbId", "zoneId", "areaId"]
      const MANY_TO_MANY = ["groupId", "categoryId"]
      const EXT_VAL_REGEXP = /extValue\.(ruby|post|tel)/
      const extValueHeaders = ["ruby", "post", "tel"]

      await bulkSaveFunc(MAIN_COL, null, null, (entity, headerName, val, dummyKey) => {
        // relation
        if (MANY_TO_MANY.includes(headerName) && Util.hasValue(val)) {
          if("groupId" === headerName) {
            entity.potGroupList = [{potGroupPK: {groupId: Number(val)}}]
          }
          if("categoryId" === headerName) {
            entity.potCategoryList = [{potCategoryPK: {categoryId: Number(val)}}]
          }
          return dummyKey
        }

        // extValue
        if (!entity.extValue) {
          entity.extValue = {}
        }
        if (_.includes(extValueHeaders, headerName)) {
          entity.extValue[headerName] = val
          return dummyKey
        }

        // other
        let newVal
        if (MAIN_COL === headerName && !val) {
          newVal = dummyKey--
        } else if (NULLABLE_NUMBER_COL.includes(headerName) && !Util.hasValue(val)) {
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