<template>
  <div>
    <breadcrumb :items="items" />
    <bulkedit :id="id" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
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
          text: this.$i18n.tnl('label.bulkRegister'),
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
      const MAIN_COL = 'regionId'
      const NUMBER_TYPE_LIST = ['regionId', 'meshId', 'deviceOffset']
      await bulkSaveFunc(MAIN_COL, null, null, (entity, headerName, val, dummyKey) => {
        if(Util.equalsAny(headerName, NUMBER_TYPE_LIST)){
          const num = Number(val)
          if(isNaN(num)){
            entity[`${headerName}Name`] = val
          }
          val = num
        }
        if (headerName == MAIN_COL){
          if(!val) {
            val = dummyKey--
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